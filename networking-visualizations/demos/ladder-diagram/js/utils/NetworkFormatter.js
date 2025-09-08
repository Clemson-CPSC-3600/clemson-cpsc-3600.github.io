/**
 * Utility class for formatting network-related values
 * Provides consistent formatting across the application
 */

import { FORMATS, THRESHOLDS, DEFAULTS } from '../constants.js';

export class NetworkFormatter {
  /**
   * Format bandwidth/bitrate values
   * @param {number} bps - Bits per second
   * @param {number} precision - Decimal places (default: 1)
   * @returns {string} Formatted bandwidth string
   */
  static bandwidth(bps, precision = 1) {
    if (typeof bps !== 'number' || isNaN(bps)) {
      return '0bps';
    }
    
    // Check each unit threshold in order
    const units = [
      FORMATS.BANDWIDTH.GBPS,
      FORMATS.BANDWIDTH.MBPS,
      FORMATS.BANDWIDTH.KBPS,
      FORMATS.BANDWIDTH.BPS
    ];
    
    for (const unit of units) {
      if (bps >= unit.threshold) {
        const value = bps / unit.divisor;
        // For whole numbers, don't show decimal
        if (value === Math.floor(value) && unit.suffix !== 'bps') {
          return `${value}${unit.suffix}`;
        }
        return `${value.toFixed(precision)}${unit.suffix}`;
      }
    }
    
    return `${bps}bps`;
  }
  
  /**
   * Format distance values
   * @param {number} meters - Distance in meters
   * @param {number} precision - Decimal places (default: 1)
   * @returns {string} Formatted distance string
   */
  static distance(meters, precision = 1) {
    if (typeof meters !== 'number' || isNaN(meters)) {
      return '0m';
    }
    
    const units = [
      FORMATS.DISTANCE.MM,
      FORMATS.DISTANCE.KM,
      FORMATS.DISTANCE.M
    ];
    
    for (const unit of units) {
      if (meters >= unit.threshold) {
        const value = meters / unit.divisor;
        // For meters, don't show decimal for whole numbers
        if (unit.suffix === 'm') {
          return `${Math.round(value)}${unit.suffix}`;
        }
        return `${value.toFixed(precision)}${unit.suffix}`;
      }
    }
    
    return `${meters.toFixed(0)}m`;
  }
  
  /**
   * Format time values with adaptive precision
   * @param {number} ms - Time in milliseconds
   * @param {number} maxTime - Maximum time in the context (for precision)
   * @returns {string} Formatted time string
   */
  static time(ms, maxTime = null) {
    if (typeof ms !== 'number' || isNaN(ms)) {
      return '0ms';
    }
    
    // Adaptive precision based on context scale
    if (maxTime !== null && maxTime > 0) {
      if (maxTime < THRESHOLDS.TIME_PRECISION.HIGH) {
        return `${ms.toFixed(3)}ms`;
      } else if (maxTime < THRESHOLDS.TIME_PRECISION.MEDIUM) {
        return `${ms.toFixed(2)}ms`;
      } else if (maxTime < THRESHOLDS.TIME_PRECISION.LOW) {
        return `${ms.toFixed(1)}ms`;
      } else {
        return `${Math.round(ms)}ms`;
      }
    }
    
    // Default precision based on value magnitude
    if (ms < THRESHOLDS.TIME_PRECISION.MICRO) {
      // Convert to microseconds
      return `${(ms * 1000).toFixed(1)}μs`;
    } else if (ms < 0.1) {
      return `${ms.toFixed(3)}ms`;
    } else if (ms < 1) {
      return `${ms.toFixed(2)}ms`;
    } else if (ms < 10) {
      return `${ms.toFixed(1)}ms`;
    } else {
      return `${Math.round(ms)}ms`;
    }
  }
  
  /**
   * Format delay value with appropriate label
   * @param {number} delay - Delay in milliseconds
   * @param {string} type - Type of delay (transmission, propagation, etc.)
   * @returns {string} Formatted delay with label
   */
  static delay(delay, type = '') {
    const formattedTime = this.time(delay);
    
    if (type) {
      const labels = {
        transmission: 'T',
        propagation: 'P',
        processing: 'Proc',
        queuing: 'Q'
      };
      const label = labels[type.toLowerCase()] || type;
      return `${label}: ${formattedTime}`;
    }
    
    return formattedTime;
  }
  
  /**
   * Format distance with medium type annotation
   * @param {number} meters - Distance in meters
   * @param {number} propagationSpeed - Speed of propagation in m/s
   * @returns {string} Formatted distance with medium type
   */
  static distanceWithMedium(meters, propagationSpeed) {
    const formattedDistance = this.distance(meters);
    
    // Determine medium based on propagation speed
    let medium = '';
    if (propagationSpeed >= 2.9e8) {
      medium = ' (vacuum)';
    } else if (propagationSpeed >= 2e8) {
      medium = ' (fiber)';
    } else if (propagationSpeed >= 1.5e8) {
      medium = ' (copper)';
    } else {
      medium = ' (cable)';
    }
    
    return formattedDistance + medium;
  }
  
  /**
   * Format packet size
   * @param {number} bytes - Size in bytes
   * @returns {string} Formatted size string
   */
  static packetSize(bytes) {
    if (bytes < 1024) {
      return `${bytes} bytes`;
    } else if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    } else {
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }
  }
  
  /**
   * Format percentage
   * @param {number} value - Value between 0 and 1
   * @param {number} precision - Decimal places (default: 1)
   * @returns {string} Formatted percentage
   */
  static percentage(value, precision = 1) {
    const percent = value * 100;
    if (percent === Math.floor(percent)) {
      return `${percent}%`;
    }
    return `${percent.toFixed(precision)}%`;
  }
  
  /**
   * Format packet location during transit
   * @param {string} source - Source node name
   * @param {string} destination - Destination node name
   * @param {number} progress - Progress between 0 and 1
   * @returns {string} Formatted location string
   */
  static packetLocation(source, destination, progress) {
    if (progress <= 0) {
      return source;
    } else if (progress >= 1) {
      return destination;
    } else {
      const percent = Math.round(progress * 100);
      return `${source} → ${destination} (${percent}%)`;
    }
  }
  
  /**
   * Format throughput (data rate over time)
   * @param {number} bytes - Total bytes transferred
   * @param {number} seconds - Time period in seconds
   * @returns {string} Formatted throughput
   */
  static throughput(bytes, seconds) {
    if (seconds <= 0) return '0bps';
    const bitsPerSecond = (bytes * 8) / seconds;
    return this.bandwidth(bitsPerSecond);
  }
  
  /**
   * Format latency comparison
   * @param {number} value - Latency value
   * @param {number} baseline - Baseline for comparison
   * @returns {string} Formatted comparison (e.g., "2.5x slower")
   */
  static latencyComparison(value, baseline) {
    if (baseline <= 0) return '';
    
    const ratio = value / baseline;
    if (ratio < 0.5) {
      return `${(1 / ratio).toFixed(1)}x faster`;
    } else if (ratio < 0.95) {
      return `${((1 - ratio) * 100).toFixed(0)}% faster`;
    } else if (ratio <= 1.05) {
      return 'similar';
    } else if (ratio < 2) {
      return `${((ratio - 1) * 100).toFixed(0)}% slower`;
    } else {
      return `${ratio.toFixed(1)}x slower`;
    }
  }
  
  /**
   * Format a delay breakdown showing all components
   * @param {Object} delays - Object with delay components
   * @returns {string} Formatted breakdown
   */
  static delayBreakdown(delays) {
    const components = [];
    
    if (delays.transmission > 0) {
      components.push(`Trans: ${this.time(delays.transmission)}`);
    }
    if (delays.propagation > 0) {
      components.push(`Prop: ${this.time(delays.propagation)}`);
    }
    if (delays.processing > 0) {
      components.push(`Proc: ${this.time(delays.processing)}`);
    }
    if (delays.queuing > 0) {
      components.push(`Queue: ${this.time(delays.queuing)}`);
    }
    
    if (components.length === 0) {
      return 'No delay';
    }
    
    const total = (delays.transmission || 0) + 
                 (delays.propagation || 0) + 
                 (delays.processing || 0) + 
                 (delays.queuing || 0);
    
    return components.join(', ') + ` (Total: ${this.time(total)})`;
  }
  
  /**
   * Get appropriate time interval for grid/axis labels
   * @param {number} maxTime - Maximum time value
   * @param {number} targetCount - Target number of labels
   * @returns {number} Appropriate interval
   */
  static getTimeInterval(maxTime, targetCount = 8) {
    let interval = maxTime / targetCount;
    
    // Round to a nice number
    const magnitude = Math.pow(10, Math.floor(Math.log10(interval)));
    const normalized = interval / magnitude;
    
    if (normalized <= 1) {
      interval = magnitude;
    } else if (normalized <= 2) {
      interval = 2 * magnitude;
    } else if (normalized <= 5) {
      interval = 5 * magnitude;
    } else {
      interval = 10 * magnitude;
    }
    
    // Special handling for very small scales
    if (maxTime < 0.5) {
      interval = 0.05;
    } else if (maxTime < 1) {
      interval = 0.1;
    } else if (maxTime < 2) {
      interval = 0.2;
    } else if (maxTime < 5) {
      interval = 0.5;
    }
    
    return interval;
  }
}