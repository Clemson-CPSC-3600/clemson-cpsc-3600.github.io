/**
 * Shared utility class for calculating network delays
 * Provides a single source of truth for delay calculations across all demos
 */

export class DelayCalculator {
  // Constants for calculations
  static BITS_PER_BYTE = 8;
  static MS_PER_SECOND = 1000;
  static SPEED_OF_LIGHT = 3e8; // meters per second in vacuum
  static DEFAULT_PROPAGATION_SPEED = 2e8; // meters per second in fiber
  
  // Propagation speeds for different media (meters per second)
  static PROPAGATION_SPEEDS = {
    'fiber': 2e8,       // ~200,000 km/s (2/3 speed of light)
    'copper': 2e8,      // ~200,000 km/s (similar to fiber for ethernet)
    'coax': 2e8,        // ~200,000 km/s (cable internet)
    'wireless': 3e8,    // ~300,000 km/s (speed of light in air)
    'wifi': 3e8,        // ~300,000 km/s (same as wireless)
    'satellite': 3e8,   // ~300,000 km/s (through space)
    'air': 3e8,         // ~300,000 km/s (radio waves)
    'vacuum': 3e8       // ~300,000 km/s (theoretical maximum)
  };
  
  /**
   * Calculate all delay components for a single hop
   * @param {Object} hop - Hop configuration
   * @param {number} packetSizeBytes - Packet size in bytes
   * @returns {Object} Object containing all delay components in milliseconds
   */
  static calculateHopDelays(hop, packetSizeBytes) {
    const packetBits = packetSizeBytes * this.BITS_PER_BYTE;
    
    const delays = {
      transmission: 0,
      propagation: 0,
      processing: 0,
      queuing: 0,
      total: 0
    };
    
    // Transmission delay: time to push all bits onto the wire
    // The bandwidth represents the link capacity FROM this node to the next
    if (hop.bandwidth && hop.bandwidth > 0) {
      delays.transmission = (packetBits / hop.bandwidth) * this.MS_PER_SECOND;
    }
    
    // Propagation delay: time for signal to travel the distance
    if (hop.distance && hop.distance > 0) {
      // Distance is in meters
      let propagationSpeed;
      
      // Use explicit propagation speed if provided
      if (hop.propagationSpeed) {
        propagationSpeed = hop.propagationSpeed;
      } 
      // Otherwise use speed based on medium type
      else if (hop.medium && this.PROPAGATION_SPEEDS[hop.medium]) {
        propagationSpeed = this.PROPAGATION_SPEEDS[hop.medium];
      }
      // Default to fiber speed
      else {
        propagationSpeed = this.DEFAULT_PROPAGATION_SPEED;
      }
      
      delays.propagation = (hop.distance / propagationSpeed) * this.MS_PER_SECOND;
    }
    
    // Processing delay: time to process packet at node
    if (hop.processingDelay && hop.processingDelay > 0) {
      delays.processing = hop.processingDelay;
    }
    
    // Queuing delay: time waiting in queue
    if (hop.queuingDelay && hop.queuingDelay > 0) {
      // Use explicit queuing delay if provided
      delays.queuing = hop.queuingDelay;
    } else if (hop.utilization && hop.utilization > 0 && hop.bandwidth) {
      // Use the same exponential model as in other parts of the codebase
      // Formula: (1 / (1 - utilization)³) - 1
      // This gives an exponential-like increase as utilization approaches 100%
      const util = Math.min(hop.utilization, 0.99); // Cap at 99% to avoid infinite values
      
      // Base delay is transmission time for one packet
      const transmissionTimeMs = (packetBits / hop.bandwidth) * this.MS_PER_SECOND;
      
      // Calculate multiplier using the cubic formula
      // This formula gives approximately:
      // - 0.3% util → ~0x delay
      // - 30% util → ~0.5x delay
      // - 50% util → ~7x delay
      // - 70% util → ~36x delay
      // - 80% util → ~125x delay
      // - 90% util → ~1000x delay
      // - 95% util → ~8000x delay
      // - 99% util → ~1,000,000x delay
      const multiplier = (1 / Math.pow(1 - util, 3)) - 1;
      
      delays.queuing = transmissionTimeMs * multiplier;
      
      // Cap maximum queuing delay at 5000ms (5 seconds) - realistic for severely congested links
      delays.queuing = Math.min(delays.queuing, 5000);
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
   * Calculate cumulative delay up to a specific hop
   * Used for packet-journey visualization
   * @param {Object} path - Path configuration
   * @param {number} upToHop - Calculate up to this hop index
   * @returns {number} Cumulative delay in milliseconds
   */
  static calculateCumulativeDelay(path, upToHop) {
    let cumulative = 0;
    const packetSize = path.packetSize || 1500;
    
    for (let i = 0; i <= upToHop && i < path.hops.length; i++) {
      const delays = this.calculateHopDelays(path.hops[i], packetSize);
      cumulative += delays.total;
    }
    
    return cumulative;
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
      
      // Queuing delay (at source for hops after the first)
      if (i > 0 && delays.queuing > 0) {
        segments.push({
          type: 'queuing',
          hopIndex: i,
          startTime: currentTime,
          endTime: currentTime + delays.queuing,
          duration: delays.queuing,
          startNode: sourceNode.name || sourceNode,
          endNode: sourceNode.name || sourceNode  // Same node (waiting)
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
        startNode: sourceNode.name || sourceNode,
        endNode: destNode.name || destNode,
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
          startNode: destNode.name || destNode,
          endNode: destNode.name || destNode  // Same node (processing)
        });
        currentTime += delays.processing;
      }
    }
    
    return segments;
  }
  
  /**
   * Calculate Round-Trip Time (RTT) for a scenario
   * @param {Object} scenario - Scenario configuration
   * @param {boolean} symmetric - Whether return path is symmetric (default: true)
   * @returns {number} RTT in milliseconds
   */
  static calculateRTT(scenario, symmetric = true) {
    const oneWayDelay = this.calculateScenarioTotalDelay(scenario);
    
    if (symmetric) {
      return oneWayDelay.total * 2;
    } else {
      // For asymmetric, would need return path configuration
      // For now, estimate with 1.5x factor
      return oneWayDelay.total * 1.5;
    }
  }
  
  /**
   * Calculate bandwidth-delay product
   * @param {number} bandwidth - Link bandwidth in bps
   * @param {number} delay - One-way delay in ms
   * @returns {Object} BDP in bits, bytes, and packets
   */
  static calculateBDP(bandwidth, delay) {
    const delaySeconds = delay / this.MS_PER_SECOND;
    const bdpBits = bandwidth * delaySeconds;
    const bdpBytes = bdpBits / this.BITS_PER_BYTE;
    
    return {
      bits: bdpBits,
      bytes: bdpBytes,
      packets: Math.ceil(bdpBytes / 1500),  // Assuming 1500 byte packets
      windows: Math.ceil(bdpBytes / 65536)  // TCP window units (64KB)
    };
  }
  
  /**
   * Calculate theoretical maximum throughput
   * @param {number} bandwidth - Link bandwidth in bps
   * @param {number} rtt - Round-trip time in ms
   * @param {number} windowSize - TCP window size in bytes
   * @returns {number} Maximum throughput in bps
   */
  static calculateThroughput(bandwidth, rtt, windowSize = 65536) {
    const rttSeconds = rtt / this.MS_PER_SECOND;
    const windowBits = windowSize * this.BITS_PER_BYTE;
    const windowLimitedThroughput = windowBits / rttSeconds;
    
    // Throughput is limited by either bandwidth or window size
    return Math.min(bandwidth, windowLimitedThroughput);
  }
  
  /**
   * Calculate effective data rate considering protocol overhead
   * @param {number} bandwidth - Raw bandwidth in bps
   * @param {number} payloadSize - Payload size in bytes
   * @param {number} headerSize - Total header size in bytes (default: 40 for TCP/IP)
   * @returns {Object} Effective rates and efficiency
   */
  static calculateEffectiveRate(bandwidth, payloadSize, headerSize = 40) {
    const totalSize = payloadSize + headerSize;
    const efficiency = payloadSize / totalSize;
    const effectiveRate = bandwidth * efficiency;
    
    return {
      rawBandwidth: bandwidth,
      effectiveRate: effectiveRate,
      efficiency: efficiency,
      overheadPercent: (1 - efficiency) * 100
    };
  }
  
  /**
   * Estimate queuing delay using M/M/1 queue model
   * @param {number} arrivalRate - Packet arrival rate (packets/second)
   * @param {number} serviceRate - Service rate (packets/second)
   * @returns {Object} Queuing statistics
   */
  static estimateQueuingDelay(arrivalRate, serviceRate) {
    if (serviceRate <= arrivalRate) {
      // Queue is unstable
      return {
        stable: false,
        utilization: 1,
        averageDelay: Infinity,
        averageQueueLength: Infinity
      };
    }
    
    const utilization = arrivalRate / serviceRate;
    const averageDelay = 1 / (serviceRate - arrivalRate) * this.MS_PER_SECOND;
    const averageQueueLength = utilization / (1 - utilization);
    
    return {
      stable: true,
      utilization: utilization,
      averageDelay: averageDelay,
      averageQueueLength: averageQueueLength,
      waitingProbability: utilization
    };
  }
  
  /**
   * Calculate jitter (variation in delay)
   * @param {Array} delays - Array of delay measurements
   * @returns {Object} Jitter statistics
   */
  static calculateJitter(delays) {
    if (!delays || delays.length < 2) {
      return { min: 0, max: 0, average: 0, stdDev: 0 };
    }
    
    const min = Math.min(...delays);
    const max = Math.max(...delays);
    const average = delays.reduce((a, b) => a + b, 0) / delays.length;
    
    // Calculate standard deviation
    const squaredDiffs = delays.map(d => Math.pow(d - average, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / delays.length;
    const stdDev = Math.sqrt(variance);
    
    return {
      min: min,
      max: max,
      average: average,
      stdDev: stdDev,
      range: max - min
    };
  }
  
  /**
   * Calculate time for multiple packets with pipelining
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
    const totalBits = scenario.packetSize * this.BITS_PER_BYTE * numPackets;
    const totalTime = lastPacketArrivalTime / this.MS_PER_SECOND;  // Convert to seconds
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
      utilization: bottleneckBandwidth > 0 ? effectiveThroughput / bottleneckBandwidth : 0,
      packetsPerSecond: numPackets / (totalTime || 1)
    };
  }
  
  /**
   * Find the dominant delay component
   * @param {Object} delays - Object with delay components
   * @returns {string} Name of dominant component
   */
  static findDominantDelay(delays) {
    const components = [
      { name: 'transmission', value: delays.transmission || 0 },
      { name: 'propagation', value: delays.propagation || 0 },
      { name: 'processing', value: delays.processing || 0 },
      { name: 'queuing', value: delays.queuing || 0 }
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
      transmission: ((delays.transmission || 0) / total) * 100,
      propagation: ((delays.propagation || 0) / total) * 100,
      processing: ((delays.processing || 0) / total) * 100,
      queuing: ((delays.queuing || 0) / total) * 100
    };
  }
  
  /**
   * Check if a delay component is significant enough to display
   * @param {number} delay - Delay value in milliseconds
   * @param {string} type - Type of delay
   * @returns {boolean} Whether to display this delay
   */
  static isSignificantDelay(delay, type) {
    const thresholds = {
      transmission: 0.001,  // 1 microsecond
      propagation: 0.1,     // 100 microseconds
      processing: 0.01,     // 10 microseconds
      queuing: 0.001        // 1 microsecond
    };
    
    return delay >= (thresholds[type] || 0);
  }
  
  /**
   * Calculate packet position at a given time
   * Used for animation
   * @param {Array} segments - Path segments from calculateSegments
   * @param {number} time - Current time in milliseconds
   * @returns {Object} Position information
   */
  static getPacketPosition(segments, time) {
    // Find active segment
    for (const segment of segments) {
      if (segment.type === 'transmission-propagation') {
        // Check if packet is in this segment
        if (time >= segment.firstBitStart && time <= segment.lastBitEnd) {
          const progress = (time - segment.firstBitStart) / 
                          (segment.lastBitEnd - segment.firstBitStart);
          return {
            segment: segment,
            progress: Math.min(1, Math.max(0, progress)),
            phase: 'transmitting',
            source: segment.startNode,
            destination: segment.endNode
          };
        }
      } else if (segment.type === 'processing' || segment.type === 'queuing') {
        if (time >= segment.startTime && time <= segment.endTime) {
          return {
            segment: segment,
            progress: (time - segment.startTime) / segment.duration,
            phase: segment.type,
            node: segment.startNode
          };
        }
      }
    }
    
    // Packet not found in any segment
    if (time < (segments[0]?.firstBitStart || 0)) {
      return { phase: 'waiting' };
    } else {
      return { phase: 'delivered' };
    }
  }
}