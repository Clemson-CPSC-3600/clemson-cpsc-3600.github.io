# Network Latency Demo - Design Document

## Overview
An interactive visualization suite to help students understand network latency through hands-on experimentation and real-world scenarios.

## Learning Objectives

### Primary Goals
1. **Understand latency fundamentals** - Time delay between sending and receiving data
2. **Identify latency sources** - Propagation, transmission, processing, and queuing delays
3. **Grasp distance impact** - Speed of light limitations and geographic constraints
4. **Recognize cumulative effects** - How delays compound across network hops
5. **Connect to real applications** - Gaming, video calls, web browsing experiences

### Student Outcomes
After completing these demos, students should be able to:
- Calculate expected latency between two points
- Identify bottlenecks in network paths
- Explain why their game "lags" or video calls freeze
- Understand CDN benefits and edge computing
- Make informed decisions about network architecture

## Demo Suite Architecture

### Demo 1: Packet Journey - Complete Latency Modeling
**Purpose**: Model all four latency components at every hop in the network path

**Network Path Structure**:
Each hop in the path experiences ALL four types of delay:
1. **Transmission Delay**: Time to push packet onto the wire (packet_size / bandwidth)
2. **Propagation Delay**: Time for signal to travel the distance (distance / signal_speed)
3. **Processing Delay**: Time to examine packet headers and decide routing (varies by device)
4. **Queuing Delay**: Time waiting in queue before processing (depends on congestion)

**Example Path Visualization**:
```
[Your Computer] → [Home Router] → [ISP Router] → [Core Router] → [Peering Point] → [Destination ISP] → [Web Server]
      Hop 1           Hop 2           Hop 3          Hop 4           Hop 5              Hop 6            Destination
```

**Per-Hop Breakdown**:
For EACH hop, students see:
- **Transmission**: Affected by link speed (1 Gbps fiber vs 100 Mbps cable vs 54 Mbps WiFi)
- **Propagation**: Affected by physical distance and medium
- **Processing**: Affected by device type and load
- **Queuing**: Affected by traffic and buffer size

**Interactive Controls Per Hop**:
- **Link Properties**:
  - Bandwidth: 10 Mbps to 10 Gbps
  - Distance: 1m to 5000km
  - Medium: Fiber/Copper/WiFi/Satellite
- **Device Properties**:
  - Type: Home router/ISP router/Core router/Switch
  - Processing power: Low/Medium/High
  - Current load: 0-100%
- **Traffic Conditions**:
  - Queue depth: 0-100 packets
  - Arrival rate: packets/second
  - Buffer size: 10-1000 packets
- **Packet Properties**:
  - Size: 64B to 9000B (jumbo frames)
  - Priority: Normal/High/Real-time

**Visual Representation**:
```
Hop 2: ISP Router
┌─────────────────────────────────────┐
│ Transmission: ████░░░░░░  2.4ms     │
│ Propagation:  ██████░░░░  5.1ms     │
│ Processing:   ██░░░░░░░░  0.8ms     │
│ Queuing:      ███████░░░  6.3ms     │
│                                      │
│ TOTAL THIS HOP: 14.6ms              │
└─────────────────────────────────────┘
```

**Cumulative View**:
- Running total after each hop
- Stacked bar chart showing contribution of each hop
- Pie chart showing which component dominates overall

**Scenario Presets**:
1. **"Home Gaming Setup"**: 
   - WiFi to router (high transmission delay)
   - Cable modem (moderate queuing)
   - Multiple ISP hops
   
2. **"Enterprise Network"**:
   - Gigabit Ethernet throughout
   - Minimal queuing
   - Direct peering
   
3. **"Satellite Internet"**:
   - Huge propagation delay (36,000km to GEO satellite)
   - High transmission delay (limited bandwidth)
   
4. **"Congested Network"**:
   - Heavy queuing at multiple points
   - Packet loss and retransmission

**Learning Points**:
- No hop is "just propagation" or "just queuing" - all four components exist everywhere
- Bottlenecks can occur at any hop for any component
- Total latency = Sum of all components at all hops
- Different applications are sensitive to different components

### Demo 2: Gaming Lag Simulator
**Purpose**: Experience how latency affects real-time interactions

**User Experience**:
- Simple game environment (e.g., catching falling objects, shooting targets)
- Split view: Your screen vs. Server's view
- Adjustable latency: 0-500ms
- Visual effects:
  - Rubber-banding
  - Delayed hit registration
  - Prediction errors

**Game Modes**:
1. **Target Practice**: Hit moving targets with various latencies
2. **Racing**: Control a car with input delay
3. **Rhythm Game**: Hit notes on beat with latency compensation

**Metrics Displayed**:
- Current ping/latency
- Hits vs misses
- Score comparison at different latencies
- "Feels like" descriptions:
  - <20ms: "LAN party smooth"
  - 50ms: "Typical online gaming"
  - 100ms: "Noticeable delay"
  - 200ms: "Frustrating lag"
  - >300ms: "Unplayable"

**Interactive Elements**:
- Latency slider with preset marks
- Network condition presets:
  - "Fiber to the home"
  - "Cable internet"
  - "4G mobile"
  - "Satellite internet"
  - "Coffee shop WiFi"
- Packet loss toggle (0-5%)
- Jitter simulation (variance in latency)

### Demo 3: CDN vs Origin Server
**Purpose**: Demonstrate how content delivery networks reduce latency

**User Experience**:
- Interactive world map with:
  - Origin server (single location)
  - CDN edge nodes (global distribution)
  - User locations (clickable)
- Content request simulation:
  - Video streaming
  - Image loading
  - API calls

**Scenario Comparisons**:
1. **Without CDN**: 
   - User → Origin server (possibly overseas)
   - Show full path with latency
2. **With CDN**:
   - User → Nearest edge node
   - Cache hit vs cache miss scenarios

**Interactive Features**:
- Click any city to simulate user location
- Drag to move origin server
- Toggle CDN on/off
- Select content type (affects caching)
- "Cache warmup" - watch content propagate to edges

**Metrics**:
- Time to first byte (TTFB)
- Total load time
- Number of hops
- Distance traveled
- Cost indicator (bandwidth pricing)

## Visual Design System

### Color Palette
```css
--latency-excellent: #2ecc71  /* <30ms - Green */
--latency-good: #3498db       /* 30-60ms - Blue */
--latency-okay: #f39c12       /* 60-100ms - Yellow */
--latency-poor: #e67e22       /* 100-200ms - Orange */
--latency-bad: #e74c3c        /* >200ms - Red */
```

### Animation Patterns
- **Packet movement**: Smooth bezier curves with trail effect
- **Loading states**: Skeleton screens while calculating
- **Transitions**: 300ms ease-in-out for UI changes
- **Particle effects**: For successful/failed transmissions

### UI Components
- **Latency Meter**: Always-visible speedometer-style gauge
- **Info Cards**: Hover tooltips with explanations
- **Control Panel**: Consistent slider/button styling
- **Legend**: Color/symbol explanations
- **Progress Indicators**: For multi-step demos

## Technical Implementation Plan

### Core Architecture
```javascript
// Network hop with all four latency components
class NetworkHop {
  constructor(id, name, type) {
    this.id = id;
    this.name = name;
    this.type = type; // 'router', 'switch', 'server', 'client'
    
    // Link properties (to next hop)
    this.link = {
      bandwidth: 1000000000,  // 1 Gbps in bits/second
      distance: 10,           // km
      medium: 'fiber',        // 'fiber', 'copper', 'wifi', 'satellite'
      utilization: 0.3        // 30% link utilization
    };
    
    // Device properties
    this.device = {
      processingPower: 'high',     // 'low', 'medium', 'high'
      processingTimeBase: 0.001,   // 1ms base processing time
      currentLoad: 0.2              // 20% CPU load
    };
    
    // Queue properties
    this.queue = {
      currentDepth: 5,        // packets currently in queue
      bufferSize: 100,        // max packets
      arrivalRate: 50,        // packets/second
      serviceRate: 100        // packets/second this device can process
    };
  }
  
  calculateLatencies(packetSize) {
    const latencies = {
      transmission: this.calculateTransmission(packetSize),
      propagation: this.calculatePropagation(),
      processing: this.calculateProcessing(),
      queuing: this.calculateQueuing()
    };
    latencies.total = Object.values(latencies).reduce((a, b) => a + b, 0);
    return latencies;
  }
  
  calculateTransmission(packetSizeBytes) {
    // Time to serialize packet onto the wire
    const bits = packetSizeBytes * 8;
    const effectiveBandwidth = this.link.bandwidth * (1 - this.link.utilization);
    return bits / effectiveBandwidth * 1000; // Convert to ms
  }
  
  calculatePropagation() {
    // Time for signal to travel the distance
    const speedOfLight = {
      'fiber': 200000,     // km/s (200,000 km/s in fiber)
      'copper': 180000,    // km/s 
      'wifi': 300000,      // km/s (speed of light in air)
      'satellite': 300000  // km/s
    };
    
    // Add satellite altitude if applicable
    let distance = this.link.distance;
    if (this.link.medium === 'satellite') {
      distance += 35786 * 2; // GEO satellite round trip
    }
    
    const speed = speedOfLight[this.link.medium];
    return (distance / speed) * 1000; // Convert to ms
  }
  
  calculateProcessing() {
    // Time to process packet (routing decisions, checksums, etc.)
    const loadFactor = 1 + this.device.currentLoad * 2; // Load increases processing time
    const powerMultiplier = {
      'low': 3,
      'medium': 1.5,
      'high': 1
    };
    
    return this.device.processingTimeBase * 
           powerMultiplier[this.device.processingPower] * 
           loadFactor * 1000; // Convert to ms
  }
  
  calculateQueuing() {
    // M/M/1 queue model for average waiting time
    const utilization = this.queue.arrivalRate / this.queue.serviceRate;
    
    if (utilization >= 1) {
      // Queue is unstable, return max queuing delay
      return 100; // 100ms max queuing delay
    }
    
    // Average number in queue (Little's Law)
    const avgQueueLength = (utilization * utilization) / (1 - utilization);
    
    // Average waiting time
    const avgWaitTime = avgQueueLength / this.queue.arrivalRate;
    
    return avgWaitTime * 1000; // Convert to ms
  }
}

// Complete network path simulation
class NetworkPath {
  constructor() {
    this.hops = [];
    this.setupDefaultPath();
  }
  
  setupDefaultPath() {
    // Typical home to web server path
    this.hops = [
      new NetworkHop('h1', 'Your Computer → Home Router', 'client'),
      new NetworkHop('h2', 'Home Router → ISP Edge', 'router'),
      new NetworkHop('h3', 'ISP Edge → Regional ISP', 'router'),
      new NetworkHop('h4', 'Regional ISP → Internet Backbone', 'router'),
      new NetworkHop('h5', 'Internet Backbone → Destination ISP', 'router'),
      new NetworkHop('h6', 'Destination ISP → Web Server', 'server')
    ];
    
    // Set realistic parameters
    this.hops[0].link.bandwidth = 450000000;  // 450 Mbps WiFi
    this.hops[0].link.distance = 0.01;        // 10 meters
    this.hops[0].link.medium = 'wifi';
    
    this.hops[1].link.bandwidth = 100000000;  // 100 Mbps cable
    this.hops[1].link.distance = 20;          // 20 km to ISP
    this.hops[1].link.medium = 'copper';
    
    // ... configure other hops
  }
  
  calculateTotalLatency(packetSize = 1500) {
    const breakdown = [];
    let cumulativeLatency = 0;
    
    for (const hop of this.hops) {
      const hopLatencies = hop.calculateLatencies(packetSize);
      cumulativeLatency += hopLatencies.total;
      
      breakdown.push({
        hop: hop.name,
        latencies: hopLatencies,
        cumulative: cumulativeLatency
      });
    }
    
    return {
      total: cumulativeLatency,
      breakdown: breakdown,
      components: this.aggregateComponents(breakdown)
    };
  }
  
  aggregateComponents(breakdown) {
    // Sum up each component across all hops
    return breakdown.reduce((acc, hop) => {
      acc.transmission += hop.latencies.transmission;
      acc.propagation += hop.latencies.propagation;
      acc.processing += hop.latencies.processing;
      acc.queuing += hop.latencies.queuing;
      return acc;
    }, { transmission: 0, propagation: 0, processing: 0, queuing: 0 });
  }
}
```

### State Management
```javascript
const demoState = {
  // User adjustable
  distance: 1000,        // km
  linkType: 'fiber',     
  routerLoad: 0.3,       // 30%
  congestion: 0.1,       // 10%
  packetSize: 1024,      // bytes
  
  // Calculated
  totalLatency: 0,
  breakdown: {
    propagation: 0,
    transmission: 0,
    processing: 0,
    queuing: 0
  },
  
  // UI state
  isPaused: false,
  speed: 1.0,
  selectedNode: null
};
```

### Performance Considerations
- Use `requestAnimationFrame` for smooth 60fps
- Object pooling for packets (reuse instances)
- Viewport culling for off-screen elements
- WebWorkers for complex latency calculations
- Canvas layering (static bg, dynamic fg)

### Data Structures
```javascript
// Network topology representation
const network = {
  nodes: Map<id, Node>,
  links: Map<id, Link>,
  routes: Map<src-dest, Path>,
  
  // Methods
  findShortestPath(src, dest),
  calculateLatency(path),
  addCongestion(linkId, level)
};
```

## Educational Features

### Progressive Disclosure
1. **Level 1**: Just show total latency
2. **Level 2**: Break down into major components
3. **Level 3**: Show all factors and calculations
4. **Expert Mode**: Full network simulation with BGP, peering, etc.

### Built-in Challenges
- "Achieve <50ms latency to the game server"
- "Design a network for video conferencing"
- "Place CDN nodes to optimize for users"
- "Debug why the stream is buffering"

### Explanatory Content
- **Contextual help**: "?" buttons with explanations
- **Formula display**: Show actual calculations
- **Real-world examples**: "This is why Netflix works smoothly"
- **Common misconceptions**: "Bandwidth ≠ Latency"

### Assessment Integration
- Track interaction patterns
- Quiz questions after each demo
- Performance metrics (time to complete challenges)
- Concept mastery indicators

## Accessibility & Responsiveness

### Accessibility Features
- Keyboard navigation for all controls
- Screen reader descriptions for animations
- High contrast mode option
- Textual alternatives to visual info
- Configurable animation speeds

### Responsive Design
- Mobile-friendly touch controls
- Adaptive canvas sizing
- Collapsible control panels
- Portrait/landscape layouts
- Progressive enhancement (works without JS)

## Next Steps

### Implementation Priority
1. **Demo 1 (Packet Journey)** - Core learning experience
2. **Demo 2 (Gaming Lag)** - High engagement factor
3. **Demo 3 (CDN)** - Advanced topic

### Testing Plan
- User testing with CS students
- A/B testing different visualizations
- Performance testing on various devices
- Accessibility audit
- Cross-browser compatibility

### Future Enhancements
- VR/AR mode for 3D network visualization
- Multiplayer mode (students affect each other's latency)
- Historical internet data (latency over the years)
- Custom scenario builder
- Integration with real ping/traceroute data

## Resources & References

### Educational Resources
- [Bufferbloat.net](https://www.bufferbloat.net/)
- [How Internet Works](https://howdns.works/)
- [Submarine Cable Map](https://www.submarinecablemap.com/)

### Technical References
- RFC 792 (ICMP - Ping)
- RFC 2988 (Computing TCP's Retransmission Timer)
- Computer Networks (Tanenbaum & Wetherall)

### Similar Projects
- [Internet Simulator](https://internet-simulator.codeplaya.com/)
- [Traceroute Mapper](https://stefansundin.github.io/traceroute-mapper/)
- [Network Playground](http://www.csfieldguide.org.nz/en/interactives/network-diagram/)

---

*This document serves as the blueprint for implementing the network latency visualization demos. It will be updated as development progresses and user feedback is incorporated.*