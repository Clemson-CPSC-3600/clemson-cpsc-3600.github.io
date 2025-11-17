/**
 * PacketJourneyVisualization - Refactored version using modular components
 * This is a lightweight wrapper that delegates to specialized components
 */

import { VisualizationOrchestrator } from './components/VisualizationOrchestrator.js';

export class PacketJourneyVisualization {
  constructor(canvasId) {
    try {
      // Initialize the orchestrator which manages all components
      this.orchestrator = new VisualizationOrchestrator(canvasId);
      
      // Store canvas reference for compatibility
      this.canvas = this.orchestrator.canvas;
      this.ctx = this.orchestrator.ctx;
    } catch (error) {
      console.error('Failed to initialize PacketJourneyVisualization:', error);
      throw error;
    }
  }
  
  /**
   * Render the network path visualization
   * @param {Object} path - Network path configuration with hops
   */
  render(path) {
    if (!this.orchestrator) {
      console.error('Visualization not properly initialized');
      return;
    }
    
    this.orchestrator.render(path);
  }
  
  /**
   * Update the visualization with new path data
   * @param {Object} path - Updated network path configuration
   */
  update(path) {
    if (!this.orchestrator) {
      console.error('Visualization not properly initialized');
      return;
    }
    
    this.orchestrator.update(path);
  }
  
  /**
   * Clear the visualization
   */
  clear() {
    if (!this.orchestrator) return;
    this.orchestrator.clear();
  }
  
  /**
   * Clean up resources and remove event listeners
   */
  destroy() {
    if (this.orchestrator) {
      this.orchestrator.destroy();
      this.orchestrator = null;
    }
    
    this.canvas = null;
    this.ctx = null;
  }
  
  /**
   * Handle window resize
   */
  handleResize() {
    if (!this.orchestrator) return;
    this.orchestrator.handleResize();
  }
  
  /**
   * Get current visualization state
   */
  getState() {
    if (!this.orchestrator) return null;
    
    return {
      path: this.orchestrator.currentPath,
      latencyData: this.orchestrator.currentLatencyData,
      hoveredNode: this.orchestrator.hoveredNode,
      selectedLink: this.orchestrator.selectedLink
    };
  }
  
  /**
   * Set visualization options
   */
  setOptions(options) {
    if (!this.orchestrator) return;
    
    // Update visual configuration
    if (options.nodeRadius) {
      this.orchestrator.nodeRadius = options.nodeRadius;
    }
    
    if (options.nodeSpacing) {
      this.orchestrator.nodeSpacing = options.nodeSpacing;
    }
    
    // Re-render if we have a current path
    if (this.orchestrator.currentPath) {
      this.orchestrator.render(this.orchestrator.currentPath);
    }
  }
}