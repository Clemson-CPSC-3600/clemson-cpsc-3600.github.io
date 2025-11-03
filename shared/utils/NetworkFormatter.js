/**
 * Shared utility class for formatting network-related values
 * Provides consistent formatting across all demos
 */

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
    
    const units = [
      { threshold: 1e12, suffix: 'Tbps', divisor: 1e12 },
      { threshold: 1e9, suffix: 'Gbps', divisor: 1e9 },
      { threshold: 1e6, suffix: 'Mbps', divisor: 1e6 },
      { threshold: 1e3, suffix: 'Kbps', divisor: 1e3 }
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
      { threshold: 1e6, suffix: 'Mm', divisor: 1e6 },
      { threshold: 1e3, suffix: 'km', divisor: 1e3 }
    ];
    
    for (const unit of units) {
      if (meters >= unit.threshold) {
        const value = meters / unit.divisor;
        return `${value.toFixed(precision)}${unit.suffix}`;
      }
    }
    
    // For meters, don't show decimal for whole numbers
    return `${Math.round(meters)}m`;
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
    
    // Handle negative values
    if (ms < 0) {
      return `-${this.time(Math.abs(ms), maxTime)}`;
    }
    
    // Adaptive precision based on context scale
    if (maxTime !== null && maxTime > 0) {
      if (maxTime < 1) {
        return `${ms.toFixed(3)}ms`;
      } else if (maxTime < 10) {
        return `${ms.toFixed(2)}ms`;
      } else if (maxTime < 100) {
        return `${ms.toFixed(1)}ms`;
      } else {
        return `${Math.round(ms)}ms`;
      }
    }
    
    // Default precision based on value magnitude
    if (ms < 0.001) {
      // Convert to microseconds
      return `${(ms * 1000).toFixed(1)}μs`;
    } else if (ms < 0.1) {
      return `${ms.toFixed(3)}ms`;
    } else if (ms < 1) {
      return `${ms.toFixed(2)}ms`;
    } else if (ms < 10) {
      return `${ms.toFixed(1)}ms`;
    } else if (ms < 1000) {
      return `${Math.round(ms)}ms`;
    } else {
      // Convert to seconds for large values
      return `${(ms / 1000).toFixed(1)}s`;
    }
  }
  
  /**
   * Format data size (bytes, KB, MB, GB, TB)
   * @param {number} bytes - Size in bytes
   * @param {number} precision - Decimal places (default: 1)
   * @returns {string} Formatted size string
   */
  static dataSize(bytes, precision = 1) {
    if (typeof bytes !== 'number' || isNaN(bytes) || bytes < 0) {
      return '0B';
    }
    
    const units = [
      { threshold: 1e12, suffix: 'TB', divisor: 1e12 },
      { threshold: 1e9, suffix: 'GB', divisor: 1e9 },
      { threshold: 1e6, suffix: 'MB', divisor: 1e6 },
      { threshold: 1e3, suffix: 'KB', divisor: 1e3 }
    ];
    
    for (const unit of units) {
      if (bytes >= unit.threshold) {
        const value = bytes / unit.divisor;
        return `${value.toFixed(precision)}${unit.suffix}`;
      }
    }
    
    return `${bytes}B`;
  }
  
  /**
   * Format packet size (specialized for network packets)
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
   * Format latency quality indicator
   * @param {number} ms - Latency in milliseconds
   * @returns {string} Quality descriptor
   */
  static latencyQuality(ms) {
    if (ms < 1) return 'Excellent';
    if (ms < 20) return 'Good';
    if (ms < 50) return 'Fair';
    if (ms < 100) return 'Poor';
    return 'Very Poor';
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
    } else if (propagationSpeed >= 3e7) {
      medium = ' (cable)';
    } else {
      medium = ' (wireless)';
    }
    
    return formattedDistance + medium;
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
   * Format IP address
   * @param {string} ip - IP address string or number
   * @returns {string} Formatted IP address
   */
  static ipAddress(ip) {
    if (typeof ip === 'string') {
      return ip;
    }
    // Convert number to IP (for IPv4)
    if (typeof ip === 'number') {
      const bytes = [];
      bytes[0] = (ip >>> 24) & 0xFF;
      bytes[1] = (ip >>> 16) & 0xFF;
      bytes[2] = (ip >>> 8) & 0xFF;
      bytes[3] = ip & 0xFF;
      return bytes.join('.');
    }
    return 'Invalid IP';
  }
  
  /**
   * Format port number
   * @param {number} port - Port number
   * @returns {string} Formatted port with service name if known
   */
  static port(port) {
    const wellKnownPorts = {
      20: 'FTP-DATA',
      21: 'FTP',
      22: 'SSH',
      23: 'Telnet',
      25: 'SMTP',
      53: 'DNS',
      80: 'HTTP',
      110: 'POP3',
      143: 'IMAP',
      443: 'HTTPS',
      3306: 'MySQL',
      3389: 'RDP',
      5432: 'PostgreSQL',
      8080: 'HTTP-Alt'
    };
    
    const service = wellKnownPorts[port];
    if (service) {
      return `${port} (${service})`;
    }
    return port.toString();
  }
  
  /**
   * Format network utilization
   * @param {number} used - Used bandwidth in bps
   * @param {number} total - Total bandwidth in bps
   * @returns {string} Formatted utilization
   */
  static utilization(used, total) {
    if (total <= 0) return '0%';
    const percent = (used / total) * 100;
    const formatted = percent < 1 ? percent.toFixed(2) : percent.toFixed(1);
    return `${formatted}% (${this.bandwidth(used)} / ${this.bandwidth(total)})`;
  }
  
  /**
   * Format packet loss rate
   * @param {number} lost - Number of packets lost
   * @param {number} sent - Total number of packets sent
   * @returns {string} Formatted loss rate
   */
  static packetLoss(lost, sent) {
    if (sent <= 0) return '0%';
    const rate = (lost / sent) * 100;
    if (rate === 0) return '0% loss';
    if (rate < 0.01) return '<0.01% loss';
    if (rate < 1) return `${rate.toFixed(2)}% loss`;
    return `${rate.toFixed(1)}% loss`;
  }
  
  /**
   * Format jitter (variation in latency)
   * @param {number} jitterMs - Jitter in milliseconds
   * @returns {string} Formatted jitter
   */
  static jitter(jitterMs) {
    if (jitterMs < 1) return `±${(jitterMs * 1000).toFixed(0)}μs`;
    if (jitterMs < 10) return `±${jitterMs.toFixed(1)}ms`;
    return `±${Math.round(jitterMs)}ms`;
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