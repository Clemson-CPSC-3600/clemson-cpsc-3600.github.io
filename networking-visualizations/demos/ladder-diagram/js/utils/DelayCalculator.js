/**
 * Utility class for calculating network delays
 * Provides a single source of truth for delay calculations
 */

import { CALC, THRESHOLDS } from '../constants.js';

export class DelayCalculator {
  /**
   * Calculate all delay components for a single hop
   * @param {Object} hop - Hop configuration
   * @param {number} packetSizeBytes - Packet size in bytes
   * @returns {Object} Object containing all delay components in milliseconds
   */
  static calculateHopDelays(hop, packetSizeBytes) {
    const packetBits = packetSizeBytes * CALC.BITS_PER_BYTE;
    
    const delays = {
      transmission: 0,
      propagation: 0,
      processing: 0,
      queuing: 0,
      total: 0
    };
    
    // Transmission delay: time to push all bits onto the wire
    if (hop.bandwidth && hop.bandwidth > 0) {
      delays.transmission = (packetBits / hop.bandwidth) * CALC.MS_PER_SECOND;
    }
    
    // Propagation delay: time for signal to travel the distance
    if (hop.distance && hop.distance > 0 && hop.propagationSpeed && hop.propagationSpeed > 0) {
      delays.propagation = (hop.distance / hop.propagationSpeed) * CALC.MS_PER_SECOND;
    }
    
    // Processing delay: time to process packet at node
    if (hop.processingDelay && hop.processingDelay > 0) {
      delays.processing = hop.processingDelay;
    }
    
    // Queuing delay: time waiting in queue
    if (hop.queuingDelay && hop.queuingDelay > 0) {
      delays.queuing = hop.queuingDelay;
    }
    
    // Calculate total delay for this hop
    delays.total = delays.transmission + delays.propagation + 
                  delays.processing + delays.queuing;
    
    return delays;
  }
  
  /**
   * Calculate total delays for an entire scenario
   * @param {Object} scenario - Scenario configuration
   * @returns {Object} Aggregate delays for all hops
   */
  static calculateScenarioTotalDelay(scenario) {
    const totals = {
      transmission: 0,
      propagation: 0,
      processing: 0,
      queuing: 0,
      total: 0,
      byHop: []  // Store per-hop delays for analysis
    };
    
    // Calculate delays for each hop
    for (let i = 0; i < scenario.hops.length; i++) {
      const hop = scenario.hops[i];
      const hopDelays = this.calculateHopDelays(hop, scenario.packetSize);
      
      // Add to totals
      totals.transmission += hopDelays.transmission;
      totals.propagation += hopDelays.propagation;
      totals.processing += hopDelays.processing;
      totals.queuing += hopDelays.queuing;
      
      // Store hop details
      totals.byHop.push({
        index: i,
        name: hop.name || `Hop ${i + 1}`,
        delays: hopDelays
      });
    }
    
    // Calculate total
    totals.total = totals.transmission + totals.propagation + 
                  totals.processing + totals.queuing;
    
    // Calculate dominant component
    totals.dominant = this.findDominantDelay(totals);
    
    // Calculate percentages
    totals.percentages = this.calculateDelayPercentages(totals);
    
    return totals;
  }
  
  /**
   * Calculate packet path segments with timing information
   * Used for visualization of packet movement through the network
   * @param {Object} scenario - Scenario configuration
   * @returns {Array} Array of segments with timing information
   */
  static calculateSegments(scenario) {
    const segments = [];
    let currentTime = 0;  // Track cumulative time
    
    for (let i = 0; i < scenario.hops.length; i++) {
      const hop = scenario.hops[i];
      const sourceNode = scenario.nodes[i];
      const destNode = scenario.nodes[i + 1];
      
      if (!sourceNode || !destNode) continue;
      
      const delays = this.calculateHopDelays(hop, scenario.packetSize);
      
      // Create segment for each delay component
      // Note: Transmission and propagation happen in parallel
      
      // Queuing delay (at source for hops after the first)
      if (i > 0 && delays.queuing > 0) {
        segments.push({
          type: 'queuing',
          hopIndex: i,
          startTime: currentTime,
          endTime: currentTime + delays.queuing,
          duration: delays.queuing,
          startNode: sourceNode.name,
          endNode: sourceNode.name  // Same node (waiting)
        });
        currentTime += delays.queuing;
      }
      
      // Transmission and Propagation (parallel for packet bits)
      const transmissionStart = currentTime;
      const firstBitPropagationStart = currentTime;  // First bit starts immediately
      const firstBitPropagationEnd = currentTime + delays.propagation;
      const lastBitPropagationStart = currentTime + delays.transmission;  // Last bit waits
      const lastBitPropagationEnd = currentTime + delays.transmission + delays.propagation;
      
      segments.push({
        type: 'transmission-propagation',
        hopIndex: i,
        firstBitStart: firstBitPropagationStart,
        firstBitEnd: firstBitPropagationEnd,
        lastBitStart: lastBitPropagationStart,
        lastBitEnd: lastBitPropagationEnd,
        startNode: sourceNode.name,
        endNode: destNode.name,
        transmissionTime: delays.transmission,
        propagationTime: delays.propagation
      });
      
      // Update current time (both delays happen in parallel)
      currentTime = lastBitPropagationEnd;
      
      // Processing delay (at destination)
      if (delays.processing > 0) {
        segments.push({
          type: 'processing',
          hopIndex: i,
          startTime: currentTime,
          endTime: currentTime + delays.processing,
          duration: delays.processing,
          startNode: destNode.name,
          endNode: destNode.name  // Same node (processing)
        });
        currentTime += delays.processing;
      }
    }
    
    return segments;
  }
  
  /**
   * Calculate time for a packet at a specific point in its journey
   * @param {Object} scenario - Scenario configuration  
   * @param {number} hopIndex - Which hop (0-based)
   * @param {string} phase - Phase within the hop ('queuing', 'transmission', 'propagation', 'processing')
   * @param {number} progress - Progress within phase (0-1)
   * @returns {number} Time in milliseconds
   */
  static calculatePacketTime(scenario, hopIndex, phase, progress = 0) {
    let time = 0;
    
    // Add time from completed hops
    for (let i = 0; i < hopIndex; i++) {
      const hop = scenario.hops[i];
      const delays = this.calculateHopDelays(hop, scenario.packetSize);
      time += delays.total;
    }
    
    // Add time from current hop based on phase
    if (hopIndex < scenario.hops.length) {
      const hop = scenario.hops[hopIndex];
      const delays = this.calculateHopDelays(hop, scenario.packetSize);
      
      switch (phase) {
        case 'queuing':
          if (hopIndex > 0) {  // No queuing at source for first hop
            time += delays.queuing * progress;
          }
          break;
          
        case 'transmission':
          if (hopIndex > 0) time += delays.queuing;  // Add full queuing if past it
          time += delays.transmission * progress;
          break;
          
        case 'propagation':
          if (hopIndex > 0) time += delays.queuing;
          // Note: transmission and propagation are parallel
          time += delays.transmission;  // Full transmission time
          time += delays.propagation * progress;
          break;
          
        case 'processing':
          if (hopIndex > 0) time += delays.queuing;
          time += delays.transmission + delays.propagation;  // Full transit time
          time += delays.processing * progress;
          break;
      }
    }
    
    return time;
  }
  
  /**
   * Find the dominant delay component
   * @param {Object} delays - Object with delay components
   * @returns {string} Name of dominant component
   */
  static findDominantDelay(delays) {
    const components = [
      { name: 'transmission', value: delays.transmission },
      { name: 'propagation', value: delays.propagation },
      { name: 'processing', value: delays.processing },
      { name: 'queuing', value: delays.queuing }
    ];
    
    components.sort((a, b) => b.value - a.value);
    return components[0].name;
  }
  
  /**
   * Calculate percentage contribution of each delay component
   * @param {Object} delays - Object with delay components
   * @returns {Object} Percentages for each component
   */
  static calculateDelayPercentages(delays) {
    const total = delays.total || 1;  // Avoid division by zero
    
    return {
      transmission: (delays.transmission / total) * 100,
      propagation: (delays.propagation / total) * 100,
      processing: (delays.processing / total) * 100,
      queuing: (delays.queuing / total) * 100
    };
  }
  
  /**
   * Estimate end-to-end delay for multiple packets
   * Considers pipelining effects
   * @param {Object} scenario - Scenario configuration
   * @param {number} numPackets - Number of packets to send
   * @param {number} interval - Interval between packet sends (ms)
   * @returns {Object} Timing information for multiple packets
   */
  static calculateMultiPacketTiming(scenario, numPackets, interval = 0) {
    const singlePacketDelay = this.calculateScenarioTotalDelay(scenario);
    
    // First packet takes full delay
    const firstPacketTime = singlePacketDelay.total;
    
    // Calculate when last packet is sent
    const lastPacketSendTime = (numPackets - 1) * interval;
    
    // Last packet arrival time
    const lastPacketArrivalTime = lastPacketSendTime + singlePacketDelay.total;
    
    // Calculate effective throughput
    const totalBits = scenario.packetSize * CALC.BITS_PER_BYTE * numPackets;
    const totalTime = lastPacketArrivalTime / CALC.MS_PER_SECOND;  // Convert to seconds
    const effectiveThroughput = totalTime > 0 ? totalBits / totalTime : 0;
    
    // Find bottleneck (minimum bandwidth)
    let bottleneckBandwidth = Infinity;
    let bottleneckHop = -1;
    scenario.hops.forEach((hop, index) => {
      if (hop.bandwidth && hop.bandwidth < bottleneckBandwidth) {
        bottleneckBandwidth = hop.bandwidth;
        bottleneckHop = index;
      }
    });
    
    return {
      firstPacketTime,
      lastPacketSendTime,
      lastPacketArrivalTime,
      totalDuration: lastPacketArrivalTime,
      effectiveThroughput,
      bottleneck: {
        bandwidth: bottleneckBandwidth,
        hopIndex: bottleneckHop
      },
      utilization: effectiveThroughput / bottleneckBandwidth
    };
  }
  
  /**
   * Check if a delay component is significant enough to display
   * @param {number} delay - Delay value in milliseconds
   * @param {string} type - Type of delay
   * @returns {boolean} Whether to display this delay
   */
  static isSignificantDelay(delay, type) {
    switch (type) {
      case 'transmission':
        return delay >= THRESHOLDS.MIN_TRANSMISSION_TIME;
      case 'propagation':
        return delay >= THRESHOLDS.MIN_PROPAGATION_TIME;
      case 'processing':
        return delay >= THRESHOLDS.MIN_PROCESSING_TIME;
      default:
        return delay > 0;
    }
  }
  
  /**
   * Calculate Round-Trip Time (RTT) for a scenario
   * Assumes symmetric path (same delays in both directions)
   * @param {Object} scenario - Scenario configuration
   * @returns {number} RTT in milliseconds
   */
  static calculateRTT(scenario) {
    const oneWayDelay = this.calculateScenarioTotalDelay(scenario);
    return oneWayDelay.total * 2;
  }
  
  /**
   * Calculate bandwidth-delay product
   * @param {number} bandwidth - Link bandwidth in bps
   * @param {number} delay - One-way delay in ms
   * @returns {Object} BDP in bits and bytes
   */
  static calculateBDP(bandwidth, delay) {
    const delaySeconds = delay / CALC.MS_PER_SECOND;
    const bdpBits = bandwidth * delaySeconds;
    const bdpBytes = bdpBits / CALC.BITS_PER_BYTE;
    
    return {
      bits: bdpBits,
      bytes: bdpBytes,
      packets: Math.ceil(bdpBytes / 1500)  // Assuming 1500 byte packets
    };
  }
}