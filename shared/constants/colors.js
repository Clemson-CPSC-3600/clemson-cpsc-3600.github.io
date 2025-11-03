/**
 * Shared color constants for all networking visualizations
 * Provides consistent color scheme across demos and site UI
 */

export const COLORS = {
  // Module colors (for curriculum organization)
  MODULES: {
    MODULE1: '#3498db',  // Blue - Big Picture
    MODULE2: '#2ecc71',  // Green - Application Layer
    MODULE3: '#9b59b6',  // Purple - Transport Layer
    MODULE4: '#e74c3c',  // Red - Network Layer
    MODULE5: '#f39c12',  // Orange - Link Layer
    MODULE6: '#34495e'   // Dark Gray - Security
  },

  // Primary brand colors
  PRIMARY: '#3498db',         // Blue
  PRIMARY_DARK: '#2980b9',    // Dark blue
  PRIMARY_LIGHT: '#5dade2',   // Light blue
  SECONDARY: '#2ecc71',       // Green
  SECONDARY_DARK: '#27ae60',  // Dark green
  SECONDARY_LIGHT: '#58d68d', // Light green

  // Semantic colors
  SUCCESS: '#2ecc71',         // Green
  WARNING: '#f39c12',         // Orange
  DANGER: '#e74c3c',          // Red
  INFO: '#3498db',            // Blue

  // UI colors
  BACKGROUND: '#f8f9fa',      // Light gray background
  BACKGROUND_ALT: '#ffffff',  // White
  TEXT: '#2c3e50',            // Dark blue-gray
  TEXT_LIGHT: '#7f8c8d',      // Medium gray
  TEXT_MUTED: '#95a5a6',      // Light gray
  BORDER: '#ddd',             // Light border
  BORDER_DARK: '#bdc3c7',     // Darker border

  // Interactive states
  HOVER: '#5dade2',           // Light blue
  ACTIVE: '#2980b9',          // Dark blue
  DISABLED: '#95a5a6',        // Light gray
  FOCUS: '#3498db',           // Blue

  // Code highlighting
  CODE_BACKGROUND: '#f4f4f4', // Light gray
  CODE_BORDER: '#ddd',        // Light border
  CODE_KEYWORD: '#d73a49',    // Red
  CODE_STRING: '#032f62',     // Dark blue
  CODE_COMMENT: '#6a737d',    // Gray
  CODE_FUNCTION: '#6f42c1',   // Purple


  // Packet types
  PACKET: {
    DEFAULT: '#2ecc71',      // Green
    TCP: '#3498db',          // Blue
    UDP: '#9b59b6',          // Purple
    ICMP: '#e67e22',         // Orange
    DNS: '#f39c12',          // Yellow-orange
    HTTP: '#1abc9c',         // Turquoise
    HTTPS: '#16a085',        // Dark turquoise
    FTP: '#d35400',          // Dark orange
    SSH: '#8e44ad',          // Dark purple
    ERROR: '#e74c3c',        // Red
    DROPPED: '#c0392b',      // Dark red
    RETRANSMIT: '#e67e22',   // Orange
    ACK: '#27ae60',          // Dark green
    SYN: '#2980b9',          // Dark blue
    FIN: '#c0392b'           // Dark red
  },
  
  // Delay components
  DELAYS: {
    TRANSMISSION: '#e74c3c', // Red
    PROPAGATION: '#3498db',   // Blue
    PROCESSING: '#f39c12',    // Yellow-orange
    QUEUING: '#9b59b6',       // Purple
    TOTAL: '#2c3e50'          // Dark blue-gray
  },
  
  // Network node types
  NODES: {
    HOST: '#34495e',          // Dark gray
    CLIENT: '#3498db',        // Blue
    SERVER: '#8e44ad',        // Purple
    ROUTER: '#2c3e50',        // Dark blue-gray
    SWITCH: '#16a085',        // Dark turquoise
    HUB: '#95a5a6',          // Light gray
    FIREWALL: '#c0392b',      // Dark red
    LOADBALANCER: '#f39c12',  // Yellow-orange
    PROXY: '#d35400',         // Dark orange
    DNS_SERVER: '#9b59b6',    // Purple
    GATEWAY: '#2980b9',       // Dark blue
    ACCESS_POINT: '#27ae60',  // Dark green
    MODEM: '#7f8c8d'         // Medium gray
  },
  
  // Link/connection types
  LINKS: {
    ETHERNET: '#95a5a6',      // Light gray
    FIBER: '#3498db',         // Blue
    WIRELESS: '#e67e22',      // Orange
    SATELLITE: '#9b59b6',     // Purple
    COPPER: '#d35400',        // Dark orange
    COAX: '#7f8c8d',         // Medium gray
    ACTIVE: '#2ecc71',        // Green
    INACTIVE: '#ecf0f1',      // Very light gray
    CONGESTED: '#e74c3c',     // Red
    OPTIMAL: '#27ae60'        // Dark green
  },
  
  // UI elements
  UI: {
    BACKGROUND: '#ffffff',     // White
    DARK_BACKGROUND: '#2c3e50', // Dark blue-gray
    GRID: '#ecf0f1',          // Very light gray
    GRID_MAJOR: '#bdc3c7',    // Light gray
    GRID_MINOR: '#ecf0f1',    // Very light gray
    AXIS: '#34495e',          // Dark gray
    AXIS_LABEL: '#2c3e50',    // Dark blue-gray
    TEXT: '#2c3e50',          // Dark blue-gray
    TEXT_SECONDARY: '#7f8c8d', // Medium gray (alias for TEXT_LIGHT)
    TEXT_LIGHT: '#7f8c8d',    // Medium gray
    TEXT_HIGHLIGHT: '#e74c3c', // Red
    BORDER: '#bdc3c7',        // Light gray
    BORDER_LIGHT: '#ecf0f1',  // Very light gray
    SHADOW: 'rgba(0,0,0,0.1)', // Light shadow
    HIGHLIGHT: '#e74c3c',      // Red
    SELECTION: '#3498db',      // Blue
    SUCCESS: '#27ae60',        // Dark green
    WARNING: '#f39c12',        // Yellow-orange
    ERROR: '#e74c3c',         // Red
    INFO: '#3498db',           // Blue
    DISABLED: '#95a5a6'        // Light gray
  },
  
  // Latency quality levels
  LATENCY: {
    EXCELLENT: '#2ecc71',      // Green - < 30ms
    GOOD: '#3498db',          // Blue - 30-60ms
    OKAY: '#f39c12',          // Yellow-orange - 60-100ms
    POOR: '#e67e22',          // Orange - 100-200ms
    BAD: '#e74c3c'            // Red - > 200ms
  },
  
  // Status indicators
  STATUS: {
    ONLINE: '#27ae60',         // Dark green
    OFFLINE: '#95a5a6',        // Light gray
    CONNECTING: '#f39c12',     // Yellow-orange
    ERROR: '#e74c3c',          // Red
    WARNING: '#e67e22',        // Orange
    IDLE: '#3498db',           // Blue
    BUSY: '#9b59b6',           // Purple
    TRANSMITTING: '#2ecc71',   // Green
    RECEIVING: '#1abc9c',      // Turquoise
    PROCESSING: '#f39c12',     // Yellow-orange
    QUEUED: '#9b59b6',         // Purple
    DROPPED: '#c0392b'         // Dark red
  },
  
  // Chart colors for data visualization
  CHART: {
    PRIMARY: '#3498db',        // Blue
    SECONDARY: '#2ecc71',      // Green
    SUCCESS: '#27ae60',        // Dark green
    WARNING: '#f39c12',        // Yellow-orange
    DANGER: '#e74c3c',         // Red
    INFO: '#1abc9c',           // Turquoise
    LIGHT: '#ecf0f1',          // Very light gray
    DARK: '#2c3e50'            // Dark blue-gray
  },
  
  // Gradients for advanced visualizations
  GRADIENTS: {
    // Speed gradient: slow to fast
    SPEED: ['#e74c3c', '#e67e22', '#f39c12', '#2ecc71', '#27ae60'],
    
    // Congestion gradient: clear to congested
    CONGESTION: ['#27ae60', '#2ecc71', '#f39c12', '#e67e22', '#e74c3c'],
    
    // Quality gradient: poor to excellent
    QUALITY: ['#c0392b', '#e74c3c', '#e67e22', '#f39c12', '#2ecc71', '#27ae60'],
    
    // Latency gradient: high to low
    LATENCY: ['#e74c3c', '#e67e22', '#f39c12', '#3498db', '#2ecc71'],
    
    // Temperature gradient: cold to hot
    TEMPERATURE: ['#3498db', '#2ecc71', '#f39c12', '#e67e22', '#e74c3c'],
    
    // Utilization gradient: low to high
    UTILIZATION: ['#ecf0f1', '#3498db', '#2ecc71', '#f39c12', '#e74c3c']
  },
  
  // Chart colors (for multiple series)
  CHART: {
    SERIES: [
      '#3498db',  // Blue
      '#2ecc71',  // Green
      '#e74c3c',  // Red
      '#f39c12',  // Yellow-orange
      '#9b59b6',  // Purple
      '#1abc9c',  // Turquoise
      '#e67e22',  // Orange
      '#34495e',  // Dark gray
      '#16a085',  // Dark turquoise
      '#d35400'   // Dark orange
    ]
  },
  
  // Opacity presets
  OPACITY: {
    FULL: 1.0,
    HIGH: 0.9,
    MEDIUM: 0.7,
    LOW: 0.5,
    FAINT: 0.3,
    GHOST: 0.15,
    INVISIBLE: 0
  }
};

/**
 * Helper function to get color with opacity
 * @param {string} color - Base color
 * @param {number} opacity - Opacity value (0-1)
 * @returns {string} Color with opacity
 */
export function withOpacity(color, opacity) {
  // If color is already rgba, replace the alpha
  if (color.startsWith('rgba')) {
    return color.replace(/[\d.]+\)$/, `${opacity})`);
  }
  
  // If color is rgb, convert to rgba
  if (color.startsWith('rgb')) {
    return color.replace('rgb', 'rgba').replace(')', `, ${opacity})`);
  }
  
  // If color is hex, convert to rgba
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  
  // Return as-is if format not recognized
  return color;
}

/**
 * Get color from gradient based on value
 * @param {Array} gradient - Array of colors
 * @param {number} value - Value between 0 and 1
 * @returns {string} Interpolated color
 */
export function getGradientColor(gradient, value) {
  if (!gradient || gradient.length === 0) return '#000000';
  if (gradient.length === 1) return gradient[0];
  
  // Clamp value between 0 and 1
  value = Math.max(0, Math.min(1, value));
  
  // Find the two colors to interpolate between
  const scaledValue = value * (gradient.length - 1);
  const lowerIndex = Math.floor(scaledValue);
  const upperIndex = Math.min(lowerIndex + 1, gradient.length - 1);
  const interpolation = scaledValue - lowerIndex;
  
  if (lowerIndex === upperIndex) {
    return gradient[lowerIndex];
  }
  
  // For now, return the closest color (could implement color interpolation)
  return interpolation < 0.5 ? gradient[lowerIndex] : gradient[upperIndex];
}

/**
 * Get status color based on value and thresholds
 * @param {number} value - Current value
 * @param {Object} thresholds - Threshold object with good, warning, error levels
 * @returns {string} Appropriate color
 */
export function getStatusColor(value, thresholds) {
  if (value <= thresholds.good) {
    return COLORS.STATUS.ONLINE;
  } else if (value <= thresholds.warning) {
    return COLORS.STATUS.WARNING;
  } else {
    return COLORS.STATUS.ERROR;
  }
}

// Export default for convenience
export default COLORS;