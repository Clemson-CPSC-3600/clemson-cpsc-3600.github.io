/**
 * Main ladder diagram visualization class
 * Renders the time-space diagram showing packet flow through a network
 */
export class LadderDiagram {
  constructor(svgElement) {
    this.svg = svgElement;
    this.width = 800;
    this.height = 600;
    
    // Visualization mode: 'single' or 'multi'
    this.visualizationMode = 'single';
    
    // Margins for axis labels
    this.margin = {
      top: 80,  // Increased to accommodate link information
      right: 50,
      bottom: 40,
      left: 80
    };
    
    // Actual drawing area
    this.plotWidth = this.width - this.margin.left - this.margin.right;
    this.plotHeight = this.height - this.margin.top - this.margin.bottom;
    
    // Scales
    this.timeScale = null;  // Maps time (ms) to y-coordinate
    this.nodeScale = null;  // Maps node names to x-coordinate
    
    // Data
    this.scenario = null;
    this.nodes = [];
    this.segments = [];  // Packet path segments with delay info
    
    // Animation state
    this.currentTime = 0;
    this.maxTime = 100;
    
    // Colors for delay types
    this.colors = {
      transmission: '#e74c3c',
      propagation: '#3498db',
      processing: '#f39c12',
      queuing: '#9b59b6',
      packet: '#2ecc71',
      grid: '#ecf0f1',
      axis: '#34495e'
    };
    
    this.setupSVG();
  }
  
  setupSVG() {
    // Clear any existing content
    this.svg.innerHTML = '';
    
    // Create main group for the plot area
    this.plotGroup = this.createSVGElement('g', {
      transform: `translate(${this.margin.left}, ${this.margin.top})`
    });
    this.svg.appendChild(this.plotGroup);
    
    // Create groups for different layers
    this.gridGroup = this.createSVGElement('g', { class: 'grid-group' });
    this.pathGroup = this.createSVGElement('g', { class: 'path-group' });
    this.packetGroup = this.createSVGElement('g', { class: 'packet-group' });
    this.axisGroup = this.createSVGElement('g', { class: 'axis-group' });
    this.labelGroup = this.createSVGElement('g', { class: 'label-group' });
    
    this.plotGroup.appendChild(this.gridGroup);
    this.plotGroup.appendChild(this.pathGroup);
    this.plotGroup.appendChild(this.packetGroup);
    this.plotGroup.appendChild(this.axisGroup);
    this.plotGroup.appendChild(this.labelGroup);
  }
  
  /**
   * Load a network scenario and setup the diagram
   */
  loadScenario(scenario) {
    this.scenario = scenario;
    this.nodes = scenario.nodes;
    
    // Calculate packet path segments first to determine actual time needed
    this.segments = this.calculateSegments(scenario);
    
    // Calculate actual max time - this should be the time for ONE packet to traverse the network
    // regardless of whether we're in single or multi-packet mode
    let calculatedMaxTime = 0;
    const packetSizeBits = scenario.packetSize * 8;
    
    // Calculate total time for a single packet to traverse all hops
    for (const hop of scenario.hops) {
      // Add all delay components
      if (hop.queuingDelay) calculatedMaxTime += hop.queuingDelay;
      if (hop.bandwidth) calculatedMaxTime += (packetSizeBits / hop.bandwidth) * 1000;
      if (hop.distance && hop.propagationSpeed) {
        calculatedMaxTime += (hop.distance / hop.propagationSpeed) * 1000;
      }
      if (hop.processingDelay) calculatedMaxTime += hop.processingDelay;
    }
    
    // Use calculated time if available, otherwise fall back to segments
    if (calculatedMaxTime > 0) {
      this.maxTime = calculatedMaxTime * 1.1; // Add 10% padding at bottom
      console.log(`Setting maxTime to ${this.maxTime}ms based on calculated single packet time of ${calculatedMaxTime}ms`);
    } else if (this.segments.length > 0) {
      let maxTime = 0;
      this.segments.forEach(segment => {
        if (segment.type === 'transmission-propagation') {
          maxTime = Math.max(maxTime, segment.lastBitEnd);
        } else if (segment.endTime) {
          maxTime = Math.max(maxTime, segment.endTime);
        }
      });
      this.maxTime = maxTime * 1.1; // Add 10% padding at bottom
    } else {
      this.maxTime = scenario.totalTime || 100;
    }
    
    // Setup scales
    this.timeScale = this.createLinearScale(0, this.maxTime, 0, this.plotHeight);
    this.nodeScale = this.createNodeScale(this.nodes.map(n => n.name), 0, this.plotWidth);
    
    // Draw the static elements
    this.drawGrid();
    this.drawAxes();
    this.drawNodeLines();
    this.drawPath();
  }
  
  /**
   * Update scales and redraw grid for multi-packet mode
   */
  updateTimeScale(maxTime) {
    this.maxTime = maxTime;
    this.timeScale = this.createLinearScale(0, this.maxTime, 0, this.plotHeight);
    
    // Clear and redraw grid and axes
    this.gridGroup.innerHTML = '';
    this.axisGroup.innerHTML = '';
    this.drawGrid();
    this.drawAxes();
  }
  
  /**
   * Calculate all segments of the packet path with timing
   * Now tracks both first bit and last bit of the packet
   */
  calculateSegments(scenario) {
    const segments = [];
    let firstBitTime = 0;  // Time when first bit leaves/arrives
    let lastBitTime = 0;   // Time when last bit leaves/arrives
    const packetSizeBits = scenario.packetSize * 8;
    
    for (let i = 0; i < scenario.hops.length; i++) {
      const hop = scenario.hops[i];
      const sourceNode = scenario.nodes[i];
      const destNode = scenario.nodes[i + 1];
      
      // Calculate transmission delay (time to push all bits onto the wire)
      const transmissionTime = hop.bandwidth ? (packetSizeBits / hop.bandwidth) * 1000 : 0;
      
      // Calculate propagation delay (time for signal to travel)
      const propagationTime = (hop.distance && hop.propagationSpeed) ? 
        (hop.distance / hop.propagationSpeed) * 1000 : 0;
      
      // Transmission and Propagation happen in parallel for the packet bits
      // First bit starts propagating immediately when it's transmitted
      // Last bit starts propagating after transmission delay
      
      segments.push({
        type: 'transmission-propagation',
        firstBitStart: firstBitTime,
        firstBitEnd: firstBitTime + propagationTime,
        lastBitStart: firstBitTime + transmissionTime,
        lastBitEnd: firstBitTime + transmissionTime + propagationTime,
        startNode: sourceNode.name,
        endNode: destNode.name,
        transmissionTime: transmissionTime,
        propagationTime: propagationTime,
        hopIndex: i
      });
      
      // Update times for next hop (both bits arrive at same relative spacing)
      firstBitTime = firstBitTime + propagationTime;
      lastBitTime = firstBitTime + transmissionTime;
      
      // Processing delay at destination (affects both bits equally)
      if (hop.processingDelay) {
        segments.push({
          type: 'processing',
          startTime: lastBitTime,  // Processing starts after last bit arrives
          endTime: lastBitTime + hop.processingDelay,
          startNode: destNode.name,
          endNode: destNode.name,
          duration: hop.processingDelay,
          hopIndex: i
        });
        firstBitTime = lastBitTime + hop.processingDelay;
        lastBitTime = firstBitTime;  // Bits are "reassembled" after processing
      }
      
      // Queuing delay at destination (affects whole packet)
      if (hop.queuingDelay) {
        segments.push({
          type: 'queuing',
          startTime: firstBitTime,
          endTime: firstBitTime + hop.queuingDelay,
          startNode: destNode.name,
          endNode: destNode.name,
          duration: hop.queuingDelay,
          hopIndex: i
        });
        firstBitTime += hop.queuingDelay;
        lastBitTime = firstBitTime;  // Packet waits as a unit
      }
    }
    
    return segments;
  }
  
  /**
   * Draw background grid
   */
  drawGrid() {
    // Clear existing grid
    this.gridGroup.innerHTML = '';
    
    // Vertical grid lines (at each node)
    this.nodes.forEach(node => {
      const x = this.nodeScale(node.name);
      const line = this.createSVGElement('line', {
        x1: x,
        y1: 0,
        x2: x,
        y2: this.plotHeight,
        stroke: this.colors.grid,
        'stroke-width': 1,
        'stroke-dasharray': '2,2'
      });
      this.gridGroup.appendChild(line);
    });
    
    // Calculate grid intervals to match axis labels
    const targetGridCount = 20; // Aim for about 20 minor grid lines
    let minorInterval = this.maxTime / targetGridCount;
    
    // Round to a nice number
    const magnitude = Math.pow(10, Math.floor(Math.log10(minorInterval)));
    const normalized = minorInterval / magnitude;
    
    if (normalized <= 1) {
      minorInterval = magnitude;
    } else if (normalized <= 2) {
      minorInterval = 2 * magnitude;
    } else if (normalized <= 5) {
      minorInterval = 5 * magnitude;
    } else {
      minorInterval = 10 * magnitude;
    }
    
    // Special handling for very small scales
    if (this.maxTime < 0.5) {
      minorInterval = 0.05;
    } else if (this.maxTime < 1) {
      minorInterval = 0.1;
    } else if (this.maxTime < 2) {
      minorInterval = 0.2;
    } else if (this.maxTime < 5) {
      minorInterval = 0.5;
    }
    
    // Major interval is typically 5x the minor interval
    const majorInterval = minorInterval * 5;
    
    // Horizontal grid lines
    for (let time = 0; time <= this.maxTime; time += minorInterval) {
      const isMajor = Math.abs(time % majorInterval) < (minorInterval * 0.1);
      const y = this.timeScale(time);
      const line = this.createSVGElement('line', {
        x1: 0,
        y1: y,
        x2: this.plotWidth,
        y2: y,
        stroke: this.colors.grid,
        'stroke-width': isMajor ? 1 : 0.5,
        'stroke-dasharray': isMajor ? 'none' : '2,2'
      });
      this.gridGroup.appendChild(line);
    }
  }
  
  /**
   * Draw axes with labels
   */
  drawAxes() {
    // Clear existing axes
    this.axisGroup.innerHTML = '';
    
    // Time axis (left side)
    const timeAxis = this.createSVGElement('line', {
      x1: 0,
      y1: 0,
      x2: 0,
      y2: this.plotHeight,
      stroke: this.colors.axis,
      'stroke-width': 2
    });
    this.axisGroup.appendChild(timeAxis);
    
    // Calculate appropriate label interval to ensure we always have 5-10 labels
    const targetLabelCount = 8;
    let labelInterval = this.maxTime / targetLabelCount;
    
    // Round to a nice number
    const magnitude = Math.pow(10, Math.floor(Math.log10(labelInterval)));
    const normalized = labelInterval / magnitude;
    
    if (normalized <= 1) {
      labelInterval = magnitude;
    } else if (normalized <= 2) {
      labelInterval = 2 * magnitude;
    } else if (normalized <= 5) {
      labelInterval = 5 * magnitude;
    } else {
      labelInterval = 10 * magnitude;
    }
    
    // Ensure we have at least some labels for very small time scales
    if (this.maxTime < 1) {
      labelInterval = 0.1;
    } else if (this.maxTime < 2) {
      labelInterval = 0.2;
    } else if (this.maxTime < 5) {
      labelInterval = 0.5;
    }
    
    // Time labels - start from 0 and go up by labelInterval
    for (let time = 0; time <= this.maxTime; time += labelInterval) {
      const y = this.timeScale(time);
      const label = this.createSVGElement('text', {
        x: -10,
        y: y + 4,
        'text-anchor': 'end',
        'font-size': '12px',
        fill: this.colors.axis
      });
      
      // Format label based on scale and value
      if (labelInterval < 1) {
        label.textContent = `${time.toFixed(2)}ms`;
      } else if (labelInterval < 10) {
        label.textContent = `${time.toFixed(1)}ms`;
      } else {
        label.textContent = `${Math.round(time)}ms`;
      }
      
      this.axisGroup.appendChild(label);
    }
    
    // Time axis label
    const timeLabel = this.createSVGElement('text', {
      x: -50,
      y: this.plotHeight / 2,
      'text-anchor': 'middle',
      'font-size': '14px',
      'font-weight': 'bold',
      fill: this.colors.axis,
      transform: `rotate(-90, -50, ${this.plotHeight / 2})`
    });
    timeLabel.textContent = 'Time';
    this.axisGroup.appendChild(timeLabel);
    
    // Node labels and characteristics (top)
    this.nodes.forEach((node, i) => {
      const x = this.nodeScale(node.name);
      
      // Node name
      const label = this.createSVGElement('text', {
        x: x,
        y: -10,
        'text-anchor': 'middle',
        'font-size': '13px',
        'font-weight': 'bold',
        fill: this.colors.axis
      });
      label.textContent = node.name;
      this.axisGroup.appendChild(label);
      
      // Node type and characteristics
      if (node.type) {
        const typeLabel = this.createSVGElement('text', {
          x: x,
          y: -25,
          'text-anchor': 'middle',
          'font-size': '9px',
          fill: '#7f8c8d'
        });
        typeLabel.textContent = node.type;
        this.axisGroup.appendChild(typeLabel);
      }
      
      // Add processing capability for routers/switches
      if (i > 0 && i <= this.scenario.hops.length) {
        const hop = this.scenario.hops[i - 1];
        if (hop.processingDelay > 0) {
          const procLabel = this.createSVGElement('text', {
            x: x,
            y: -38,
            'text-anchor': 'middle',
            'font-size': '8px',
            fill: this.colors.processing,
            'font-style': 'italic'
          });
          procLabel.textContent = `Proc: ${hop.processingDelay}ms`;
          this.axisGroup.appendChild(procLabel);
        }
      }
    });
    
    // Link information (between nodes)
    for (let i = 0; i < this.nodes.length - 1; i++) {
      if (i < this.scenario.hops.length) {
        const hop = this.scenario.hops[i];
        const startX = this.nodeScale(this.nodes[i].name);
        const endX = this.nodeScale(this.nodes[i + 1].name);
        const midX = (startX + endX) / 2;
        
        // Link distance and medium
        const distanceLabel = this.createSVGElement('text', {
          x: midX,
          y: -45,
          'text-anchor': 'middle',
          'font-size': '10px',
          fill: '#34495e',
          'font-weight': '600'
        });
        distanceLabel.textContent = this.formatDistanceWithMedium(hop.distance, hop.propagationSpeed);
        this.axisGroup.appendChild(distanceLabel);
        
        // Link bandwidth
        const bandwidthLabel = this.createSVGElement('text', {
          x: midX,
          y: -32,
          'text-anchor': 'middle',
          'font-size': '9px',
          fill: '#7f8c8d'
        });
        bandwidthLabel.textContent = this.formatBandwidth(hop.bandwidth);
        this.axisGroup.appendChild(bandwidthLabel);
        
        // Draw a subtle line to connect the nodes at the top
        const linkLine = this.createSVGElement('line', {
          x1: startX + 20,
          y1: -15,
          x2: endX - 20,
          y2: -15,
          stroke: '#bdc3c7',
          'stroke-width': 1,
          'stroke-dasharray': '2,2',
          opacity: 0.5
        });
        this.axisGroup.appendChild(linkLine);
      }
    }
  }
  
  /**
   * Draw vertical lines for each node
   */
  drawNodeLines() {
    // These are drawn in pathGroup to be behind the packet path
    this.nodes.forEach(node => {
      const x = this.nodeScale(node.name);
      const line = this.createSVGElement('line', {
        x1: x,
        y1: 0,
        x2: x,
        y2: this.plotHeight,
        stroke: this.colors.axis,
        'stroke-width': 2,
        opacity: 0.3
      });
      this.pathGroup.appendChild(line);
    });
  }
  
  /**
   * Draw the complete packet path with first and last bit
   */
  drawPath() {
    // Clear existing path
    const existingPaths = this.pathGroup.querySelectorAll('.segment');
    existingPaths.forEach(p => p.remove());
    
    this.segments.forEach(segment => {
      if (segment.type === 'transmission-propagation') {
        const startX = this.nodeScale(segment.startNode);
        const endX = this.nodeScale(segment.endNode);
        
        // Draw first bit line
        const firstBitLine = this.createSVGElement('line', {
          class: 'segment segment-first-bit',
          x1: startX,
          y1: this.timeScale(segment.firstBitStart),
          x2: endX,
          y2: this.timeScale(segment.firstBitEnd),
          stroke: this.colors.propagation,
          'stroke-width': 2,
          opacity: 0.9
        });
        this.pathGroup.appendChild(firstBitLine);
        
        // Draw last bit line
        const lastBitLine = this.createSVGElement('line', {
          class: 'segment segment-last-bit',
          x1: startX,
          y1: this.timeScale(segment.lastBitStart),
          x2: endX,
          y2: this.timeScale(segment.lastBitEnd),
          stroke: this.colors.propagation,
          'stroke-width': 2,
          'stroke-dasharray': '5,3',
          opacity: 0.7
        });
        this.pathGroup.appendChild(lastBitLine);
        
        // Fill area between first and last bit to show packet "body"
        const packetArea = this.createSVGElement('polygon', {
          class: 'segment segment-packet-area',
          points: `${startX},${this.timeScale(segment.firstBitStart)} ` +
                  `${endX},${this.timeScale(segment.firstBitEnd)} ` +
                  `${endX},${this.timeScale(segment.lastBitEnd)} ` +
                  `${startX},${this.timeScale(segment.lastBitStart)}`,
          fill: this.colors.propagation,
          opacity: 0.15
        });
        this.pathGroup.appendChild(packetArea);
        
        // Add transmission delay label if it exists
        if (segment.transmissionTime > 0.0001) {
          const transLabel = this.createSVGElement('text', {
            x: startX - 40,
            y: (this.timeScale(segment.firstBitStart) + this.timeScale(segment.lastBitStart)) / 2,
            'font-size': '9px',
            fill: this.colors.transmission,
            'text-anchor': 'end'
          });
          
          // Format based on magnitude
          let labelText;
          if (segment.transmissionTime < 0.001) {
            labelText = `T: ${(segment.transmissionTime * 1000).toFixed(1)}μs`;
          } else if (segment.transmissionTime < 0.1) {
            labelText = `T: ${segment.transmissionTime.toFixed(3)}ms`;
          } else {
            labelText = `T: ${segment.transmissionTime.toFixed(2)}ms`;
          }
          transLabel.textContent = labelText;
          this.pathGroup.appendChild(transLabel);
        }
        
        // Add propagation delay label if significant
        if (segment.propagationTime > 0.1) {
          const propLabel = this.createSVGElement('text', {
            x: (startX + endX) / 2,
            y: this.timeScale(segment.firstBitStart + segment.propagationTime / 2) - 10,
            'font-size': '9px',
            fill: this.colors.propagation,
            'text-anchor': 'middle'
          });
          propLabel.textContent = `P: ${segment.propagationTime.toFixed(2)}ms`;
          this.pathGroup.appendChild(propLabel);
        }
        
        // Add arrows on first bit line to show direction
        const midX = (startX + endX) / 2;
        const midY = (this.timeScale(segment.firstBitStart) + this.timeScale(segment.firstBitEnd)) / 2;
        const angle = Math.atan2(
          this.timeScale(segment.firstBitEnd) - this.timeScale(segment.firstBitStart),
          endX - startX
        ) * (180 / Math.PI);
        
        const arrow = this.createSVGElement('polygon', {
          points: '0,-3 6,0 0,3',
          fill: this.colors.propagation,
          transform: `translate(${midX}, ${midY}) rotate(${angle})`
        });
        this.pathGroup.appendChild(arrow);
        
      } else if (segment.type === 'processing' || segment.type === 'queuing') {
        // Draw as a rectangle
        const nodeX = this.nodeScale(segment.startNode);
        const rect = this.createSVGElement('rect', {
          class: `segment segment-${segment.type}`,
          x: nodeX - 10,
          y: this.timeScale(segment.startTime),
          width: 20,
          height: this.timeScale(segment.endTime) - this.timeScale(segment.startTime),
          fill: this.colors[segment.type],
          opacity: 0.8,
          rx: 2
        });
        this.pathGroup.appendChild(rect);
        
        // Add duration label
        if (segment.duration > 0.1) {
          const label = this.createSVGElement('text', {
            x: nodeX + 15,
            y: (this.timeScale(segment.startTime) + this.timeScale(segment.endTime)) / 2,
            'font-size': '9px',
            fill: this.colors[segment.type],
            'font-weight': 'bold'
          });
          label.textContent = `${segment.duration.toFixed(1)}ms`;
          this.pathGroup.appendChild(label);
        }
      }
    });
    
    // Add legend annotations
    this.addPathAnnotations();
  }
  
  /**
   * Add annotations to explain the visualization
   */
  addPathAnnotations() {
    // Add "First bit" and "Last bit" labels if space permits
    if (this.segments.length > 0 && this.plotWidth > 400) {
      const firstSegment = this.segments[0];
      if (firstSegment.type === 'transmission-propagation') {
        const startX = this.nodeScale(firstSegment.startNode);
        
        // First bit label
        const firstBitLabel = this.createSVGElement('text', {
          x: startX + 10,
          y: this.timeScale(firstSegment.firstBitStart) - 5,
          'font-size': '8px',
          fill: '#7f8c8d',
          'font-style': 'italic'
        });
        firstBitLabel.textContent = 'First bit →';
        this.pathGroup.appendChild(firstBitLabel);
        
        // Last bit label
        const lastBitLabel = this.createSVGElement('text', {
          x: startX + 10,
          y: this.timeScale(firstSegment.lastBitStart) + 10,
          'font-size': '8px',
          fill: '#7f8c8d',
          'font-style': 'italic'
        });
        lastBitLabel.textContent = 'Last bit →';
        this.pathGroup.appendChild(lastBitLabel);
      }
    }
  }
  
  /**
   * Set visualization mode for single or multi-packet display
   */
  setVisualizationMode(mode) {
    this.visualizationMode = mode; // 'single' or 'multi'
  }
  
  /**
   * Unified update method that handles both single and multi-packet visualization
   */
  updatePackets(state) {
    this.currentTime = state.time;
    
    // Clear existing packet/time visualization
    this.packetGroup.innerHTML = '';
    
    // Draw the current time line
    this.drawTimeLine(state.time);
    
    // Choose visualization based on mode and packet count
    if (this.visualizationMode === 'single' && state.packets.length === 1) {
      // Single packet mode - show detailed first/last bit visualization
      this.drawSinglePacketDetailed(state.packets[0], state.time);
    } else {
      // Multi-packet mode - show simplified packet indicators
      this.drawMultiplePacketsSimplified(state);
    }
    
    // Add shading to show "past" events
    this.shadePastEvents(state.time);
  }
  
  /**
   * Draw detailed single packet visualization with first and last bit tracking
   */
  drawSinglePacketDetailed(packet, time) {
    // Find and highlight active segments based on packet timing
    const packetTime = time - packet.sendTime;
    let activeSegment = null;
    
    for (const segment of this.segments) {
      if (segment.type === 'transmission-propagation') {
        // Check if this segment is active
        if (packetTime >= segment.firstBitStart && packetTime <= segment.lastBitEnd) {
          activeSegment = segment;
          
          // Show where packets are at this moment in time
          const startX = this.nodeScale(segment.startNode);
          const endX = this.nodeScale(segment.endNode);
          
          // Mark where the first bit is (if still traveling)
          if (packetTime >= segment.firstBitStart && packetTime <= segment.firstBitEnd) {
            const progress = (packetTime - segment.firstBitStart) / segment.propagationTime;
            const x = startX + (endX - startX) * progress;
            this.drawTimeIntersection(x, this.timeScale(packetTime), 'first-bit');
          }
          
          // Mark where the last bit is (if it has started)
          if (packetTime >= segment.lastBitStart && packetTime <= segment.lastBitEnd) {
            const progress = (packetTime - segment.lastBitStart) / segment.propagationTime;
            const x = startX + (endX - startX) * progress;
            this.drawTimeIntersection(x, this.timeScale(packetTime), 'last-bit');
            
            // If transmission delay is very small, ensure both bits are visible
            if (segment.transmissionTime < 0.001 && packetTime >= segment.firstBitStart && packetTime <= segment.firstBitEnd) {
              const firstProgress = (packetTime - segment.firstBitStart) / segment.propagationTime;
              const firstX = startX + (endX - startX) * firstProgress;
              // Offset the first bit marker slightly to the right if they overlap
              if (Math.abs(firstX - x) < 5) {
                this.drawTimeIntersection(firstX + 10, this.timeScale(packetTime), 'first-bit');
              }
            }
          }
        }
      } else if (segment.type === 'processing' || segment.type === 'queuing') {
        // Check if packet is in processing or queuing
        if (packetTime >= segment.startTime && packetTime <= segment.endTime) {
          activeSegment = segment;
          const nodeX = this.nodeScale(segment.startNode);
          this.drawTimeIntersection(nodeX, this.timeScale(packetTime), segment.type);
        }
      }
    }
    
    if (activeSegment) {
      this.highlightSegment(activeSegment);
    }
  }
  
  /**
   * Draw simplified multi-packet visualization
   */
  drawMultiplePacketsSimplified(state) {
    // Draw each packet
    for (const packet of state.packets) {
      if (packet.phase === 'waiting' || packet.phase === 'delivered') continue;
      
      this.drawPacket(packet, state.time);
    }
    
    // Draw queue indicators
    for (let i = 0; i < state.queues.length; i++) {
      const queue = state.queues[i];
      if (queue.queueLength > 0 || queue.transmitting) {
        this.drawQueueIndicator(i, queue);
      }
    }
  }
  
  /**
   * Legacy method for backwards compatibility - redirects to unified method
   * @deprecated Use updatePackets() instead
   */
  updatePacketPosition(time) {
    // Convert to state format and call unified method
    this.updatePackets({
      time: time,
      packets: [{
        id: 1,
        phase: 'propagating',
        hop: 0,
        progress: 0,
        color: '#2ecc71',
        sendTime: 0,
        size: this.scenario.packetSize
      }],
      queues: []
    });
  }
  
  /**
   * Legacy method for backwards compatibility - redirects to unified method
   * @deprecated Use updatePackets() instead
   */
  updateMultiplePackets(state) {
    this.updatePackets(state);
  }
  
  /**
   * Draw a single packet on the diagram
   */
  drawPacket(packet, currentTime) {
    const packetSizeBits = packet.size * 8;
    
    // For multi-packet mode, we need to properly handle the packet's position on the diagram
    // The packet's Y position should be based on how long it has been traveling,
    // not the absolute simulation time
    
    // Calculate accumulated time using the same logic as getAccumulatedTime
    let accumulatedTime = 0;
    
    // First, handle completed hops (all phases complete)
    for (let h = 0; h < packet.hop; h++) {
      const hop = this.scenario.hops[h];
      // Add all delay components for completed hops
      if (h > 0 && hop.queuingDelay) {
        accumulatedTime += hop.queuingDelay;
      }
      if (hop.bandwidth) {
        accumulatedTime += (packetSizeBits / hop.bandwidth) * 1000;
      }
      if (hop.distance && hop.propagationSpeed) {
        accumulatedTime += (hop.distance / hop.propagationSpeed) * 1000;
      }
      if (hop.processingDelay) {
        accumulatedTime += hop.processingDelay;
      }
    }
    
    // Now handle the current hop based on the current phase
    const currentHop = this.scenario.hops[packet.hop];
    if (currentHop) {
      // Queuing happens at the beginning of each hop (except hop 0)
      if (packet.hop > 0) {
        if (packet.phase === 'queuing') {
          // Currently in queuing phase
          accumulatedTime += currentHop.queuingDelay * packet.progress;
        } else if (packet.phase !== 'waiting') {
          // Past queuing phase
          accumulatedTime += currentHop.queuingDelay || 0;
        }
      }
      
      // Transmission
      if (packet.phase === 'transmitting') {
        // Currently transmitting
        const transmissionTime = (packetSizeBits / currentHop.bandwidth) * 1000;
        accumulatedTime += transmissionTime * packet.progress;
      } else if (packet.phase === 'propagating' || packet.phase === 'processing') {
        // Past transmission phase
        if (currentHop.bandwidth) {
          accumulatedTime += (packetSizeBits / currentHop.bandwidth) * 1000;
        }
      }
      
      // Propagation
      if (packet.phase === 'propagating') {
        // Currently propagating
        const propagationTime = (currentHop.distance / currentHop.propagationSpeed) * 1000;
        accumulatedTime += propagationTime * packet.progress;
      } else if (packet.phase === 'processing') {
        // Past propagation phase
        if (currentHop.distance && currentHop.propagationSpeed) {
          accumulatedTime += (currentHop.distance / currentHop.propagationSpeed) * 1000;
        }
      }
      
      // Processing
      if (packet.phase === 'processing') {
        // Currently processing
        accumulatedTime += currentHop.processingDelay * packet.progress;
      }
    }
    
    // Only log key transitions
    if (packet.phase === 'propagating' && packet.progress < 0.1) {
      console.log(`Packet ${packet.id} starting propagation: accumTime=${accumulatedTime.toFixed(2)}ms, Y=${this.timeScale(accumulatedTime)}`)
    }
    
    // Handle waiting packets at the source
    if (packet.phase === 'waiting') {
      const sourceNode = this.scenario.nodes[0];
      if (sourceNode) {
        const sourceX = this.nodeScale(sourceNode.name);
        // Show at time 0 (top of diagram) since it hasn't started yet
        const y = this.timeScale(0);
        this.drawPacketIndicator(sourceX, y, packet.color, 'waiting');
      }
      return;
    }
    
    // Don't draw packets that have traveled beyond the diagram
    if (accumulatedTime > this.maxTime) {
      console.log(`Packet ${packet.id} beyond diagram (accumTime=${accumulatedTime} > maxTime=${this.maxTime})`);
      return;
    }
    
    // Calculate packet position based on phase and hop
    if (packet.hop < 0 || packet.hop >= this.scenario.hops.length) {
      console.log(`Packet ${packet.id} invalid hop: ${packet.hop}`);
      return;
    }
    
    const hop = this.scenario.hops[packet.hop];
    const startNode = this.scenario.nodes[packet.hop];
    const endNode = this.scenario.nodes[packet.hop + 1];
    
    if (!startNode || !endNode) {
      console.log(`Packet ${packet.id} missing nodes for hop ${packet.hop}`);
      return;
    }
    
    const startX = this.nodeScale(startNode.name);
    const endX = this.nodeScale(endNode.name);
    
    // Calculate Y positions based on packet send time and current phase
    let firstBitY, lastBitY;
    
    if (packet.phase === 'transmitting') {
      // During transmission, bits are being sent
      const transmissionTime = (packetSizeBits / hop.bandwidth) * 1000;
      const transmissionStart = this.getAccumulatedTime(packet.hop, 'transmission');
      
      // Use relative time from when packet was sent
      firstBitY = this.timeScale(transmissionStart);
      lastBitY = this.timeScale(transmissionStart + transmissionTime * packet.progress);
      
      // Draw vertical line at source showing transmission
      this.drawPacketSegment(startX, firstBitY, startX, lastBitY, packet.color, packet.id);
      
    } else if (packet.phase === 'propagating') {
      // During propagation, packet travels through medium
      const transmissionTime = hop.bandwidth ? (packetSizeBits / hop.bandwidth) * 1000 : 0;
      const propagationTime = (hop.distance / hop.propagationSpeed) * 1000;
      const propagationStart = this.getAccumulatedTime(packet.hop, 'propagation');
      
      // Calculate current X position based on progress
      const currentX = startX + (endX - startX) * packet.progress;
      
      // Calculate Y position based on accumulated time
      const currentY = this.timeScale(accumulatedTime);
      
      console.log(`Packet ${packet.id} propagating: X=${currentX.toFixed(1)}, Y=${currentY.toFixed(1)}, progress=${packet.progress.toFixed(3)}, color=${packet.color}`);
      
      // Draw the packet indicator at its current position
      this.drawPacketIndicator(currentX, currentY, packet.color, 'propagating');
      
      // Optionally draw the propagation line trail  
      // First bit line
      if (packet.progress > 0) {
        const firstBitStartY = this.timeScale(propagationStart);
        const firstBitEndY = this.timeScale(propagationStart + propagationTime * packet.progress);
        
        const line = this.createSVGElement('line', {
          x1: startX,
          y1: firstBitStartY,
          x2: currentX,
          y2: firstBitEndY,
          stroke: packet.color,
          'stroke-width': 2,
          opacity: 0.3,
          'stroke-dasharray': '2,2'
        });
        this.packetGroup.appendChild(line);
      }
      
      // Last bit line (if transmission delay exists)
      const lastBitProgress = Math.max(0, packet.progress - (transmissionTime / propagationTime));
      if (lastBitProgress > 0) {
        const lastBitX = startX + (endX - startX) * lastBitProgress;
        const lastBitStartY = this.timeScale(propagationStart + transmissionTime);
        const lastBitEndY = this.timeScale(propagationStart + transmissionTime + propagationTime * lastBitProgress);
        
        const line = this.createSVGElement('line', {
          x1: startX,
          y1: lastBitStartY,
          x2: lastBitX,
          y2: lastBitEndY,
          stroke: packet.color,
          'stroke-width': 2,
          opacity: 0.3,
          'stroke-dasharray': '2,2'
        });
        this.packetGroup.appendChild(line);
      }
      
    } else if (packet.phase === 'processing') {
      // During processing, packet is at destination node of current hop
      const nodeX = this.nodeScale(endNode.name);
      const y = this.timeScale(accumulatedTime);
      
      this.drawPacketIndicator(nodeX, y, packet.color, 'processing');
      
    } else if (packet.phase === 'queuing') {
      // During queuing, packet waits at start node of current hop
      // For hop 0: should not happen (we skip queuing at source)
      // For hop 1: waits at Router before transmitting to Destination
      const nodeX = this.nodeScale(startNode.name);
      const y = this.timeScale(accumulatedTime);
      
      this.drawPacketIndicator(nodeX, y, packet.color, 'queuing');
    }
  }
  
  /**
   * Draw a packet segment (line)
   */
  drawPacketSegment(x1, y1, x2, y2, color, id) {
    const line = this.createSVGElement('line', {
      x1: x1,
      y1: y1,
      x2: x2,
      y2: y2,
      stroke: color,
      'stroke-width': 2,
      opacity: 0.7,
      'data-packet-id': id
    });
    this.packetGroup.appendChild(line);
  }
  
  /**
   * Draw a packet indicator (circle)
   */
  drawPacketIndicator(x, y, color, type) {
    // Create a larger, more visible circle
    const circle = this.createSVGElement('circle', {
      cx: x,
      cy: y,
      r: 10,  // Larger radius for visibility
      fill: color || '#FF0000',  // Default to red if no color
      stroke: '#000000',  // Black stroke for visibility
      'stroke-width': 2,
      opacity: 1.0
    });
    this.packetGroup.appendChild(circle);
    
    console.log(`Drew packet at (${x}, ${y}) with color ${color}`);
    
    // Add pulsing animation for queuing and waiting packets
    if (type === 'queuing' || type === 'waiting') {
      circle.style.animation = 'pulse 1s infinite';
    }
  }
  
  /**
   * Draw queue indicator at a node
   */
  drawQueueIndicator(hopIndex, queueState) {
    if (hopIndex >= this.scenario.nodes.length - 1) return;
    
    const node = this.scenario.nodes[hopIndex];
    const nodeX = this.nodeScale(node.name);
    const y = this.timeScale(this.currentTime);
    
    // Draw queue length indicator
    if (queueState.queueLength > 0) {
      const text = this.createSVGElement('text', {
        x: nodeX + 15,
        y: y,
        'font-size': '10px',
        fill: '#9b59b6',
        'font-weight': 'bold'
      });
      text.textContent = `Q:${queueState.queueLength}`;
      this.packetGroup.appendChild(text);
    }
  }
  
  /**
   * Calculate accumulated time up to a certain phase
   */
  getAccumulatedTime(hopIndex, targetPhase) {
    let time = 0;
    const phases = ['transmission', 'propagation', 'processing', 'queuing'];
    const targetIndex = phases.indexOf(targetPhase);
    
    // Add time from previous hops
    for (let i = 0; i < hopIndex; i++) {
      const hop = this.scenario.hops[i];
      time += this.getHopTotalTime(hop);
    }
    
    // Add time from current hop up to target phase
    const hop = this.scenario.hops[hopIndex];
    const packetSizeBits = this.scenario.packetSize * 8;
    
    for (let i = 0; i < targetIndex; i++) {
      if (phases[i] === 'transmission' && hop.bandwidth) {
        time += (packetSizeBits / hop.bandwidth) * 1000;
      } else if (phases[i] === 'propagation' && hop.distance && hop.propagationSpeed) {
        time += (hop.distance / hop.propagationSpeed) * 1000;
      } else if (phases[i] === 'processing' && hop.processingDelay) {
        time += hop.processingDelay;
      } else if (phases[i] === 'queuing' && hop.queuingDelay) {
        time += hop.queuingDelay;
      }
    }
    
    return time;
  }
  
  /**
   * Get total time for a hop
   */
  getHopTotalTime(hop) {
    let time = 0;
    const packetSizeBits = this.scenario.packetSize * 8;
    
    if (hop.bandwidth) {
      time += (packetSizeBits / hop.bandwidth) * 1000;
    }
    if (hop.distance && hop.propagationSpeed) {
      time += (hop.distance / hop.propagationSpeed) * 1000;
    }
    if (hop.processingDelay) {
      time += hop.processingDelay;
    }
    if (hop.queuingDelay) {
      time += hop.queuingDelay;
    }
    
    return time;
  }
  
  /**
   * Draw the horizontal time line
   */
  drawTimeLine(time) {
    const y = this.timeScale(time);
    
    // Main time line
    const line = this.createSVGElement('line', {
      x1: -20,
      y1: y,
      x2: this.plotWidth + 20,
      y2: y,
      stroke: '#e74c3c',
      'stroke-width': 2,
      opacity: 0.8,
      class: 'time-line'
    });
    this.packetGroup.appendChild(line);
    
    // Time label on the line - adjust precision based on scale
    const label = this.createSVGElement('text', {
      x: this.plotWidth - 10,  // Move it inside the plot area
      y: y - 5,  // Position above the line
      'font-size': '11px',
      fill: '#e74c3c',
      'font-weight': 'bold',
      'text-anchor': 'end'  // Right-align the text
    });
    
    // Format time with appropriate precision
    let timeText;
    if (this.maxTime < 1) {
      // For sub-millisecond scenarios, show 3 decimal places
      timeText = `t = ${time.toFixed(3)} ms`;
    } else if (this.maxTime < 10) {
      // For short scenarios, show 2 decimal places
      timeText = `t = ${time.toFixed(2)} ms`;
    } else if (this.maxTime < 100) {
      // For medium scenarios, show 1 decimal place
      timeText = `t = ${time.toFixed(1)} ms`;
    } else {
      // For long scenarios, show whole numbers
      timeText = `t = ${Math.round(time)} ms`;
    }
    
    label.textContent = timeText;
    this.packetGroup.appendChild(label);
    
    // Add animated glow effect
    const glow = this.createSVGElement('line', {
      x1: -20,
      y1: y,
      x2: this.plotWidth + 20,
      y2: y,
      stroke: '#e74c3c',
      'stroke-width': 4,
      opacity: 0.3,
      class: 'time-line-glow'
    });
    glow.innerHTML = `
      <animate attributeName="opacity" 
               values="0.3;0.6;0.3" 
               dur="1.5s" 
               repeatCount="indefinite"/>
    `;
    this.packetGroup.insertBefore(glow, line);
  }
  
  /**
   * Draw intersection points where the time line crosses packet paths
   */
  drawTimeIntersection(x, y, type) {
    let color, size, label;
    
    switch(type) {
      case 'first-bit':
        color = '#27ae60';
        size = 6;
        label = 'First bit';
        break;
      case 'last-bit':
        color = '#16a085';
        size = 5;
        label = 'Last bit';
        break;
      case 'processing':
        color = this.colors.processing;
        size = 8;
        label = 'Processing';
        break;
      case 'queuing':
        color = this.colors.queuing;
        size = 8;
        label = 'Queuing';
        break;
      default:
        color = '#2c3e50';
        size = 5;
    }
    
    // Draw circle at intersection
    const circle = this.createSVGElement('circle', {
      cx: x,
      cy: y,
      r: size,
      fill: color,
      stroke: '#fff',
      'stroke-width': 2,
      class: 'time-intersection'
    });
    this.packetGroup.appendChild(circle);
    
    // Add pulsing effect
    const pulse = this.createSVGElement('circle', {
      cx: x,
      cy: y,
      r: size,
      fill: 'none',
      stroke: color,
      'stroke-width': 2,
      opacity: 0.5
    });
    pulse.innerHTML = `
      <animate attributeName="r" from="${size}" to="${size + 6}" dur="1s" repeatCount="indefinite"/>
      <animate attributeName="opacity" from="0.5" to="0" dur="1s" repeatCount="indefinite"/>
    `;
    this.packetGroup.appendChild(pulse);
  }
  
  /**
   * Shade the area above the time line to show past events
   */
  shadePastEvents(time) {
    const y = this.timeScale(time);
    
    // Create a subtle shading for everything that has already happened
    const shade = this.createSVGElement('rect', {
      x: -30,
      y: -10,
      width: this.plotWidth + 60,
      height: y + 10,
      fill: '#2c3e50',
      opacity: 0.05,
      class: 'past-shade'
    });
    this.packetGroup.insertBefore(shade, this.packetGroup.firstChild);
  }
  
  
  /**
   * Highlight the current segment
   */
  highlightSegment(segment) {
    // Remove previous highlights
    const highlighted = this.pathGroup.querySelectorAll('.highlighted');
    highlighted.forEach(el => {
      el.classList.remove('highlighted');
      el.style.filter = 'none';
      if (el.tagName === 'line') {
        el.style.strokeWidth = '2';
      } else if (el.tagName === 'rect') {
        el.style.strokeWidth = '1';
      }
    });
    
    // Highlight transmission-propagation segments
    if (segment.type === 'transmission-propagation') {
      // Highlight first and last bit lines for this segment
      const lines = this.pathGroup.querySelectorAll('.segment-first-bit, .segment-last-bit');
      lines.forEach(line => {
        const y1 = parseFloat(line.getAttribute('y1'));
        if (Math.abs(y1 - this.timeScale(segment.firstBitStart)) < 1 || 
            Math.abs(y1 - this.timeScale(segment.lastBitStart)) < 1) {
          line.classList.add('highlighted');
          line.style.filter = 'brightness(1.3)';
          line.style.strokeWidth = '3';
        }
      });
    } else {
      // Highlight processing or queuing rectangles
      const rects = this.pathGroup.querySelectorAll(`.segment-${segment.type}`);
      rects.forEach(rect => {
        const y = parseFloat(rect.getAttribute('y'));
        if (Math.abs(y - this.timeScale(segment.startTime)) < 1) {
          rect.classList.add('highlighted');
          rect.style.filter = 'brightness(1.3)';
        }
      });
    }
  }
  
  /**
   * Helper to create SVG elements
   */
  createSVGElement(type, attributes = {}) {
    const element = document.createElementNS('http://www.w3.org/2000/svg', type);
    for (const [key, value] of Object.entries(attributes)) {
      if (key === 'class') {
        element.setAttribute('class', value);
      } else {
        element.setAttribute(key, value);
      }
    }
    return element;
  }
  
  /**
   * Create a linear scale
   */
  createLinearScale(domainMin, domainMax, rangeMin, rangeMax) {
    return (value) => {
      const t = (value - domainMin) / (domainMax - domainMin);
      return rangeMin + t * (rangeMax - rangeMin);
    };
  }
  
  /**
   * Create a scale for node positions
   */
  createNodeScale(nodes, rangeMin, rangeMax) {
    const step = (rangeMax - rangeMin) / (nodes.length - 1);
    return (nodeName) => {
      const index = nodes.indexOf(nodeName);
      return rangeMin + index * step;
    };
  }
  
  /**
   * Reset the visualization
   */
  reset() {
    this.currentTime = 0;
    this.updatePacketPosition(0);
  }
  
  /**
   * Format bandwidth for display
   */
  formatBandwidth(bps) {
    if (bps >= 1e9) return `${(bps / 1e9).toFixed(1)}Gbps`;
    if (bps >= 1e6) return `${(bps / 1e6).toFixed(1)}Mbps`;
    if (bps >= 1e3) return `${(bps / 1e3).toFixed(1)}Kbps`;
    return `${bps}bps`;
  }
  
  /**
   * Format distance for display
   */
  formatDistance(meters) {
    if (meters >= 1000000) return `${(meters / 1000000).toFixed(1)}Mm`;
    if (meters >= 1000) return `${(meters / 1000).toFixed(1)}km`;
    return `${meters.toFixed(0)}m`;
  }
  
  /**
   * Format distance with medium type
   */
  formatDistanceWithMedium(meters, propagationSpeed) {
    const distance = this.formatDistance(meters);
    
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
    
    return distance + medium;
  }
}