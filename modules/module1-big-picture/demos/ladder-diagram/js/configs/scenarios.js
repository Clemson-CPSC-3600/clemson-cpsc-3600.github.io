/**
 * Scenario configurations for network simulations
 * 
 * This configuration-driven approach eliminates code duplication and makes
 * scenarios easy to modify and extend. Each scenario defines nodes and hops
 * with their respective properties.
 */

export const scenarioConfigs = {
  simple: {
    name: 'Simple 2-Hop Network',
    description: 'A basic network with one router between source and destination',
    packetSize: 1500,
    nodes: ['Source:Host', 'Router:Router', 'Destination:Host'],
    hops: [
      {
        bandwidth: 100e6,        // 100 Mbps
        distance: 100,           // meters
        propagationSpeed: 2e8,   // 2/3 speed of light (copper)
        processingDelay: 0.5,    // ms
        queuingDelay: 0.2        // ms
      },
      {
        bandwidth: 100e6,
        distance: 100,
        propagationSpeed: 2e8,
        processingDelay: 0.5,
        queuingDelay: 0.1
      }
    ]
  },
  
  lan: {
    name: 'Local Area Network',
    description: 'High-speed local network with minimal delays',
    packetSize: 1500,
    nodes: ['Client:Host', 'Switch:Switch', 'Server:Server'],
    hops: [
      {
        bandwidth: 1e9,          // 1 Gbps
        distance: 50,            // meters
        propagationSpeed: 2e8,
        processingDelay: 0.01,   // Fast switch
        queuingDelay: 0          // No congestion
      },
      {
        bandwidth: 1e9,
        distance: 50,
        propagationSpeed: 2e8,
        processingDelay: 0.05,   // Server processing
        queuingDelay: 0
      }
    ]
  },
  
  wan: {
    name: 'Wide Area Network',
    description: 'Cross-country connection with significant propagation delay',
    packetSize: 1500,
    nodes: ['NYC:Host', 'Chicago:Router', 'Denver:Router', 'LA:Host'],
    hops: [
      {
        bandwidth: 10e9,         // 10 Gbps backbone
        distance: 1200e3,        // 1200 km
        propagationSpeed: 2e8,
        processingDelay: 0.5,
        queuingDelay: 0.8        // Some congestion
      },
      {
        bandwidth: 10e9,
        distance: 1500e3,        // 1500 km
        propagationSpeed: 2e8,
        processingDelay: 0.5,
        queuingDelay: 1.2        // More congestion
      },
      {
        bandwidth: 10e9,
        distance: 1300e3,        // 1300 km
        propagationSpeed: 2e8,
        processingDelay: 0.5,
        queuingDelay: 0.5
      }
    ]
  },
  
  congested: {
    name: 'Congested Network',
    description: 'Network experiencing heavy congestion with significant queuing delays',
    packetSize: 1500,
    nodes: ['User:Host', 'ISP Router:Router', 'Core Router:Router', 'CDN:Server'],
    hops: [
      {
        bandwidth: 100e6,        // 100 Mbps home connection
        distance: 10e3,          // 10 km to ISP
        propagationSpeed: 2e8,
        processingDelay: 2,      // Congested router
        queuingDelay: 15         // Heavy queuing
      },
      {
        bandwidth: 1e9,          // 1 Gbps
        distance: 100e3,         // 100 km
        propagationSpeed: 2e8,
        processingDelay: 1.5,
        queuingDelay: 8          // Moderate queuing
      },
      {
        bandwidth: 10e9,         // 10 Gbps
        distance: 50e3,          // 50 km
        propagationSpeed: 2e8,
        processingDelay: 0.3,
        queuingDelay: 2          // Light queuing at destination
      }
    ]
  },
  
  transcontinental: {
    name: 'Transcontinental Cable',
    description: 'NYC to London via undersea fiber optic cable',
    packetSize: 1500,
    nodes: ['NYC:Host', 'Atlantic Cable:Router', 'London:Host'],
    hops: [
      {
        bandwidth: 100e9,        // 100 Gbps
        distance: 100e3,         // 100 km to cable landing station
        propagationSpeed: 2e8,   // Fiber optic
        processingDelay: 0.5,
        queuingDelay: 0.2
      },
      {
        bandwidth: 100e9,        // 100 Gbps undersea cable
        distance: 5500e3,        // 5500 km across Atlantic
        propagationSpeed: 2e8,   // Fiber optic undersea
        processingDelay: 0.5,
        queuingDelay: 0.3
      }
    ]
  },
  
  satellite: {
    name: 'Satellite Internet',
    description: 'Geostationary satellite connection with extreme propagation delay',
    packetSize: 1500,
    nodes: ['User:Host', 'Satellite:Satellite', 'Ground Station:Router', 'Server:Server'],
    hops: [
      {
        bandwidth: 25e6,         // 25 Mbps uplink
        distance: 35786e3,       // 35,786 km to geostationary orbit
        propagationSpeed: 3e8,   // Speed of light in vacuum
        processingDelay: 2,      // Satellite processing
        queuingDelay: 5          // Shared medium
      },
      {
        bandwidth: 1e9,          // 1 Gbps downlink to ground station
        distance: 35786e3,       // 35,786 km back down
        propagationSpeed: 3e8,
        processingDelay: 1,
        queuingDelay: 2
      },
      {
        bandwidth: 10e9,         // 10 Gbps fiber
        distance: 500e3,         // 500 km terrestrial
        propagationSpeed: 2e8,   // Fiber optic
        processingDelay: 0.5,
        queuingDelay: 0.5
      }
    ]
  },
  
  balanced: {
    name: 'Balanced Delays',
    description: 'All four delay components contribute roughly equally',
    packetSize: 1500,
    nodes: ['Home:Host', 'Regional ISP:Router', 'Remote Server:Server'],
    hops: [
      {
        // For ~10ms transmission delay with 1500 byte packet:
        // Required bandwidth = (1500 * 8) / 0.01 = 1.2 Mbps
        bandwidth: 1.2e6,        // 1.2 Mbps (DSL-like)
        // For ~10ms propagation delay:
        // Required distance = 10ms * 200,000 km/s = 2000 km
        distance: 2000e3,        // 2000 km
        propagationSpeed: 2e8,
        processingDelay: 10,     // 10ms processing
        queuingDelay: 10         // 10ms queuing
      },
      {
        bandwidth: 100e6,        // 100 Mbps (faster link)
        distance: 100e3,         // 100 km (shorter distance)
        propagationSpeed: 2e8,
        processingDelay: 1,
        queuingDelay: 1
      }
    ]
  },
  
  // Educational scenarios
  
  transmissionDominant: {
    name: 'Transmission-Dominant',
    description: 'Scenario where transmission delay dominates (slow link, large packet)',
    packetSize: 10000,  // 10KB packet
    nodes: ['Source:Host', 'Destination:Host'],
    hops: [
      {
        bandwidth: 56e3,         // 56 Kbps dial-up
        distance: 10,            // 10 meters (LAN)
        propagationSpeed: 2e8,
        processingDelay: 0.01,
        queuingDelay: 0
      }
    ]
  },
  
  propagationDominant: {
    name: 'Propagation-Dominant',
    description: 'Scenario where propagation delay dominates (long distance)',
    packetSize: 64,  // Small packet
    nodes: ['Earth:Host', 'Mars Rover:Host'],
    hops: [
      {
        bandwidth: 1e9,          // 1 Gbps (fast link)
        distance: 225e9,         // 225 million km (avg Earth-Mars distance)
        propagationSpeed: 3e8,   // Speed of light
        processingDelay: 0,
        queuingDelay: 0
      }
    ]
  },
  
  processingDominant: {
    name: 'Processing-Dominant',
    description: 'Scenario with heavy processing (deep packet inspection, encryption)',
    packetSize: 1500,
    nodes: ['Client:Host', 'Security Appliance:Firewall', 'Server:Server'],
    hops: [
      {
        bandwidth: 10e9,         // 10 Gbps
        distance: 100,           // 100 meters
        propagationSpeed: 2e8,
        processingDelay: 50,     // 50ms for deep inspection
        queuingDelay: 0
      },
      {
        bandwidth: 10e9,
        distance: 100,
        propagationSpeed: 2e8,
        processingDelay: 30,     // 30ms for decryption/processing
        queuingDelay: 0
      }
    ]
  },
  
  queuingDominant: {
    name: 'Queuing-Dominant',
    description: 'Heavily congested network during peak hours',
    packetSize: 1500,
    nodes: ['Home:Host', 'Congested ISP:Router', 'Internet:Cloud'],
    hops: [
      {
        bandwidth: 1e9,          // 1 Gbps local
        distance: 1000,          // 1 km
        propagationSpeed: 2e8,
        processingDelay: 0.5,
        queuingDelay: 100        // 100ms severe congestion
      },
      {
        bandwidth: 10e9,         // 10 Gbps backbone
        distance: 10e3,          // 10 km
        propagationSpeed: 2e8,
        processingDelay: 0.5,
        queuingDelay: 50         // 50ms congestion
      }
    ]
  }
};

// Preset groups for organization
export const scenarioGroups = {
  basic: {
    name: 'Basic Scenarios',
    scenarios: ['simple', 'lan', 'wan']
  },
  realWorld: {
    name: 'Real-World Networks',
    scenarios: ['congested', 'transcontinental', 'satellite']
  },
  educational: {
    name: 'Educational (Dominant Delays)',
    scenarios: ['balanced', 'transmissionDominant', 'propagationDominant', 'processingDominant', 'queuingDominant']
  }
};

// Default configuration values
export const defaults = {
  packetSize: 1500,                    // Standard Ethernet MTU
  propagationSpeed: {
    copper: 2e8,                       // 2/3 speed of light
    fiber: 2e8,                        // Similar in fiber (slightly faster in practice)
    wireless: 3e8,                     // Speed of light in air/vacuum
  },
  processingDelay: {
    switch: 0.01,                      // L2 switch (microseconds to ms)
    router: 0.5,                       // L3 router  
    firewall: 2,                       // Stateful firewall
    server: 1                          // Application server
  }
};