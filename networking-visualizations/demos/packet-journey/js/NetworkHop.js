/**
 * NetworkHop - Models a single hop in a network path with all four latency components
 */
export class NetworkHop {
  constructor(id, name, type = 'router') {
    this.id = id;
    this.name = name;
    this.type = type; // 'client', 'router', 'server', 'isp-edge', 'core'
    
    // Initialize with defaults based on type
    this.setDefaults();
  }
  
  setQueueDefaults() {
    // Set queue parameters based on hop type
    switch(this.type) {
      case 'client':
        // Home devices: light traffic, small buffers
        this.queue = {
          currentDepth: 2,
          bufferSize: 50,
          arrivalRate: 10,    // 10 packets/sec
          serviceRate: 100    // Can handle 100 packets/sec
        };
        break;
        
      case 'isp-edge':
        // ISP edge: moderate congestion possible
        this.queue = {
          currentDepth: 5,
          bufferSize: 200,
          arrivalRate: 80,    // 80 packets/sec (busy)
          serviceRate: 100    // 100 packets/sec capacity
        };
        break;
        
      case 'router':
        // Regular routers: moderate traffic
        this.queue = {
          currentDepth: 3,
          bufferSize: 150,
          arrivalRate: 40,    // 40 packets/sec
          serviceRate: 100    // 100 packets/sec
        };
        break;
        
      case 'core':
        // Core routers: high capacity, well-provisioned
        this.queue = {
          currentDepth: 1,
          bufferSize: 500,
          arrivalRate: 200,   // High traffic
          serviceRate: 1000   // But very high capacity
        };
        break;
        
      case 'server':
        // Servers: depends on load
        this.queue = {
          currentDepth: 4,
          bufferSize: 100,
          arrivalRate: 30,    // Moderate requests
          serviceRate: 50     // Processing capacity
        };
        break;
        
      default:
        this.queue = {
          currentDepth: 2,
          bufferSize: 100,
          arrivalRate: 20,
          serviceRate: 100
        };
    }
  }
  
  setDefaults() {
    switch(this.type) {
      case 'client':
        this.link = {
          bandwidth: 450_000_000,  // 450 Mbps (WiFi 6)
          distance: 0.01,          // 10 meters
          medium: 'wifi',
          utilization: 0.3         // 30% baseline utilization
        };
        this.device = {
          processingPower: 'low',
          processingTimeBase: 0.0001, // 0.1ms base
          currentLoad: 0.2
        };
        break;
        
      case 'router':
        this.link = {
          bandwidth: 1_000_000_000, // 1 Gbps
          distance: 50,             // 50 km
          medium: 'fiber',
          utilization: 0.4
        };
        this.device = {
          processingPower: 'medium',
          processingTimeBase: 0.0005, // 0.5ms base
          currentLoad: 0.3
        };
        break;
        
      case 'isp-edge':
        this.link = {
          bandwidth: 100_000_000,   // 100 Mbps (cable modem typical)
          distance: 20,              // 20 km to ISP
          medium: 'copper',
          utilization: 0.5
        };
        this.device = {
          processingPower: 'medium',
          processingTimeBase: 0.001,  // 1ms base
          currentLoad: 0.4
        };
        break;
        
      case 'core':
        this.link = {
          bandwidth: 10_000_000_000, // 10 Gbps backbone
          distance: 500,              // 500 km between major cities
          medium: 'fiber',
          utilization: 0.6
        };
        this.device = {
          processingPower: 'high',
          processingTimeBase: 0.0002,  // 0.2ms base
          currentLoad: 0.5
        };
        break;
        
      case 'server':
        this.link = {
          bandwidth: 1_000_000_000,  // 1 Gbps
          distance: 5,                // 5 km within datacenter region
          medium: 'fiber',
          utilization: 0.3
        };
        this.device = {
          processingPower: 'high',
          processingTimeBase: 0.001,   // 1ms processing
          currentLoad: 0.4
        };
        break;
        
      default:
        this.link = {
          bandwidth: 100_000_000,
          distance: 10,
          medium: 'copper',
          utilization: 0.3
        };
        this.device = {
          processingPower: 'medium',
          processingTimeBase: 0.001,
          currentLoad: 0.3
        };
    }
    
    // Queue properties - vary by hop type for realism
    this.setQueueDefaults();
  }
  
  /**
   * Calculate all four latency components for this hop
   * @param {number} packetSizeBytes - Size of packet in bytes
   * @returns {object} Object with transmission, propagation, processing, queuing, and total (all in ms)
   */
  calculateLatencies(packetSizeBytes) {
    const latencies = {
      transmission: this.calculateTransmission(packetSizeBytes),
      propagation: this.calculatePropagation(),
      processing: this.calculateProcessing(),
      queuing: this.calculateQueuing()
    };
    
    // Calculate total for this hop
    latencies.total = latencies.transmission + 
                     latencies.propagation + 
                     latencies.processing + 
                     latencies.queuing;
    
    return latencies;
  }
  
  /**
   * Transmission Delay: Time to push all bits of packet onto the wire
   * Formula: packet_size_bits / bandwidth
   */
  calculateTransmission(packetSizeBytes) {
    const bits = packetSizeBytes * 8;
    // Account for link utilization reducing effective bandwidth
    const effectiveBandwidth = this.link.bandwidth * (1 - this.link.utilization);
    
    if (effectiveBandwidth <= 0) {
      return 1000; // Return 1 second if link is saturated
    }
    
    // Convert seconds to milliseconds
    return (bits / effectiveBandwidth) * 1000;
  }
  
  /**
   * Propagation Delay: Time for signal to travel the physical distance
   * Formula: distance / signal_speed
   */
  calculatePropagation() {
    // Signal speeds in different media (km/s)
    const signalSpeed = {
      'fiber': 200_000,      // ~2/3 speed of light
      'copper': 180_000,     // slightly slower than fiber
      'wifi': 300_000,       // speed of light in air
      'satellite': 300_000   // speed of light in vacuum
    };
    
    let distance = this.link.distance;
    
    // Add satellite altitude for satellite links
    if (this.link.medium === 'satellite') {
      // Geostationary orbit: 35,786 km altitude
      // Low Earth Orbit: ~550 km (Starlink)
      // Using GEO for worst case
      distance += 35_786 * 2; // Round trip to satellite and back
    }
    
    const speed = signalSpeed[this.link.medium] || signalSpeed['copper'];
    
    // Convert seconds to milliseconds
    return (distance / speed) * 1000;
  }
  
  /**
   * Processing Delay: Time to examine packet headers, make routing decisions, etc.
   * Varies based on device power and current load
   */
  calculateProcessing() {
    // Processing power affects base processing time
    const powerMultiplier = {
      'low': 3.0,    // Home routers, client devices
      'medium': 1.5,  // ISP routers
      'high': 1.0     // Core routers, servers
    };
    
    // Current load increases processing time (up to 3x at 100% load)
    const loadFactor = 1 + (this.device.currentLoad * 2);
    
    const processingTime = this.device.processingTimeBase * 
                          powerMultiplier[this.device.processingPower] * 
                          loadFactor;
    
    // Convert seconds to milliseconds
    return processingTime * 1000;
  }
  
  /**
   * Queuing Delay: Time spent waiting in queue before processing
   * Using simplified formula: (1/(1-x)³) - 1 where x is utilization
   * Result is directly in milliseconds per packet
   */
  calculateQueuing() {
    // Calculate utilization (x = arrival rate / service rate)
    const utilization = this.queue.arrivalRate / this.queue.serviceRate;
    
    // If queue is unstable (arrival >= service), return high delay
    if (utilization >= 0.95) {
      return 100; // 100ms max queuing delay
    }
    
    // If very low utilization, minimal queuing
    if (utilization < 0.05) {
      return 0.1; // 0.1ms minimal queuing delay
    }
    
    // Apply the queuing delay formula: (1/(1-x)³) - 1
    // This directly gives us the queuing delay in milliseconds
    const queuingDelay = (1 / Math.pow(1 - utilization, 3)) - 1;
    
    // Return the delay directly (already in milliseconds)
    return queuingDelay;
  }
  
  /**
   * Update a specific parameter
   */
  updateParameter(category, param, value) {
    if (this[category] && this[category].hasOwnProperty(param)) {
      this[category][param] = value;
    }
  }
  
  /**
   * Get a summary of this hop's configuration
   */
  getSummary() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      bandwidth: `${(this.link.bandwidth / 1_000_000).toFixed(0)} Mbps`,
      distance: `${this.link.distance} km`,
      medium: this.link.medium,
      load: `${(this.device.currentLoad * 100).toFixed(0)}%`
    };
  }
}