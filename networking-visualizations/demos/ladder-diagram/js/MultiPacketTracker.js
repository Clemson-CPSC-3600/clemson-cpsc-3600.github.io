/**
 * Manages multiple packets traveling through the network
 */
export class MultiPacketTracker {
  constructor(scenario) {
    this.scenario = scenario;
    this.packets = [];
    this.nextPacketId = 1;
    this.currentTime = 0;
    this.isPlaying = false;
    this.playbackSpeed = 0.25;
    
    // Packet sending configuration
    this.sendMode = 'interval'; // 'interval', 'burst', 'manual'
    this.packetInterval = 10; // ms between packets
    this.burstSize = 3; // packets per burst
    this.lastSendTime = -Infinity;
    this.packetsSentInBurst = 0;
    
    // Calculate maximum simulation time
    this.maxSimulationTime = 500; // Default max time in ms
    
    // Callbacks
    this.onUpdate = null;
    this.onPacketSent = null;
    this.onPacketDelivered = null;
    
    // Animation frame tracking
    this.lastFrameTime = 0;
    this.animationId = null;
    
    // Queue tracking for each hop
    this.hopQueues = [];
    for (let i = 0; i < scenario.hops.length; i++) {
      this.hopQueues.push({
        packetsInQueue: [],
        currentlyTransmitting: null,
        transmissionStartTime: null
      });
    }
  }
  
  /**
   * Create a new packet
   */
  createPacket(sendTime = this.currentTime) {
    const packet = {
      id: this.nextPacketId++,
      sendTime: sendTime,
      size: this.scenario.packetSize,
      color: this.getPacketColor(this.nextPacketId - 1),
      currentHop: 0,
      currentPhase: 'waiting', // waiting, transmitting, propagating, processing, queuing, delivered
      phaseStartTime: sendTime,
      arrivalTimes: [], // Track arrival time at each node
      completedHops: 0, // Track how many hops have been fully completed
      position: { x: 0, y: 0 },
      visible: true
    };
    
    return packet;
  }
  
  /**
   * Get color for packet based on ID
   */
  getPacketColor(index) {
    const colors = [
      '#3498db', // Blue
      '#2ecc71', // Green
      '#9b59b6', // Purple
      '#e67e22', // Orange
      '#1abc9c', // Turquoise
      '#f39c12', // Yellow
      '#e74c3c', // Red
      '#34495e'  // Dark gray
    ];
    return colors[index % colors.length];
  }
  
  /**
   * Send a new packet
   */
  sendPacket(time = this.currentTime) {
    const packet = this.createPacket(time);
    this.packets.push(packet);
    
    if (this.onPacketSent) {
      this.onPacketSent(packet);
    }
    
    return packet;
  }
  
  /**
   * Update all packets for current time
   */
  updatePackets() {
    // Check if we should send new packets
    this.checkAutoSend();
    
    // Update each packet
    for (const packet of this.packets) {
      if (packet.currentPhase === 'delivered') continue;
      
      this.updatePacketState(packet);
    }
    
    // Update queue states
    this.updateQueues();
  }
  
  /**
   * Check if we should automatically send packets
   */
  checkAutoSend() {
    if (this.sendMode === 'manual') return;
    
    if (this.sendMode === 'interval') {
      if (this.currentTime - this.lastSendTime >= this.packetInterval) {
        this.sendPacket();
        this.lastSendTime = this.currentTime;
      }
    } else if (this.sendMode === 'burst') {
      // Send burst of packets at intervals
      if (this.currentTime - this.lastSendTime >= this.packetInterval) {
        for (let i = 0; i < this.burstSize; i++) {
          this.sendPacket(this.currentTime + i * 0.1); // Slight offset for visibility
        }
        this.lastSendTime = this.currentTime;
      }
    }
  }
  
  /**
   * Update single packet state
   */
  updatePacketState(packet) {
    // Don't process packets that haven't been sent yet
    if (this.currentTime < packet.sendTime) {
      packet.currentPhase = 'waiting';
      return;
    }
    
    // If we're exactly at send time or later, packet should start moving
    let elapsedTime = this.currentTime - packet.sendTime;
    let accumulatedTime = 0;
    const packetSizeBits = packet.size * 8;
    
    // First, calculate time for all completed hops
    for (let i = 0; i < packet.completedHops && i < this.scenario.hops.length; i++) {
      const hop = this.scenario.hops[i];
      // Queuing at beginning (only for hops after the first)
      if (hop.queuingDelay && i > 0) {
        accumulatedTime += hop.queuingDelay;
      }
      if (hop.bandwidth) {
        accumulatedTime += (packetSizeBits / hop.bandwidth) * 1000;
      }
      if (hop.distance && hop.propagationSpeed) {
        accumulatedTime += (hop.distance / hop.propagationSpeed) * 1000;
      }
      if (hop.processingDelay) {
        accumulatedTime += hop.processingDelay;
      }
    }
    
    // Now check the current hop
    for (let hopIndex = packet.completedHops; hopIndex < this.scenario.hops.length; hopIndex++) {
      const hop = this.scenario.hops[hopIndex];
      const queue = this.hopQueues[hopIndex];
      
      // We're now working on this hop
      packet.currentHop = hopIndex;
      
      // Static queuing delay at the beginning of the hop (before transmission)
      if (hop.queuingDelay && hopIndex > 0) { // No queuing at source for first hop
        if (elapsedTime <= accumulatedTime + hop.queuingDelay) {
          packet.currentPhase = 'queuing';
          packet.progress = (elapsedTime - accumulatedTime) / hop.queuingDelay;
          return;
        }
        accumulatedTime += hop.queuingDelay;
      }
      
      // Check if packet is waiting in dynamic queue
      if (queue.packetsInQueue.includes(packet)) {
        packet.currentPhase = 'queuing';
        return;
      }
      
      // Transmission phase
      if (hop.bandwidth) {
        const transmissionTime = (packetSizeBits / hop.bandwidth) * 1000;
        
        // Check if this packet is currently being transmitted
        if (queue.currentlyTransmitting === packet) {
          const transmissionProgress = (this.currentTime - queue.transmissionStartTime) / transmissionTime;
          if (transmissionProgress < 1) {
            packet.currentPhase = 'transmitting';
            packet.progress = transmissionProgress;
            return;
          }
          accumulatedTime += transmissionTime;
        } else if (elapsedTime >= accumulatedTime && elapsedTime < accumulatedTime + transmissionTime) {
          // Packet should be transmitting at this hop
          if (!queue.currentlyTransmitting) {
            // Start transmitting this packet
            queue.currentlyTransmitting = packet;
            queue.transmissionStartTime = this.currentTime;
            packet.currentPhase = 'transmitting';
            packet.progress = 0;
            return;
          } else {
            // Another packet is transmitting, queue this one
            if (!queue.packetsInQueue.includes(packet)) {
              queue.packetsInQueue.push(packet);
            }
            packet.currentPhase = 'queuing';
            return;
          }
        } else if (elapsedTime >= accumulatedTime + transmissionTime) {
          // Packet has finished transmitting at this hop
          accumulatedTime += transmissionTime;
        }
      }
      
      // Propagation phase
      if (hop.distance && hop.propagationSpeed) {
        const propagationTime = (hop.distance / hop.propagationSpeed) * 1000;
        if (elapsedTime <= accumulatedTime + propagationTime) {
          const progress = (elapsedTime - accumulatedTime) / propagationTime;
          packet.currentPhase = 'propagating';
          packet.progress = progress;
          
          // Record arrival time at destination node
          if (progress >= 1 && !packet.arrivalTimes[hopIndex + 1]) {
            packet.arrivalTimes[hopIndex + 1] = this.currentTime;
          }
          return;
        }
        accumulatedTime += propagationTime;
      }
      
      // Processing phase
      if (hop.processingDelay) {
        if (elapsedTime <= accumulatedTime + hop.processingDelay) {
          packet.currentPhase = 'processing';
          packet.progress = (elapsedTime - accumulatedTime) / hop.processingDelay;
          return;
        }
        accumulatedTime += hop.processingDelay;
      }
      
      // If we've made it through all phases of this hop, mark it as completed
      packet.completedHops = hopIndex + 1;
      
      // Continue to next hop (loop will continue)
      // Note: currentHop will be set when we enter a phase of the next hop
    }
    
    // Packet has been delivered
    packet.currentPhase = 'delivered';
    packet.currentHop = this.scenario.hops.length;
    
    if (this.onPacketDelivered) {
      this.onPacketDelivered(packet);
    }
  }
  
  /**
   * Update queue states
   */
  updateQueues() {
    for (let i = 0; i < this.hopQueues.length; i++) {
      const queue = this.hopQueues[i];
      const hop = this.scenario.hops[i];
      
      if (!hop.bandwidth) continue;
      
      // Check if current transmission is complete
      if (queue.currentlyTransmitting) {
        const packet = queue.currentlyTransmitting;
        const transmissionTime = (packet.size * 8 / hop.bandwidth) * 1000;
        const elapsed = this.currentTime - queue.transmissionStartTime;
        
        if (elapsed >= transmissionTime) {
          // Transmission complete
          queue.currentlyTransmitting = null;
          queue.transmissionStartTime = null;
          
          // Start next packet if queued
          if (queue.packetsInQueue.length > 0) {
            const nextPacket = queue.packetsInQueue.shift();
            queue.currentlyTransmitting = nextPacket;
            queue.transmissionStartTime = this.currentTime;
          }
        }
      }
    }
  }
  
  /**
   * Get current state of all packets
   */
  getCurrentState() {
    return {
      time: this.currentTime,
      packets: this.packets.map(p => ({
        id: p.id,
        phase: p.currentPhase,
        hop: p.currentHop,
        progress: p.progress || 0,
        color: p.color,
        sendTime: p.sendTime,
        size: p.size
      })),
      queues: this.hopQueues.map(q => ({
        queueLength: q.packetsInQueue.length,
        transmitting: q.currentlyTransmitting ? q.currentlyTransmitting.id : null
      }))
    };
  }
  
  /**
   * Start or resume playback
   */
  play() {
    if (this.isPlaying) return;
    
    this.isPlaying = true;
    this.lastFrameTime = performance.now();
    this.animate();
  }
  
  /**
   * Pause playback
   */
  pause() {
    this.isPlaying = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
  
  /**
   * Animation loop
   */
  animate() {
    if (!this.isPlaying) return;
    
    const currentFrameTime = performance.now();
    const deltaTime = currentFrameTime - this.lastFrameTime;
    this.lastFrameTime = currentFrameTime;
    
    // Update time
    const timeIncrement = (deltaTime / 1000) * this.playbackSpeed * 1;
    this.setTime(this.currentTime + timeIncrement);
    
    // Continue animation
    if (this.isPlaying && this.currentTime < this.maxSimulationTime) {
      this.animationId = requestAnimationFrame(() => this.animate());
    } else if (this.currentTime >= this.maxSimulationTime) {
      this.pause();
    }
  }
  
  /**
   * Set current time
   */
  setTime(time) {
    this.currentTime = Math.max(0, Math.min(time, this.maxSimulationTime));
    this.updatePackets();
    
    if (this.onUpdate) {
      this.onUpdate(this.getCurrentState());
    }
  }
  
  /**
   * Reset simulation
   */
  reset() {
    this.currentTime = 0;
    this.packets = [];
    this.nextPacketId = 1;
    this.lastSendTime = -Infinity;
    this.packetsSentInBurst = 0;
    
    // Clear queues
    for (const queue of this.hopQueues) {
      queue.packetsInQueue = [];
      queue.currentlyTransmitting = null;
      queue.transmissionStartTime = null;
    }
    
    this.pause();
    if (this.onUpdate) {
      this.onUpdate(this.getCurrentState());
    }
  }
  
  /**
   * Set playback speed
   */
  setPlaybackSpeed(speed) {
    this.playbackSpeed = Math.max(0.05, Math.min(2, speed));
  }
  
  /**
   * Set packet sending mode
   */
  setSendMode(mode, interval = 10, burstSize = 3) {
    this.sendMode = mode;
    this.packetInterval = interval;
    this.burstSize = burstSize;
  }
  
  /**
   * Manually send a packet
   */
  manualSend() {
    if (this.packets.length < 20) { // Limit total packets
      const packet = this.sendPacket();
      // Immediately update packet state so it appears correctly
      this.updatePacketState(packet);
      return packet;
    }
  }
}