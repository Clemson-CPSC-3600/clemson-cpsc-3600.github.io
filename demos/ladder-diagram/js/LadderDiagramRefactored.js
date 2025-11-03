/**
 * Refactored LadderDiagram - Main visualization orchestrator
 * 
 * This is a dramatically simplified version that delegates rendering
 * to specialized components, reducing the original 1400 lines to ~300
 */

import { ScaleManager } from './rendering/ScaleManager.js';
import { GridRenderer } from './rendering/GridRenderer.js';
import { AxisRenderer } from './rendering/AxisRenderer.js';
import { PathRenderer } from './rendering/PathRenderer.js';
import { PacketRenderer } from './rendering/PacketRenderer.js';
import { TimeLineRenderer } from './rendering/TimeLineRenderer.js';
import { SVGBuilder } from './utils/SVGBuilder.js';
import { SIZES, COLORS, DEFAULTS } from './constants.js';

export class LadderDiagram {
  constructor(svgElement) {
    this.svg = svgElement;
    this.visualizationMode = 'single';
    
    // Core components
    this.scaleManager = new ScaleManager();
    this.svgBuilder = new SVGBuilder(this.svg);
    
    // Rendering components (initialized after setup)
    this.gridRenderer = null;
    this.axisRenderer = null;
    this.pathRenderer = null;
    this.packetRenderer = null;
    this.timeLineRenderer = null;
    
    // State
    this.scenario = null;
    this.currentTime = 0;
    
    // Layer groups
    this.layers = {};
    
    this.setupSVG();
  }

  /**
   * Setup SVG structure with layers
   */
  setupSVG() {
    // Clear any existing content
    this.svgBuilder.clear();
    
    // Get container dimensions
    const rect = this.svg.getBoundingClientRect();
    this.updateDimensions(rect.width || 800, rect.height || 600);
    
    // Create main container with margins
    this.plotGroup = this.svgBuilder.group({
      transform: `translate(${SIZES.MARGIN.left}, ${SIZES.MARGIN.top})`,
      class: 'plot-area'
    });
    
    // Create layers in rendering order
    this.layers = {
      grid: this.createLayer('grid-layer'),
      path: this.createLayer('path-layer'),
      packet: this.createLayer('packet-layer'),
      axis: this.createLayer('axis-layer'),
      overlay: this.createLayer('overlay-layer'),
      timeline: this.createLayer('timeline-layer')
    };
  }

  /**
   * Create a rendering layer
   * @private
   */
  createLayer(className) {
    const layer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    layer.setAttribute('class', className);
    this.plotGroup.appendChild(layer);
    return layer;
  }


  /**
   * Update dimensions based on container size
   */
  updateDimensions(width, height) {
    this.svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    this.svg.setAttribute('width', width);
    this.svg.setAttribute('height', height);
    
    // Update scale manager dimensions
    this.scaleManager.updateDimensions(width, height);
  }

  /**
   * Load a network scenario
   */
  loadScenario(scenario) {
    this.scenario = scenario;
    this.currentTime = 0;
    
    // Update scales
    this.scaleManager.updateScales(scenario, {
      timeMultiplier: this.visualizationMode === 'multi' ? 
        DEFAULTS.MULTI_PACKET_TIME_MULTIPLIER : 
        DEFAULTS.TIME_SCALE_MULTIPLIER
    });
    
    // Create/update rendering components
    this.initializeRenderers();
    
    // Clear any existing packets before rendering new scenario
    if (this.packetRenderer) {
      this.packetRenderer.clear();
    }
    if (this.timeLineRenderer) {
      this.timeLineRenderer.clear();
    }
    
    // Render static elements
    this.renderStaticElements();
    
    // Reset time line
    this.updateTimeLine(0);
  }

  /**
   * Initialize or update rendering components
   * @private
   */
  initializeRenderers() {
    // Ensure layers exist
    if (!this.layers || !this.layers.axis) {
      console.error('Layers not initialized before creating renderers');
      return;
    }
    
    // Clear existing renderers
    if (this.gridRenderer) {
      this.gridRenderer.clear();
    }
    if (this.axisRenderer) {
      this.axisRenderer.clear();
    }
    if (this.pathRenderer) {
      this.pathRenderer.clear();
    }
    if (this.packetRenderer) {
      this.packetRenderer.clear();
    }
    
    // Create new renderers with appropriate containers
    this.gridRenderer = new GridRenderer(
      this.layers.grid,
      this.scaleManager
    );
    
    this.axisRenderer = new AxisRenderer(
      this.layers.axis,
      this.scaleManager,
      this.scenario
    );
    
    this.pathRenderer = new PathRenderer(
      this.layers.path,
      this.scaleManager,
      this.scenario
    );
    
    this.packetRenderer = new PacketRenderer(
      this.layers.packet,
      this.scaleManager
    );
    
    this.timeLineRenderer = new TimeLineRenderer(
      this.layers.timeline,
      this.scaleManager
    );
  }

  /**
   * Render all static elements (axes, paths, etc.)
   * @private
   */
  renderStaticElements() {
    // Check if renderers exist
    if (!this.gridRenderer || !this.axisRenderer || !this.pathRenderer) {
      console.error('Renderers not initialized before rendering static elements');
      return;
    }
    
    // Render grid first (behind everything)
    this.gridRenderer.render();
    
    // Render axes and labels
    this.axisRenderer.render();
    
    // Render packet paths
    this.pathRenderer.render();
  }

  /**
   * Update packet visualization based on tracker state
   */
  updatePackets(trackerState) {
    if (!this.scenario || !trackerState) return;
    
    // Update current time
    this.currentTime = trackerState.time;
    
    // Clear and render packets
    this.packetRenderer.render(
      trackerState.packets,
      trackerState.time,
      this.visualizationMode,
      this.scenario
    );
    
    // Update time line
    this.updateTimeLine(trackerState.time);
    
    // Update any highlights
    this.updateHighlights(trackerState);
  }

  /**
   * Update the time indicator line
   * @private
   */
  updateTimeLine(time) {
    if (this.timeLineRenderer) {
      this.timeLineRenderer.render(time, this.scenario);
    }
  }

  /**
   * Update visual highlights based on tracker state
   * @private
   */
  updateHighlights(trackerState) {
    // Highlight active segments for packets in transit
    const activeSegments = new Set();
    
    trackerState.packets.forEach(packet => {
      if (packet.phase === 'in-transit' && packet.currentHop !== undefined) {
        activeSegments.add(packet.currentHop);
      }
    });
    
    // Apply highlighting
    if (activeSegments.size > 0 && this.visualizationMode === 'single') {
      activeSegments.forEach(segmentIndex => {
        this.pathRenderer.highlightSegment(segmentIndex);
      });
    } else {
      this.pathRenderer.clearHighlight();
    }
  }

  /**
   * Set visualization mode
   */
  setVisualizationMode(mode) {
    const previousMode = this.visualizationMode;
    this.visualizationMode = mode;
    
    // Reload scenario if mode changed and we have a scenario
    if (previousMode !== mode && this.scenario) {
      this.loadScenario(this.scenario);
    }
  }

  /**
   * Clear the entire diagram
   */
  clear() {
    this.svgBuilder.clear();
    this.currentTime = 0;
    this.scenario = null;
  }

  /**
   * Reset to initial state
   */
  reset() {
    this.currentTime = 0;
    if (this.scenario) {
      // Clear packets and timeline
      this.packetRenderer.clear();
      if (this.timeLineRenderer) {
        this.timeLineRenderer.clear();
      }
      
      // Re-render static elements
      this.renderStaticElements();
      this.updateTimeLine(0);
      
      // Clear any highlights
      this.pathRenderer.clearHighlight();
    }
  }

  /**
   * Get current visualization state
   */
  getState() {
    return {
      scenario: this.scenario,
      currentTime: this.currentTime,
      visualizationMode: this.visualizationMode,
      dimensions: this.scaleManager.getScales()
    };
  }

  /**
   * Handle window resize
   */
  handleResize() {
    const rect = this.svg.getBoundingClientRect();
    this.updateDimensions(rect.width, rect.height);
    
    if (this.scenario) {
      this.loadScenario(this.scenario);
    }
  }

  /**
   * Export diagram as SVG string
   */
  exportSVG() {
    const serializer = new XMLSerializer();
    return serializer.serializeToString(this.svg);
  }

  /**
   * Enable/disable debug mode
   */
  setDebugMode(enabled) {
    if (enabled) {
      this.svg.classList.add('debug-mode');
    } else {
      this.svg.classList.remove('debug-mode');
    }
  }
}