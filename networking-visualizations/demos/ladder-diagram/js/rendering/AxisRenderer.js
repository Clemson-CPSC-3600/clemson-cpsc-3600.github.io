/**
 * AxisRenderer - Handles rendering of axes, labels, and grid lines
 * 
 * Responsibilities:
 * - Render time axis (y-axis) with labels
 * - Render node axis (x-axis) with labels
 * - Render link information between nodes
 * - Render grid lines
 */

import { SVGBuilder } from '../utils/SVGBuilder.js';
import { NetworkFormatter } from '../utils/NetworkFormatter.js';
import { COLORS, SIZES, STYLES } from '../constants.js';

export class AxisRenderer {
  constructor(container, scaleManager, scenario) {
    this.svg = new SVGBuilder(container);
    this.scaleManager = scaleManager;
    this.scenario = scenario;
  }

  /**
   * Render all static axis elements
   */
  render() {
    this.renderTimeAxis();
    this.renderNodeAxis();
    this.renderNodeLines();
    this.renderLinkLabels();
  }

  /**
   * Render vertical node lines
   */
  renderNodeLines() {
    const scales = this.scaleManager.getScales();
    
    this.scenario.nodes.forEach((node, index) => {
      const x = this.scaleManager.nodeToX(node.name);
      
      // Draw vertical line for node
      this.svg.line(x, 0, x, scales.plotHeight, {
        stroke: COLORS.UI.AXIS,
        'stroke-width': 1,
        'stroke-dasharray': '2,2',
        opacity: 0.3,
        class: `node-line node-${index}`
      });
    });
  }
  
  /**
   * Render grid lines - DEPRECATED, use GridRenderer instead
   */
  renderGrid() {
    const gridLines = this.scaleManager.calculateGridLines();
    const scales = this.scaleManager.getScales();
    
    // Create grid group
    const gridGroup = this.svg.group({ class: 'grid-lines' });
    
    // Horizontal grid lines (time)
    gridLines.horizontal.forEach(({ y }) => {
      this.svg.line(0, y, scales.plotWidth, y, {
        stroke: COLORS.UI.GRID,
        'stroke-width': 0.5,
        opacity: 0.5
      });
    });
    
    // Vertical grid lines (nodes)
    gridLines.vertical.forEach(({ x }) => {
      this.svg.line(x, 0, x, scales.plotHeight, {
        stroke: COLORS.UI.GRID,
        'stroke-width': 0.5,
        opacity: 0.5
      });
    });
  }

  /**
   * Render time axis with labels
   */
  renderTimeAxis() {
    const scales = this.scaleManager.getScales();
    const ticks = this.scaleManager.calculateTimeAxisTicks();
    
    // Create axis group
    const axisGroup = this.svg.group({ class: 'time-axis' });
    
    // Draw axis line
    this.svg.line(-SIZES.AXIS.TICK_LENGTH, 0, -SIZES.AXIS.TICK_LENGTH, scales.plotHeight, {
      stroke: COLORS.UI.AXIS,
      'stroke-width': SIZES.AXIS.LINE_WIDTH
    });
    
    // Draw ticks and labels
    ticks.forEach(time => {
      const y = this.scaleManager.timeToY(time);
      
      // Tick mark
      this.svg.line(-SIZES.AXIS.TICK_LENGTH - 5, y, -SIZES.AXIS.TICK_LENGTH, y, {
        stroke: COLORS.UI.AXIS,
        'stroke-width': SIZES.AXIS.LINE_WIDTH
      });
      
      // Label
      const label = NetworkFormatter.time(time, scales.maxTime);
      this.svg.text(-SIZES.AXIS.TICK_LENGTH - 10, y + 4, label, {
        'text-anchor': 'end',
        'font-size': STYLES.FONTS.AXIS_LABEL.size,
        'font-family': STYLES.FONTS.AXIS_LABEL.family,
        fill: COLORS.UI.AXIS
      });
    });
    
    // Axis title
    this.svg.text(-50, scales.plotHeight / 2, 'Time', {
      'text-anchor': 'middle',
      'font-size': STYLES.FONTS.AXIS_TITLE.size,
      'font-weight': STYLES.FONTS.AXIS_TITLE.weight,
      'font-family': STYLES.FONTS.AXIS_TITLE.family,
      fill: COLORS.UI.AXIS,
      transform: `rotate(-90, -50, ${scales.plotHeight / 2})`
    });
  }

  /**
   * Render node axis with labels
   */
  renderNodeAxis() {
    const scales = this.scaleManager.getScales();
    
    // Create axis group
    const axisGroup = this.svg.group({ class: 'node-axis' });
    
    // Draw axis line
    this.svg.line(0, -SIZES.AXIS.TICK_LENGTH, scales.plotWidth, -SIZES.AXIS.TICK_LENGTH, {
      stroke: COLORS.UI.AXIS,
      'stroke-width': SIZES.AXIS.LINE_WIDTH
    });
    
    // Draw nodes
    this.scenario.nodes.forEach((node, i) => {
      const x = this.scaleManager.nodeToX(i);
      
      // Tick mark
      this.svg.line(x, -SIZES.AXIS.TICK_LENGTH - 5, x, -SIZES.AXIS.TICK_LENGTH, {
        stroke: COLORS.UI.AXIS,
        'stroke-width': SIZES.AXIS.LINE_WIDTH
      });
      
      // Node icon (circle)
      this.svg.circle(x, -25, 8, {
        fill: this.getNodeColor(node.type),
        stroke: COLORS.UI.AXIS,
        'stroke-width': 1.5
      });
      
      // Node name
      this.svg.text(x, -40, node.name, {
        'text-anchor': 'middle',
        'font-size': STYLES.FONTS.NODE_LABEL.size,
        'font-weight': STYLES.FONTS.NODE_LABEL.weight,
        'font-family': STYLES.FONTS.NODE_LABEL.family,
        fill: COLORS.UI.AXIS
      });
      
      // Node type (if specified)
      if (node.type) {
        this.svg.text(x, -52, `[${node.type}]`, {
          'text-anchor': 'middle',
          'font-size': STYLES.FONTS.NODE_TYPE.size,
          'font-style': 'italic',
          'font-family': STYLES.FONTS.NODE_TYPE.family,
          fill: COLORS.UI.SECONDARY_TEXT
        });
      }
    });
  }

  /**
   * Render link labels between nodes
   */
  renderLinkLabels() {
    const scales = this.scaleManager.getScales();
    
    // Create links group
    const linksGroup = this.svg.group({ class: 'link-labels' });
    
    // Draw link information for each hop
    for (let i = 0; i < this.scenario.nodes.length - 1; i++) {
      if (i < this.scenario.hops.length) {
        this.renderLinkLabel(i);
      }
    }
  }

  /**
   * Render a single link label
   * @private
   */
  renderLinkLabel(hopIndex) {
    const hop = this.scenario.hops[hopIndex];
    const startNode = this.scenario.nodes[hopIndex];
    const endNode = this.scenario.nodes[hopIndex + 1];
    
    const startX = this.scaleManager.nodeToX(hopIndex);
    const endX = this.scaleManager.nodeToX(hopIndex + 1);
    const midX = (startX + endX) / 2;
    
    // Link line (above the labels)
    this.svg.line(startX + 10, -25, endX - 10, -25, {
      stroke: COLORS.UI.LINK_LINE,
      'stroke-width': 1,
      'stroke-dasharray': '2,2',
      opacity: 0.5
    });
    
    // Create background for labels
    const bgRect = this.svg.rect(midX - 40, -70, 80, 35, {
      fill: 'white',
      stroke: COLORS.UI.BORDER,
      'stroke-width': 0.5,
      rx: 3,
      opacity: 0.9
    });
    
    // Distance label
    if (hop.distance) {
      this.svg.text(midX, -60, NetworkFormatter.distance(hop.distance), {
        'text-anchor': 'middle',
        'font-size': STYLES.FONTS.LINK_LABEL.size,
        'font-weight': '600',
        'font-family': STYLES.FONTS.LINK_LABEL.family,
        fill: COLORS.UI.AXIS
      });
    }
    
    // Bandwidth label
    if (hop.bandwidth) {
      this.svg.text(midX, -47, NetworkFormatter.bandwidth(hop.bandwidth), {
        'text-anchor': 'middle',
        'font-size': STYLES.FONTS.LINK_SUBLABEL.size,
        'font-family': STYLES.FONTS.LINK_SUBLABEL.family,
        fill: COLORS.UI.SECONDARY_TEXT
      });
    }
    
    // Additional delay info (if significant)
    const delayInfo = [];
    if (hop.processingDelay && hop.processingDelay > 0) {
      delayInfo.push(`P: ${NetworkFormatter.time(hop.processingDelay)}`);
    }
    if (hop.queuingDelay && hop.queuingDelay > 0) {
      delayInfo.push(`Q: ${NetworkFormatter.time(hop.queuingDelay)}`);
    }
    
    if (delayInfo.length > 0) {
      this.svg.text(midX, -34, delayInfo.join(' | '), {
        'text-anchor': 'middle',
        'font-size': '8px',
        'font-family': STYLES.FONTS.LINK_SUBLABEL.family,
        fill: COLORS.UI.TERTIARY_TEXT,
        opacity: 0.8
      });
    }
  }

  /**
   * Get color for node based on type
   * @private
   */
  getNodeColor(nodeType) {
    const typeColors = {
      'Host': COLORS.NODE_TYPES.HOST,
      'Client': COLORS.NODE_TYPES.CLIENT,
      'Server': COLORS.NODE_TYPES.SERVER,
      'Router': COLORS.NODE_TYPES.ROUTER,
      'Switch': COLORS.NODE_TYPES.SWITCH,
      'Firewall': COLORS.NODE_TYPES.FIREWALL,
      'LoadBalancer': COLORS.NODE_TYPES.LOAD_BALANCER
    };
    
    return typeColors[nodeType] || COLORS.NODE_TYPES.DEFAULT;
  }

  /**
   * Clear all axis elements
   */
  clear() {
    this.svg.clear();
  }

  /**
   * Update with new scenario
   */
  update(scenario) {
    this.scenario = scenario;
    this.clear();
    this.render();
  }
}