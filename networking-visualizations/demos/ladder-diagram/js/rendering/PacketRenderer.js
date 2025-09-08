/**
 * PacketRenderer - Handles rendering of animated packets with phase visualization
 * Shows packets in different states: transmitting, propagating, processing, queuing
 */

import { SVGBuilder } from '../utils/SVGBuilder.js';
import { DelayCalculator } from '../utils/DelayCalculator.js';
import { NetworkFormatter } from '../utils/NetworkFormatter.js';
import { COLORS, SIZES } from '../constants.js';

export class PacketRenderer {
  constructor(container, scaleManager) {
    this.svg = new SVGBuilder(container);
    this.scaleManager = scaleManager;
    this.packetElements = new Map(); // Cache for packet elements
  }

  /**
   * Render packets based on visualization mode
   * @param {Array} packets - Array of packet objects
   * @param {number} currentTime - Current simulation time
   * @param {string} mode - Visualization mode ('single' or 'multi')
   * @param {Object} scenario - Network scenario
   */
  render(packets, currentTime, mode, scenario) {
    this.clear();
    
    if (mode === 'single' && packets.length === 1) {
      this.renderSinglePacketDetailed(packets[0], currentTime, scenario);
    } else {
      this.renderMultiplePackets(packets, currentTime, scenario);
    }
  }

  /**
   * Render a single packet with detailed phase visualization
   * @private
   */
  renderSinglePacketDetailed(packet, currentTime, scenario) {
    const packetTime = currentTime - packet.sendTime;
    const segments = DelayCalculator.calculateSegments(scenario);
    
    // Find current position and phase
    const position = this.calculateDetailedPacketPosition(packet, packetTime, segments, scenario);
    if (!position || position.phase === 'delivered') return;
    
    // Create packet group
    const packetGroup = this.svg.group({ 
      class: `packet-detailed packet-${position.phase}`,
      id: `packet-${packet.id}`
    });
    
    // Render based on packet phase
    switch (position.phase) {
      case 'transmitting':
        this.renderTransmittingPacket(packetGroup, position, packet, scenario);
        break;
      case 'propagating':
        this.renderPropagatingPacket(packetGroup, position, packet, scenario);
        break;
      case 'processing':
        this.renderProcessingPacket(packetGroup, position, packet);
        break;
      case 'queuing':
        this.renderQueuingPacket(packetGroup, position, packet);
        break;
    }
    
    // Add packet info label
    this.renderPacketInfo(packetGroup, position, packet);
  }

  /**
   * Render packet in transmitting phase
   * @private
   */
  renderTransmittingPacket(group, position, packet, scenario) {
    const x = position.x;
    const packetSizeBits = scenario.packetSize * 8;
    
    // Calculate how much of the packet has been transmitted
    const transmittedBits = position.transmittedBits || 0;
    const transmittedHeight = (transmittedBits / packetSizeBits) * position.totalHeight;
    
    // Draw the transmitted portion (already on the wire)
    if (transmittedHeight > 0) {
      this.svg.rect(x - 8, position.startY, 16, transmittedHeight, {
        fill: COLORS.PACKET.TRANSMITTED,
        stroke: COLORS.PACKET.BORDER,
        'stroke-width': 1,
        rx: 2,
        class: 'packet-transmitted'
      });
    }
    
    // Draw the remaining portion (still being transmitted)
    const remainingHeight = position.totalHeight - transmittedHeight;
    if (remainingHeight > 0) {
      this.svg.rect(x - 8, position.startY - remainingHeight, 16, remainingHeight, {
        fill: COLORS.PACKET.TRANSMITTING,
        stroke: COLORS.PACKET.BORDER,
        'stroke-width': 1,
        rx: 2,
        'fill-opacity': 0.7,
        class: 'packet-transmitting'
      });
    }
    
    // Add transmission animation effect
    this.svg.circle(x, position.startY, 3, {
      fill: COLORS.PATH.TRANSMISSION,
      class: 'transmission-indicator'
    });
    
    // Label
    this.svg.text(x - 25, position.startY - remainingHeight/2, 'TX', {
      'font-size': '9px',
      'font-weight': 'bold',
      fill: COLORS.PATH.TRANSMISSION
    });
  }

  /**
   * Render packet in propagating phase
   * @private
   */
  renderPropagatingPacket(group, position, packet, scenario) {
    const packetHeight = 12; // Visual height of packet
    
    // Draw packet as moving rectangle
    this.svg.rect(position.x - 8, position.y - packetHeight/2, 16, packetHeight, {
      fill: COLORS.PACKET.IN_TRANSIT,
      stroke: COLORS.PACKET.BORDER,
      'stroke-width': 1.5,
      rx: 3,
      class: 'packet-propagating'
    });
    
    // Add motion effect with gradient
    const gradientId = `motion-gradient-${packet.id}`;
    this.createMotionGradient(gradientId, COLORS.PACKET.IN_TRANSIT);
    
    // Leading edge indicator
    this.svg.circle(position.x, position.y, 4, {
      fill: COLORS.PATH.PROPAGATION,
      stroke: 'white',
      'stroke-width': 1,
      class: 'packet-head'
    });
    
    // Trailing edge indicator if packet is still partially transmitting
    if (position.partialTransmission) {
      const trailY = position.y - position.transmissionOffset;
      this.svg.circle(position.startX, trailY, 3, {
        fill: COLORS.PATH.TRANSMISSION,
        'fill-opacity': 0.5,
        class: 'packet-tail'
      });
      
      // Connect head and tail
      this.svg.line(position.startX, trailY, position.x, position.y, {
        stroke: COLORS.PACKET.IN_TRANSIT,
        'stroke-width': 2,
        'stroke-opacity': 0.3,
        class: 'packet-body'
      });
    }
  }

  /**
   * Render packet in processing phase
   * @private
   */
  renderProcessingPacket(group, position, packet) {
    const x = position.x;
    const y = position.y;
    
    // Processing box with animation
    const boxSize = 20;
    this.svg.rect(x - boxSize/2, y - boxSize/2, boxSize, boxSize, {
      fill: COLORS.PATH.PROCESSING,
      stroke: COLORS.PATH.PROCESSING,
      'stroke-width': 2,
      'fill-opacity': 0.5,
      rx: 3,
      class: 'packet-processing'
    });
    
    // Rotating indicator for processing
    const angle = (position.progress * 360) % 360;
    this.svg.circle(x, y, 4, {
      fill: 'white',
      stroke: COLORS.PATH.PROCESSING,
      'stroke-width': 2,
      transform: `rotate(${angle} ${x} ${y})`,
      class: 'processing-indicator'
    });
    
    // Progress bar
    const progressWidth = boxSize * position.progress;
    this.svg.rect(x - boxSize/2, y + boxSize/2 + 2, progressWidth, 3, {
      fill: COLORS.PATH.PROCESSING,
      class: 'processing-progress'
    });
    
    // Label
    this.svg.text(x, y - boxSize/2 - 5, 'PROC', {
      'text-anchor': 'middle',
      'font-size': '9px',
      'font-weight': 'bold',
      fill: COLORS.PATH.PROCESSING
    });
  }

  /**
   * Render packet in queuing phase
   * @private
   */
  renderQueuingPacket(group, position, packet) {
    const x = position.x;
    const y = position.y;
    
    // Queue representation
    const queueWidth = 24;
    const queueHeight = 8;
    
    // Draw queue slots
    for (let i = 0; i < 3; i++) {
      const slotY = y - 12 + (i * 10);
      const isCurrent = i === position.queuePosition;
      
      this.svg.rect(x - queueWidth/2, slotY - queueHeight/2, queueWidth, queueHeight, {
        fill: isCurrent ? COLORS.PATH.QUEUING : 'white',
        stroke: COLORS.PATH.QUEUING,
        'stroke-width': 1,
        'fill-opacity': isCurrent ? 0.7 : 0,
        rx: 2,
        class: `queue-slot ${isCurrent ? 'current' : ''}`
      });
    }
    
    // Packet in queue
    this.svg.circle(x, y, 5, {
      fill: COLORS.PACKET.QUEUED,
      stroke: COLORS.PATH.QUEUING,
      'stroke-width': 2,
      class: 'packet-queued'
    });
    
    // Label
    this.svg.text(x, y - 20, 'QUEUE', {
      'text-anchor': 'middle',
      'font-size': '9px',
      'font-weight': 'bold',
      fill: COLORS.PATH.QUEUING
    });
  }

  /**
   * Render packet information label
   * @private
   */
  renderPacketInfo(group, position, packet) {
    const infoY = position.y - 25;
    const infoText = `P${packet.id} | ${position.phase}`;
    
    // Background for readability
    const textWidth = infoText.length * 6;
    this.svg.rect(position.x - textWidth/2 - 3, infoY - 10, textWidth + 6, 14, {
      fill: 'white',
      'fill-opacity': 0.9,
      rx: 2,
      class: 'packet-info-bg'
    });
    
    // Info text
    this.svg.text(position.x, infoY, infoText, {
      'text-anchor': 'middle',
      'font-size': '10px',
      fill: COLORS.UI.SUBTITLE,
      class: 'packet-info'
    });
  }

  /**
   * Render multiple packets efficiently
   * @private
   */
  renderMultiplePackets(packets, currentTime, scenario) {
    const segments = DelayCalculator.calculateSegments(scenario);
    
    packets.forEach(packet => {
      if (packet.phase === 'delivered') return;
      
      const packetTime = currentTime - packet.sendTime;
      const position = this.calculatePacketPosition(packet, packetTime, segments, scenario);
      
      if (!position || position.phase === 'delivered') return;
      
      // Simple circle representation for multiple packets
      const color = this.getPacketColor(position.phase);
      
      this.svg.circle(position.x, position.y, 4, {
        fill: color,
        stroke: 'white',
        'stroke-width': 1,
        class: `packet multi-packet packet-${position.phase}`
      });
      
      // Small ID label
      this.svg.text(position.x + 8, position.y + 3, packet.id.toString(), {
        'font-size': '8px',
        fill: COLORS.UI.SUBTITLE,
        class: 'packet-id'
      });
    });
  }

  /**
   * Calculate detailed packet position for single packet mode
   * @private
   */
  calculateDetailedPacketPosition(packet, elapsedTime, segments, scenario) {
    let currentTime = 0;
    
    // Process each segment to find where the packet is
    for (const segment of segments) {
      if (segment.type === 'transmission-propagation') {
        const hop = scenario.hops[segment.hopIndex];
        const transmissionTime = segment.transmissionTime;
        const propagationTime = segment.propagationTime;
        
        // Check if packet is transmitting
        if (elapsedTime >= currentTime && elapsedTime < currentTime + transmissionTime) {
          const progress = (elapsedTime - currentTime) / transmissionTime;
          const startX = this.scaleManager.nodeToX(segment.startNode);
          
          return {
            phase: 'transmitting',
            x: startX,
            startY: this.scaleManager.timeToY(currentTime),
            y: this.scaleManager.timeToY(elapsedTime),
            totalHeight: this.scaleManager.timeToY(currentTime + transmissionTime) - this.scaleManager.timeToY(currentTime),
            progress: progress,
            transmittedBits: progress * scenario.packetSize * 8,
            hop: segment.hopIndex
          };
        }
        
        // Check if packet is propagating
        const propStart = currentTime;
        const propEnd = currentTime + transmissionTime + propagationTime;
        
        if (elapsedTime >= propStart && elapsedTime < propEnd) {
          // Calculate position along the propagation path
          const propProgress = Math.min((elapsedTime - propStart) / propagationTime, 1);
          const startX = this.scaleManager.nodeToX(segment.startNode);
          const endX = this.scaleManager.nodeToX(segment.endNode);
          
          // Check if packet is still partially transmitting
          const partialTransmission = elapsedTime < currentTime + transmissionTime;
          
          return {
            phase: 'propagating',
            x: startX + (endX - startX) * propProgress,
            y: this.scaleManager.timeToY(elapsedTime),
            startX: startX,
            endX: endX,
            progress: propProgress,
            partialTransmission: partialTransmission,
            transmissionOffset: partialTransmission ? 
              this.scaleManager.timeToY(elapsedTime) - this.scaleManager.timeToY(currentTime) : 0,
            hop: segment.hopIndex
          };
        }
        
        currentTime = propEnd;
        
      } else if (segment.type === 'processing') {
        if (elapsedTime >= segment.startTime && elapsedTime < segment.endTime) {
          const progress = (elapsedTime - segment.startTime) / segment.duration;
          const x = this.scaleManager.nodeToX(segment.startNode);
          
          return {
            phase: 'processing',
            x: x,
            y: this.scaleManager.timeToY(elapsedTime),
            progress: progress
          };
        }
        
      } else if (segment.type === 'queuing') {
        if (elapsedTime >= segment.startTime && elapsedTime < segment.endTime) {
          const progress = (elapsedTime - segment.startTime) / segment.duration;
          const x = this.scaleManager.nodeToX(segment.startNode);
          
          return {
            phase: 'queuing',
            x: x,
            y: this.scaleManager.timeToY(elapsedTime),
            progress: progress,
            queuePosition: Math.floor(progress * 3) // Simulate moving through queue
          };
        }
      }
    }
    
    // Packet delivered
    return {
      phase: 'delivered'
    };
  }

  /**
   * Calculate simple packet position for multi-packet mode
   * @private
   */
  calculatePacketPosition(packet, elapsedTime, segments, scenario) {
    // Simplified calculation for multiple packets
    // Similar to calculateDetailedPacketPosition but without detailed phase info
    return this.calculateDetailedPacketPosition(packet, elapsedTime, segments, scenario);
  }

  /**
   * Get color based on packet phase
   * @private
   */
  getPacketColor(phase) {
    const colors = {
      'transmitting': COLORS.PATH.TRANSMISSION,
      'propagating': COLORS.PACKET.IN_TRANSIT,
      'processing': COLORS.PATH.PROCESSING,
      'queuing': COLORS.PATH.QUEUING,
      'delivered': COLORS.PACKET.DELIVERED
    };
    return colors[phase] || COLORS.PACKET.DEFAULT;
  }

  /**
   * Create motion gradient for packet animation
   * @private
   */
  createMotionGradient(id, color) {
    // This would create an SVG gradient definition
    // For now, we'll skip the implementation as it requires defs management
  }

  /**
   * Clear all packet elements
   */
  clear() {
    this.svg.clear();
    this.packetElements.clear();
  }
}