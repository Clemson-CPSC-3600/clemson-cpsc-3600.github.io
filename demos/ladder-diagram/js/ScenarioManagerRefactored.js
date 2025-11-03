/**
 * Refactored ScenarioManager - Configuration-driven scenario management
 * 
 * This simplified version uses external configuration files and delegates
 * calculations to utility classes, reducing the original 364 lines to ~120
 */

import { scenarioConfigs, scenarioGroups, defaults } from './configs/scenarios.js';
import { DelayCalculator } from './utils/DelayCalculator.js';

export class ScenarioManager {
  constructor() {
    this.scenarios = {};
    this.groups = scenarioGroups;
    this.loadScenarios();
  }
  
  /**
   * Load all scenarios from configuration
   */
  loadScenarios() {
    for (const [key, config] of Object.entries(scenarioConfigs)) {
      this.scenarios[key] = this.buildScenario(config);
    }
  }
  
  /**
   * Build a scenario from configuration
   */
  buildScenario(config) {
    const scenario = {
      name: config.name,
      description: config.description,
      packetSize: config.packetSize || defaults.packetSize,
      nodes: this.parseNodes(config.nodes),
      hops: this.parseHops(config.hops)
    };
    
    // Auto-calculate statistics using utility
    scenario.statistics = DelayCalculator.calculateScenarioTotalDelay(scenario);
    
    // Add dominant component info
    scenario.dominantComponent = this.findDominantComponent(scenario.statistics);
    
    return scenario;
  }
  
  /**
   * Parse node strings into objects
   * Format: "NodeName:NodeType" or just "NodeName"
   */
  parseNodes(nodeConfig) {
    if (Array.isArray(nodeConfig)) {
      // If it's already an array of strings, parse them
      if (typeof nodeConfig[0] === 'string') {
        return nodeConfig.map(nodeStr => {
          if (nodeStr.includes(':')) {
            const [name, type] = nodeStr.split(':');
            return { name, type };
          }
          return { name: nodeStr, type: 'Node' };
        });
      }
      // If it's already an array of objects, return as-is
      return nodeConfig;
    }
    return [];
  }
  
  /**
   * Parse and enrich hop configurations
   */
  parseHops(hopConfigs) {
    if (!Array.isArray(hopConfigs)) return [];
    
    return hopConfigs.map((hop, index) => ({
      name: hop.name || `Hop ${index + 1}`,
      bandwidth: hop.bandwidth || 100e6,  // Default 100 Mbps
      distance: hop.distance || 100,      // Default 100m
      propagationSpeed: hop.propagationSpeed || defaults.propagationSpeed.copper,
      processingDelay: hop.processingDelay || 0,
      queuingDelay: hop.queuingDelay || 0
    }));
  }
  
  /**
   * Find the dominant delay component
   */
  findDominantComponent(statistics) {
    const components = [
      { name: 'Transmission', value: statistics.transmission },
      { name: 'Propagation', value: statistics.propagation },
      { name: 'Processing', value: statistics.processing },
      { name: 'Queuing', value: statistics.queuing }
    ];
    
    components.sort((a, b) => b.value - a.value);
    
    return {
      name: components[0].name,
      value: components[0].value,
      percentage: (components[0].value / statistics.total) * 100
    };
  }
  
  /**
   * Get a scenario by name
   */
  getScenario(name) {
    return this.scenarios[name] || this.scenarios.simple;
  }
  
  /**
   * Get all scenario names
   */
  getScenarioNames() {
    return Object.keys(this.scenarios);
  }
  
  /**
   * Get scenarios by group
   */
  getScenariosByGroup(groupName) {
    const group = this.groups[groupName];
    if (!group) return [];
    
    return group.scenarios
      .map(name => this.scenarios[name])
      .filter(scenario => scenario != null);
  }
  
  /**
   * Create a custom scenario from parameters
   */
  createCustomScenario(params) {
    return this.buildScenario({
      name: params.name || 'Custom Scenario',
      description: params.description || 'User-defined network scenario',
      packetSize: params.packetSize,
      nodes: params.nodes,
      hops: params.hops
    });
  }
  
  /**
   * Export scenario as configuration
   */
  exportScenarioConfig(scenario) {
    return {
      name: scenario.name,
      description: scenario.description,
      packetSize: scenario.packetSize,
      nodes: scenario.nodes.map(n => `${n.name}:${n.type}`),
      hops: scenario.hops.map(h => ({
        bandwidth: h.bandwidth,
        distance: h.distance,
        propagationSpeed: h.propagationSpeed,
        processingDelay: h.processingDelay,
        queuingDelay: h.queuingDelay
      }))
    };
  }
}