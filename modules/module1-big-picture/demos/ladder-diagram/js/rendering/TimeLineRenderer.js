/**
 * TimeLineRenderer - Renders the current time indicator and past time shading
 * Shows a horizontal line at the current simulation time with visual effects
 */

import { SVGBuilder } from '../utils/SVGBuilder.js';
import { COLORS, SIZES, CLASSES, GRID } from '../constants.js';

export class TimeLineRenderer {
  constructor(container, scaleManager) {
    this.svg = new SVGBuilder(container);
    this.scaleManager = scaleManager;
    this.timeLineElement = null;
    this.pastShadeElement = null;
    this.intersectionElements = [];
  }

  /**
   * Render time line at current time position
   * @param {number} currentTime - Current simulation time in ms
   * @param {Object} scenario - Network scenario for node positions
   */
  render(currentTime, scenario) {
    this.clear();
    
    if (!scenario || currentTime <= 0) return;
    
    const scales = this.scaleManager.getScales();
    const y = this.scaleManager.timeToY(currentTime);
    
    // Create time visualization group
    const timeGroup = this.svg.group({ 
      class: 'time-visualization',
      id: 'time-line-group'
    });
    
    // Render past time shading (subtle background for elapsed time)
    this.renderPastShade(y, scales);
    
    // Render the main time line
    this.renderTimeLine(y, scales);
    
    // Render intersection points at nodes
    this.renderIntersections(y, scenario);
    
    // Render time label
    this.renderTimeLabel(currentTime, y, scales);
  }
  
  /**
   * Render shading for past time
   * @private
   */
  renderPastShade(y, scales) {
    if (y <= 0) return;
    
    this.pastShadeElement = this.svg.rect(0, 0, scales.plotWidth, y, {
      fill: COLORS.UI.AXIS,
      'fill-opacity': GRID.OPACITY.PAST_SHADE,
      class: CLASSES.ELEMENTS.PAST_SHADE,
      'pointer-events': 'none'
    });
  }
  
  /**
   * Render the main time line
   * @private
   */
  renderTimeLine(y, scales) {
    // Main time line
    this.timeLineElement = this.svg.line(0, y, scales.plotWidth, y, {
      stroke: COLORS.UI.HIGHLIGHT,
      'stroke-width': SIZES.STROKE_WIDTH_THICK,
      class: CLASSES.ELEMENTS.TIME_LINE,
      'pointer-events': 'none'
    });
    
    // Glow effect for the time line
    const glowLine = this.svg.line(0, y, scales.plotWidth, y, {
      stroke: COLORS.UI.HIGHLIGHT,
      'stroke-width': SIZES.STROKE_WIDTH_THICK * 3,
      'stroke-opacity': 0.2,
      class: CLASSES.ELEMENTS.TIME_LINE_GLOW,
      'pointer-events': 'none'
    });
  }
  
  /**
   * Render intersection points where time line crosses nodes
   * @private
   */
  renderIntersections(y, scenario) {
    this.intersectionElements = [];
    
    scenario.nodes.forEach((node, index) => {
      const x = this.scaleManager.nodeToX(index);
      
      // Outer pulsing circle
      const outerCircle = this.svg.circle(x, y, SIZES.PULSE_RADIUS_END, {
        fill: 'none',
        stroke: COLORS.UI.HIGHLIGHT,
        'stroke-width': 1,
        'stroke-opacity': 0.3,
        class: `${CLASSES.ELEMENTS.TIME_INTERSECTION} ${CLASSES.STATES.PULSING}`
      });
      
      // Inner solid circle
      const innerCircle = this.svg.circle(x, y, SIZES.PULSE_RADIUS_START, {
        fill: COLORS.UI.HIGHLIGHT,
        stroke: 'white',
        'stroke-width': 1.5,
        class: CLASSES.ELEMENTS.TIME_INTERSECTION
      });
      
      this.intersectionElements.push({ outer: outerCircle, inner: innerCircle });
    });
  }
  
  /**
   * Render time label
   * @private
   */
  renderTimeLabel(currentTime, y, scales) {
    // Background for time label
    const labelText = `t = ${currentTime.toFixed(1)} ms`;
    const labelWidth = labelText.length * 7;
    
    this.svg.rect(scales.plotWidth + 10, y - 10, labelWidth, 20, {
      fill: 'white',
      stroke: COLORS.UI.HIGHLIGHT,
      'stroke-width': 1,
      rx: 3,
      class: 'time-label-bg'
    });
    
    // Time text
    this.svg.text(scales.plotWidth + 15, y + 4, labelText, {
      'font-size': '12px',
      'font-weight': 'bold',
      fill: COLORS.UI.HIGHLIGHT,
      class: 'time-label'
    });
  }
  
  /**
   * Update time line position smoothly
   * @param {number} currentTime - Current simulation time
   * @param {Object} scenario - Network scenario
   */
  update(currentTime, scenario) {
    // For smooth animation, we could transition the elements
    // For now, just re-render
    this.render(currentTime, scenario);
  }
  
  /**
   * Clear all time line elements
   */
  clear() {
    this.svg.clear();
    this.timeLineElement = null;
    this.pastShadeElement = null;
    this.intersectionElements = [];
  }
}