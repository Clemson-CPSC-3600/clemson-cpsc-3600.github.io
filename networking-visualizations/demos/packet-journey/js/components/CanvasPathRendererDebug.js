/**
 * Debug version of CanvasPathRenderer with extensive logging
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
    
    console.log('🎨 CanvasPathRenderer initialized', { width, height });
    
    // Visual configuration
    this.nodeRadius = SIZES.NODE.RADIUS || 30;
    this.nodeSpacing = 150;
    this.linkWidth = 3;
    
    // Device icons
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
    
    this.nodeRegions = [];
    this.linkRegions = [];
  }
  
  render(path, latencyData) {
    console.log('📐 Rendering path', { hops: path.hops.length, hasLatencyData: !!latencyData });
    
    this.nodeRegions = [];
    this.linkRegions = [];
    
    // Find bottleneck index
    let bottleneckIndex = -1;
    let maxDelay = 0;
    if (latencyData) {
      latencyData.forEach((data, index) => {
        if (!data.isLastHop && data.delays && data.delays.total > maxDelay) {
          maxDelay = data.delays.total;
          bottleneckIndex = index;
        }
      });
    }
    
    const nodePositions = this.calculateNodePositions(path.hops);
    console.log('📍 Node positions calculated:', nodePositions);
    console.log('🚨 Bottleneck at index:', bottleneckIndex);
    
    // Draw links first (behind nodes)
    console.log('🔗 Drawing links...');
    this.drawLinks(path.hops, nodePositions, latencyData);
    
    // Draw nodes on top
    console.log('⭕ Drawing nodes...');
    this.drawNodes(path.hops, nodePositions, latencyData, bottleneckIndex);
    
    console.log('✅ Rendering complete');
    return nodePositions;
  }
  
  calculateNodePositions(hops) {
    const positions = [];
    const nodeCount = hops.length;
    const totalWidth = (nodeCount - 1) * this.nodeSpacing;
    const startX = (this.width - totalWidth) / 2;
    const y = this.height / 2 - 50;
    
    hops.forEach((hop, index) => {
      const pos = {
        x: startX + index * this.nodeSpacing,
        y: y,
        hop: hop,
        index: index
      };
      positions.push(pos);
      console.log(`  Node ${index}: ${hop.node} at (${pos.x}, ${pos.y})`);
    });
    
    return positions;
  }
  
  drawLinks(hops, positions, latencyData) {
    console.log(`  Drawing ${positions.length - 1} links`);
    
    for (let i = 0; i < positions.length - 1; i++) {
      const start = positions[i];
      const end = positions[i + 1];
      const startHop = hops[i];  // Source node (has the outgoing link properties)
      const endHop = hops[i + 1];  // Destination node
      
      const linkLatency = this.calculateLinkLatency(startHop, latencyData ? latencyData[i] : null);
      const color = this.getLatencyColor(linkLatency);
      
      console.log(`  Link ${i}: ${start.hop.node} → ${end.hop.node}`);
      console.log(`    Latency: ${linkLatency}ms, Color: ${color}`);
      console.log(`    Bandwidth: ${startHop.bandwidth}, Distance: ${startHop.distance}`);
      console.log(`    Coords: (${start.x}, ${start.y}) → (${end.x}, ${end.y})`);
      
      // Draw the line
      this.ctx.save();
      this.ctx.strokeStyle = color;
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.moveTo(start.x, start.y);
      this.ctx.lineTo(end.x, end.y);
      this.ctx.stroke();
      this.ctx.restore();
      console.log(`    ✓ Line drawn`);
      
      // Draw link label with bandwidth and distance from source node
      this.drawLinkLabel(start, end, startHop, linkLatency);
      console.log(`    ✓ Label drawn`);
    }
  }
  
  drawLinkLabel(start, end, hop, latency) {
    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2;
    
    this.ctx.save();
    
    // Format bandwidth, distance, medium, and utilization
    const bandwidth = this.formatBandwidth(hop.bandwidth);
    const distance = this.formatDistance(hop.distance);
    const medium = hop.medium ? `(${hop.medium})` : '';
    const utilization = hop.utilization !== undefined ? `${Math.round(hop.utilization * 100)}%` : '';
    
    // Set font for measurement
    this.ctx.font = '11px sans-serif';
    this.ctx.textAlign = 'center';
    
    // Measure text widths for background
    const bandwidthMetrics = this.ctx.measureText(bandwidth);
    const distanceWithMedium = distance && medium ? `${distance} ${medium}` : distance;
    const distanceMetrics = distanceWithMedium ? this.ctx.measureText(distanceWithMedium) : { width: 0 };
    const utilizationMetrics = utilization ? this.ctx.measureText(utilization) : { width: 0 };
    const maxWidth = Math.max(bandwidthMetrics.width, distanceMetrics.width, utilizationMetrics.width);
    
    // Calculate background height based on what we're showing
    let lineCount = 1; // Always show bandwidth
    if (distance) lineCount++;
    if (utilization) lineCount++;
    const lineHeight = 14;
    const bgHeight = lineCount * lineHeight + 4;
    const bgY = midY + 10;
    
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
    
    // Draw distance with medium type (if exists)
    if (distance) {
      this.ctx.fillStyle = '#666';
      this.ctx.font = '10px sans-serif';
      const distanceText = medium ? `${distance} ${medium}` : distance;
      this.ctx.fillText(distanceText, midX, currentY);
      currentY += lineHeight;
    }
    
    // Draw utilization with color coding (if exists)
    if (utilization) {
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
    }
    
    this.ctx.restore();
  }
  
  // Simple formatting helpers for debug version
  formatBandwidth(bps) {
    if (bps >= 1e9) return `${(bps / 1e9).toFixed(1)} Gbps`;
    if (bps >= 1e6) return `${(bps / 1e6).toFixed(1)} Mbps`;
    if (bps >= 1e3) return `${(bps / 1e3).toFixed(1)} Kbps`;
    return `${bps} bps`;
  }
  
  formatTime(ms) {
    if (ms < 0.001) return '<1μs';
    if (ms < 1) return `${(ms * 1000).toFixed(1)}μs`;
    if (ms < 1000) return `${ms.toFixed(1)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  }
  
  formatDistance(distanceMeters) {
    if (!distanceMeters || distanceMeters === 0) {
      return '';  // No distance to show
    }
    
    // Use km for distances >= 1000m
    if (distanceMeters >= 1000) {
      const km = distanceMeters / 1000;
      if (km >= 10) {
        return `${km.toFixed(0)}km`;
      } else {
        return `${km.toFixed(1)}km`;
      }
    }
    
    // Use meters for smaller distances
    if (distanceMeters >= 1) {
      return `${distanceMeters.toFixed(0)}m`;
    }
    
    // Use cm for very small distances
    return `${(distanceMeters * 100).toFixed(0)}cm`;
  }
  
  drawNodes(hops, positions, latencyData, bottleneckIndex = -1) {
    console.log(`  Drawing ${positions.length} nodes, bottleneck at ${bottleneckIndex}`);
    
    positions.forEach((pos, index) => {
      const hop = hops[index];
      const data = latencyData ? latencyData[index] : null;
      const isBottleneck = index === bottleneckIndex;
      
      console.log(`  Node ${index}: ${hop.node} at (${pos.x}, ${pos.y})${isBottleneck ? ' [BOTTLENECK]' : ''}`);
      if (data) {
        console.log(`    Processing: ${data.delays?.processing}ms, Cumulative: ${data.cumulativeDelay}ms`);
      }
      
      // Determine node color based on performance
      let nodeColor = '#ffffff';
      if (data) {
        if (hop.cpuLoad > 0.8) {
          nodeColor = '#ffe6e6'; // Light red for high load
        } else if (hop.cpuLoad > 0.6) {
          nodeColor = '#fff5e6'; // Light orange for medium load
        }
      }
      
      // Draw node circle
      this.ctx.save();
      this.ctx.fillStyle = nodeColor;
      this.ctx.strokeStyle = '#333333';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(pos.x, pos.y, this.nodeRadius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();
      this.ctx.restore();
      
      // Draw icon
      const icon = this.deviceIcons[hop.nodeType] || '📡';
      this.ctx.save();
      this.ctx.font = '24px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(icon, pos.x, pos.y);
      this.ctx.restore();
      
      // Draw node name
      this.ctx.save();
      this.ctx.fillStyle = '#333';
      this.ctx.font = 'bold 12px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'top';
      this.ctx.fillText(hop.node, pos.x, pos.y + this.nodeRadius + 8);
      
      // Draw processing delay if significant
      if (data && data.delays && data.delays.processing > 0.01) {
        this.ctx.fillStyle = '#666';
        this.ctx.font = '10px sans-serif';
        this.ctx.fillText(
          `Process: ${this.formatTime(data.delays.processing)}`,
          pos.x,
          pos.y + this.nodeRadius + 24
        );
      }
      
      // Draw cumulative latency
      if (data && data.cumulativeDelay) {
        this.ctx.fillStyle = this.getLatencyColor(data.cumulativeDelay);
        this.ctx.font = 'bold 11px sans-serif';
        this.ctx.fillText(
          `Total: ${this.formatTime(data.cumulativeDelay)}`,
          pos.x,
          pos.y + this.nodeRadius + 38
        );
      }
      
      this.ctx.restore();
      
      console.log(`    ✓ Node drawn with labels`);
      
      this.nodeRegions.push({
        x: pos.x,
        y: pos.y,
        radius: this.nodeRadius,
        node: hop.node,
        nodeType: hop.nodeType,
        index: index
      });
    });
  }
  
  calculateLinkLatency(hop, nodeData) {
    if (!nodeData || !nodeData.delays) return 10; // Default latency
    return (nodeData.delays.transmission || 0) +
           (nodeData.delays.propagation || 0) +
           (nodeData.delays.queuing || 0);
  }
  
  getLatencyColor(latency) {
    if (latency < 30) return COLORS.LATENCY.EXCELLENT || '#2ecc71';
    if (latency < 60) return COLORS.LATENCY.GOOD || '#3498db';
    if (latency < 100) return COLORS.LATENCY.OKAY || '#f39c12';
    if (latency < 200) return COLORS.LATENCY.POOR || '#e67e22';
    return COLORS.LATENCY.BAD || '#e74c3c';
  }
  
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
  
  getLinkAt(x, y) {
    // Simplified for debugging
    return null;
  }
}