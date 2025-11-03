/**
 * Wrapper for VisualizationOrchestrator that disables latency display for practice mode
 */

import { VisualizationOrchestrator } from '../../packet-journey/js/components/VisualizationOrchestrator.js';

export class PracticeVisualizationWrapper {
  constructor(canvasId) {
    // Create the underlying orchestrator
    this.orchestrator = new VisualizationOrchestrator(canvasId);
    
    // Store original render method
    this.originalRender = this.orchestrator.render.bind(this.orchestrator);
    
    // Override the render method to skip latency calculations
    this.orchestrator.render = this.renderPracticeMode.bind(this);
    
    // Expose necessary properties
    this.clear = this.orchestrator.clear.bind(this.orchestrator);
    this.pathRenderer = this.orchestrator.pathRenderer;
  }
  
  /**
   * Render method for practice mode - shows only network topology
   */
  renderPracticeMode(path) {
    if (!path || !path.hops) {
      console.error('Invalid path data');
      return;
    }
    
    // Store current path
    this.orchestrator.currentPath = path;
    
    // Clear canvas
    this.orchestrator.clear();
    
    // Create latency data that only shows given delays (not calculated ones)
    // Hide calculated values but show given processing and queuing delays
    const practiceLatencyData = path.hops.map((hop, index) => ({
      hop: hop,
      hopIndex: index,
      isLastHop: index === path.hops.length - 1,
      delays: {
        transmission: 0,  // Always calculated, never show
        propagation: 0,   // Always calculated, never show
        processing: index === 0 ? 0 : (hop.processingDelay || 0),  // No processing at source node
        queuing: (hop.queuingDelay !== undefined && hop.utilization === undefined) ? hop.queuingDelay : 0,  // Only show if explicitly given
        total: 0
      },
      cumulative: 0,  // Hide cumulative to avoid giving away the answer
      cumulativeDelay: 0,  // Hide cumulative to avoid giving away the answer
      cpuLoad: hop.cpuLoad || 0,  // Pass through if given
      processingPower: hop.processingPower || 'medium'  // Pass through if given
    }));
    
    // Render network path with empty latency data
    // This will show nodes and links but no delay information
    if (this.orchestrator.pathRenderer) {
      this.orchestrator.pathRenderer.render(path, practiceLatencyData);
    }
    
    // Don't render latency visualizer or hop breakdown table
    // Don't render legend
  }
  
  /**
   * Render with full latency (for showing solution)
   */
  renderWithLatency(path) {
    // Use original render method
    this.originalRender(path);
  }
  
  /**
   * Get the underlying orchestrator
   */
  getOrchestrator() {
    return this.orchestrator;
  }
  
  /**
   * Proxy other methods to orchestrator
   */
  render(path) {
    return this.renderPracticeMode(path);
  }
  
  clear() {
    return this.orchestrator.clear();
  }
  
  destroy() {
    return this.orchestrator.destroy();
  }
}