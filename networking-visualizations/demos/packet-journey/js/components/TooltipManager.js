/**
 * TooltipManager - Manages hover tooltips for network elements
 * Provides contextual information on hover for nodes and other elements
 */

import { NetworkFormatter } from '../../../../shared/utils/NetworkFormatter.js';
import { COLORS } from '../../../../shared/constants/colors.js';

export class TooltipManager {
  constructor() {
    this.tooltip = null;
    this.visible = false;
    this.hideTimeout = null;
    
    this.createTooltip();
  }
  
  /**
   * Create the tooltip DOM element
   */
  createTooltip() {
    this.tooltip = document.createElement('div');
    this.tooltip.className = 'network-tooltip';
    this.tooltip.style.display = 'none';
    this.tooltip.style.position = 'absolute';
    this.tooltip.style.pointerEvents = 'none';
    this.tooltip.style.zIndex = '1000';
    document.body.appendChild(this.tooltip);
    
    // Apply default styles if not provided by CSS
    if (!document.querySelector('style[data-tooltip-styles]')) {
      const style = document.createElement('style');
      style.setAttribute('data-tooltip-styles', 'true');
      style.textContent = `
        .network-tooltip {
          background: ${COLORS.UI.DARK_BACKGROUND};
          color: ${COLORS.UI.BACKGROUND};
          padding: 8px 12px;
          border-radius: 4px;
          font-size: 12px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          max-width: 300px;
          line-height: 1.4;
        }
        
        .network-tooltip h4 {
          margin: 0 0 4px 0;
          font-size: 13px;
          font-weight: 600;
          color: ${COLORS.UI.BACKGROUND};
          border-bottom: 1px solid rgba(255,255,255,0.2);
          padding-bottom: 4px;
        }
        
        .network-tooltip .tooltip-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 2px 0;
        }
        
        .network-tooltip .tooltip-label {
          color: rgba(255,255,255,0.7);
          margin-right: 8px;
        }
        
        .network-tooltip .tooltip-value {
          font-weight: 500;
          color: ${COLORS.UI.BACKGROUND};
        }
        
        .network-tooltip .tooltip-status {
          display: inline-block;
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 11px;
          font-weight: 600;
          margin-top: 4px;
        }
        
        .network-tooltip .status-online {
          background: ${COLORS.STATUS.ONLINE};
          color: white;
        }
        
        .network-tooltip .status-busy {
          background: ${COLORS.STATUS.WARNING};
          color: white;
        }
        
        .network-tooltip .status-error {
          background: ${COLORS.STATUS.ERROR};
          color: white;
        }
        
        .network-tooltip::after {
          content: '';
          position: absolute;
          bottom: -6px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 6px solid ${COLORS.UI.DARK_BACKGROUND};
        }
      `;
      document.head.appendChild(style);
    }
  }
  
  /**
   * Show tooltip for a network node
   */
  showNodeTooltip(node, x, y, additionalInfo = {}) {
    const content = this.generateNodeContent(node, additionalInfo);
    this.show(content, x, y - 10); // Position above the node
  }
  
  /**
   * Show tooltip for a network link
   */
  showLinkTooltip(link, x, y) {
    const content = this.generateLinkContent(link);
    this.show(content, x, y);
  }
  
  /**
   * Show tooltip for legend item
   */
  showLegendTooltip(item, x, y) {
    const content = this.generateLegendContent(item);
    this.show(content, x, y);
  }
  
  /**
   * Show custom tooltip
   */
  showCustom(title, items, x, y) {
    const content = this.generateCustomContent(title, items);
    this.show(content, x, y);
  }
  
  /**
   * Generate content for node tooltip
   */
  generateNodeContent(node, info) {
    // Handle both node.type and node.nodeType for compatibility
    const nodeType = node.type || node.nodeType;
    const deviceInfo = this.getDeviceInfo(nodeType);
    
    // Handle both node.name and node.node for the label
    const nodeName = node.name || node.node || node.label || 'Network Node';
    let html = `<h4>${nodeName}</h4>`;
    
    // Device type and role
    html += `<div class="tooltip-row">
      <span class="tooltip-label">Type:</span>
      <span class="tooltip-value">${deviceInfo.name}</span>
    </div>`;
    
    if (deviceInfo.role) {
      html += `<div class="tooltip-row">
        <span class="tooltip-label">Role:</span>
        <span class="tooltip-value">${deviceInfo.role}</span>
      </div>`;
    }
    
    // Performance characteristics
    if (info.processingPower) {
      const powerLabels = {
        'high': 'High Performance',
        'medium': 'Medium Performance',
        'low': 'Low Performance'
      };
      html += `<div class="tooltip-row">
        <span class="tooltip-label">Performance:</span>
        <span class="tooltip-value">${powerLabels[info.processingPower] || info.processingPower}</span>
      </div>`;
    }
    
    if (info.cpuLoad !== undefined) {
      html += `<div class="tooltip-row">
        <span class="tooltip-label">CPU Load:</span>
        <span class="tooltip-value">${NetworkFormatter.percentage(info.cpuLoad)}</span>
      </div>`;
    }
    
    // Latency information
    if (info.latency !== undefined) {
      html += `<div class="tooltip-row">
        <span class="tooltip-label">Latency:</span>
        <span class="tooltip-value">${NetworkFormatter.time(info.latency)}</span>
      </div>`;
    }
    
    if (info.cumulativeLatency !== undefined) {
      html += `<div class="tooltip-row">
        <span class="tooltip-label">Total to here:</span>
        <span class="tooltip-value">${NetworkFormatter.time(info.cumulativeLatency)}</span>
      </div>`;
    }
    
    // Status indicator
    if (info.status) {
      const statusClass = `status-${info.status.toLowerCase()}`;
      html += `<span class="tooltip-status ${statusClass}">${info.status}</span>`;
    }
    
    // Device description
    if (deviceInfo.description) {
      html += `<div style="margin-top: 6px; padding-top: 6px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 11px; color: rgba(255,255,255,0.6);">
        ${deviceInfo.description}
      </div>`;
    }
    
    return html;
  }
  
  /**
   * Generate content for link tooltip
   */
  generateLinkContent(link) {
    let html = `<h4>Network Link</h4>`;
    
    if (link.bandwidth) {
      html += `<div class="tooltip-row">
        <span class="tooltip-label">Bandwidth:</span>
        <span class="tooltip-value">${NetworkFormatter.bandwidth(link.bandwidth)}</span>
      </div>`;
    }
    
    if (link.distance) {
      html += `<div class="tooltip-row">
        <span class="tooltip-label">Distance:</span>
        <span class="tooltip-value">${NetworkFormatter.distance(link.distance)}</span>
      </div>`;
    }
    
    if (link.medium) {
      const mediumLabels = {
        'fiber': 'Fiber Optic',
        'copper': 'Copper Cable',
        'wifi': 'Wireless',
        'satellite': 'Satellite'
      };
      html += `<div class="tooltip-row">
        <span class="tooltip-label">Medium:</span>
        <span class="tooltip-value">${mediumLabels[link.medium] || link.medium}</span>
      </div>`;
    }
    
    if (link.utilization !== undefined) {
      // Color code utilization based on level
      let utilizationClass = '';
      let utilizationStatus = '';
      if (link.utilization >= 0.9) {
        utilizationClass = 'status-error';
        utilizationStatus = ' (Critical)';
      } else if (link.utilization >= 0.7) {
        utilizationClass = 'status-busy';
        utilizationStatus = ' (High)';
      } else if (link.utilization >= 0.5) {
        utilizationStatus = ' (Moderate)';
      } else {
        utilizationClass = 'status-online';
        utilizationStatus = ' (Low)';
      }
      
      html += `<div class="tooltip-row">
        <span class="tooltip-label">Utilization:</span>
        <span class="tooltip-value ${utilizationClass ? `style="color: inherit;"` : ''}>
          <span class="${utilizationClass}" style="padding: 1px 4px; border-radius: 3px;">
            ${NetworkFormatter.percentage(link.utilization)}${utilizationStatus}
          </span>
        </span>
      </div>`;
      
      // Add queuing impact if high utilization
      if (link.utilization >= 0.7) {
        const queuingDelay = (1 / Math.pow(1 - Math.min(link.utilization, 0.95), 3)) - 1;
        html += `<div class="tooltip-row">
          <span class="tooltip-label">Queue Delay:</span>
          <span class="tooltip-value">${queuingDelay.toFixed(1)} ms</span>
        </div>`;
      }
    }
    
    if (link.latency) {
      html += `<div class="tooltip-row">
        <span class="tooltip-label">Link Latency:</span>
        <span class="tooltip-value">${NetworkFormatter.time(link.latency.total)}</span>
      </div>`;
    }
    
    return html;
  }
  
  /**
   * Generate content for legend tooltip
   */
  generateLegendContent(item) {
    const legendDescriptions = {
      'excellent': {
        title: 'Excellent Latency',
        description: 'Less than 30ms - Ideal for all applications including real-time gaming and video calls',
        examples: 'Local networks, same-city connections'
      },
      'good': {
        title: 'Good Latency',
        description: '30-60ms - Good for most applications including VoIP and online gaming',
        examples: 'Regional connections, well-connected servers'
      },
      'okay': {
        title: 'Acceptable Latency',
        description: '60-100ms - Acceptable for web browsing and streaming',
        examples: 'Cross-country connections, international to nearby countries'
      },
      'poor': {
        title: 'Poor Latency',
        description: '100-200ms - Noticeable delays, impacts real-time applications',
        examples: 'Intercontinental connections, congested networks'
      },
      'bad': {
        title: 'Bad Latency',
        description: 'Over 200ms - Significant delays, poor user experience',
        examples: 'Satellite connections, heavily congested or distant networks'
      },
      'transmission': {
        title: 'Transmission Delay',
        description: 'Time to serialize packet bits onto the wire',
        formula: 'Packet Size / Bandwidth',
        factors: 'Depends on packet size and link speed'
      },
      'propagation': {
        title: 'Propagation Delay',
        description: 'Time for signal to travel the physical distance',
        formula: 'Distance / Signal Speed',
        factors: 'Depends on distance and medium (fiber, copper, wireless)'
      },
      'processing': {
        title: 'Processing Delay',
        description: 'Time for device to process the packet',
        formula: 'Device-specific processing time',
        factors: 'Depends on device performance and CPU load'
      },
      'queuing': {
        title: 'Queuing Delay',
        description: 'Time waiting in queue before transmission',
        formula: 'Variable based on congestion',
        factors: 'Depends on network utilization and traffic patterns'
      }
    };
    
    const info = legendDescriptions[item.type] || {};
    
    let html = `<h4>${info.title || item.label}</h4>`;
    
    if (info.description) {
      html += `<div style="margin-bottom: 6px;">${info.description}</div>`;
    }
    
    if (info.formula) {
      html += `<div class="tooltip-row">
        <span class="tooltip-label">Formula:</span>
        <span class="tooltip-value" style="font-family: monospace; font-size: 11px;">${info.formula}</span>
      </div>`;
    }
    
    if (info.factors) {
      html += `<div style="margin-top: 4px; font-size: 11px; color: rgba(255,255,255,0.7);">
        ${info.factors}
      </div>`;
    }
    
    if (info.examples) {
      html += `<div style="margin-top: 6px; padding-top: 6px; border-top: 1px solid rgba(255,255,255,0.1);">
        <span class="tooltip-label">Examples:</span><br>
        <span style="font-size: 11px; color: rgba(255,255,255,0.8);">${info.examples}</span>
      </div>`;
    }
    
    return html;
  }
  
  /**
   * Generate custom content
   */
  generateCustomContent(title, items) {
    let html = `<h4>${title}</h4>`;
    
    items.forEach(item => {
      if (item.separator) {
        html += `<div style="margin: 4px 0; border-top: 1px solid rgba(255,255,255,0.1);"></div>`;
      } else {
        html += `<div class="tooltip-row">
          <span class="tooltip-label">${item.label}:</span>
          <span class="tooltip-value">${item.value}</span>
        </div>`;
      }
    });
    
    return html;
  }
  
  /**
   * Get device information
   */
  getDeviceInfo(type) {
    const devices = {
      'client': {
        name: 'Client Computer',
        role: 'End User Device',
        description: 'Your computer initiating the network request'
      },
      'host': {
        name: 'Host Computer',
        role: 'End Device',
        description: 'Computer or device at network endpoint'
      },
      'router': {
        name: 'Router',
        role: 'Layer 3 Device',
        description: 'Routes packets between different networks'
      },
      'switch': {
        name: 'Network Switch',
        role: 'Layer 2 Device',
        description: 'Connects devices within the same network'
      },
      'server': {
        name: 'Server',
        role: 'Service Provider',
        description: 'Provides network services and resources'
      },
      'firewall': {
        name: 'Firewall',
        role: 'Security Device',
        description: 'Filters and inspects network traffic'
      },
      'loadbalancer': {
        name: 'Load Balancer',
        role: 'Traffic Distributor',
        description: 'Distributes requests across multiple servers'
      },
      'isp-edge': {
        name: 'ISP Edge Router',
        role: 'Network Gateway',
        description: 'Connection point to Internet Service Provider'
      },
      'core': {
        name: 'Core Router',
        role: 'Backbone Device',
        description: 'High-capacity router in network backbone'
      }
    };
    
    // Handle undefined or null type
    if (!type) {
      return {
        name: 'Unknown Device',
        role: 'Network Device'
      };
    }
    
    return devices[type] || {
      name: type.charAt(0).toUpperCase() + type.slice(1),
      role: 'Network Device'
    };
  }
  
  /**
   * Show the tooltip at specified position
   */
  show(content, x, y) {
    // Clear any hide timeout
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
    
    // Update content
    this.tooltip.innerHTML = content;
    
    // Position tooltip
    this.position(x, y);
    
    // Show tooltip
    this.tooltip.style.display = 'block';
    this.visible = true;
  }
  
  /**
   * Position tooltip, keeping it on screen
   */
  position(x, y) {
    // Initially position to measure dimensions
    this.tooltip.style.left = '0px';
    this.tooltip.style.top = '0px';
    this.tooltip.style.display = 'block';
    
    const rect = this.tooltip.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const padding = 10;
    
    // Get scroll offsets
    const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    
    // Calculate position (x, y are client coordinates, need to add scroll)
    let left = x + scrollX - width / 2;
    let top = y + scrollY - height - 10; // Default to above cursor
    
    // Get viewport bounds
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Keep tooltip on screen horizontally (check against viewport + scroll)
    if (left < scrollX + padding) {
      left = scrollX + padding;
    } else if (left + width > scrollX + viewportWidth - padding) {
      left = scrollX + viewportWidth - width - padding;
    }
    
    // Keep tooltip on screen vertically (check against viewport + scroll)
    if (top < scrollY + padding) {
      top = y + scrollY + 20; // Show below if not enough space above
      // Remove the arrow pointing up and add one pointing down
      this.tooltip.style.setProperty('--arrow-direction', 'down');
    } else {
      this.tooltip.style.setProperty('--arrow-direction', 'up');
    }
    
    // Apply position (absolute positioning from page top)
    this.tooltip.style.left = `${left}px`;
    this.tooltip.style.top = `${top}px`;
  }
  
  /**
   * Hide the tooltip
   */
  hide(immediate = false) {
    if (immediate) {
      this.tooltip.style.display = 'none';
      this.visible = false;
    } else {
      // Add a small delay to prevent flickering
      this.hideTimeout = setTimeout(() => {
        this.tooltip.style.display = 'none';
        this.visible = false;
      }, 100);
    }
  }
  
  /**
   * Check if tooltip is visible
   */
  isVisible() {
    return this.visible;
  }
  
  /**
   * Destroy tooltip and clean up
   */
  destroy() {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
    }
    
    if (this.tooltip && this.tooltip.parentNode) {
      this.tooltip.parentNode.removeChild(this.tooltip);
    }
    
    this.tooltip = null;
    this.visible = false;
  }
}