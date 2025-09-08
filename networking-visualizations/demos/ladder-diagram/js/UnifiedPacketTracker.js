/**
 * Unified packet tracker that handles both single and multi-packet modes
 * Extends MultiPacketTracker to provide backwards compatibility with PacketTracker
 */
import { MultiPacketTracker } from './MultiPacketTracker.js';

export class UnifiedPacketTracker extends MultiPacketTracker {
  constructor(scenario, mode = 'single') {
    super(scenario);
    
    this.visualizationMode = mode; // 'single' or 'multi'
    
    // Calculate total time for a single packet
    this.singlePacketTime = this.calculateSinglePacketTime();
    
    // Configure for single packet mode
    if (mode === 'single') {
      this.setSendMode('manual');
      this.maxSimulationTime = this.singlePacketTime;
      // Send one packet immediately at t=0
      this.sendPacket(0);
    } else {
      // Multi-packet mode - longer simulation time
      this.maxSimulationTime = Math.min(this.singlePacketTime * 20, 500);
    }
  }
  
  /**
   * Calculate total time for a single packet to traverse the network
   */
  calculateSinglePacketTime() {
    let totalTime = 0;
    const packetSizeBits = this.scenario.packetSize * 8;
    
    for (const hop of this.scenario.hops) {
      // Transmission delay
      if (hop.bandwidth) {
        totalTime += (packetSizeBits / hop.bandwidth) * 1000;
      }
      
      // Propagation delay
      if (hop.distance && hop.propagationSpeed) {
        totalTime += (hop.distance / hop.propagationSpeed) * 1000;
      }
      
      // Processing delay
      if (hop.processingDelay) {
        totalTime += hop.processingDelay;
      }
      
      // Queuing delay
      if (hop.queuingDelay) {
        totalTime += hop.queuingDelay;
      }
    }
    
    return totalTime;
  }
  
  /**
   * Get state in PacketTracker format for backwards compatibility
   */
  getSinglePacketState() {
    // For single packet mode, return state of first packet
    const packet = this.packets[0];
    if (!packet) {
      return {
        time: this.currentTime,
        location: 'Source',
        currentDelay: null,
        progress: 0,
        delayTotals: {
          transmission: 0,
          propagation: 0,
          processing: 0,
          queuing: 0
        }
      };
    }
    
    return {
      time: this.currentTime,
      location: this.getPacketLocation(packet),
      currentDelay: this.getDelayType(packet),
      progress: packet.progress || 0,
      delayTotals: this.calculateDelayTotals(packet)
    };
  }
  
  /**
   * Get human-readable location for a packet
   */
  getPacketLocation(packet) {
    if (packet.currentPhase === 'waiting') {
      return this.scenario.nodes[0].name;
    }
    
    if (packet.currentPhase === 'delivered') {
      return this.scenario.nodes[this.scenario.nodes.length - 1].name;
    }
    
    const sourceNode = this.scenario.nodes[packet.currentHop];
    const destNode = this.scenario.nodes[packet.currentHop + 1];
    
    if (!sourceNode || !destNode) {
      return 'Unknown';
    }
    
    switch (packet.currentPhase) {
      case 'transmitting':
        return sourceNode.name;
      case 'propagating':
        const percent = Math.round((packet.progress || 0) * 100);
        return `${sourceNode.name} → ${destNode.name} (${percent}%)`;
      case 'processing':
      case 'queuing':
        return destNode.name;
      default:
        return 'Unknown';
    }
  }
  
  /**
   * Get current delay type for display
   */
  getDelayType(packet) {
    switch (packet.currentPhase) {
      case 'transmitting': return 'Transmission';
      case 'propagating': return 'Propagation';
      case 'processing': return 'Processing';
      case 'queuing': return 'Queuing';
      case 'delivered': return 'Complete';
      default: return null;
    }
  }
  
  /**
   * Calculate cumulative delay totals for a packet
   */
  calculateDelayTotals(packet) {
    const totals = {
      transmission: 0,
      propagation: 0,
      processing: 0,
      queuing: 0
    };
    
    const packetSizeBits = packet.size * 8;
    const elapsedTime = this.currentTime - packet.sendTime;
    let accumulatedTime = 0;
    
    // Add delays from completed hops
    for (let i = 0; i < packet.completedHops && i < this.scenario.hops.length; i++) {
      const hop = this.scenario.hops[i];
      
      if (hop.queuingDelay && i > 0) {
        totals.queuing += hop.queuingDelay;
        accumulatedTime += hop.queuingDelay;
      }
      if (hop.bandwidth) {
        const transmissionTime = (packetSizeBits / hop.bandwidth) * 1000;
        totals.transmission += transmissionTime;
        accumulatedTime += transmissionTime;
      }
      if (hop.distance && hop.propagationSpeed) {
        const propagationTime = (hop.distance / hop.propagationSpeed) * 1000;
        totals.propagation += propagationTime;
        accumulatedTime += propagationTime;
      }
      if (hop.processingDelay) {
        totals.processing += hop.processingDelay;
        accumulatedTime += hop.processingDelay;
      }
    }
    
    // Add partial delay from current hop if still in transit
    if (packet.currentHop < this.scenario.hops.length && packet.currentPhase !== 'delivered') {
      const hop = this.scenario.hops[packet.currentHop];
      const remainingTime = Math.max(0, elapsedTime - accumulatedTime);
      
      switch (packet.currentPhase) {
        case 'queuing':
          totals.queuing += Math.min(remainingTime, hop.queuingDelay * (packet.progress || 1));
          break;
        case 'transmitting':
          if (hop.bandwidth) {
            const transmissionTime = (packetSizeBits / hop.bandwidth) * 1000;
            totals.transmission += Math.min(remainingTime, transmissionTime * (packet.progress || 1));
          }
          break;
        case 'propagating':
          if (hop.distance && hop.propagationSpeed) {
            const propagationTime = (hop.distance / hop.propagationSpeed) * 1000;
            totals.propagation += Math.min(remainingTime, propagationTime * (packet.progress || 1));
          }
          break;
        case 'processing':
          if (hop.processingDelay) {
            totals.processing += Math.min(remainingTime, hop.processingDelay * (packet.progress || 1));
          }
          break;
      }
    }
    
    return totals;
  }
  
  /**
   * Get state - returns appropriate format based on mode
   */
  getCurrentState() {
    // Always return the multi-packet format
    // The display logic will adapt based on mode
    return super.getCurrentState();
  }
  
  /**
   * Get total time (different for single vs multi mode)
   */
  get totalTime() {
    return this.visualizationMode === 'single' ? this.singlePacketTime : this.maxSimulationTime;
  }
  
  /**
   * Switch between single and multi packet modes
   */
  setVisualizationMode(mode) {
    this.visualizationMode = mode;
    
    if (mode === 'single') {
      // Reset and send single packet
      this.reset();
      this.setSendMode('manual');
      this.maxSimulationTime = this.singlePacketTime;
      this.sendPacket(0);
    } else {
      // Reset for multi-packet mode
      this.reset();
      this.maxSimulationTime = Math.min(this.singlePacketTime * 20, 500);
      // Don't change send mode - let UI controls handle that
    }
  }
  
  /**
   * Override reset to maintain single packet in single mode
   */
  reset() {
    super.reset();
    
    if (this.visualizationMode === 'single') {
      // Immediately send one packet for single mode
      this.sendPacket(0);
    }
  }
}