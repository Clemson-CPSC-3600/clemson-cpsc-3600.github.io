/**
 * CanvasPathRenderer - Renders network nodes and links on canvas
 * Handles the visual representation of the network path
 */

import { NetworkFormatter } from '../../../../shared/utils/NetworkFormatter.js';
import { COLORS } from '../../../../shared/constants/colors.js';
import { SIZES } from '../../../../shared/constants/sizes.js';

export class CanvasPathRenderer {
  constructor(ctx, width, height, canvasHelper) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
    this.canvasHelper = canvasHelper;
    
    // Visual configuration
    this.nodeRadius = SIZES.NODE.RADIUS;
    this.nodeSpacing = 150;
    this.linkWidth = 3;
    
    // Device icons (using emoji for simplicity)
    this.deviceIcons = {
      'client': '💻',
      'host': '💻',
      'router': '🔄',
      'switch': '🔀',
      'isp-edge': '🌐',
      'core': '⚡',
      'server': '🖥️',
      'firewall': '🛡️',
      'loadbalancer': '⚖️'
    };
    
    // Interaction regions for click/hover detection
    this.nodeRegions = [];
    this.linkRegions = [];
  }
  
  /**
   * Main render method for the network path
   */
  render(path, latencyData) {
    // Clear interaction regions
    this.nodeRegions = [];
    this.linkRegions = [];
    
    // Calculate node positions
    const nodePositions = this.calculateNodePositions(path.hops);
    
    // Draw links first (behind nodes)
    this.drawLinks(path.hops, nodePositions, latencyData);
    
    // Draw nodes on top
    this.drawNodes(path.hops, nodePositions, latencyData);
    
    return nodePositions;
  }
  
  /**
   * Calculate positions for all nodes
   */
  calculateNodePositions(hops) {
    const positions = [];
    const nodeCount = hops.length;
    const totalWidth = (nodeCount - 1) * this.nodeSpacing;
    const startX = (this.width - totalWidth) / 2;
    const y = 150; // Move network visualization higher up
    
    hops.forEach((hop, index) => {
      positions.push({
        x: startX + index * this.nodeSpacing,
        y: y,
        hop: hop,
        index: index
      });
    });
    
    return positions;
  }
  
  /**
   * Draw all network links
   */
  drawLinks(hops, positions, latencyData) {
    for (let i = 0; i < positions.length - 1; i++) {
      const start = positions[i];
      const end = positions[i + 1];
      const startHop = hops[i];  // Source node (has the outgoing link properties)
      const endHop = hops[i + 1];  // Destination node
      
      // Calculate link metrics using source hop's bandwidth
      const linkLatency = this.calculateLinkLatency(startHop, latencyData[i]);
      const utilization = startHop.utilization || 0;
      
      // Determine link color based on latency
      const color = this.getLatencyColor(linkLatency);
      
      // Draw the link
      this.drawLink(start, end, {
        color: color,
        width: this.linkWidth,
        utilization: utilization,
        latency: linkLatency,
        hop: startHop  // Use source hop for link properties
      });
      
      // Store link region for interaction
      this.linkRegions.push({
        startX: start.x + this.nodeRadius,
        startY: start.y - 10,
        endX: end.x - this.nodeRadius,
        endY: end.y + 10,
        hop: startHop,  // Store source hop for correct link info
        index: i,
        region: {
          x1: start.x + this.nodeRadius,
          y1: start.y - 20,
          x2: end.x - this.nodeRadius,
          y2: end.y + 20
        }
      });
      
      // Draw link label with source node's bandwidth and distance
      this.drawLinkLabel(start, end, startHop, linkLatency);
    }
  }
  
  /**
   * Draw a single link
   */
  drawLink(start, end, options) {
    const { color, width, utilization } = options;
    
    // Calculate link endpoints (from edge of nodes)
    const angle = Math.atan2(end.y - start.y, end.x - start.x);
    const startX = start.x + Math.cos(angle) * this.nodeRadius;
    const startY = start.y + Math.sin(angle) * this.nodeRadius;
    const endX = end.x - Math.cos(angle) * this.nodeRadius;
    const endY = end.y - Math.sin(angle) * this.nodeRadius;
    
    // Draw main link line directly
    this.ctx.save();
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = width;
    this.ctx.beginPath();
    this.ctx.moveTo(startX, startY);
    this.ctx.lineTo(endX, endY);
    this.ctx.stroke();
    this.ctx.restore();
    
    // Draw utilization indicator if high
    if (utilization > 0.7) {
      const midX = (startX + endX) / 2;
      const midY = (startY + endY) / 2;
      
      // Draw warning indicator
      this.ctx.save();
      this.ctx.fillStyle = COLORS.STATUS.WARNING;
      this.ctx.strokeStyle = COLORS.UI.BACKGROUND;
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(midX, midY - 20, 8, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();
      
      // Draw exclamation mark
      this.ctx.fillStyle = COLORS.UI.BACKGROUND;
      this.ctx.font = 'bold 12px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText('!', midX, midY - 20);
      this.ctx.restore();
    }
    
    // Draw directional arrow
    this.drawArrow(startX, startY, endX, endY, color);
  }
  
  /**
   * Draw directional arrow on link
   */
  drawArrow(startX, startY, endX, endY, color) {
    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;
    const angle = Math.atan2(endY - startY, endX - startX);
    
    this.ctx.save();
    this.ctx.translate(midX, midY);
    this.ctx.rotate(angle);
    
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.moveTo(5, 0);
    this.ctx.lineTo(-5, -5);
    this.ctx.lineTo(-5, 5);
    this.ctx.closePath();
    this.ctx.fill();
    
    this.ctx.restore();
  }
  
  /**
   * Draw link label with metrics
   */
  drawLinkLabel(start, end, hop, latency) {
    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2;
    
    // Save context state
    this.ctx.save();
    
    // Format bandwidth, distance, and utilization
    const bandwidth = NetworkFormatter.bandwidth(hop.bandwidth);
    const distance = hop.distance ? NetworkFormatter.distance(hop.distance) : '';
    const utilization = hop.utilization !== undefined ? `${Math.round(hop.utilization * 100)}%` : '';
    
    // Debug log
    console.log(`Link label for ${hop.node}:`, {
      bandwidth,
      distance,
      utilization,
      hasUtilization: hop.utilization !== undefined,
      utilizationValue: hop.utilization
    });
    
    // Set font for measurement
    this.ctx.font = '11px sans-serif';
    this.ctx.textAlign = 'center';
    
    // Measure text widths for background
    const bandwidthMetrics = this.ctx.measureText(bandwidth);
    const distanceMetrics = distance ? this.ctx.measureText(distance) : { width: 0 };
    const utilizationMetrics = utilization ? this.ctx.measureText(utilization) : { width: 0 };
    const maxWidth = Math.max(bandwidthMetrics.width, distanceMetrics.width, utilizationMetrics.width);
    
    // Calculate background height based on what we're showing
    let lineCount = 1; // Always show bandwidth
    if (distance) lineCount++;
    if (utilization) lineCount++;
    const lineHeight = 14;
    const bgHeight = lineCount * lineHeight + 4;
    const bgY = midY + 10;
    
    console.log(`Background calculation:`, {
      lineCount,
      bgHeight,
      willShowUtilization: !!utilization
    });
    
    // Draw white background for better readability
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    this.ctx.fillRect(
      midX - maxWidth / 2 - 6,
      bgY,
      maxWidth + 12,
      bgHeight
    );
    
    // Draw bandwidth on top
    let currentY = bgY + 3;
    this.ctx.fillStyle = '#333';
    this.ctx.font = 'bold 11px sans-serif';
    this.ctx.textBaseline = 'top';
    this.ctx.fillText(bandwidth, midX, currentY);
    currentY += lineHeight;
    
    // Draw distance (if exists)
    if (distance) {
      this.ctx.fillStyle = '#666';
      this.ctx.font = '10px sans-serif';
      this.ctx.fillText(distance, midX, currentY);
      currentY += lineHeight;
    }
    
    // Draw utilization with color coding (if exists)
    if (utilization) {
      console.log(`Drawing utilization "${utilization}" at position (${midX}, ${currentY})`);
      
      // Color code based on utilization level
      if (hop.utilization >= 0.9) {
        this.ctx.fillStyle = '#e74c3c'; // Red for critical
      } else if (hop.utilization >= 0.7) {
        this.ctx.fillStyle = '#e67e22'; // Orange for high
      } else if (hop.utilization >= 0.5) {
        this.ctx.fillStyle = '#f39c12'; // Yellow for moderate
      } else {
        this.ctx.fillStyle = '#27ae60'; // Green for low
      }
      
      this.ctx.font = 'bold 10px sans-serif';
      this.ctx.fillText(utilization, midX, currentY);
      console.log(`✓ Utilization drawn with color: ${this.ctx.fillStyle}`);
    } else {
      console.log(`No utilization to draw (utilization="${utilization}")`);
    }
    
    // Restore context state
    this.ctx.restore();
  }
  
  /**
   * Draw all network nodes
   */
  drawNodes(hops, positions, latencyData) {
    positions.forEach((pos, index) => {
      const hop = hops[index];
      const data = latencyData[index];
      
      // Determine node appearance
      const nodeColor = this.getNodeColor(data);
      const isHighLoad = data.cpuLoad > 0.7;
      
      // Draw node
      this.drawNode(pos, hop, {
        color: nodeColor,
        highlight: isHighLoad,
        icon: this.deviceIcons[hop.nodeType] || '📡'
      });
      
      // Store node region for interaction
      this.nodeRegions.push({
        x: pos.x,
        y: pos.y,
        radius: this.nodeRadius,
        node: hop.node,
        nodeType: hop.nodeType,
        index: index
      });
      
      // Draw node label
      this.drawNodeLabel(pos, hop, data);
    });
  }
  
  /**
   * Draw a single node
   */
  drawNode(position, hop, options) {
    const { color, highlight, icon } = options;
    
    this.ctx.save();
    
    // Draw outer ring if highlighted
    if (highlight) {
      this.ctx.strokeStyle = COLORS.STATUS.WARNING;
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.arc(position.x, position.y, this.nodeRadius + 5, 0, Math.PI * 2);
      this.ctx.stroke();
    }
    
    // Draw node circle
    this.ctx.fillStyle = color;
    this.ctx.strokeStyle = COLORS.UI.BORDER;
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(position.x, position.y, this.nodeRadius, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();
    
    // Draw icon
    this.ctx.font = '24px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(icon, position.x, position.y);
    
    this.ctx.restore();
  }
  
  /**
   * Draw node label
   */
  drawNodeLabel(position, hop, data) {
    this.ctx.save();
    
    // Draw node name
    this.ctx.fillStyle = COLORS.UI.TEXT;
    this.ctx.font = 'bold 12px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'top';
    this.ctx.fillText(hop.node, position.x, position.y + this.nodeRadius + 8);
    
    // Draw processing delay if available and non-zero
    if (data.delays && data.delays.processing > 0) {
      const processingStr = NetworkFormatter.time(data.delays.processing);
      this.ctx.fillStyle = COLORS.UI.TEXT_SECONDARY;
      this.ctx.font = '11px sans-serif';
      this.ctx.fillText(`Process: ${processingStr}`, position.x, position.y + this.nodeRadius + 24);
    }
    
    // Draw cumulative latency
    if (data.cumulativeDelay) {
      const cumulativeStr = NetworkFormatter.time(data.cumulativeDelay);
      this.ctx.fillStyle = this.getLatencyColor(data.cumulativeDelay);
      this.ctx.font = 'bold 11px sans-serif';
      this.ctx.fillText(`Total: ${cumulativeStr}`, position.x, position.y + this.nodeRadius + 38);
    }
    
    this.ctx.restore();
  }
  
  /**
   * Calculate total link latency
   */
  calculateLinkLatency(hop, nodeData) {
    if (!nodeData || !nodeData.delays) return 0;
    
    return (nodeData.delays.transmission || 0) +
           (nodeData.delays.propagation || 0) +
           (nodeData.delays.queuing || 0);
  }
  
  /**
   * Get color based on latency value
   */
  getLatencyColor(latency) {
    if (latency < 30) return COLORS.LATENCY.EXCELLENT;
    if (latency < 60) return COLORS.LATENCY.GOOD;
    if (latency < 100) return COLORS.LATENCY.OKAY;
    if (latency < 200) return COLORS.LATENCY.POOR;
    return COLORS.LATENCY.BAD;
  }
  
  /**
   * Get node color based on performance
   */
  getNodeColor(data) {
    if (!data) return COLORS.UI.BACKGROUND;
    
    // Color based on CPU load
    if (data.cpuLoad > 0.9) return COLORS.STATUS.ERROR;
    if (data.cpuLoad > 0.7) return COLORS.STATUS.WARNING;
    
    // Color based on processing power
    if (data.processingPower === 'high') return COLORS.STATUS.ONLINE;
    if (data.processingPower === 'low') return COLORS.UI.BORDER_LIGHT;
    
    return COLORS.UI.BACKGROUND;
  }
  
  /**
   * Get node at specified coordinates
   */
  getNodeAt(x, y) {
    for (const region of this.nodeRegions) {
      const dx = x - region.x;
      const dy = y - region.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance <= region.radius) {
        return region;
      }
    }
    return null;
  }
  
  /**
   * Get link at specified coordinates
   */
  getLinkAt(x, y) {
    for (const region of this.linkRegions) {
      // Simple bounding box check
      if (x >= region.region.x1 && x <= region.region.x2 &&
          y >= region.region.y1 && y <= region.region.y2) {
        return region;
      }
    }
    return null;
  }
}