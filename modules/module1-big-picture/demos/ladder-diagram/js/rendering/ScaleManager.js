/**
 * ScaleManager - Manages scales and dimensions for the ladder diagram
 * 
 * Responsibilities:
 * - Calculate and manage time/node scales
 * - Handle dimension calculations
 * - Provide scale functions for rendering
 */

import { SIZES, DEFAULTS } from '../constants.js';
import { DelayCalculator } from '../utils/DelayCalculator.js';

export class ScaleManager {
  constructor() {
    this.dimensions = {
      width: 0,
      height: 0,
      plotWidth: 0,
      plotHeight: 0
    };
    
    this.scales = {
      timeScale: null,
      nodeScale: null,
      maxTime: 0,
      nodePositions: new Map()
    };
    
    this.scenario = null;
  }

  /**
   * Update dimensions based on container size
   * @param {number} containerWidth 
   * @param {number} containerHeight 
   */
  updateDimensions(containerWidth, containerHeight) {
    this.dimensions.width = containerWidth;
    this.dimensions.height = containerHeight;
    this.dimensions.plotWidth = containerWidth - SIZES.MARGIN.left - SIZES.MARGIN.right;
    this.dimensions.plotHeight = containerHeight - SIZES.MARGIN.top - SIZES.MARGIN.bottom;
  }

  /**
   * Update scales based on scenario
   * @param {Object} scenario - The network scenario
   * @param {Object} options - Additional options for scale calculation
   */
  updateScales(scenario, options = {}) {
    this.scenario = scenario;
    
    // Calculate max time for the scenario
    const delays = DelayCalculator.calculateScenarioTotalDelay(scenario);
    
    // Check if delays is valid
    if (!delays || typeof delays.total !== 'number') {
      console.error('Invalid delays from DelayCalculator:', delays);
      this.scales.maxTime = 100; // Default fallback
    } else {
      this.scales.maxTime = delays.total * (options.timeMultiplier || DEFAULTS.TIME_SCALE_MULTIPLIER);
    }
    
    // Create time scale (y-axis)
    this.scales.timeScale = this.createTimeScale();
    
    // Create node scale (x-axis)
    this.scales.nodeScale = this.createNodeScale();
    
    // Store node positions for quick lookup
    this.updateNodePositions();
  }

  /**
   * Create time scale function
   * @returns {Function} Scale function for time to y-position
   */
  createTimeScale() {
    const { plotHeight } = this.dimensions;
    const { maxTime } = this.scales;
    
    return (time) => {
      if (maxTime === 0) return 0;
      return (time / maxTime) * plotHeight;
    };
  }

  /**
   * Create node scale function
   * @returns {Function} Scale function for node to x-position
   */
  createNodeScale() {
    const { plotWidth } = this.dimensions;
    const nodeCount = this.scenario ? this.scenario.nodes.length : 0;
    
    if (nodeCount === 0) {
      return () => 0;
    }
    
    if (nodeCount === 1) {
      return () => plotWidth / 2;
    }
    
    const spacing = plotWidth / (nodeCount - 1);
    
    return (nodeNameOrIndex) => {
      if (typeof nodeNameOrIndex === 'number') {
        return nodeNameOrIndex * spacing;
      }
      
      // Handle node name
      const index = this.scenario.nodes.findIndex(n => n.name === nodeNameOrIndex);
      return index >= 0 ? index * spacing : 0;
    };
  }

  /**
   * Update node positions map for quick lookup
   */
  updateNodePositions() {
    if (!this.scenario || !this.scales.nodeScale) return;
    
    this.scales.nodePositions.clear();
    this.scenario.nodes.forEach((node, index) => {
      const x = this.scales.nodeScale(index);
      this.scales.nodePositions.set(node.name, { x, index });
    });
  }

  /**
   * Get node position by name
   * @param {string} nodeName 
   * @returns {{x: number, index: number}} Position and index
   */
  getNodePosition(nodeName) {
    return this.scales.nodePositions.get(nodeName) || { x: 0, index: -1 };
  }

  /**
   * Calculate nice tick values for time axis
   * @param {number} targetCount - Target number of ticks
   * @returns {Array<number>} Array of tick values
   */
  calculateTimeAxisTicks(targetCount = 8) {
    const { maxTime } = this.scales;
    
    if (maxTime === 0) return [0];
    
    // Calculate initial interval
    let interval = maxTime / targetCount;
    
    // Round to nice number
    const magnitude = Math.pow(10, Math.floor(Math.log10(interval)));
    const normalized = interval / magnitude;
    
    if (normalized <= 1) {
      interval = magnitude;
    } else if (normalized <= 2) {
      interval = 2 * magnitude;
    } else if (normalized <= 5) {
      interval = 5 * magnitude;
    } else {
      interval = 10 * magnitude;
    }
    
    // Generate ticks
    const ticks = [];
    for (let time = 0; time <= maxTime; time += interval) {
      ticks.push(time);
    }
    
    // Always include max time if not already included
    const lastTick = ticks[ticks.length - 1];
    if (Math.abs(lastTick - maxTime) > interval * 0.1) {
      ticks.push(maxTime);
    }
    
    return ticks;
  }

  /**
   * Calculate grid lines for the diagram
   * @returns {{horizontal: Array, vertical: Array}} Grid line positions
   */
  calculateGridLines() {
    const timeTicks = this.calculateTimeAxisTicks();
    const horizontal = timeTicks.map(time => ({
      y: this.scales.timeScale(time),
      time: time
    }));
    
    const vertical = [];
    if (this.scenario) {
      this.scenario.nodes.forEach((node, index) => {
        vertical.push({
          x: this.scales.nodeScale(index),
          node: node.name
        });
      });
    }
    
    return { horizontal, vertical };
  }

  /**
   * Get all scales and dimensions
   * @returns {Object} Combined scales and dimensions
   */
  getScales() {
    return {
      timeScale: this.scales.timeScale,
      nodeScale: this.scales.nodeScale,
      maxTime: this.scales.maxTime,
      plotWidth: this.dimensions.plotWidth,
      plotHeight: this.dimensions.plotHeight,
      width: this.dimensions.width,
      height: this.dimensions.height
    };
  }

  /**
   * Convert time to y-coordinate
   * @param {number} time 
   * @returns {number} Y-coordinate
   */
  timeToY(time) {
    return this.scales.timeScale ? this.scales.timeScale(time) : 0;
  }

  /**
   * Convert y-coordinate to time
   * @param {number} y 
   * @returns {number} Time value
   */
  yToTime(y) {
    if (!this.scales.maxTime || !this.dimensions.plotHeight) return 0;
    return (y / this.dimensions.plotHeight) * this.scales.maxTime;
  }

  /**
   * Convert node to x-coordinate
   * @param {string|number} nodeOrIndex 
   * @returns {number} X-coordinate
   */
  nodeToX(nodeOrIndex) {
    return this.scales.nodeScale ? this.scales.nodeScale(nodeOrIndex) : 0;
  }

  /**
   * Get interpolated position between two nodes
   * @param {string} startNode 
   * @param {string} endNode 
   * @param {number} progress - Progress between 0 and 1
   * @returns {number} Interpolated x-coordinate
   */
  getInterpolatedX(startNode, endNode, progress) {
    const startX = this.nodeToX(startNode);
    const endX = this.nodeToX(endNode);
    return startX + (endX - startX) * progress;
  }
}