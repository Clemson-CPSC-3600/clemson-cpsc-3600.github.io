/**
 * SVGBuilder - Utility class for creating and managing SVG elements
 * Provides a fluent API for SVG element creation and manipulation
 */

import { CLASSES } from '../constants.js';

export class SVGBuilder {
  /**
   * Create a new SVG builder
   * @param {Element} parent - Parent element to append to (optional)
   * @param {string} namespace - SVG namespace (default: standard SVG namespace)
   */
  constructor(parent = null, namespace = 'http://www.w3.org/2000/svg') {
    this.parent = parent;
    this.namespace = namespace;
    this.currentElement = null;
  }
  
  /**
   * Create a group element
   * @param {Object} attributes - SVG attributes
   * @returns {SVGElement} The created group element
   */
  group(attributes = {}) {
    return this.element('g', attributes);
  }
  
  /**
   * Create a line element
   * @param {number} x1 - Start X coordinate
   * @param {number} y1 - Start Y coordinate
   * @param {number} x2 - End X coordinate
   * @param {number} y2 - End Y coordinate
   * @param {Object} style - Additional attributes (stroke, stroke-width, etc.)
   * @returns {SVGElement} The created line element
   */
  line(x1, y1, x2, y2, style = {}) {
    return this.element('line', {
      x1: x1,
      y1: y1,
      x2: x2,
      y2: y2,
      ...style
    });
  }
  
  /**
   * Create a text element
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {string} content - Text content
   * @param {Object} style - Additional attributes
   * @returns {SVGElement} The created text element
   */
  text(x, y, content, style = {}) {
    const el = this.element('text', {
      x: x,
      y: y,
      ...style
    });
    el.textContent = content;
    return el;
  }
  
  /**
   * Create a circle element
   * @param {number} cx - Center X coordinate
   * @param {number} cy - Center Y coordinate
   * @param {number} r - Radius
   * @param {Object} style - Additional attributes
   * @returns {SVGElement} The created circle element
   */
  circle(cx, cy, r, style = {}) {
    return this.element('circle', {
      cx: cx,
      cy: cy,
      r: r,
      ...style
    });
  }
  
  /**
   * Create a rectangle element
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} width - Width
   * @param {number} height - Height
   * @param {Object} style - Additional attributes
   * @returns {SVGElement} The created rectangle element
   */
  rect(x, y, width, height, style = {}) {
    return this.element('rect', {
      x: x,
      y: y,
      width: width,
      height: height,
      ...style
    });
  }
  
  /**
   * Create a polygon element
   * @param {string|Array} points - Points as string or array of [x,y] pairs
   * @param {Object} style - Additional attributes
   * @returns {SVGElement} The created polygon element
   */
  polygon(points, style = {}) {
    // Convert array of points to string if necessary
    if (Array.isArray(points)) {
      points = points.map(p => `${p[0]},${p[1]}`).join(' ');
    }
    
    return this.element('polygon', {
      points: points,
      ...style
    });
  }
  
  /**
   * Create a path element
   * @param {string} d - Path data
   * @param {Object} style - Additional attributes
   * @returns {SVGElement} The created path element
   */
  path(d, style = {}) {
    return this.element('path', {
      d: d,
      ...style
    });
  }
  
  /**
   * Create an ellipse element
   * @param {number} cx - Center X coordinate
   * @param {number} cy - Center Y coordinate
   * @param {number} rx - X radius
   * @param {number} ry - Y radius
   * @param {Object} style - Additional attributes
   * @returns {SVGElement} The created ellipse element
   */
  ellipse(cx, cy, rx, ry, style = {}) {
    return this.element('ellipse', {
      cx: cx,
      cy: cy,
      rx: rx,
      ry: ry,
      ...style
    });
  }
  
  /**
   * Create a polyline element
   * @param {string|Array} points - Points as string or array of [x,y] pairs
   * @param {Object} style - Additional attributes
   * @returns {SVGElement} The created polyline element
   */
  polyline(points, style = {}) {
    // Convert array of points to string if necessary
    if (Array.isArray(points)) {
      points = points.map(p => `${p[0]},${p[1]}`).join(' ');
    }
    
    return this.element('polyline', {
      points: points,
      fill: 'none',  // Default to no fill for polylines
      ...style
    });
  }
  
  /**
   * Create an arrow marker definition
   * @param {string} id - Unique ID for the marker
   * @param {string} color - Arrow color
   * @param {number} size - Arrow size
   * @returns {SVGElement} The created marker element
   */
  createArrowMarker(id, color = '#000000', size = 6) {
    // Create defs if it doesn't exist
    let defs = this.parent.querySelector('defs');
    if (!defs) {
      defs = this.element('defs');
      this.parent.insertBefore(defs, this.parent.firstChild);
    }
    
    // Create marker
    const marker = document.createElementNS(this.namespace, 'marker');
    marker.setAttribute('id', id);
    marker.setAttribute('markerWidth', size);
    marker.setAttribute('markerHeight', size);
    marker.setAttribute('refX', size);
    marker.setAttribute('refY', size / 2);
    marker.setAttribute('orient', 'auto');
    
    // Create arrow path
    const path = document.createElementNS(this.namespace, 'path');
    path.setAttribute('d', `M0,0 L${size},${size/2} L0,${size} Z`);
    path.setAttribute('fill', color);
    
    marker.appendChild(path);
    defs.appendChild(marker);
    
    return marker;
  }
  
  /**
   * Create a gradient definition
   * @param {string} id - Unique ID for the gradient
   * @param {Array} stops - Array of {offset, color, opacity} objects
   * @param {string} type - 'linear' or 'radial'
   * @returns {SVGElement} The created gradient element
   */
  createGradient(id, stops, type = 'linear') {
    // Create defs if it doesn't exist
    let defs = this.parent.querySelector('defs');
    if (!defs) {
      defs = this.element('defs');
      this.parent.insertBefore(defs, this.parent.firstChild);
    }
    
    // Create gradient
    const gradientType = type === 'radial' ? 'radialGradient' : 'linearGradient';
    const gradient = document.createElementNS(this.namespace, gradientType);
    gradient.setAttribute('id', id);
    
    // Add stops
    stops.forEach(stop => {
      const stopElement = document.createElementNS(this.namespace, 'stop');
      stopElement.setAttribute('offset', stop.offset || '0%');
      stopElement.setAttribute('stop-color', stop.color || '#000000');
      if (stop.opacity !== undefined) {
        stopElement.setAttribute('stop-opacity', stop.opacity);
      }
      gradient.appendChild(stopElement);
    });
    
    defs.appendChild(gradient);
    return gradient;
  }
  
  /**
   * Generic element creation method
   * @param {string} type - Element type
   * @param {Object} attributes - Element attributes
   * @returns {SVGElement} The created element
   */
  element(type, attributes = {}) {
    const el = document.createElementNS(this.namespace, type);
    
    // Set attributes
    for (const [key, value] of Object.entries(attributes)) {
      if (value !== undefined && value !== null) {
        if (key === 'class') {
          el.setAttribute('class', value);
        } else if (key === 'style' && typeof value === 'object') {
          // Handle style object
          const styleString = Object.entries(value)
            .map(([prop, val]) => `${prop}: ${val}`)
            .join('; ');
          el.setAttribute('style', styleString);
        } else {
          el.setAttribute(key, value);
        }
      }
    }
    
    // Append to parent if exists
    if (this.parent) {
      this.parent.appendChild(el);
    }
    
    this.currentElement = el;
    return el;
  }
  
  /**
   * Add animation to the current or specified element
   * @param {SVGElement} element - Element to animate (uses current if not specified)
   * @param {string} attributeName - Attribute to animate
   * @param {Object} options - Animation options
   * @returns {SVGElement} The animation element
   */
  animate(element = null, attributeName, options = {}) {
    const target = element || this.currentElement;
    if (!target) return null;
    
    const anim = document.createElementNS(this.namespace, 'animate');
    anim.setAttribute('attributeName', attributeName);
    
    // Set animation properties
    if (options.from !== undefined) anim.setAttribute('from', options.from);
    if (options.to !== undefined) anim.setAttribute('to', options.to);
    if (options.values !== undefined) anim.setAttribute('values', options.values);
    if (options.dur !== undefined) anim.setAttribute('dur', options.dur);
    if (options.repeatCount !== undefined) anim.setAttribute('repeatCount', options.repeatCount);
    if (options.begin !== undefined) anim.setAttribute('begin', options.begin);
    if (options.fill !== undefined) anim.setAttribute('fill', options.fill);
    
    target.appendChild(anim);
    return anim;
  }
  
  /**
   * Create a transform attribute string
   * @param {Object} transforms - Transform operations
   * @returns {string} Transform string
   */
  static transform(transforms = {}) {
    const parts = [];
    
    if (transforms.translate) {
      const [x, y = 0] = Array.isArray(transforms.translate) ? 
        transforms.translate : [transforms.translate, 0];
      parts.push(`translate(${x}, ${y})`);
    }
    
    if (transforms.rotate !== undefined) {
      if (Array.isArray(transforms.rotate)) {
        parts.push(`rotate(${transforms.rotate.join(', ')})`);
      } else {
        parts.push(`rotate(${transforms.rotate})`);
      }
    }
    
    if (transforms.scale !== undefined) {
      if (Array.isArray(transforms.scale)) {
        parts.push(`scale(${transforms.scale.join(', ')})`);
      } else {
        parts.push(`scale(${transforms.scale})`);
      }
    }
    
    if (transforms.skewX !== undefined) {
      parts.push(`skewX(${transforms.skewX})`);
    }
    
    if (transforms.skewY !== undefined) {
      parts.push(`skewY(${transforms.skewY})`);
    }
    
    return parts.join(' ');
  }
  
  /**
   * Clear all children from the parent element
   */
  clear() {
    if (this.parent) {
      while (this.parent.firstChild) {
        this.parent.removeChild(this.parent.firstChild);
      }
    }
  }
  
  /**
   * Set the parent element for subsequent operations
   * @param {Element} parent - New parent element
   * @returns {SVGBuilder} This builder for chaining
   */
  setParent(parent) {
    this.parent = parent;
    return this;
  }
  
  /**
   * Create a new builder with a sub-group as parent
   * @param {Object} attributes - Group attributes
   * @returns {SVGBuilder} New builder instance
   */
  subBuilder(attributes = {}) {
    const group = this.group(attributes);
    return new SVGBuilder(group, this.namespace);
  }
  
  /**
   * Helper to create a labeled line (with text along the line)
   * @param {number} x1 - Start X
   * @param {number} y1 - Start Y
   * @param {number} x2 - End X
   * @param {number} y2 - End Y
   * @param {string} label - Label text
   * @param {Object} lineStyle - Line style attributes
   * @param {Object} textStyle - Text style attributes
   * @returns {Object} Object with line and text elements
   */
  labeledLine(x1, y1, x2, y2, label, lineStyle = {}, textStyle = {}) {
    const line = this.line(x1, y1, x2, y2, lineStyle);
    
    // Calculate midpoint for label
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    
    // Calculate angle for text rotation
    const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
    
    const text = this.text(midX, midY, label, {
      'text-anchor': 'middle',
      'dominant-baseline': 'middle',
      transform: `rotate(${angle}, ${midX}, ${midY})`,
      ...textStyle
    });
    
    return { line, text };
  }
  
  /**
   * Create a tooltip-enabled element
   * @param {SVGElement} element - Element to add tooltip to
   * @param {string} text - Tooltip text
   * @returns {SVGElement} The element with tooltip
   */
  addTooltip(element, text) {
    const title = document.createElementNS(this.namespace, 'title');
    title.textContent = text;
    element.appendChild(title);
    return element;
  }
}