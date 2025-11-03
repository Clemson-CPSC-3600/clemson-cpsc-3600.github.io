/**
 * Constants for the Ladder Diagram visualization
 * Centralizes all magic numbers, colors, and configuration values
 */

// Visual color constants
export const COLORS = {
  // Delay component colors
  DELAYS: {
    TRANSMISSION: '#e74c3c',  // Red
    PROPAGATION: '#3498db',    // Blue
    PROCESSING: '#f39c12',     // Orange
    QUEUING: '#9b59b6'         // Purple
  },
  
  // Packet colors
  PACKET: {
    DEFAULT: '#2ecc71',        // Green
    FIRST_BIT: '#27ae60',      // Darker green
    LAST_BIT: '#16a085',       // Teal
    IN_TRANSIT: '#27ae60',     // Darker green
    TRANSMITTED: '#2ecc71',    // Green (portion already transmitted)
    TRANSMITTING: '#e74c3c',   // Red (portion being transmitted)
    BORDER: '#34495e',         // Dark gray border
    QUEUED: '#9b59b6',         // Purple when queued
    DELIVERED: '#95a5a6',      // Gray when delivered
    // Multi-packet mode colors
    MULTI: [
      '#3498db',  // Blue
      '#2ecc71',  // Green
      '#9b59b6',  // Purple
      '#e67e22',  // Orange
      '#1abc9c',  // Turquoise
      '#f39c12',  // Yellow
      '#e74c3c',  // Red
      '#34495e'   // Dark gray
    ]
  },
  
  // UI element colors
  UI: {
    GRID: '#ecf0f1',           // Light gray
    GRID_MAJOR: '#bdc3c7',     // Medium gray
    AXIS: '#34495e',           // Dark gray
    AXIS_LABEL: '#2c3e50',     // Darker gray
    SUBTITLE: '#7f8c8d',       // Medium gray
    SECONDARY_TEXT: '#95a5a6', // Light gray text
    HIGHLIGHT: '#e74c3c',      // Red (for time line)
    BACKGROUND: '#fafbfc',     // Very light gray
    LINK_LINE: '#bdc3c7',      // Link connection lines
    BORDER: '#ddd'             // Light border
  },
  
  // Node type colors
  NODE_TYPES: {
    HOST: '#3498db',           // Blue
    CLIENT: '#2ecc71',         // Green
    SERVER: '#9b59b6',         // Purple
    ROUTER: '#e67e22',         // Orange
    SWITCH: '#34495e',         // Dark gray
    FIREWALL: '#e74c3c',       // Red
    LOAD_BALANCER: '#f39c12',  // Yellow
    SATELLITE: '#8e44ad',      // Dark purple
    CLOUD: '#16a085',          // Teal
    DEFAULT: '#95a5a6'         // Gray
  },
  
  // Path colors
  PATH: {
    NORMAL: '#95a5a6',         // Gray
    HIGHLIGHTED: '#3498db',    // Blue
    TRANSMISSION: '#e74c3c',   // Red
    PROPAGATION: '#2ecc71',    // Green
    PROCESSING: '#f39c12',     // Orange
    QUEUING: '#9b59b6'         // Purple
  }
};

// Size constants
export const SIZES = {
  // Packet visualization
  PACKET_RADIUS: 10,
  PACKET_RADIUS_SMALL: 6,
  PULSE_RADIUS_START: 6,
  PULSE_RADIUS_END: 12,
  
  // Line widths
  STROKE_WIDTH: 2,
  STROKE_WIDTH_THIN: 1,
  STROKE_WIDTH_THICK: 3,
  STROKE_WIDTH_HIGHLIGHT: 4,
  
  // SVG dimensions
  SVG_WIDTH: 800,
  SVG_HEIGHT: 600,
  
  // Margins for axis labels
  MARGIN: {
    top: 80,     // Space for link information
    right: 50,   // Space for overflow
    bottom: 40,  // Space for bottom labels
    left: 80     // Space for time axis
  },
  
  // Text sizes
  FONT: {
    AXIS_TITLE: '14px',
    AXIS_LABEL: '12px',
    NODE_LABEL: '13px',
    NODE_TYPE: '9px',
    LINK_LABEL: '10px',
    LINK_DETAIL: '9px',
    DELAY_LABEL: '9px',
    SMALL: '8px'
  },
  
  // Rectangles
  PROCESSING_BOX_WIDTH: 20,
  PROCESSING_BOX_RADIUS: 2,
  
  // Axis
  AXIS: {
    TICK_LENGTH: 5,
    LINE_WIDTH: 1
  }
};

// Text styles
export const STYLES = {
  FONTS: {
    AXIS_LABEL: {
      size: '12px',
      family: 'system-ui, -apple-system, sans-serif'
    },
    AXIS_TITLE: {
      size: '14px',
      weight: 'bold',
      family: 'system-ui, -apple-system, sans-serif'
    },
    NODE_LABEL: {
      size: '12px',
      weight: 'bold',
      family: 'system-ui, -apple-system, sans-serif'
    },
    NODE_TYPE: {
      size: '10px',
      family: 'system-ui, -apple-system, sans-serif'
    },
    LINK_LABEL: {
      size: '11px',
      family: 'system-ui, -apple-system, sans-serif'
    },
    LINK_SUBLABEL: {
      size: '9px',
      family: 'system-ui, -apple-system, sans-serif'
    }
  }
};

// Timing thresholds
export const THRESHOLDS = {
  // Minimum values to display
  MIN_TRANSMISSION_TIME: 0.001,   // Don't show transmission delay below this
  MIN_PROPAGATION_TIME: 0.1,      // Don't show propagation delay below this
  MIN_PROCESSING_TIME: 0.1,       // Don't show processing delay below this
  
  // Animation thresholds
  MIN_FRAME_TIME: 16.67,          // 60fps target
  
  // Packet limits
  MAX_PACKETS: 20,                // Maximum packets in multi-mode
  
  // Time precision thresholds
  TIME_PRECISION: {
    MICRO: 0.001,   // Below this, show microseconds
    HIGH: 1,         // Below this, show 3 decimal places
    MEDIUM: 10,      // Below this, show 2 decimal places
    LOW: 100         // Below this, show 1 decimal place
  }
};

// Animation constants
export const ANIMATION = {
  // Durations
  PULSE_DURATION: '1s',
  GLOW_DURATION: '1.5s',
  
  // Playback speeds
  SPEED: {
    MIN: 0.05,
    DEFAULT: 0.25,
    MAX: 2.0,
    STEP: 0.05
  },
  
  // Step sizes for time navigation
  STEP: {
    SINGLE_MODE: 0.5,   // ms
    MULTI_MODE: 2.0     // ms
  }
};

// Default configurations
export const DEFAULTS = {
  // Packet configuration
  PACKET_SIZE: 1500,  // bytes (standard MTU)
  
  // Network speeds
  PROPAGATION_SPEED: {
    VACUUM: 3e8,      // Speed of light in vacuum
    FIBER: 2e8,       // Speed in fiber optic cable (~2/3 c)
    COPPER: 2e8,      // Speed in copper cable
    WIRELESS: 3e8     // Speed in air (approximately c)
  },
  
  // Multi-packet mode
  MULTI_PACKET: {
    SEND_MODE: 'interval',
    INTERVAL: 10,      // ms between packets
    BURST_SIZE: 3,     // packets per burst
    SIMULATION_MULTIPLIER: 20  // How many packet-times to simulate
  },
  
  // Time scaling
  TIME_SCALE_MULTIPLIER: 1.2,        // Add 20% buffer to max time
  MULTI_PACKET_TIME_MULTIPLIER: 2    // Double the time scale for multi-packet mode
};

// Grid and axis configuration
export const GRID = {
  // Target counts for grid lines
  TARGET_MINOR_LINES: 20,
  TARGET_MAJOR_LINES: 5,
  TARGET_TIME_LABELS: 8,
  
  // Dash patterns
  DASH_PATTERN: {
    MINOR: '2,2',
    MAJOR: 'none',
    LAST_BIT: '5,3'
  },
  
  // Opacity values
  OPACITY: {
    MINOR_LINE: 0.5,
    MAJOR_LINE: 1.0,
    NODE_LINE: 0.3,
    PACKET_AREA: 0.15,
    PAST_SHADE: 0.05,
    PATH_LINE: 0.9,
    PATH_LINE_DASHED: 0.7
  }
};

// Format patterns
export const FORMATS = {
  // Number format patterns
  BANDWIDTH: {
    GBPS: { threshold: 1e9, divisor: 1e9, suffix: 'Gbps' },
    MBPS: { threshold: 1e6, divisor: 1e6, suffix: 'Mbps' },
    KBPS: { threshold: 1e3, divisor: 1e3, suffix: 'Kbps' },
    BPS: { threshold: 0, divisor: 1, suffix: 'bps' }
  },
  
  DISTANCE: {
    MM: { threshold: 1e6, divisor: 1e6, suffix: 'Mm' },
    KM: { threshold: 1e3, divisor: 1e3, suffix: 'km' },
    M: { threshold: 0, divisor: 1, suffix: 'm' }
  },
  
  TIME: {
    US: { threshold: 0.001, multiplier: 1000, suffix: 'μs' },
    MS: { threshold: 0, multiplier: 1, suffix: 'ms' }
  }
};

// CSS class names
export const CLASSES = {
  // Layer groups
  LAYERS: {
    GRID: 'grid-layer',
    PATH: 'path-layer',
    PACKET: 'packet-layer',
    AXIS: 'axis-layer',
    LABEL: 'label-layer'
  },
  
  // Element classes
  ELEMENTS: {
    SEGMENT: 'segment',
    SEGMENT_FIRST_BIT: 'segment-first-bit',
    SEGMENT_LAST_BIT: 'segment-last-bit',
    SEGMENT_PACKET_AREA: 'segment-packet-area',
    TIME_LINE: 'time-line',
    TIME_LINE_GLOW: 'time-line-glow',
    TIME_INTERSECTION: 'time-intersection',
    PAST_SHADE: 'past-shade',
    HIGHLIGHTED: 'highlighted'
  },
  
  // State classes
  STATES: {
    ACTIVE: 'active',
    WAITING: 'waiting',
    DELIVERED: 'delivered',
    PULSING: 'pulsing'
  }
};

// Error messages
export const ERRORS = {
  INVALID_SCENARIO: 'Invalid scenario configuration',
  PACKET_LIMIT_EXCEEDED: `Maximum packet limit (${THRESHOLDS.MAX_PACKETS}) exceeded`,
  INVALID_MODE: 'Invalid visualization mode. Use "single" or "multi"',
  MISSING_TRACKER: 'Packet tracker not initialized',
  MISSING_SCENARIO: 'No scenario loaded'
};

// Calculation constants
export const CALC = {
  BITS_PER_BYTE: 8,
  MS_PER_SECOND: 1000,
  LABEL_OFFSET: {
    X: 10,
    Y: 5
  }
};