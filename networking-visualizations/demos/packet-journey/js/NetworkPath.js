import { NetworkHop } from './NetworkHop.js';

/**
 * NetworkPath - Manages a complete network path from source to destination
 */
export class NetworkPath {
  constructor() {
    this.hops = [];
    this.setupDefaultPath();
  }
  
  /**
   * Set up a realistic default path from home computer to web server
   */
  setupDefaultPath() {
    // Clear any existing hops
    this.hops = [];
    
    // Hop 1: Your computer to home router (WiFi)
    const hop1 = new NetworkHop('hop1', 'Your Computer → Home Router', 'client');
    hop1.link.distance = 0.01; // 10 meters
    
    // Hop 2: Home router to ISP edge (Cable/DSL)
    const hop2 = new NetworkHop('hop2', 'Home Router → ISP Edge', 'isp-edge');
    hop2.link.distance = 15; // 15 km to local ISP
    
    // Hop 3: ISP edge to regional ISP (Fiber)
    const hop3 = new NetworkHop('hop3', 'ISP Edge → Regional ISP', 'router');
    hop3.link.distance = 50; // 50 km to regional hub
    hop3.link.bandwidth = 1_000_000_000; // 1 Gbps
    
    // Hop 4: Regional ISP to Internet backbone (Fiber)
    const hop4 = new NetworkHop('hop4', 'Regional ISP → Internet Backbone', 'core');
    hop4.link.distance = 300; // 300 km to major peering point
    
    // Hop 5: Internet backbone to destination ISP (Fiber)
    const hop5 = new NetworkHop('hop5', 'Internet Backbone → Destination ISP', 'core');
    hop5.link.distance = 800; // 800 km cross-country
    
    // Hop 6: Destination ISP to web server (Fiber in datacenter)
    const hop6 = new NetworkHop('hop6', 'Destination ISP → Web Server', 'server');
    hop6.link.distance = 5; // 5 km within metro area
    
    // Add all hops to the path
    this.hops.push(hop1, hop2, hop3, hop4, hop5, hop6);
  }
  
  /**
   * Calculate total latency for the entire path
   * @param {number} packetSize - Packet size in bytes (default 1500 for standard MTU)
   * @returns {object} Total latency and detailed breakdown
   */
  calculateTotalLatency(packetSize = 1500) {
    const breakdown = [];
    let cumulativeLatency = 0;
    
    // Calculate latency for each hop
    for (let i = 0; i < this.hops.length; i++) {
      const hop = this.hops[i];
      const hopLatencies = hop.calculateLatencies(packetSize);
      cumulativeLatency += hopLatencies.total;
      
      breakdown.push({
        hopNumber: i + 1,
        hopId: hop.id,
        hopName: hop.name,
        latencies: hopLatencies,
        cumulative: cumulativeLatency
      });
    }
    
    // Aggregate components across all hops
    const components = this.aggregateComponents(breakdown);
    
    return {
      total: cumulativeLatency,
      breakdown: breakdown,
      components: components,
      summary: this.generateSummary(cumulativeLatency, components)
    };
  }
  
  /**
   * Sum up each latency component across all hops
   */
  aggregateComponents(breakdown) {
    const totals = {
      transmission: 0,
      propagation: 0,
      processing: 0,
      queuing: 0
    };
    
    for (const hop of breakdown) {
      totals.transmission += hop.latencies.transmission;
      totals.propagation += hop.latencies.propagation;
      totals.processing += hop.latencies.processing;
      totals.queuing += hop.latencies.queuing;
    }
    
    return totals;
  }
  
  /**
   * Generate a human-readable summary of the latency
   */
  generateSummary(total, components) {
    // Find dominant component
    let dominant = 'transmission';
    let maxValue = components.transmission;
    
    for (const [key, value] of Object.entries(components)) {
      if (value > maxValue) {
        dominant = key;
        maxValue = value;
      }
    }
    
    // Calculate percentages
    const percentages = {};
    for (const [key, value] of Object.entries(components)) {
      percentages[key] = ((value / total) * 100).toFixed(1);
    }
    
    // Generate quality assessment
    let quality = 'Excellent';
    if (total > 200) quality = 'Poor';
    else if (total > 100) quality = 'Fair';
    else if (total > 50) quality = 'Good';
    
    return {
      quality: quality,
      dominant: dominant,
      percentages: percentages,
      suitable: this.getSuitableApplications(total)
    };
  }
  
  /**
   * Determine which applications work well with this latency
   */
  getSuitableApplications(totalMs) {
    const apps = [];
    
    if (totalMs < 20) {
      apps.push('Competitive gaming', 'High-frequency trading');
    }
    if (totalMs < 50) {
      apps.push('Online gaming', 'VoIP calls', 'Video conferencing');
    }
    if (totalMs < 100) {
      apps.push('Web browsing', 'Streaming video', 'Remote desktop');
    }
    if (totalMs < 200) {
      apps.push('Email', 'File downloads', 'Cloud backup');
    }
    if (totalMs >= 200) {
      apps.push('Non-interactive applications only');
    }
    
    return apps;
  }
  
  /**
   * Find the bottleneck hop (highest total latency)
   */
  findBottleneck(packetSize = 1500) {
    let maxLatency = 0;
    let bottleneckHop = null;
    let bottleneckIndex = -1;
    
    for (let i = 0; i < this.hops.length; i++) {
      const hop = this.hops[i];
      const latencies = hop.calculateLatencies(packetSize);
      
      if (latencies.total > maxLatency) {
        maxLatency = latencies.total;
        bottleneckHop = hop;
        bottleneckIndex = i;
      }
    }
    
    return {
      hop: bottleneckHop,
      index: bottleneckIndex,
      latency: maxLatency
    };
  }
  
  /**
   * Add a new hop to the path
   */
  addHop(hop) {
    this.hops.push(hop);
  }
  
  /**
   * Remove a hop from the path
   */
  removeHop(index) {
    if (index >= 0 && index < this.hops.length) {
      this.hops.splice(index, 1);
    }
  }
  
  /**
   * Update a specific hop's parameters
   */
  updateHop(index, category, param, value) {
    if (index >= 0 && index < this.hops.length) {
      this.hops[index].updateParameter(category, param, value);
    }
  }
  
  /**
   * Load a preset configuration
   */
  loadPreset(presetName) {
    switch(presetName) {
      case 'gaming':
        this.setupGamingPath();
        break;
      case 'satellite':
        this.setupSatellitePath();
        break;
      case 'enterprise':
        this.setupEnterprisePath();
        break;
      default:
        this.setupDefaultPath();
    }
  }
  
  /**
   * Gaming-optimized path (low latency)
   */
  setupGamingPath() {
    this.hops = [];
    
    // Ethernet connection to router
    const hop1 = new NetworkHop('hop1', 'Gaming PC → Router (Ethernet)', 'client');
    hop1.link.medium = 'copper';
    hop1.link.bandwidth = 1_000_000_000; // 1 Gbps ethernet
    hop1.link.distance = 0.002; // 2 meters
    hop1.link.utilization = 0.1;
    
    // Fiber to ISP
    const hop2 = new NetworkHop('hop2', 'Router → ISP (Fiber)', 'isp-edge');
    hop2.link.medium = 'fiber';
    hop2.link.bandwidth = 1_000_000_000;
    hop2.link.distance = 10;
    hop2.link.utilization = 0.2;
    
    // Direct peering to game server
    const hop3 = new NetworkHop('hop3', 'ISP → Game Server (Direct Peering)', 'server');
    hop3.link.medium = 'fiber';
    hop3.link.bandwidth = 10_000_000_000;
    hop3.link.distance = 50;
    hop3.link.utilization = 0.3;
    
    this.hops.push(hop1, hop2, hop3);
  }
  
  /**
   * Satellite internet path (high latency)
   */
  setupSatellitePath() {
    this.hops = [];
    
    // Computer to satellite dish
    const hop1 = new NetworkHop('hop1', 'Computer → Satellite Dish', 'client');
    hop1.link.distance = 0.05; // 50 meters of cable
    
    // Up to satellite
    const hop2 = new NetworkHop('hop2', 'Dish → Satellite', 'router');
    hop2.link.medium = 'satellite';
    hop2.link.bandwidth = 25_000_000; // 25 Mbps typical satellite
    hop2.link.distance = 0; // Distance handled in propagation calc
    hop2.link.utilization = 0.4;
    
    // Satellite to ground station
    const hop3 = new NetworkHop('hop3', 'Satellite → Ground Station', 'router');
    hop3.link.medium = 'satellite';
    hop3.link.bandwidth = 25_000_000;
    hop3.link.distance = 0;
    
    // Ground station to internet
    const hop4 = new NetworkHop('hop4', 'Ground Station → Internet', 'core');
    hop4.link.distance = 100;
    
    // Internet to destination
    const hop5 = new NetworkHop('hop5', 'Internet → Destination', 'server');
    hop5.link.distance = 500;
    
    this.hops.push(hop1, hop2, hop3, hop4, hop5);
  }
  
  /**
   * Enterprise network path (optimized)
   */
  setupEnterprisePath() {
    this.hops = [];
    
    // Workstation to switch
    const hop1 = new NetworkHop('hop1', 'Workstation → Switch', 'client');
    hop1.link.medium = 'copper';
    hop1.link.bandwidth = 1_000_000_000;
    hop1.link.distance = 0.05; // 50 meters
    hop1.link.utilization = 0.1;
    hop1.device.processingPower = 'high';
    
    // Switch to core router
    const hop2 = new NetworkHop('hop2', 'Switch → Core Router', 'router');
    hop2.link.medium = 'fiber';
    hop2.link.bandwidth = 10_000_000_000; // 10 Gbps
    hop2.link.distance = 0.5; // 500 meters in building
    hop2.link.utilization = 0.2;
    hop2.device.processingPower = 'high';
    
    // Core to datacenter
    const hop3 = new NetworkHop('hop3', 'Core Router → Datacenter', 'server');
    hop3.link.medium = 'fiber';
    hop3.link.bandwidth = 10_000_000_000;
    hop3.link.distance = 2; // 2 km to local datacenter
    hop3.link.utilization = 0.15;
    hop3.device.processingPower = 'high';
    
    this.hops.push(hop1, hop2, hop3);
  }
}