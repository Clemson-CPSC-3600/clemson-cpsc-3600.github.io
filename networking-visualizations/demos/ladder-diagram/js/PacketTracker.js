/**
 * Tracks packet position and timing through the network
 */
export class PacketTracker {
  constructor(scenario) {
    this.scenario = scenario;
    this.currentTime = 0;
    this.isPlaying = false;
    this.playbackSpeed = 0.25; // Start with even slower speed
    
    // Calculate total journey time
    this.totalTime = this.calculateTotalTime();
    
    // Callbacks
    this.onUpdate = null;
    this.onComplete = null;
    
    // Animation frame tracking
    this.lastFrameTime = 0;
    this.animationId = null;
  }
  
  /**
   * Calculate total time for packet to reach destination
   */
  calculateTotalTime() {
    let totalTime = 0;
    const packetSizeBits = this.scenario.packetSize * 8;
    
    for (const hop of this.scenario.hops) {
      // Transmission delay
      if (hop.bandwidth) {
        totalTime += (packetSizeBits / hop.bandwidth) * 1000; // Convert to ms
      }
      
      // Propagation delay
      if (hop.distance && hop.propagationSpeed) {
        totalTime += (hop.distance / hop.propagationSpeed) * 1000; // Convert to ms
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
   * Get current packet state
   */
  getCurrentState() {
    const state = {
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
    
    let accumulatedTime = 0;
    const packetSizeBits = this.scenario.packetSize * 8;
    
    // Iterate through hops to find current position
    for (let i = 0; i < this.scenario.hops.length; i++) {
      const hop = this.scenario.hops[i];
      const sourceNode = this.scenario.nodes[i];
      const destNode = this.scenario.nodes[i + 1];
      
      // Check transmission delay
      if (hop.bandwidth) {
        const transmissionTime = (packetSizeBits / hop.bandwidth) * 1000;
        if (this.currentTime <= accumulatedTime + transmissionTime) {
          state.location = sourceNode.name;
          state.currentDelay = 'Transmission';
          state.progress = (this.currentTime - accumulatedTime) / transmissionTime;
          state.delayTotals.transmission = this.currentTime - accumulatedTime;
          return state;
        }
        state.delayTotals.transmission += transmissionTime;
        accumulatedTime += transmissionTime;
      }
      
      // Check propagation delay
      if (hop.distance && hop.propagationSpeed) {
        const propagationTime = (hop.distance / hop.propagationSpeed) * 1000;
        if (this.currentTime <= accumulatedTime + propagationTime) {
          const progress = (this.currentTime - accumulatedTime) / propagationTime;
          state.location = `${sourceNode.name} → ${destNode.name} (${Math.round(progress * 100)}%)`;
          state.currentDelay = 'Propagation';
          state.progress = progress;
          state.delayTotals.propagation += this.currentTime - accumulatedTime;
          return state;
        }
        state.delayTotals.propagation += propagationTime;
        accumulatedTime += propagationTime;
      }
      
      // Check processing delay
      if (hop.processingDelay) {
        if (this.currentTime <= accumulatedTime + hop.processingDelay) {
          state.location = destNode.name;
          state.currentDelay = 'Processing';
          state.progress = (this.currentTime - accumulatedTime) / hop.processingDelay;
          state.delayTotals.processing += this.currentTime - accumulatedTime;
          return state;
        }
        state.delayTotals.processing += hop.processingDelay;
        accumulatedTime += hop.processingDelay;
      }
      
      // Check queuing delay
      if (hop.queuingDelay) {
        if (this.currentTime <= accumulatedTime + hop.queuingDelay) {
          state.location = destNode.name;
          state.currentDelay = 'Queuing';
          state.progress = (this.currentTime - accumulatedTime) / hop.queuingDelay;
          state.delayTotals.queuing += this.currentTime - accumulatedTime;
          return state;
        }
        state.delayTotals.queuing += hop.queuingDelay;
        accumulatedTime += hop.queuingDelay;
      }
    }
    
    // Packet has reached destination
    state.location = this.scenario.nodes[this.scenario.nodes.length - 1].name;
    state.currentDelay = 'Complete';
    state.progress = 1;
    
    // Set final totals
    state.delayTotals = this.calculateFinalTotals();
    
    return state;
  }
  
  /**
   * Calculate final delay totals
   */
  calculateFinalTotals() {
    const totals = {
      transmission: 0,
      propagation: 0,
      processing: 0,
      queuing: 0
    };
    
    const packetSizeBits = this.scenario.packetSize * 8;
    
    for (const hop of this.scenario.hops) {
      if (hop.bandwidth) {
        totals.transmission += (packetSizeBits / hop.bandwidth) * 1000;
      }
      if (hop.distance && hop.propagationSpeed) {
        totals.propagation += (hop.distance / hop.propagationSpeed) * 1000;
      }
      if (hop.processingDelay) {
        totals.processing += hop.processingDelay;
      }
      if (hop.queuingDelay) {
        totals.queuing += hop.queuingDelay;
      }
    }
    
    return totals;
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
    
    // Update time based on playback speed
    // Even slower playback: 1ms per second at 1x speed
    // At 0.05x speed: 0.05ms per second (20 seconds to show 1ms)
    // At 0.25x speed: 0.25ms per second (4 seconds to show 1ms)
    // At 1x speed: 1ms per second
    // At 2x speed: 2ms per second
    const timeIncrement = (deltaTime / 1000) * this.playbackSpeed * 1;
    this.setTime(this.currentTime + timeIncrement);
    
    // Check if complete
    if (this.currentTime >= this.totalTime) {
      this.currentTime = this.totalTime;
      this.pause();
      if (this.onComplete) {
        this.onComplete();
      }
    }
    
    // Continue animation
    if (this.isPlaying) {
      this.animationId = requestAnimationFrame(() => this.animate());
    }
  }
  
  /**
   * Set current time
   */
  setTime(time) {
    this.currentTime = Math.max(0, Math.min(time, this.totalTime));
    
    if (this.onUpdate) {
      this.onUpdate(this.getCurrentState());
    }
  }
  
  /**
   * Step forward by given milliseconds
   */
  stepForward(ms = 5) {
    this.setTime(this.currentTime + ms);
  }
  
  /**
   * Step backward by given milliseconds
   */
  stepBackward(ms = 5) {
    this.setTime(this.currentTime - ms);
  }
  
  /**
   * Reset to beginning
   */
  reset() {
    this.currentTime = 0;
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
   * Get progress as percentage
   */
  getProgress() {
    return (this.currentTime / this.totalTime) * 100;
  }
}