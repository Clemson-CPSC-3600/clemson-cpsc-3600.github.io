/**
 * Journey Scenarios Configuration
 * Defines network path scenarios for the packet journey visualization
 */

export const journeyScenarios = {
  // Local network scenarios
  'local-network': {
    id: 'local-network',
    name: 'Local Network Transfer',
    description: 'File transfer within a local area network',
    difficulty: 'beginner',
    packetSize: 1500, // bytes
    fileSize: 10485760, // 10MB
    hops: [
      {
        node: 'Laptop',
        nodeType: 'client',
        bandwidth: 1000000000, // 1 Gbps outgoing link
        distance: 10, // 10 meters to Switch
        medium: 'copper', // Ethernet cable
        processingPower: 'medium',
        cpuLoad: 0.3,
        utilization: 0.2 // 20% utilization on local link
      },
      {
        node: 'Switch',
        nodeType: 'switch',
        bandwidth: 1000000000, // 1 Gbps outgoing link
        distance: 20, // 20 meters to File Server
        medium: 'copper', // Ethernet cable
        processingPower: 'medium',
        cpuLoad: 0.2,
        utilization: 0.3,
        processingDelay: 0.001 // 1µs
      },
      {
        node: 'File Server',
        nodeType: 'server',
        bandwidth: 10000000000, // 10 Gbps (not used for last hop)
        distance: 0, // No next hop
        processingPower: 'high',
        cpuLoad: 0.4,
        utilization: 0.5,
        processingDelay: 0.01 // 10ms
      }
    ]
  },
  
  // Home to internet scenarios
  'home-internet': {
    id: 'home-internet',
    name: 'Home Internet Connection',
    description: 'Typical home broadband connection to internet service',
    difficulty: 'beginner',
    packetSize: 1500,
    hops: [
      {
        node: 'Home PC',
        nodeType: 'client',
        bandwidth: 1000000000, // 1 Gbps NIC (LAN speed)
        distance: 1, // 1 meter to Home Router
        medium: 'copper', // Ethernet cable
        processingPower: 'medium',
        cpuLoad: 0.4,
        utilization: 0.3 // 30% utilization on local network
      },
      {
        node: 'Home Router',
        nodeType: 'router',
        bandwidth: 100000000, // 100 Mbps (ISP plan speed)
        distance: 5000, // 5000 meters to ISP Edge
        medium: 'coax', // Cable internet
        processingPower: 'low',
        cpuLoad: 0.5,
        utilization: 0.6,
        processingDelay: 0.002
      },
      {
        node: 'ISP Edge',
        nodeType: 'isp-edge',
        bandwidth: 10000000000, // 10 Gbps (ISP backbone)
        distance: 50000, // 50000 meters to Web Server
        medium: 'fiber',
        processingPower: 'high',
        cpuLoad: 0.6,
        utilization: 0.7,
        processingDelay: 0.005
      },
      {
        node: 'Web Server',
        nodeType: 'server',
        bandwidth: 10000000000, // 10 Gbps server NIC
        distance: 0, // No next hop
        processingPower: 'high',
        cpuLoad: 0.3,
        processingDelay: 0.02
      }
    ]
  },
  
  // Enterprise network
  'enterprise': {
    id: 'enterprise',
    name: 'Enterprise Network',
    description: 'Corporate network with security and load balancing',
    difficulty: 'intermediate',
    packetSize: 1500,
    hops: [
      {
        node: 'Workstation',
        nodeType: 'client',
        bandwidth: 1000000000, // 1 Gbps
        distance: 5, // 5 meters to Access Switch
        medium: 'copper', // Ethernet cable
        processingPower: 'medium',
        cpuLoad: 0.2,
        utilization: 0.2 // 20% utilization
      },
      {
        node: 'Access Switch',
        nodeType: 'switch',
        bandwidth: 1000000000,
        distance: 100, // 100 meters to Core Router
        medium: 'fiber', // Fiber optic
        processingPower: 'medium',
        cpuLoad: 0.3,
        utilization: 0.4,
        processingDelay: 0.001
      },
      {
        node: 'Core Router',
        nodeType: 'router',
        bandwidth: 10000000000, // 10 Gbps
        distance: 10, // 10 meters to Firewall
        medium: 'fiber', // Fiber optic
        processingPower: 'high',
        cpuLoad: 0.5,
        utilization: 0.6,
        processingDelay: 0.002
      },
      {
        node: 'Firewall',
        nodeType: 'firewall',
        bandwidth: 10000000000,
        distance: 10, // 10 meters to Load Balancer
        medium: 'fiber', // Fiber optic
        processingPower: 'high',
        cpuLoad: 0.7, // Higher load due to inspection
        utilization: 0.6,
        processingDelay: 0.05 // 50ms for deep packet inspection
      },
      {
        node: 'Load Balancer',
        nodeType: 'loadbalancer',
        bandwidth: 10000000000,
        distance: 10, // 10 meters to App Server
        medium: 'fiber', // Fiber optic
        processingPower: 'high',
        cpuLoad: 0.4,
        utilization: 0.5,
        processingDelay: 0.01
      },
      {
        node: 'App Server',
        nodeType: 'server',
        bandwidth: 10000000000,
        distance: 0, // No next hop
        processingPower: 'high',
        cpuLoad: 0.6,
        processingDelay: 0.1 // 100ms application processing
      }
    ]
  },
  
  // Cross-country connection
  'cross-country': {
    id: 'cross-country',
    name: 'Cross-Country Connection',
    description: 'Coast-to-coast data transfer across the internet backbone',
    difficulty: 'intermediate',
    packetSize: 1500,
    hops: [
      {
        node: 'NYC Client',
        nodeType: 'client',
        bandwidth: 1000000000, // 1 Gbps
        distance: 10000, // 10000 meters to NYC ISP
        medium: 'fiber', // Metro fiber
        processingPower: 'medium',
        cpuLoad: 0.3,
        utilization: 0.4 // 40% utilization
      },
      {
        node: 'NYC ISP',
        nodeType: 'isp-edge',
        bandwidth: 10000000000, // 10 Gbps
        distance: 1200000, // 1200000 meters to Chicago Core
        medium: 'fiber',
        processingPower: 'high',
        cpuLoad: 0.5,
        utilization: 0.6,
        processingDelay: 0.005
      },
      {
        node: 'Chicago Core',
        nodeType: 'core',
        bandwidth: 100000000000, // 100 Gbps
        distance: 1500000, // 1500000 meters to Denver Core
        medium: 'fiber',
        processingPower: 'high',
        cpuLoad: 0.4,
        utilization: 0.7,
        processingDelay: 0.001
      },
      {
        node: 'Denver Core',
        nodeType: 'core',
        bandwidth: 100000000000,
        distance: 1200000, // 1200000 meters to LA ISP
        medium: 'fiber',
        processingPower: 'high',
        cpuLoad: 0.4,
        utilization: 0.6,
        processingDelay: 0.001
      },
      {
        node: 'LA ISP',
        nodeType: 'isp-edge',
        bandwidth: 10000000000,
        distance: 15000, // 15000 meters to LA Server
        medium: 'fiber',
        processingPower: 'high',
        cpuLoad: 0.5,
        utilization: 0.7,
        processingDelay: 0.005
      },
      {
        node: 'LA Server',
        nodeType: 'server',
        bandwidth: 10000000000,
        distance: 0, // No next hop
        processingPower: 'high',
        cpuLoad: 0.4,
        processingDelay: 0.03
      }
    ]
  },
  
  // International connection
  'international': {
    id: 'international',
    name: 'International Connection',
    description: 'Intercontinental data transfer via undersea cables',
    difficulty: 'advanced',
    packetSize: 1500,
    hops: [
      {
        node: 'US Client',
        nodeType: 'client',
        bandwidth: 100000000, // 100 Mbps
        distance: 1, // 1 meter to router
        medium: 'copper', // Ethernet cable
        processingPower: 'medium',
        cpuLoad: 0.3,
        utilization: 0.5 // 50% utilization
      },
      {
        node: 'US Router',
        nodeType: 'router',
        bandwidth: 1000000000,
        distance: 1, // 1 meter
        medium: 'copper', // Ethernet cable
        processingPower: 'medium',
        cpuLoad: 0.4,
        utilization: 0.5,
        processingDelay: 0.002
      },
      {
        node: 'US ISP',
        nodeType: 'isp-edge',
        bandwidth: 10000000000,
        distance: 20, // 20 meters
        medium: 'fiber',
        processingPower: 'high',
        cpuLoad: 0.5,
        utilization: 0.6,
        processingDelay: 0.005
      },
      {
        node: 'US Backbone',
        nodeType: 'core',
        bandwidth: 100000000000,
        distance: 500000, // 500000 meters (500km)
        medium: 'fiber',
        processingPower: 'high',
        cpuLoad: 0.4,
        utilization: 0.7,
        processingDelay: 0.001
      },
      {
        node: 'Atlantic Cable',
        nodeType: 'core',
        bandwidth: 400000000000, // 400 Gbps undersea cable
        distance: 6000000, // 6000000 meters (6000km) across Atlantic
        medium: 'fiber',
        propagationSpeed: 2e8, // Speed of light in fiber
        processingPower: 'high',
        cpuLoad: 0.3,
        utilization: 0.8,
        processingDelay: 0
      },
      {
        node: 'EU Backbone',
        nodeType: 'core',
        bandwidth: 100000000000,
        distance: 300000, // 300000 meters (300km)
        medium: 'fiber',
        processingPower: 'high',
        cpuLoad: 0.4,
        utilization: 0.6,
        processingDelay: 0.001
      },
      {
        node: 'EU ISP',
        nodeType: 'isp-edge',
        bandwidth: 10000000000,
        distance: 30000, // 30000 meters (30km)
        medium: 'fiber',
        processingPower: 'high',
        cpuLoad: 0.5,
        utilization: 0.5,
        processingDelay: 0.005
      },
      {
        node: 'EU Server',
        nodeType: 'server',
        bandwidth: 10000000000,
        distance: 0, // No next hop
        processingPower: 'high',
        cpuLoad: 0.4,
        processingDelay: 0.025
      }
    ]
  },
  
  // Satellite connection
  'satellite': {
    id: 'satellite',
    name: 'Satellite Internet',
    description: 'Rural internet connection via geostationary satellite',
    difficulty: 'advanced',
    packetSize: 1500,
    hops: [
      {
        node: 'Rural Client',
        nodeType: 'client',
        bandwidth: 25000000, // 25 Mbps
        distance: 1, // 1 meter to Satellite Dish
        medium: 'copper', // Ethernet cable
        processingPower: 'low',
        cpuLoad: 0.4,
        utilization: 0.6 // 60% utilization - satellite often congested
      },
      {
        node: 'Satellite Dish',
        nodeType: 'router',
        bandwidth: 25000000,
        distance: 35786000, // 35786000 meters to Satellite
        medium: 'satellite', // Radio waves through space
        processingPower: 'low',
        cpuLoad: 0.3,
        utilization: 0.7,
        processingDelay: 0.01
      },
      {
        node: 'Satellite',
        nodeType: 'core',
        bandwidth: 1000000000, // 1 Gbps satellite capacity
        distance: 35786000, // 35786000 meters back to Ground Station
        medium: 'satellite', // Radio waves through space
        processingPower: 'medium',
        cpuLoad: 0.6,
        utilization: 0.8,
        processingDelay: 0.05 // Satellite processing
      },
      {
        node: 'Ground Station',
        nodeType: 'isp-edge',
        bandwidth: 10000000000,
        distance: 50000, // 50000 meters to Internet Gateway
        medium: 'fiber', // Ground network is fiber
        processingPower: 'high',
        cpuLoad: 0.5,
        utilization: 0.6,
        processingDelay: 0.01
      },
      {
        node: 'Internet Gateway',
        nodeType: 'core',
        bandwidth: 10000000000,
        distance: 100000, // 100000 meters to Content Server
        medium: 'fiber',
        processingPower: 'high',
        cpuLoad: 0.4,
        utilization: 0.5,
        processingDelay: 0.002
      },
      {
        node: 'Content Server',
        nodeType: 'server',
        bandwidth: 10000000000,
        distance: 0, // No next hop
        processingPower: 'high',
        cpuLoad: 0.3,
        processingDelay: 0.02
      }
    ]
  },
  
  // Congested network scenario
  'congested': {
    id: 'congested',
    name: 'Congested Network',
    description: 'Network under heavy load with significant queuing delays',
    difficulty: 'advanced',
    packetSize: 1500,
    hops: [
      {
        node: 'Client',
        nodeType: 'client',
        bandwidth: 100000000, // 100 Mbps
        distance: 5, // 5 meters to Overloaded Router
        medium: 'copper', // Ethernet cable
        processingPower: 'low',
        cpuLoad: 0.9, // High CPU load
        utilization: 0.8 // 80% utilization - congested
      },
      {
        node: 'Overloaded Router',
        nodeType: 'router',
        bandwidth: 100000000, // Limited bandwidth
        distance: 10000, // 10000 meters to Congested ISP
        medium: 'coax', // Cable internet
        processingPower: 'low',
        cpuLoad: 0.95, // Very high load
        utilization: 0.95, // Near capacity - will generate high queuing
        processingDelay: 0.02
      },
      {
        node: 'Congested ISP',
        nodeType: 'isp-edge',
        bandwidth: 1000000000,
        distance: 50000, // 50000 meters to Busy Server
        medium: 'copper', // Older infrastructure
        propagationSpeed: 2e8,
        processingPower: 'medium',
        cpuLoad: 0.85,
        utilization: 0.9, // 90% utilization - will generate high queuing
        processingDelay: 0.01
      },
      {
        node: 'Busy Server',
        nodeType: 'server',
        bandwidth: 1000000000,
        distance: 0, // No next hop
        processingPower: 'medium',
        cpuLoad: 0.9, // Server under load
        processingDelay: 0.2 // 200ms processing time
      }
    ]
  }
};

/**
 * Get scenario by ID
 */
export function getScenario(id) {
  return journeyScenarios[id] || null;
}

/**
 * Get all scenarios
 */
export function getAllScenarios() {
  return Object.values(journeyScenarios);
}

/**
 * Get scenarios by difficulty
 */
export function getScenariosByDifficulty(difficulty) {
  return Object.values(journeyScenarios).filter(
    scenario => scenario.difficulty === difficulty
  );
}

/**
 * Generate random scenario variation
 */
export function generateRandomVariation(baseScenarioId) {
  const base = journeyScenarios[baseScenarioId];
  if (!base) return null;
  
  // Create a deep copy
  const variation = JSON.parse(JSON.stringify(base));
  
  // Add some random variations
  variation.hops.forEach(hop => {
    // Vary CPU load by ±20%
    if (hop.cpuLoad !== undefined) {
      hop.cpuLoad = Math.max(0, Math.min(1, 
        hop.cpuLoad + (Math.random() - 0.5) * 0.4
      ));
    }
    
    // Vary utilization by ±15%
    if (hop.utilization !== undefined) {
      hop.utilization = Math.max(0, Math.min(1,
        hop.utilization + (Math.random() - 0.5) * 0.3
      ));
    }
    
    // Vary processing delay by ±30%
    if (hop.processingDelay !== undefined) {
      hop.processingDelay = Math.max(0,
        hop.processingDelay * (0.7 + Math.random() * 0.6)
      );
    }
  });
  
  variation.name += ' (Variation)';
  return variation;
}