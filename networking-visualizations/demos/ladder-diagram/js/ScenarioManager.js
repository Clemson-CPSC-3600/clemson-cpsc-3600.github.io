/**
 * Manages different network scenarios for the ladder diagram
 */
export class ScenarioManager {
  constructor() {
    this.scenarios = {
      simple: this.createSimpleScenario(),
      lan: this.createLANScenario(),
      wan: this.createWANScenario(),
      congested: this.createCongestedScenario(),
      transcontinental: this.createTranscontinentalScenario(),
      satellite: this.createSatelliteScenario(),
      balanced: this.createBalancedScenario()
    };
  }
  
  /**
   * Get a scenario by name
   */
  getScenario(name) {
    return this.scenarios[name] || this.scenarios.simple;
  }
  
  /**
   * Simple 2-hop network scenario
   */
  createSimpleScenario() {
    return {
      name: 'Simple 2-Hop Network',
      description: 'A basic network with one router between source and destination',
      packetSize: 1500, // bytes
      nodes: [
        { name: 'Source', type: 'Host' },
        { name: 'Router', type: 'Router' },
        { name: 'Destination', type: 'Host' }
      ],
      hops: [
        {
          name: 'Source to Router',
          bandwidth: 100e6, // 100 Mbps
          distance: 100, // meters
          propagationSpeed: 2e8, // 2/3 speed of light (typical for copper)
          processingDelay: 0.5, // ms
          queuingDelay: 0.2 // ms
        },
        {
          name: 'Router to Destination',
          bandwidth: 100e6, // 100 Mbps
          distance: 100, // meters
          propagationSpeed: 2e8,
          processingDelay: 0.5, // ms
          queuingDelay: 0.1 // ms
        }
      ]
    };
  }
  
  /**
   * Local Area Network scenario
   */
  createLANScenario() {
    return {
      name: 'Local Area Network',
      description: 'High-speed local network with minimal delays',
      packetSize: 1500, // bytes
      nodes: [
        { name: 'Client', type: 'Host' },
        { name: 'Switch', type: 'Switch' },
        { name: 'Server', type: 'Server' }
      ],
      hops: [
        {
          name: 'Client to Switch',
          bandwidth: 1e9, // 1 Gbps
          distance: 50, // meters
          propagationSpeed: 2e8,
          processingDelay: 0.01, // ms (fast switch)
          queuingDelay: 0 // No congestion
        },
        {
          name: 'Switch to Server',
          bandwidth: 1e9, // 1 Gbps
          distance: 50, // meters
          propagationSpeed: 2e8,
          processingDelay: 0.05, // ms (server processing)
          queuingDelay: 0 // No congestion
        }
      ]
    };
  }
  
  /**
   * Wide Area Network scenario
   */
  createWANScenario() {
    return {
      name: 'Wide Area Network',
      description: 'Cross-country connection with significant propagation delay',
      packetSize: 1500, // bytes
      nodes: [
        { name: 'NYC', type: 'Host' },
        { name: 'Chicago', type: 'Router' },
        { name: 'Denver', type: 'Router' },
        { name: 'LA', type: 'Host' }
      ],
      hops: [
        {
          name: 'NYC to Chicago',
          bandwidth: 10e9, // 10 Gbps backbone
          distance: 1200e3, // 1200 km
          propagationSpeed: 2e8,
          processingDelay: 0.5, // ms
          queuingDelay: 0.8 // ms (some congestion)
        },
        {
          name: 'Chicago to Denver',
          bandwidth: 10e9, // 10 Gbps backbone
          distance: 1500e3, // 1500 km
          propagationSpeed: 2e8,
          processingDelay: 0.5, // ms
          queuingDelay: 1.2 // ms (more congestion)
        },
        {
          name: 'Denver to LA',
          bandwidth: 10e9, // 10 Gbps backbone
          distance: 1300e3, // 1300 km
          propagationSpeed: 2e8,
          processingDelay: 0.5, // ms
          queuingDelay: 0.5 // ms
        }
      ]
    };
  }
  
  /**
   * Congested network scenario
   */
  createCongestedScenario() {
    return {
      name: 'Congested Network',
      description: 'Network experiencing heavy congestion with significant queuing delays',
      packetSize: 1500, // bytes
      nodes: [
        { name: 'User', type: 'Host' },
        { name: 'ISP Router', type: 'Router' },
        { name: 'Core Router', type: 'Router' },
        { name: 'CDN', type: 'Server' }
      ],
      hops: [
        {
          name: 'User to ISP',
          bandwidth: 100e6, // 100 Mbps home connection
          distance: 10e3, // 10 km to ISP
          propagationSpeed: 2e8,
          processingDelay: 2, // ms (congested router)
          queuingDelay: 15 // ms (heavy queuing)
        },
        {
          name: 'ISP to Core',
          bandwidth: 1e9, // 1 Gbps
          distance: 100e3, // 100 km
          propagationSpeed: 2e8,
          processingDelay: 1.5, // ms
          queuingDelay: 8 // ms (moderate queuing)
        },
        {
          name: 'Core to CDN',
          bandwidth: 10e9, // 10 Gbps
          distance: 50e3, // 50 km
          propagationSpeed: 2e8,
          processingDelay: 0.3, // ms
          queuingDelay: 2 // ms (light queuing at destination)
        }
      ]
    };
  }
  
  /**
   * Transcontinental scenario - NYC to London
   */
  createTranscontinentalScenario() {
    return {
      name: 'Transcontinental Cable',
      description: 'NYC to London via undersea fiber optic cable',
      packetSize: 1500, // bytes
      nodes: [
        { name: 'NYC', type: 'Host' },
        { name: 'Atlantic Cable', type: 'Router' },
        { name: 'London', type: 'Host' }
      ],
      hops: [
        {
          name: 'NYC to Cable Landing',
          bandwidth: 100e9, // 100 Gbps
          distance: 100e3, // 100 km to cable landing station
          propagationSpeed: 2e8, // fiber optic
          processingDelay: 0.5, // ms
          queuingDelay: 0.2 // ms
        },
        {
          name: 'Undersea Cable to London',
          bandwidth: 100e9, // 100 Gbps undersea cable
          distance: 5500e3, // 5500 km across Atlantic
          propagationSpeed: 2e8, // fiber optic undersea
          processingDelay: 0.5, // ms
          queuingDelay: 0.3 // ms
        }
      ]
    };
  }
  
  /**
   * Balanced delays scenario - all four components contribute roughly equally
   */
  createBalancedScenario() {
    // Target: ~10ms for each component (40ms total)
    // For transmission delay of 10ms with 1500 byte packet:
    // Required bandwidth = (1500 * 8 bits) / 0.01s = 1.2 Mbps
    
    // For propagation delay of 10ms:
    // Required distance = 10ms * 200,000 km/s = 2000 km
    
    return {
      name: 'Balanced Delays',
      description: 'All four delay components contribute roughly equally',
      packetSize: 1500, // bytes
      nodes: [
        { name: 'Home', type: 'Host' },
        { name: 'Regional ISP', type: 'Router' },
        { name: 'Remote Server', type: 'Server' }
      ],
      hops: [
        {
          name: 'Home to Regional ISP',
          bandwidth: 1.2e6, // 1.2 Mbps (DSL-like) - gives 10ms transmission delay
          distance: 2000e3, // 2000 km - gives 10ms propagation delay
          propagationSpeed: 2e8, // typical cable speed
          processingDelay: 10, // 10ms processing
          queuingDelay: 10 // 10ms queuing
        },
        {
          name: 'ISP to Server',
          bandwidth: 100e6, // 100 Mbps (faster link, minimal transmission)
          distance: 100e3, // 100 km (shorter distance)
          propagationSpeed: 2e8,
          processingDelay: 1, // ms
          queuingDelay: 1 // ms
        }
      ]
    };
  }
  
  /**
   * Satellite internet scenario
   */
  createSatelliteScenario() {
    return {
      name: 'Satellite Internet',
      description: 'Geostationary satellite connection with extreme propagation delay',
      packetSize: 1500, // bytes
      nodes: [
        { name: 'User', type: 'Host' },
        { name: 'Satellite', type: 'Satellite' },
        { name: 'Ground Station', type: 'Router' },
        { name: 'Server', type: 'Server' }
      ],
      hops: [
        {
          name: 'User to Satellite',
          bandwidth: 25e6, // 25 Mbps uplink
          distance: 35786e3, // 35,786 km to geostationary orbit
          propagationSpeed: 3e8, // speed of light in vacuum
          processingDelay: 2, // ms (satellite processing)
          queuingDelay: 5 // ms (shared medium)
        },
        {
          name: 'Satellite to Ground Station',
          bandwidth: 1e9, // 1 Gbps downlink to ground station
          distance: 35786e3, // 35,786 km back down
          propagationSpeed: 3e8, // speed of light in vacuum
          processingDelay: 1, // ms
          queuingDelay: 2 // ms
        },
        {
          name: 'Ground Station to Server',
          bandwidth: 10e9, // 10 Gbps fiber
          distance: 500e3, // 500 km terrestrial
          propagationSpeed: 2e8, // fiber optic
          processingDelay: 0.5, // ms
          queuingDelay: 0.5 // ms
        }
      ]
    };
  }
  
  /**
   * Calculate statistics for a scenario
   */
  calculateStatistics(scenario) {
    const stats = {
      totalDelay: 0,
      transmissionDelay: 0,
      propagationDelay: 0,
      processingDelay: 0,
      queuingDelay: 0,
      dominantComponent: null
    };
    
    const packetSizeBits = scenario.packetSize * 8;
    
    for (const hop of scenario.hops) {
      // Transmission delay
      if (hop.bandwidth) {
        const transmission = (packetSizeBits / hop.bandwidth) * 1000;
        stats.transmissionDelay += transmission;
      }
      
      // Propagation delay
      if (hop.distance && hop.propagationSpeed) {
        const propagation = (hop.distance / hop.propagationSpeed) * 1000;
        stats.propagationDelay += propagation;
      }
      
      // Processing delay
      if (hop.processingDelay) {
        stats.processingDelay += hop.processingDelay;
      }
      
      // Queuing delay
      if (hop.queuingDelay) {
        stats.queuingDelay += hop.queuingDelay;
      }
    }
    
    stats.totalDelay = stats.transmissionDelay + stats.propagationDelay + 
                      stats.processingDelay + stats.queuingDelay;
    
    // Find dominant component
    const components = [
      { name: 'Transmission', value: stats.transmissionDelay },
      { name: 'Propagation', value: stats.propagationDelay },
      { name: 'Processing', value: stats.processingDelay },
      { name: 'Queuing', value: stats.queuingDelay }
    ];
    
    components.sort((a, b) => b.value - a.value);
    stats.dominantComponent = components[0].name;
    
    return stats;
  }
  
  /**
   * Create a custom scenario from parameters
   */
  createCustomScenario(params) {
    // This could be extended to allow users to create their own scenarios
    return {
      name: params.name || 'Custom Scenario',
      description: params.description || 'User-defined network scenario',
      packetSize: params.packetSize || 1500,
      nodes: params.nodes || [],
      hops: params.hops || []
    };
  }
}