/**
 * PathRenderer - Handles rendering of packet paths and delay visualizations
 * Shows transmission, propagation, processing, and queuing delays visually
 */

import { SVGBuilder } from '../utils/SVGBuilder.js';
import { DelayCalculator } from '../utils/DelayCalculator.js';
import { NetworkFormatter } from '../utils/NetworkFormatter.js';
import { COLORS, SIZES, STYLES } from '../constants.js';

export class PathRenderer {
  constructor(container, scaleManager, scenario) {
    this.svg = new SVGBuilder(container);
    this.scaleManager = scaleManager;
    this.scenario = scenario;
    this.pathElements = new Map();
  }

  /**
   * Render all path segments with rich visualization
   */
  render() {
    this.clear();
    
    if (!this.scenario) return;
    
    // Calculate segments for the scenario
    this.segments = DelayCalculator.calculateSegments(this.scenario);
    
    // Render each segment with appropriate visualization
    this.segments.forEach((segment, index) => {
      if (segment.type === 'transmission-propagation') {
        this.renderTransmissionPropagationSegment(segment, index);
      } else if (segment.type === 'processing') {
        this.renderProcessingSegment(segment);
      } else if (segment.type === 'queuing') {
        this.renderQueuingSegment(segment);
      }
    });
  }

  /**
   * Render transmission and propagation segment with rich visualization
   */
  renderTransmissionPropagationSegment(segment, index) {
    const startX = this.scaleManager.nodeToX(segment.startNode);
    const endX = this.scaleManager.nodeToX(segment.endNode);
    
    // Create segment group
    const segmentGroup = this.svg.group({ 
      class: `path-segment transmission-propagation segment-${index}`,
      'data-hop': segment.hopIndex
    });
    
    // Calculate Y positions for timing
    const firstBitStartY = this.scaleManager.timeToY(segment.firstBitStart);
    const firstBitEndY = this.scaleManager.timeToY(segment.firstBitEnd);
    const lastBitStartY = this.scaleManager.timeToY(segment.lastBitStart);
    const lastBitEndY = this.scaleManager.timeToY(segment.lastBitEnd);
    
    // Draw first bit line (green - shows pure propagation)
    this.svg.line(startX, firstBitStartY, endX, firstBitEndY, {
      stroke: COLORS.PATH.PROPAGATION,
      'stroke-width': 2,
      class: 'segment-first-bit',
      'data-segment': index
    });
    
    // Draw last bit line (shows transmission + propagation)
    this.svg.line(startX, lastBitStartY, endX, lastBitEndY, {
      stroke: COLORS.PATH.PROPAGATION,
      'stroke-width': 2,
      'stroke-dasharray': '4,2',
      class: 'segment-last-bit',
      'data-segment': index
    });
    
    // Fill area between first and last bit to show packet "body"
    const pathData = `
      M ${startX} ${firstBitStartY}
      L ${endX} ${firstBitEndY}
      L ${endX} ${lastBitEndY}
      L ${startX} ${lastBitStartY}
      Z
    `;
    
    this.svg.path(pathData, {
      fill: COLORS.PACKET.IN_TRANSIT,
      'fill-opacity': 0.1,
      stroke: 'none',
      class: 'packet-area'
    });
    
    // Add transmission delay visualization at source
    if (segment.transmissionTime > 0.001) {
      // Vertical bar showing transmission time
      this.svg.rect(startX - 3, firstBitStartY, 6, lastBitStartY - firstBitStartY, {
        fill: COLORS.PATH.TRANSMISSION,
        'fill-opacity': 0.7,
        class: 'transmission-delay'
      });
      
      // Transmission delay label
      const transY = (firstBitStartY + lastBitStartY) / 2;
      this.svg.text(startX - 25, transY + 3, 
        `${segment.transmissionTime.toFixed(2)}ms`, {
        'text-anchor': 'end',
        'font-size': '9px',
        fill: COLORS.PATH.TRANSMISSION,
        class: 'transmission-label'
      });
    }
    
    // Add propagation delay label along the path
    if (segment.propagationTime > 0.1) {
      const midX = (startX + endX) / 2;
      const midY = (firstBitStartY + firstBitEndY) / 2;
      
      // Background for text
      this.svg.rect(midX - 20, midY - 12, 40, 14, {
        fill: 'white',
        'fill-opacity': 0.9,
        rx: 2
      });
      
      this.svg.text(midX, midY - 2, 
        `${segment.propagationTime.toFixed(1)}ms`, {
        'text-anchor': 'middle',
        'font-size': '10px',
        fill: COLORS.PATH.PROPAGATION,
        'font-weight': 'bold',
        class: 'propagation-label'
      });
    }
    
    // Add arrow at the end
    this.renderArrow(endX, firstBitEndY, 'right');
    
    // Store segment reference
    this.pathElements.set(index, segmentGroup);
  }

  /**
   * Render processing delay segment
   */
  renderProcessingSegment(segment) {
    const x = this.scaleManager.nodeToX(segment.startNode);
    const startY = this.scaleManager.timeToY(segment.startTime);
    const endY = this.scaleManager.timeToY(segment.endTime);
    const height = endY - startY;
    
    // Processing delay box
    this.svg.rect(x - 10, startY, 20, height, {
      fill: COLORS.PATH.PROCESSING,
      'fill-opacity': 0.3,
      stroke: COLORS.PATH.PROCESSING,
      'stroke-width': 1,
      rx: 2,
      class: 'segment-processing'
    });
    
    // Duration label
    if (segment.duration > 0.1) {
      this.svg.text(x + 15, startY + height/2 + 3, 
        `${segment.duration.toFixed(1)}ms`, {
        'font-size': '9px',
        fill: COLORS.PATH.PROCESSING,
        class: 'processing-label'
      });
    }
  }

  /**
   * Render queuing delay segment
   */
  renderQueuingSegment(segment) {
    const x = this.scaleManager.nodeToX(segment.startNode);
    const startY = this.scaleManager.timeToY(segment.startTime);
    const endY = this.scaleManager.timeToY(segment.endTime);
    const height = endY - startY;
    
    // Queuing delay box with pattern
    this.svg.rect(x - 10, startY, 20, height, {
      fill: COLORS.PATH.QUEUING,
      'fill-opacity': 0.3,
      stroke: COLORS.PATH.QUEUING,
      'stroke-width': 1,
      'stroke-dasharray': '2,2',
      rx: 2,
      class: 'segment-queuing'
    });
    
    // Duration label
    if (segment.duration > 0.1) {
      this.svg.text(x + 15, startY + height/2 + 3, 
        `${segment.duration.toFixed(1)}ms`, {
        'font-size': '9px',
        fill: COLORS.PATH.QUEUING,
        class: 'queuing-label'
      });
    }
  }

  /**
   * Render an arrow marker
   */
  renderArrow(x, y, direction = 'right') {
    const size = 6;
    const points = direction === 'right' ?
      `${x-size},${y-size/2} ${x},${y} ${x-size},${y+size/2}` :
      `${x+size},${y-size/2} ${x},${y} ${x+size},${y+size/2}`;
    
    this.svg.polyline(points, {
      fill: 'none',
      stroke: COLORS.UI.AXIS,
      'stroke-width': 1.5,
      class: 'arrow'
    });
  }

  /**
   * Highlight a specific segment
   */
  highlightSegment(segmentIndex) {
    const segment = this.pathElements.get(segmentIndex);
    if (segment) {
      segment.classList.add('highlighted');
    }
  }

  /**
   * Clear all highlights
   */
  clearHighlight() {
    this.pathElements.forEach(segment => {
      if (segment.classList) {
        segment.classList.remove('highlighted');
      }
    });
  }

  /**
   * Clear all path elements
   */
  clear() {
    this.svg.clear();
    this.pathElements.clear();
  }
}