/**
 * VisualizationOrchestrator - Main orchestrator for packet journey visualization
 * Coordinates between Canvas rendering, tooltips, popups, and state management
 */

import { CanvasHelper } from '../../../../shared/utils/CanvasHelper.js';
import { DelayCalculator } from '../../../../shared/utils/DelayCalculator.js';
import { NetworkFormatter } from '../../../../shared/utils/NetworkFormatter.js';
import { COLORS } from '../../../../shared/constants/colors.js';
import { SIZES } from '../../../../shared/constants/sizes.js';
import { PopupManager } from './PopupManager.js';
import { TooltipManager } from './TooltipManager.js';
// Using debug version to troubleshoot link rendering
import { CanvasPathRenderer } from './CanvasPathRendererDebug.js';
import { LatencyVisualizer } from './LatencyVisualizer.js';
import { HopBreakdownTable } from './HopBreakdownTable.js';

export class VisualizationOrchestrator {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      throw new Error(`Canvas with id '${canvasId}' not found`);
    }
    
    this.ctx = this.canvas.getContext('2d');
    this.canvasHelper = new CanvasHelper(this.ctx);
    
    // Initialize components
    this.popupManager = new PopupManager();
    this.tooltipManager = new TooltipManager();
    this.pathRenderer = null; // Will be initialized after canvas setup
    this.latencyVisualizer = null; // Will be initialized after canvas setup
    this.hopBreakdownTable = null; // Will be initialized if container exists
    
    // State management
    this.currentPath = null;
    this.currentLatencyData = null;
    this.hoveredNode = null;
    this.selectedLink = null;
    
    // Visual configuration
    this.nodeRadius = SIZES.NODE.RADIUS;
    this.nodeSpacing = 150;
    this.width = 0;
    this.height = 0;
    this.dpr = 1;
    
    // Initialize
    this.setupCanvas();
    this.initializeComponents();
    this.setupEventListeners();
  }
  
  /**
   * Setup canvas dimensions and high DPI support
   */
  setupCanvas() {
    const container = this.canvas.parentElement;
    const containerRect = container.getBoundingClientRect();
    const width = Math.floor(containerRect.width - 48); // Account for padding
    const height = 500; // Fixed height
    
    // Setup high DPI
    const { dpr } = this.canvasHelper.setupHighDPI(this.canvas, width, height);
    
    // Store dimensions
    this.width = width;
    this.height = height;
    this.dpr = dpr;
  }
  
  /**
   * Initialize sub-components with canvas dimensions
   */
  initializeComponents() {
    // Initialize path renderer
    this.pathRenderer = new CanvasPathRenderer(
      this.ctx,
      this.width,
      this.height,
      this.canvasHelper
    );
    
    // Initialize latency visualizer
    this.latencyVisualizer = new LatencyVisualizer(
      this.ctx,
      this.width,
      this.height,
      this.canvasHelper
    );
    
    // Initialize hop breakdown table if container exists
    if (document.getElementById('hop-breakdown-container')) {
      this.hopBreakdownTable = new HopBreakdownTable('hop-breakdown-container');
    }
  }
  
  /**
   * Setup event listeners for interaction
   */
  setupEventListeners() {
    // Canvas click handler
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      this.handleClick(x, y, e.clientX, e.clientY);
    });
    
    // Canvas hover handler
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      this.handleHover(x, y, e.clientX, e.clientY);
    });
    
    // Mouse leave handler
    this.canvas.addEventListener('mouseleave', () => {
      this.hoveredNode = null;
      this.tooltipManager.hide();
      this.canvas.style.cursor = 'default';
    });
    
    // Window resize handler
    window.addEventListener('resize', () => {
      this.handleResize();
    });
  }
  
  /**
   * Handle canvas click events
   */
  handleClick(x, y, clientX, clientY) {
    // Check if click is on a link
    const clickedLink = this.pathRenderer.getLinkAt(x, y);
    
    if (clickedLink) {
      this.selectedLink = clickedLink;
      this.popupManager.show(
        clickedLink.region,
        clickedLink.hop,
        clientX,
        clientY
      );
    } else {
      this.selectedLink = null;
      this.popupManager.hide();
    }
  }
  
  /**
   * Handle hover events
   */
  handleHover(x, y, clientX, clientY) {
    // Track previous hover state
    const previousBar = this.latencyVisualizer.hoveredBar;
    
    // First check for chart bar hover
    const hoveredBar = this.latencyVisualizer.checkHover(x, y);
    if (hoveredBar) {
      this.canvas.style.cursor = 'pointer';
      // Re-render to clear any previous tooltip
      this.render(this.currentPath);
      // Draw the tooltip on top (this is drawn after render, so it appears)
      this.latencyVisualizer.drawBarTooltip(hoveredBar, x, y);
      return;
    }
    
    // Check for node hover
    const hoveredNode = this.pathRenderer.getNodeAt(x, y);
    
    if (hoveredNode) {
      if (hoveredNode !== this.hoveredNode) {
        this.hoveredNode = hoveredNode;
        this.canvas.style.cursor = 'pointer';
        
        // Show tooltip with node information
        const nodeInfo = this.getNodeInfo(hoveredNode);
        this.tooltipManager.showNodeTooltip(
          hoveredNode,
          clientX,
          clientY,
          nodeInfo
        );
      }
      // If we were hovering a bar, clear it
      if (previousBar) {
        this.latencyVisualizer.hoveredBar = null;
        this.render(this.currentPath);
      }
    } else {
      // Check for link hover
      const hoveredLink = this.pathRenderer.getLinkAt(x, y);
      
      if (hoveredLink) {
        this.canvas.style.cursor = 'pointer';
        
        // Show link tooltip
        this.tooltipManager.showLinkTooltip(
          hoveredLink.hop,
          clientX,
          clientY
        );
        // If we were hovering a bar, clear it
        if (previousBar) {
          this.latencyVisualizer.hoveredBar = null;
          this.render(this.currentPath);
        }
      } else {
        // No hover - clear everything
        if (this.hoveredNode || previousBar) {
          this.hoveredNode = null;
          this.latencyVisualizer.hoveredBar = null;
          this.tooltipManager.hide();
          // Re-render to clear bar tooltip
          this.render(this.currentPath);
        }
        this.canvas.style.cursor = 'default';
      }
    }
  }
  
  /**
   * Get formatted information for a node
   */
  getNodeInfo(node) {
    if (!this.currentLatencyData) return {};
    
    const nodeData = this.currentLatencyData.find(d => d.node === node);
    if (!nodeData) return {};
    
    return {
      processingPower: nodeData.processingPower,
      cpuLoad: nodeData.cpuLoad,
      latency: nodeData.delays ? nodeData.delays.processing : undefined,
      cumulativeLatency: nodeData.cumulativeDelay,
      status: this.getNodeStatus(nodeData)
    };
  }
  
  /**
   * Determine node status based on performance
   */
  getNodeStatus(nodeData) {
    if (!nodeData.cpuLoad) return 'Online';
    if (nodeData.cpuLoad > 0.8) return 'Busy';
    if (nodeData.cpuLoad > 0.9) return 'Error';
    return 'Online';
  }
  
  /**
   * Handle window resize
   */
  handleResize() {
    // Store current breakdown table state
    const hadBreakdownTable = this.hopBreakdownTable !== null;
    
    this.setupCanvas();
    this.initializeComponents();
    
    // Re-initialize hop breakdown table if it was present
    if (hadBreakdownTable && !this.hopBreakdownTable) {
      if (document.getElementById('hop-breakdown-container')) {
        this.hopBreakdownTable = new HopBreakdownTable('hop-breakdown-container');
      }
    }
    
    if (this.currentPath) {
      this.render(this.currentPath);
    }
  }
  
  /**
   * Main render method
   */
  render(path) {
    if (!path || !path.hops) {
      console.error('Invalid path data');
      return;
    }
    
    // Store current path
    this.currentPath = path;
    
    // Calculate latency data
    this.currentLatencyData = this.calculateLatencyData(path);
    
    // Clear canvas
    this.clear();
    
    // Render network path
    const nodePositions = this.pathRenderer.render(path, this.currentLatencyData);
    
    // Render latency breakdown
    this.latencyVisualizer.render(this.currentLatencyData, nodePositions);
    
    // Update hop breakdown table if it exists
    if (this.hopBreakdownTable) {
      // Use standard MTU packet size
      const packetSize = 1500;
      this.hopBreakdownTable.update(this.currentLatencyData, path, packetSize);
    }
    
    // Render legend
    this.renderLegend();
  }
  
  /**
   * Calculate latency data for the path
   */
  calculateLatencyData(path) {
    const latencyData = [];
    let cumulativeDelay = 0;
    
    path.hops.forEach((hop, index) => {
      const isLastHop = index === path.hops.length - 1;
      let delays;
      
      if (isLastHop) {
        // Last node only has processing delay (no outgoing link)
        delays = {
          transmission: 0,
          propagation: 0,
          processing: hop.processingDelay || 0,
          queuing: 0,
          total: hop.processingDelay || 0
        };
      } else {
        // Regular hop with outgoing link
        delays = DelayCalculator.calculateHopDelays(hop, 1500);
      }
      
      cumulativeDelay += delays.total;
      
      latencyData.push({
        node: hop.node,
        nodeType: hop.nodeType,
        delays: delays,
        cumulativeDelay: cumulativeDelay,
        processingPower: hop.processingPower,
        cpuLoad: hop.cpuLoad || 0,
        index: index,
        isLastHop: isLastHop
      });
    });
    
    return latencyData;
  }
  
  /**
   * Placeholder for any future legend/indicator needs
   */
  renderLegend() {
    // Currently no legend needed - bottleneck is shown visually on nodes
  }
  
  /**
   * Clear the canvas
   */
  clear() {
    this.canvasHelper.clear(0, 0, this.width, this.height);
  }
  
  /**
   * Update the visualization with new path data
   */
  update(path) {
    this.render(path);
  }
  
  /**
   * Clean up resources
   */
  destroy() {
    // Remove event listeners
    this.canvas.removeEventListener('click', this.handleClick);
    this.canvas.removeEventListener('mousemove', this.handleHover);
    this.canvas.removeEventListener('mouseleave', this.handleMouseLeave);
    window.removeEventListener('resize', this.handleResize);
    
    // Destroy components
    this.popupManager.destroy();
    this.tooltipManager.destroy();
    
    // Clear references
    this.currentPath = null;
    this.currentLatencyData = null;
    this.hoveredNode = null;
    this.selectedLink = null;
  }
}