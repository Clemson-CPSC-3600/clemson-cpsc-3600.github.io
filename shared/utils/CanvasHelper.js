/**
 * CanvasHelper - Shared utility class for Canvas rendering operations
 * Provides standardized drawing methods for Canvas-based demos
 */

import { COLORS } from '../constants/colors.js';
import { SIZES } from '../constants/sizes.js';

export class CanvasHelper {
  /**
   * Create a new Canvas helper
   * @param {CanvasRenderingContext2D} ctx - Canvas 2D context
   */
  constructor(ctx) {
    this.ctx = ctx;
    this.dpr = window.devicePixelRatio || 1;
  }
  
  /**
   * Setup canvas for high-DPI displays
   * @param {HTMLCanvasElement} canvas - Canvas element
   * @param {number} width - Logical width
   * @param {number} height - Logical height
   */
  setupHighDPI(canvas, width, height) {
    // Set actual size scaled for device pixel ratio
    canvas.width = width * this.dpr;
    canvas.height = height * this.dpr;
    
    // Set CSS size to logical size
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    
    // Scale the drawing context
    this.ctx.scale(this.dpr, this.dpr);
    
    // Enable better rendering
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
    
    return { width, height, dpr: this.dpr };
  }
  
  /**
   * Pixel-perfect alignment for crisp lines
   * @param {number} value - Value to align
   * @returns {number} Aligned value
   */
  pixelAlign(value) {
    return Math.round(value) + 0.5;
  }
  
  /**
   * Clear canvas with optional background color
   * @param {string} color - Background color (optional)
   */
  clear(color = null) {
    const canvas = this.ctx.canvas;
    const width = canvas.width / this.dpr;
    const height = canvas.height / this.dpr;
    
    if (color) {
      this.ctx.fillStyle = color;
      this.ctx.fillRect(0, 0, width, height);
    } else {
      this.ctx.clearRect(0, 0, width, height);
    }
  }
  
  /**
   * Draw a line between two points
   * @param {number} x1 - Start X
   * @param {number} y1 - Start Y
   * @param {number} x2 - End X
   * @param {number} y2 - End Y
   * @param {Object} options - Drawing options
   */
  drawLine(x1, y1, x2, y2, options = {}) {
    this.ctx.save();
    
    this.ctx.beginPath();
    this.ctx.moveTo(this.pixelAlign(x1), this.pixelAlign(y1));
    this.ctx.lineTo(this.pixelAlign(x2), this.pixelAlign(y2));
    
    this.ctx.strokeStyle = options.color || COLORS.UI.AXIS;
    this.ctx.lineWidth = options.width || 1;
    
    if (options.dashed) {
      this.ctx.setLineDash(options.dashArray || [5, 5]);
    }
    
    if (options.lineCap) {
      this.ctx.lineCap = options.lineCap;
    }
    
    this.ctx.stroke();
    this.ctx.restore();
  }
  
  /**
   * Draw a circle
   * @param {number} x - Center X
   * @param {number} y - Center Y
   * @param {number} radius - Radius
   * @param {Object} options - Drawing options
   */
  drawCircle(x, y, radius, options = {}) {
    this.ctx.save();
    
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    
    if (options.fill !== false) {
      this.ctx.fillStyle = options.fillColor || options.color || COLORS.UI.BACKGROUND;
      this.ctx.fill();
    }
    
    if (options.stroke !== false) {
      this.ctx.strokeStyle = options.strokeColor || '#000';
      this.ctx.lineWidth = options.strokeWidth || 1;
      this.ctx.stroke();
    }
    
    this.ctx.restore();
  }
  
  /**
   * Draw a rectangle
   * @param {number} x - Top-left X
   * @param {number} y - Top-left Y
   * @param {number} width - Width
   * @param {number} height - Height
   * @param {Object} options - Drawing options
   */
  drawRect(x, y, width, height, options = {}) {
    this.ctx.save();
    
    if (options.fill !== false) {
      this.ctx.fillStyle = options.fillColor || options.color || COLORS.UI.BACKGROUND;
      this.ctx.fillRect(x, y, width, height);
    }
    
    if (options.stroke !== false) {
      this.ctx.strokeStyle = options.strokeColor || '#000';
      this.ctx.lineWidth = options.strokeWidth || 1;
      this.ctx.strokeRect(
        this.pixelAlign(x),
        this.pixelAlign(y),
        width,
        height
      );
    }
    
    this.ctx.restore();
  }
  
  /**
   * Draw a rounded rectangle
   * @param {number} x - Top-left X
   * @param {number} y - Top-left Y
   * @param {number} width - Width
   * @param {number} height - Height
   * @param {number} radius - Corner radius
   * @param {Object} options - Drawing options
   */
  drawRoundedRect(x, y, width, height, radius, options = {}) {
    this.ctx.save();
    
    this.ctx.beginPath();
    this.ctx.moveTo(x + radius, y);
    this.ctx.lineTo(x + width - radius, y);
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.ctx.lineTo(x + width, y + height - radius);
    this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    this.ctx.lineTo(x + radius, y + height);
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.ctx.lineTo(x, y + radius);
    this.ctx.quadraticCurveTo(x, y, x + radius, y);
    this.ctx.closePath();
    
    if (options.fill !== false) {
      this.ctx.fillStyle = options.fillColor || options.color || COLORS.UI.BACKGROUND;
      this.ctx.fill();
    }
    
    if (options.stroke !== false) {
      this.ctx.strokeStyle = options.strokeColor || '#000';
      this.ctx.lineWidth = options.strokeWidth || 1;
      this.ctx.stroke();
    }
    
    this.ctx.restore();
  }
  
  /**
   * Draw text
   * @param {string} text - Text to draw
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {Object} options - Drawing options
   */
  drawText(text, x, y, options = {}) {
    this.ctx.save();
    
    // Set font
    const fontSize = options.fontSize || SIZES.FONTS.BODY;
    const fontFamily = options.fontFamily || 'sans-serif';
    const fontWeight = options.fontWeight || 'normal';
    this.ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    
    // Set alignment
    this.ctx.textAlign = options.align || 'left';
    this.ctx.textBaseline = options.baseline || 'alphabetic';
    
    // Draw background if specified
    if (options.background) {
      const metrics = this.ctx.measureText(text);
      const padding = options.padding || 4;
      const bgHeight = fontSize + padding * 2;
      const bgWidth = metrics.width + padding * 2;
      
      let bgX = x - padding;
      if (this.ctx.textAlign === 'center') {
        bgX = x - bgWidth / 2;
      } else if (this.ctx.textAlign === 'right') {
        bgX = x - bgWidth + padding;
      }
      
      let bgY = y - fontSize - padding;
      if (this.ctx.textBaseline === 'middle') {
        bgY = y - bgHeight / 2;
      } else if (this.ctx.textBaseline === 'bottom') {
        bgY = y - bgHeight + padding;
      }
      
      this.drawRoundedRect(bgX, bgY, bgWidth, bgHeight, 3, {
        fillColor: options.background,
        stroke: false
      });
    }
    
    // Draw text
    this.ctx.fillStyle = options.color || COLORS.UI.TEXT;
    this.ctx.fillText(text, x, y);
    
    this.ctx.restore();
  }
  
  /**
   * Draw a label (text with background)
   * @param {string} text - Label text
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {Object} options - Drawing options
   */
  drawLabel(text, x, y, options = {}) {
    this.drawText(text, x, y, {
      ...options,
      background: options.background || COLORS.UI.BACKGROUND,
      padding: options.padding || 6,
      align: options.align || 'center',
      baseline: options.baseline || 'middle'
    });
  }
  
  /**
   * Draw a network node
   * @param {number} x - Center X
   * @param {number} y - Center Y
   * @param {string} type - Node type (host, router, switch, server, etc.)
   * @param {Object} options - Drawing options
   */
  drawNode(x, y, type, options = {}) {
    const nodeType = type.toUpperCase();
    const config = SIZES.NODE[nodeType] || SIZES.NODE.HOST;
    const color = options.color || COLORS.NODES[nodeType] || COLORS.NODES.HOST;
    
    this.ctx.save();
    
    if (config.radius) {
      // Circular node (router, hub)
      this.drawCircle(x, y, config.radius, {
        fillColor: color,
        strokeColor: options.strokeColor || COLORS.UI.BORDER,
        strokeWidth: options.selected ? SIZES.NODE.SELECTED_BORDER_WIDTH : SIZES.NODE.BORDER_WIDTH
      });
    } else {
      // Rectangular node (host, server, switch)
      this.drawRoundedRect(
        x - config.width / 2,
        y - config.height / 2,
        config.width,
        config.height,
        5,
        {
          fillColor: color,
          strokeColor: options.strokeColor || COLORS.UI.BORDER,
          strokeWidth: options.selected ? SIZES.NODE.SELECTED_BORDER_WIDTH : SIZES.NODE.BORDER_WIDTH
        }
      );
    }
    
    // Draw icon or label if provided
    if (options.icon) {
      this.ctx.font = `${config.iconSize || 20}px sans-serif`;
      this.ctx.fillStyle = COLORS.UI.BACKGROUND;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(options.icon, x, y);
    } else if (options.label) {
      this.drawText(options.label, x, y + config.radius + 10, {
        align: 'center',
        fontSize: SIZES.FONTS.LABEL,
        color: COLORS.UI.TEXT
      });
    }
    
    this.ctx.restore();
  }
  
  /**
   * Draw a network link
   * @param {number} x1 - Start X
   * @param {number} y1 - Start Y
   * @param {number} x2 - End X
   * @param {number} y2 - End Y
   * @param {Object} options - Drawing options
   */
  drawLink(x1, y1, x2, y2, options = {}) {
    const linkType = (options.type || 'ethernet').toUpperCase();
    const color = options.color || COLORS.LINKS[linkType] || COLORS.LINKS.ETHERNET;
    const width = options.width || SIZES.LINK.WIDTH;
    
    // Draw the line
    this.drawLine(x1, y1, x2, y2, {
      color: color,
      width: options.active ? SIZES.LINK.ACTIVE_WIDTH : width,
      dashed: options.dashed || linkType === 'WIRELESS',
      dashArray: linkType === 'WIRELESS' ? [2, 3] : [5, 5]
    });
    
    // Draw arrow if specified
    if (options.arrow) {
      this.drawArrow(x1, y1, x2, y2, {
        color: color,
        size: SIZES.LINK.ARROW_SIZE
      });
    }
  }
  
  /**
   * Draw an arrow at the end of a line
   * @param {number} x1 - Start X
   * @param {number} y1 - Start Y
   * @param {number} x2 - End X
   * @param {number} y2 - End Y
   * @param {Object} options - Drawing options
   */
  drawArrow(x1, y1, x2, y2, options = {}) {
    const size = options.size || 8;
    const angle = Math.atan2(y2 - y1, x2 - x1);
    
    this.ctx.save();
    this.ctx.translate(x2, y2);
    this.ctx.rotate(angle);
    
    this.ctx.beginPath();
    this.ctx.moveTo(-size, -size / 2);
    this.ctx.lineTo(0, 0);
    this.ctx.lineTo(-size, size / 2);
    
    this.ctx.strokeStyle = options.color || COLORS.UI.AXIS;
    this.ctx.lineWidth = options.width || 2;
    this.ctx.stroke();
    
    this.ctx.restore();
  }
  
  /**
   * Draw a packet
   * @param {number} x - Center X
   * @param {number} y - Center Y
   * @param {Object} options - Drawing options
   */
  drawPacket(x, y, options = {}) {
    const radius = options.radius || SIZES.PACKET.RADIUS;
    const type = (options.type || 'default').toUpperCase();
    const color = options.color || COLORS.PACKET[type] || COLORS.PACKET.DEFAULT;
    
    // Draw packet circle
    this.drawCircle(x, y, radius, {
      fillColor: color,
      strokeColor: options.strokeColor || COLORS.UI.BORDER,
      strokeWidth: SIZES.PACKET.STROKE_WIDTH
    });
    
    // Draw packet number/label if provided
    if (options.label) {
      this.ctx.save();
      this.ctx.font = `bold ${SIZES.FONTS.SMALL}px sans-serif`;
      this.ctx.fillStyle = COLORS.UI.BACKGROUND;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(options.label, x, y);
      this.ctx.restore();
    }
    
    // Draw pulse effect if specified
    if (options.pulse) {
      this.ctx.save();
      this.ctx.globalAlpha = 0.3 * (1 - options.pulse);
      this.drawCircle(x, y, radius * (1 + options.pulse * 0.5), {
        fill: false,
        strokeColor: color,
        strokeWidth: 2
      });
      this.ctx.restore();
    }
  }
  
  /**
   * Draw a progress bar
   * @param {number} x - Top-left X
   * @param {number} y - Top-left Y
   * @param {number} width - Width
   * @param {number} height - Height
   * @param {number} progress - Progress value (0-1)
   * @param {Object} options - Drawing options
   */
  drawProgressBar(x, y, width, height, progress, options = {}) {
    // Draw background
    this.drawRoundedRect(x, y, width, height, height / 2, {
      fillColor: options.backgroundColor || COLORS.UI.GRID,
      strokeColor: options.borderColor || COLORS.UI.BORDER,
      strokeWidth: 1
    });
    
    // Draw progress
    if (progress > 0) {
      const progressWidth = width * Math.min(1, Math.max(0, progress));
      this.drawRoundedRect(x, y, progressWidth, height, height / 2, {
        fillColor: options.progressColor || COLORS.STATUS.ONLINE,
        stroke: false
      });
    }
    
    // Draw text if specified
    if (options.showText) {
      const text = options.text || `${Math.round(progress * 100)}%`;
      this.drawText(text, x + width / 2, y + height / 2, {
        align: 'center',
        baseline: 'middle',
        fontSize: SIZES.FONTS.SMALL,
        color: options.textColor || COLORS.UI.TEXT
      });
    }
  }
  
  /**
   * Draw a grid background
   * @param {number} width - Grid width
   * @param {number} height - Grid height
   * @param {Object} options - Grid options
   */
  drawGrid(width, height, options = {}) {
    const cellSize = options.cellSize || SIZES.UI.GRID.CELL_SIZE;
    const majorEvery = options.majorEvery || 5;
    
    this.ctx.save();
    
    // Draw vertical lines
    for (let x = 0; x <= width; x += cellSize) {
      const isMajor = (x / cellSize) % majorEvery === 0;
      this.drawLine(x, 0, x, height, {
        color: isMajor ? COLORS.UI.GRID_MAJOR : COLORS.UI.GRID,
        width: isMajor ? SIZES.UI.GRID.MAJOR_WIDTH : SIZES.UI.GRID.MINOR_WIDTH
      });
    }
    
    // Draw horizontal lines
    for (let y = 0; y <= height; y += cellSize) {
      const isMajor = (y / cellSize) % majorEvery === 0;
      this.drawLine(0, y, width, y, {
        color: isMajor ? COLORS.UI.GRID_MAJOR : COLORS.UI.GRID,
        width: isMajor ? SIZES.UI.GRID.MAJOR_WIDTH : SIZES.UI.GRID.MINOR_WIDTH
      });
    }
    
    this.ctx.restore();
  }
  
  /**
   * Draw a tooltip
   * @param {string} text - Tooltip text
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {Object} options - Tooltip options
   */
  drawTooltip(text, x, y, options = {}) {
    const padding = SIZES.UI.TOOLTIP.PADDING;
    const fontSize = SIZES.FONTS.TOOLTIP;
    
    this.ctx.save();
    
    // Measure text
    this.ctx.font = `${fontSize}px sans-serif`;
    const metrics = this.ctx.measureText(text);
    const width = Math.min(metrics.width + padding * 2, SIZES.UI.TOOLTIP.MAX_WIDTH);
    const height = fontSize + padding * 2;
    
    // Adjust position to keep tooltip on screen
    let tooltipX = x;
    let tooltipY = y - height - 10; // Default to above
    
    const canvas = this.ctx.canvas;
    if (tooltipX + width > canvas.width / this.dpr) {
      tooltipX = canvas.width / this.dpr - width;
    }
    if (tooltipY < 0) {
      tooltipY = y + 10; // Show below instead
    }
    
    // Draw background with shadow
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    this.ctx.shadowBlur = 4;
    this.ctx.shadowOffsetX = 2;
    this.ctx.shadowOffsetY = 2;
    
    this.drawRoundedRect(tooltipX, tooltipY, width, height, SIZES.UI.TOOLTIP.BORDER_RADIUS, {
      fillColor: options.background || COLORS.UI.DARK_BACKGROUND,
      strokeColor: options.borderColor || COLORS.UI.BORDER,
      strokeWidth: 1
    });
    
    // Reset shadow
    this.ctx.shadowColor = 'transparent';
    this.ctx.shadowBlur = 0;
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 0;
    
    // Draw text
    this.drawText(text, tooltipX + width / 2, tooltipY + height / 2, {
      align: 'center',
      baseline: 'middle',
      fontSize: fontSize,
      color: options.textColor || COLORS.UI.BACKGROUND
    });
    
    // Draw arrow pointing to target
    if (options.showArrow !== false) {
      const arrowSize = SIZES.UI.TOOLTIP.ARROW_SIZE;
      const arrowX = x;
      const arrowY = tooltipY > y ? tooltipY : tooltipY + height;
      
      this.ctx.beginPath();
      if (tooltipY > y) {
        // Arrow pointing up
        this.ctx.moveTo(arrowX - arrowSize, arrowY);
        this.ctx.lineTo(arrowX, arrowY - arrowSize);
        this.ctx.lineTo(arrowX + arrowSize, arrowY);
      } else {
        // Arrow pointing down
        this.ctx.moveTo(arrowX - arrowSize, arrowY);
        this.ctx.lineTo(arrowX, arrowY + arrowSize);
        this.ctx.lineTo(arrowX + arrowSize, arrowY);
      }
      this.ctx.fillStyle = options.background || COLORS.UI.DARK_BACKGROUND;
      this.ctx.fill();
    }
    
    this.ctx.restore();
  }
  
  /**
   * Apply a gradient fill
   * @param {number} x1 - Gradient start X
   * @param {number} y1 - Gradient start Y
   * @param {number} x2 - Gradient end X
   * @param {number} y2 - Gradient end Y
   * @param {Array} colorStops - Array of {offset, color} objects
   * @returns {CanvasGradient} The created gradient
   */
  createLinearGradient(x1, y1, x2, y2, colorStops) {
    const gradient = this.ctx.createLinearGradient(x1, y1, x2, y2);
    
    colorStops.forEach(stop => {
      gradient.addColorStop(stop.offset || 0, stop.color);
    });
    
    return gradient;
  }
  
  /**
   * Create a radial gradient
   * @param {number} x - Center X
   * @param {number} y - Center Y
   * @param {number} innerRadius - Inner radius
   * @param {number} outerRadius - Outer radius
   * @param {Array} colorStops - Array of {offset, color} objects
   * @returns {CanvasGradient} The created gradient
   */
  createRadialGradient(x, y, innerRadius, outerRadius, colorStops) {
    const gradient = this.ctx.createRadialGradient(x, y, innerRadius, x, y, outerRadius);
    
    colorStops.forEach(stop => {
      gradient.addColorStop(stop.offset || 0, stop.color);
    });
    
    return gradient;
  }
  
  /**
   * Measure text dimensions
   * @param {string} text - Text to measure
   * @param {Object} options - Font options
   * @returns {Object} Text metrics
   */
  measureText(text, options = {}) {
    this.ctx.save();
    
    const fontSize = options.fontSize || SIZES.FONTS.BODY;
    const fontFamily = options.fontFamily || 'sans-serif';
    const fontWeight = options.fontWeight || 'normal';
    this.ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    
    const metrics = this.ctx.measureText(text);
    
    this.ctx.restore();
    
    return {
      width: metrics.width,
      height: fontSize, // Approximate height
      actualBoundingBoxAscent: metrics.actualBoundingBoxAscent,
      actualBoundingBoxDescent: metrics.actualBoundingBoxDescent
    };
  }
  
  /**
   * Save current context state
   */
  save() {
    this.ctx.save();
  }
  
  /**
   * Restore previous context state
   */
  restore() {
    this.ctx.restore();
  }
  
  /**
   * Set global alpha for transparency
   * @param {number} alpha - Alpha value (0-1)
   */
  setAlpha(alpha) {
    this.ctx.globalAlpha = alpha;
  }
  
  /**
   * Set composite operation for blending
   * @param {string} operation - Composite operation mode
   */
  setCompositeOperation(operation) {
    this.ctx.globalCompositeOperation = operation;
  }
}