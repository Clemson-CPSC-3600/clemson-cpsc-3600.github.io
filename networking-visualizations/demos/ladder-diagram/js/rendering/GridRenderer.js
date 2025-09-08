/**
 * GridRenderer - Handles grid line rendering for the ladder diagram
 * Provides enhanced major/minor grid line distinction for better readability
 */

import { SVGBuilder } from '../utils/SVGBuilder.js';
import { COLORS, GRID } from '../constants.js';

export class GridRenderer {
  constructor(container, scaleManager) {
    this.svg = new SVGBuilder(container);
    this.scaleManager = scaleManager;
  }

  /**
   * Render grid lines with enhanced major/minor distinction
   */
  render() {
    this.clear();
    
    const scales = this.scaleManager.getScales();
    const gridLines = this.scaleManager.calculateGridLines();
    
    // Create grid groups for layering
    const minorGroup = this.svg.group({ 
      class: 'grid-lines-minor',
      opacity: GRID.OPACITY.MINOR_LINE 
    });
    
    const majorGroup = this.svg.group({ 
      class: 'grid-lines-major',
      opacity: GRID.OPACITY.MAJOR_LINE 
    });
    
    // Render horizontal grid lines (time) - minor lines first
    gridLines.horizontal.forEach(({ y, major }, index) => {
      // Enhanced major line detection - every 5th line or marked as major
      const isMajor = major || (index > 0 && index % 5 === 0);
      
      const group = isMajor ? majorGroup : minorGroup;
      
      this.svg.line(0, y, scales.plotWidth, y, {
        stroke: isMajor ? COLORS.UI.GRID_MAJOR : COLORS.UI.GRID,
        'stroke-width': isMajor ? 1 : 0.5,
        'stroke-dasharray': isMajor ? 'none' : GRID.DASH_PATTERN.MINOR,
        opacity: isMajor ? 0.6 : 0.3,
        class: isMajor ? 'grid-line-time-major' : 'grid-line-time-minor'
      });
    });
    
    // Render vertical grid lines (nodes) - enhanced styling
    gridLines.vertical.forEach(({ x }, index) => {
      // Node lines are slightly more prominent than minor grid lines
      this.svg.line(x, 0, x, scales.plotHeight, {
        stroke: COLORS.UI.GRID_MAJOR,
        'stroke-width': 0.75,
        'stroke-dasharray': '3,3',
        opacity: GRID.OPACITY.NODE_LINE,
        class: 'grid-line-node'
      });
    });
    
    // Add subtle background gradient for depth
    this.addBackgroundGradient(scales);
  }
  
  /**
   * Add a subtle background gradient for visual depth
   * @private
   */
  addBackgroundGradient(scales) {
    // Create a subtle gradient from top to bottom
    const gradientId = 'grid-bg-gradient';
    
    // Add a subtle background rect with gradient
    this.svg.rect(0, 0, scales.plotWidth, scales.plotHeight, {
      fill: COLORS.UI.BACKGROUND,
      'fill-opacity': 0.5,
      class: 'grid-background'
    });
  }

  /**
   * Clear all grid elements
   */
  clear() {
    this.svg.clear();
  }
}