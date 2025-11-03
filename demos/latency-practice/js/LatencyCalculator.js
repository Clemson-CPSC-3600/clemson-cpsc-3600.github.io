/**
 * Core latency calculation engine
 * Handles all four components of network latency
 */
export class LatencyCalculator {
  constructor() {
    // Speed of light in different media (m/s)
    this.propagationSpeeds = {
      fiber: 2e8,      // 2/3 speed of light
      copper: 2e8,     // Similar to fiber
      wifi: 2e8 * 0.67, // Roughly 2/3 of fiber
      satellite: 3e8   // Speed of light in vacuum
    };
    
    // Processing delays by device type (seconds)
    this.processingDelays = {
      home_router: 0.0001,    // 0.1ms
      isp_router: 0.0005,     // 0.5ms
      core_router: 0.00001,   // 0.01ms (high-speed)
      switch: 0.000002,       // 2 microseconds
      firewall: 0.001,        // 1ms (inspection overhead)
      load_balancer: 0.0002   // 0.2ms
    };
  }
  
  /**
   * Calculate transmission delay
   * @param {number} packetSizeBits - Packet size in bits
   * @param {number} bandwidthBps - Bandwidth in bits per second
   * @returns {number} Delay in seconds
   */
  transmissionDelay(packetSizeBits, bandwidthBps) {
    if (bandwidthBps <= 0) return 0;
    return packetSizeBits / bandwidthBps;
  }
  
  /**
   * Calculate propagation delay
   * @param {number} distanceMeters - Distance in meters
   * @param {string} medium - Type of medium (fiber, copper, wifi, satellite)
   * @returns {number} Delay in seconds
   */
  propagationDelay(distanceMeters, medium = 'fiber') {
    const speed = this.propagationSpeeds[medium] || this.propagationSpeeds.fiber;
    return distanceMeters / speed;
  }
  
  /**
   * Calculate processing delay
   * @param {string} deviceType - Type of network device
   * @param {number} loadFactor - Current load (0-1, where 1 is 100% loaded)
   * @returns {number} Delay in seconds
   */
  processingDelay(deviceType, loadFactor = 0.5) {
    const baseDelay = this.processingDelays[deviceType] || 0.0001;
    // Processing delay increases with load
    return baseDelay * (1 + loadFactor * 2);
  }
  
  /**
   * Calculate queuing delay using cubic utilization model
   * @param {number} utilization - Link utilization (0-1)
   * @returns {number} Delay in seconds
   */
  queuingDelay(utilization) {
    // If queue is unstable (utilization >= 95%), return high delay
    if (utilization >= 0.95) {
      return 0.1; // 100ms max queuing delay (in seconds)
    }
    
    // If very low utilization, minimal queuing
    if (utilization < 0.05) {
      return 0.0001; // 0.1ms minimal queuing delay (in seconds)
    }
    
    // Apply the queuing delay formula: (1/(1-x)³) - 1
    // This directly gives us the queuing delay in milliseconds
    const queuingDelayMs = (1 / Math.pow(1 - utilization, 3)) - 1;
    
    // Return the delay in seconds
    return queuingDelayMs / 1000;
  }
  
  /**
   * Calculate total end-to-end latency for a path
   * @param {Array} hops - Array of hop configurations
   * @param {number} packetSizeBytes - Packet size in bytes
   * @param {Object} propagationSpeeds - Speed of light in different media
   * @returns {Object} Breakdown of delays and total
   */
  calculateTotalLatency(hops, packetSizeBytes, propagationSpeeds = null) {
    const packetSizeBits = packetSizeBytes * 8;
    
    const components = {
      transmission: 0,
      propagation: 0,
      processing: 0,
      queuing: 0
    };
    
    const perHop = [];
    
    hops.forEach((hop, index) => {
      // Use provided propagation speed if available
      const propSpeed = propagationSpeeds?.[hop.medium] || this.propagationSpeeds[hop.medium];
      
      const hopDelays = {
        // Calculate transmission and propagation
        transmission: this.transmissionDelay(packetSizeBits, hop.bandwidth),
        propagation: hop.distance / propSpeed,
        // Use explicitly provided values for processing and queuing
        processing: hop.processingDelay !== undefined ? hop.processingDelay / 1000 : this.processingDelay(hop.deviceType, hop.loadFactor || 0.5),
        queuing: hop.queuingDelay !== undefined ? hop.queuingDelay / 1000 : this.queuingDelay(
          hop.utilization || 0.3
        )
      };
      
      // Convert to milliseconds for display
      Object.keys(hopDelays).forEach(key => {
        if (key === 'processing' || key === 'queuing') {
          // Already in ms if provided explicitly
          if (hop.processingDelay !== undefined || hop.queuingDelay !== undefined) {
            hopDelays[key] = hop[key + 'Delay'] || 0;
          } else {
            hopDelays[key] = hopDelays[key] * 1000;
          }
        } else {
          hopDelays[key] = hopDelays[key] * 1000; // Convert to ms
        }
        components[key] += hopDelays[key];
      });
      
      hopDelays.total = Object.values(hopDelays).reduce((sum, val) => sum + val, 0);
      hopDelays.name = hop.name || `Hop ${index + 1}`;
      perHop.push(hopDelays);
    });
    
    const total = Object.values(components).reduce((sum, val) => sum + val, 0);
    
    return {
      components,
      perHop,
      total,
      dominant: this.findDominantComponent(components)
    };
  }
  
  /**
   * Find which component contributes most to delay
   */
  findDominantComponent(components) {
    let max = 0;
    let dominant = 'transmission';
    
    Object.entries(components).forEach(([key, value]) => {
      if (value > max) {
        max = value;
        dominant = key;
      }
    });
    
    return { component: dominant, value: max };
  }
  
  /**
   * Convert between different units
   */
  convertBandwidth(value, fromUnit, toUnit) {
    const toBits = {
      'bps': 1,
      'Kbps': 1e3,
      'Mbps': 1e6,
      'Gbps': 1e9,
      'Tbps': 1e12
    };
    
    const bitsPerSecond = value * toBits[fromUnit];
    return bitsPerSecond / toBits[toUnit];
  }
  
  convertDistance(value, fromUnit, toUnit) {
    const toMeters = {
      'm': 1,
      'km': 1e3,
      'mi': 1609.34,
      'ft': 0.3048
    };
    
    const meters = value * toMeters[fromUnit];
    return meters / toMeters[toUnit];
  }
  
  /**
   * Format delay value for display
   */
  formatDelay(delayMs) {
    if (delayMs < 0.001) {
      return `${(delayMs * 1000).toFixed(2)} µs`;
    } else if (delayMs < 1) {
      return `${delayMs.toFixed(3)} ms`;
    } else if (delayMs < 1000) {
      return `${delayMs.toFixed(2)} ms`;
    } else {
      return `${(delayMs / 1000).toFixed(2)} s`;
    }
  }
}

/**
 * NetworkHop represents a single hop in a network path
 */
export class NetworkHop {
  constructor(config) {
    this.name = config.name || 'Network Hop';
    this.bandwidth = config.bandwidth || 100e6; // 100 Mbps default
    this.distance = config.distance || 100; // 100m default
    this.medium = config.medium || 'fiber';
    this.deviceType = config.deviceType || 'home_router';
    this.loadFactor = config.loadFactor || 0.3;
    this.utilization = config.utilization || 0.3;
  }
  
  /**
   * Set hop parameters from a preset configuration
   */
  applyPreset(preset) {
    Object.assign(this, preset);
  }
  
  /**
   * Validate hop parameters
   */
  validate() {
    const errors = [];
    
    if (this.bandwidth <= 0) {
      errors.push('Bandwidth must be positive');
    }
    if (this.distance < 0) {
      errors.push('Distance cannot be negative');
    }
    if (this.loadFactor < 0 || this.loadFactor > 1) {
      errors.push('Load factor must be between 0 and 1');
    }
    if (this.utilization < 0 || this.utilization > 1) {
      errors.push('Utilization must be between 0 and 1');
    }
    
    return { valid: errors.length === 0, errors };
  }
  
  /**
   * Create a copy of this hop
   */
  clone() {
    return new NetworkHop({ ...this });
  }
}

/**
 * Preset network configurations
 */
export const NetworkPresets = {
  home_wifi: {
    name: 'Home WiFi',
    hops: [
      {
        name: 'Device to Router',
        bandwidth: 100e6,
        distance: 10,
        medium: 'wifi',
        deviceType: 'home_router',
        loadFactor: 0.3,
        utilization: 0.3
      }
    ]
  },
  
  gaming_setup: {
    name: 'Gaming Setup',
    hops: [
      {
        name: 'PC to Router',
        bandwidth: 1e9,
        distance: 5,
        medium: 'copper',
        deviceType: 'home_router',
        loadFactor: 0.1,
        utilization: 0
      },
      {
        name: 'Router to ISP',
        bandwidth: 500e6,
        distance: 5000,
        medium: 'fiber',
        deviceType: 'isp_router',
        loadFactor: 0.4,
        utilization: 5
      },
      {
        name: 'ISP to Game Server',
        bandwidth: 10e9,
        distance: 50000,
        medium: 'fiber',
        deviceType: 'core_router',
        loadFactor: 0.3,
        utilization: 10
      }
    ]
  },
  
  enterprise_network: {
    name: 'Enterprise Network',
    hops: [
      {
        name: 'Workstation to Switch',
        bandwidth: 1e9,
        distance: 50,
        medium: 'copper',
        deviceType: 'switch',
        loadFactor: 0.2,
        utilization: 1
      },
      {
        name: 'Switch to Firewall',
        bandwidth: 10e9,
        distance: 100,
        medium: 'fiber',
        deviceType: 'firewall',
        loadFactor: 0.5,
        utilization: 20
      },
      {
        name: 'Firewall to Core',
        bandwidth: 10e9,
        distance: 200,
        medium: 'fiber',
        deviceType: 'core_router',
        loadFactor: 0.4,
        utilization: 15
      }
    ]
  },
  
  satellite_connection: {
    name: 'Satellite Internet',
    hops: [
      {
        name: 'Home to Satellite',
        bandwidth: 25e6,
        distance: 35786000, // Geostationary orbit
        medium: 'satellite',
        deviceType: 'home_router',
        loadFactor: 0.3,
        utilization: 5
      },
      {
        name: 'Satellite to Ground Station',
        bandwidth: 25e6,
        distance: 35786000,
        medium: 'satellite',
        deviceType: 'isp_router',
        loadFactor: 0.4,
        utilization: 10
      }
    ]
  }
};