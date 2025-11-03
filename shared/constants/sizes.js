/**
 * Shared size constants for all networking visualizations
 * Provides consistent sizing across demos
 */

export const SIZES = {
  // Packet visualization sizes
  PACKET: {
    RADIUS: 10,
    MINI_RADIUS: 5,
    LARGE_RADIUS: 15,
    STROKE_WIDTH: 2,
    LABEL_OFFSET: 15,
    ICON_SIZE: 20
  },
  
  // Network node sizes
  NODE: {
    // Default sizes for different node types
    HOST: { width: 60, height: 40, iconSize: 24 },
    CLIENT: { width: 60, height: 40, iconSize: 24 },
    SERVER: { width: 50, height: 60, iconSize: 28 },
    ROUTER: { radius: 30, iconSize: 24 },
    SWITCH: { width: 80, height: 30, iconSize: 20 },
    HUB: { radius: 25, iconSize: 20 },
    FIREWALL: { width: 70, height: 50, iconSize: 26 },
    LOADBALANCER: { width: 80, height: 40, iconSize: 24 },
    ACCESS_POINT: { radius: 35, iconSize: 24 },
    
    // Common properties
    DEFAULT_RADIUS: 30,
    DEFAULT_WIDTH: 60,
    DEFAULT_HEIGHT: 40,
    LABEL_OFFSET: 10,
    BORDER_WIDTH: 2,
    SELECTED_BORDER_WIDTH: 3,
    HOVER_SCALE: 1.1
  },
  
  // Link/connection sizes
  LINK: {
    WIDTH: 2,
    ACTIVE_WIDTH: 3,
    HOVER_WIDTH: 4,
    ARROW_SIZE: 8,
    LABEL_OFFSET: 10,
    DASH_ARRAY: '5,5',
    WIRELESS_DASH: '2,3',
    FIBER_WIDTH: 3
  },
  
  // UI element sizes
  UI: {
    // Margins for visualizations
    MARGIN: {
      TOP: 80,
      RIGHT: 50,
      BOTTOM: 40,
      LEFT: 80,
      SMALL: {
        TOP: 40,
        RIGHT: 30,
        BOTTOM: 30,
        LEFT: 50
      },
      LARGE: {
        TOP: 100,
        RIGHT: 80,
        BOTTOM: 60,
        LEFT: 100
      }
    },
    
    // Padding
    PADDING: {
      SMALL: 5,
      MEDIUM: 10,
      LARGE: 20,
      XLARGE: 30
    },
    
    // Border widths
    BORDER: {
      THIN: 1,
      MEDIUM: 2,
      THICK: 3,
      HEAVY: 4
    },
    
    // Corner radius
    RADIUS: {
      SMALL: 3,
      MEDIUM: 5,
      LARGE: 8,
      XLARGE: 12,
      ROUND: 9999
    },
    
    // Grid sizes
    GRID: {
      MINOR_WIDTH: 0.5,
      MAJOR_WIDTH: 1,
      CELL_SIZE: 20,
      LARGE_CELL_SIZE: 50
    },
    
    // Tooltip
    TOOLTIP: {
      PADDING: 8,
      BORDER_RADIUS: 4,
      MAX_WIDTH: 300,
      ARROW_SIZE: 6
    },
    
    // Controls
    BUTTON: {
      HEIGHT: 36,
      MIN_WIDTH: 80,
      PADDING_X: 16,
      PADDING_Y: 8,
      ICON_SIZE: 20,
      SMALL: {
        HEIGHT: 28,
        MIN_WIDTH: 60,
        PADDING_X: 12,
        PADDING_Y: 6,
        ICON_SIZE: 16
      },
      LARGE: {
        HEIGHT: 44,
        MIN_WIDTH: 100,
        PADDING_X: 20,
        PADDING_Y: 10,
        ICON_SIZE: 24
      }
    },
    
    // Input fields
    INPUT: {
      HEIGHT: 36,
      PADDING_X: 12,
      PADDING_Y: 8,
      BORDER_WIDTH: 1,
      FOCUS_BORDER_WIDTH: 2
    },
    
    // Slider
    SLIDER: {
      TRACK_HEIGHT: 4,
      THUMB_SIZE: 16,
      ACTIVE_THUMB_SIZE: 20
    }
  },
  
  // Font sizes
  FONTS: {
    // Text sizes
    TINY: 9,
    SMALL: 11,
    DETAIL: 12,
    BODY: 14,
    LABEL: 13,
    SUBTITLE: 16,
    TITLE: 18,
    HEADING: 24,
    DISPLAY: 32,
    
    // Line heights (as multipliers)
    LINE_HEIGHT: {
      TIGHT: 1.2,
      NORMAL: 1.5,
      RELAXED: 1.8,
      LOOSE: 2
    },
    
    // Font weights
    WEIGHT: {
      LIGHT: 300,
      NORMAL: 400,
      MEDIUM: 500,
      SEMIBOLD: 600,
      BOLD: 700,
      HEAVY: 900
    }
  },
  
  // Animation sizes and durations
  ANIMATION: {
    // Durations in milliseconds
    INSTANT: 0,
    FAST: 200,
    NORMAL: 300,
    SLOW: 500,
    VERY_SLOW: 1000,
    
    // Packet animation
    PACKET_SPEED: 100,        // pixels per second base speed
    PACKET_PULSE_SIZE: 1.2,   // scale factor for pulse
    
    // Transitions
    FADE_DURATION: 300,
    SLIDE_DURATION: 400,
    BOUNCE_DURATION: 600,
    
    // Delays
    STAGGER_DELAY: 50,        // delay between staggered animations
    HOVER_DELAY: 100,         // delay before hover effect
    TOOLTIP_DELAY: 500        // delay before showing tooltip
  },
  
  // Chart/graph sizes
  CHART: {
    // Axis
    AXIS_WIDTH: 2,
    TICK_SIZE: 5,
    TICK_PADDING: 3,
    LABEL_PADDING: 10,
    
    // Data points
    POINT_RADIUS: 4,
    HOVER_POINT_RADIUS: 6,
    LINE_WIDTH: 2,
    AREA_OPACITY: 0.3,
    
    // Bar charts
    BAR_WIDTH: 30,
    BAR_SPACING: 10,
    GROUP_SPACING: 20,
    
    // Legend
    LEGEND: {
      ITEM_HEIGHT: 20,
      ITEM_SPACING: 15,
      SYMBOL_SIZE: 12,
      SYMBOL_SPACING: 8
    }
  },
  
  // Responsive breakpoints
  BREAKPOINTS: {
    MOBILE: 480,
    TABLET: 768,
    DESKTOP: 1024,
    WIDE: 1440,
    ULTRAWIDE: 1920
  },
  
  // Z-index layers
  Z_INDEX: {
    BACKGROUND: 0,
    GRID: 1,
    LINKS: 10,
    NODES: 20,
    PACKETS: 30,
    LABELS: 40,
    OVERLAY: 50,
    TOOLTIP: 100,
    MODAL: 200,
    NOTIFICATION: 300
  },
  
  // Canvas specific
  CANVAS: {
    DEFAULT_WIDTH: 800,
    DEFAULT_HEIGHT: 600,
    MIN_WIDTH: 320,
    MIN_HEIGHT: 240,
    MAX_WIDTH: 2560,
    MAX_HEIGHT: 1440,
    PIXEL_RATIO: window.devicePixelRatio || 1
  },
  
  // SVG specific
  SVG: {
    DEFAULT_WIDTH: 800,
    DEFAULT_HEIGHT: 600,
    MIN_ZOOM: 0.1,
    MAX_ZOOM: 10,
    ZOOM_STEP: 0.1
  }
};

/**
 * Get responsive size based on viewport width
 * @param {Object} sizes - Object with size values for different breakpoints
 * @param {number} viewportWidth - Current viewport width
 * @returns {*} Appropriate size value
 */
export function getResponsiveSize(sizes, viewportWidth) {
  if (viewportWidth < SIZES.BREAKPOINTS.MOBILE) {
    return sizes.mobile || sizes.small || sizes.default;
  } else if (viewportWidth < SIZES.BREAKPOINTS.TABLET) {
    return sizes.tablet || sizes.medium || sizes.default;
  } else if (viewportWidth < SIZES.BREAKPOINTS.DESKTOP) {
    return sizes.desktop || sizes.large || sizes.default;
  } else {
    return sizes.wide || sizes.xlarge || sizes.large || sizes.default;
  }
}

/**
 * Scale a size value
 * @param {number} size - Base size
 * @param {number} scale - Scale factor
 * @returns {number} Scaled size
 */
export function scaleSize(size, scale) {
  return Math.round(size * scale);
}

/**
 * Get margin object for D3 or similar libraries
 * @param {string} size - Size preset ('small', 'medium', 'large')
 * @returns {Object} Margin object with top, right, bottom, left
 */
export function getMargin(size = 'medium') {
  switch (size) {
    case 'small':
      return SIZES.UI.MARGIN.SMALL;
    case 'large':
      return SIZES.UI.MARGIN.LARGE;
    default:
      return SIZES.UI.MARGIN;
  }
}

// Export default for convenience
export default SIZES;