/**
 * Main entry point for Ladder Diagram visualization
 */
import { LadderDiagram } from './js/LadderDiagramRefactored.js';
import { UnifiedPacketTracker } from './js/UnifiedPacketTracker.js';
import { ScenarioManager } from './js/ScenarioManagerRefactored.js';

// Global instances
let ladderDiagram;
let tracker;  // Single unified tracker instance
let scenarioManager;
let isMultiPacketMode = false;
let packetsSent = 0;
let packetsDelivered = 0;

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  console.log('Initializing Ladder Diagram...');
  
  // Get DOM elements
  const svgElement = document.getElementById('ladder-svg');
  const playPauseBtn = document.getElementById('play-pause');
  const stepBackwardBtn = document.getElementById('step-backward');
  const stepForwardBtn = document.getElementById('step-forward');
  const resetBtn = document.getElementById('reset');
  const speedSlider = document.getElementById('speed-slider');
  const speedDisplay = document.getElementById('speed-display');
  const timelineSlider = document.getElementById('timeline-slider');
  const scenarioSelect = document.getElementById('scenario-select');
  
  // Multi-packet controls
  const multiPacketMode = document.getElementById('multi-packet-mode');
  const multiPacketControls = document.getElementById('multi-packet-controls');
  const sendModeSelect = document.getElementById('send-mode');
  const packetIntervalInput = document.getElementById('packet-interval');
  const burstSizeInput = document.getElementById('burst-size');
  const sendPacketBtn = document.getElementById('send-packet-btn');
  const packetsSentDisplay = document.getElementById('packets-sent');
  const packetsDeliveredDisplay = document.getElementById('packets-delivered');
  const packetsTransitDisplay = document.getElementById('packets-transit');
  
  // Info displays
  const currentTimeDisplay = document.getElementById('current-time');
  const packetSizeDisplay = document.getElementById('packet-size');
  const packetLocationDisplay = document.getElementById('packet-location');
  const currentDelayDisplay = document.getElementById('current-delay');
  
  // Delay totals
  const transmissionTotal = document.getElementById('transmission-total');
  const propagationTotal = document.getElementById('propagation-total');
  const processingTotal = document.getElementById('processing-total');
  const queuingTotal = document.getElementById('queuing-total');
  const totalDelayDisplay = document.getElementById('total-delay');
  
  // Initialize components
  ladderDiagram = new LadderDiagram(svgElement);
  scenarioManager = new ScenarioManager();
  
  // Load initial scenario
  loadScenario('simple');
  
  /**
   * Load a scenario
   */
  function loadScenario(scenarioName) {
    const scenario = scenarioManager.getScenario(scenarioName);
    
    // Update packet size display
    packetSizeDisplay.textContent = `${scenario.packetSize} bytes`;
    
    // Load into ladder diagram
    ladderDiagram.loadScenario(scenario);
    
    // Create unified tracker in appropriate mode
    const mode = isMultiPacketMode ? 'multi' : 'single';
    tracker = new UnifiedPacketTracker(scenario, mode);
    
    // Set visualization mode in diagram
    ladderDiagram.setVisualizationMode(mode);
    
    // Setup based on current mode
    if (isMultiPacketMode) {
      setupMultiPacketMode();
    } else {
      setupSinglePacketMode();
    }
    
    // Reset counters
    packetsSent = 0;
    packetsDelivered = 0;
    updatePacketCounters();
  }
  
  /**
   * Setup single packet mode
   */
  function setupSinglePacketMode() {
    // Setup timeline slider
    timelineSlider.max = tracker.totalTime;
    timelineSlider.value = 0;
    
    // Set initial speed slider
    speedSlider.value = tracker.playbackSpeed;
    speedDisplay.textContent = `${tracker.playbackSpeed}x`;
    
    // Setup tracker callbacks
    tracker.onUpdate = (state) => {
      const singleState = tracker.getSinglePacketState();
      updateDisplay(singleState);
      ladderDiagram.updatePackets(state);
      timelineSlider.value = state.time;
    };
    
    tracker.onComplete = () => {
      playPauseBtn.querySelector('.play-icon').style.display = 'inline';
      playPauseBtn.querySelector('.pause-icon').style.display = 'none';
    };
    
    // Reset display
    updateDisplay(tracker.getSinglePacketState());
  }
  
  /**
   * Setup multi-packet mode
   */
  function setupMultiPacketMode() {
    // Setup timeline slider for simulation duration
    timelineSlider.max = tracker.maxSimulationTime;
    timelineSlider.value = 0;
    
    // Set initial speed
    const singlePacketTime = tracker.singlePacketTime;
    const defaultSpeed = singlePacketTime < 5 ? 1.0 : 0.5;
    tracker.setPlaybackSpeed(defaultSpeed);
    speedSlider.value = defaultSpeed;
    speedDisplay.textContent = `${defaultSpeed}x`;
    
    // Setup tracker callbacks
    tracker.onUpdate = (state) => {
      updateMultiPacketDisplay(state);
      ladderDiagram.updatePackets(state);
      timelineSlider.value = state.time;
    };
    
    tracker.onPacketSent = (packet) => {
      packetsSent++;
      updatePacketCounters();
    };
    
    tracker.onPacketDelivered = (packet) => {
      packetsDelivered++;
      updatePacketCounters();
    };
    
    // Configure send mode with appropriate interval
    const sendMode = sendModeSelect.value;
    // Set default interval to be about 1.5x the single packet time for good spacing
    const defaultInterval = Math.max(1, Math.round(singlePacketTime * 1.5));
    packetIntervalInput.value = defaultInterval;
    const interval = parseInt(packetIntervalInput.value);
    const burstSize = parseInt(burstSizeInput.value);
    tracker.setSendMode(sendMode, interval, burstSize);
    
    // Reset display
    updateMultiPacketDisplay(tracker.getCurrentState());
  }
  
  /**
   * Update packet counters
   */
  function updatePacketCounters() {
    packetsSentDisplay.textContent = packetsSent;
    packetsDeliveredDisplay.textContent = packetsDelivered;
    packetsTransitDisplay.textContent = packetsSent - packetsDelivered;
  }
  
  /**
   * Update display for multi-packet mode
   */
  function updateMultiPacketDisplay(state) {
    // Update time
    let timeText;
    if (state.time < 1) {
      timeText = `${state.time.toFixed(3)} ms`;
    } else if (state.time < 10) {
      timeText = `${state.time.toFixed(2)} ms`;
    } else if (state.time < 100) {
      timeText = `${state.time.toFixed(1)} ms`;
    } else {
      timeText = `${Math.round(state.time)} ms`;
    }
    currentTimeDisplay.textContent = timeText;
    
    // Update packet location based on active packets
    const activePackets = state.packets.filter(p => p.phase !== 'waiting' && p.phase !== 'delivered');
    if (activePackets.length > 0) {
      const phases = activePackets.map(p => p.phase).filter((v, i, a) => a.indexOf(v) === i);
      packetLocationDisplay.textContent = `${activePackets.length} packets (${phases.join(', ')})`;
    } else {
      packetLocationDisplay.textContent = 'None active';
    }
    
    // Hide single-packet delay totals in multi-packet mode
    currentDelayDisplay.textContent = 'Multiple packets';
    transmissionTotal.textContent = '-';
    propagationTotal.textContent = '-';
    processingTotal.textContent = '-';
    queuingTotal.textContent = '-';
    totalDelayDisplay.textContent = '-';
  }
  
  /**
   * Update the display with current state (single packet)
   */
  function updateDisplay(state) {
    // Update time with appropriate precision based on total time
    let timeText;
    const totalTime = tracker.totalTime;
    if (totalTime < 1) {
      timeText = `${state.time.toFixed(3)} ms`;
    } else if (totalTime < 10) {
      timeText = `${state.time.toFixed(2)} ms`;
    } else if (totalTime < 100) {
      timeText = `${state.time.toFixed(1)} ms`;
    } else {
      timeText = `${Math.round(state.time)} ms`;
    }
    currentTimeDisplay.textContent = timeText;
    
    // Update location
    packetLocationDisplay.textContent = state.location;
    
    // Update current delay type
    currentDelayDisplay.textContent = state.currentDelay || '-';
    
    // Update delay totals with appropriate precision
    const formatDelay = (delay) => {
      const totalTime = tracker.totalTime;
      if (totalTime < 1) {
        return `${delay.toFixed(3)} ms`;
      } else if (totalTime < 10) {
        return `${delay.toFixed(2)} ms`;
      } else if (delay < 1) {
        return `${delay.toFixed(3)} ms`;
      } else if (delay < 10) {
        return `${delay.toFixed(2)} ms`;
      } else {
        return `${delay.toFixed(1)} ms`;
      }
    };
    
    transmissionTotal.textContent = formatDelay(state.delayTotals.transmission);
    propagationTotal.textContent = formatDelay(state.delayTotals.propagation);
    processingTotal.textContent = formatDelay(state.delayTotals.processing);
    queuingTotal.textContent = formatDelay(state.delayTotals.queuing);
    
    // Calculate and update total
    const total = state.delayTotals.transmission + 
                 state.delayTotals.propagation + 
                 state.delayTotals.processing + 
                 state.delayTotals.queuing;
    totalDelayDisplay.textContent = formatDelay(total);
    
    // Highlight active delay component
    document.querySelectorAll('.delay-item').forEach(item => {
      item.style.background = '#f8f9fa';
    });
    
    if (state.currentDelay) {
      const activeDelay = state.currentDelay.toLowerCase();
      const activeElement = document.querySelector(`.delay-item.${activeDelay}`);
      if (activeElement) {
        activeElement.style.background = '#e3f2fd';
      }
    }
  }
  
  // Event Handlers
  
  /**
   * Play/Pause button handler
   */
  playPauseBtn.addEventListener('click', () => {
    if (tracker.isPlaying) {
      tracker.pause();
      playPauseBtn.querySelector('.play-icon').style.display = 'inline';
      playPauseBtn.querySelector('.pause-icon').style.display = 'none';
    } else {
      // Reset if at the end (single packet mode only)
      if (!isMultiPacketMode && tracker.currentTime >= tracker.totalTime) {
        tracker.reset();
      }
      tracker.play();
      playPauseBtn.querySelector('.play-icon').style.display = 'none';
      playPauseBtn.querySelector('.pause-icon').style.display = 'inline';
    }
  });
  
  /**
   * Step backward button handler
   */
  stepBackwardBtn.addEventListener('click', () => {
    const step = isMultiPacketMode ? 2 : 0.5;
    tracker.setTime(tracker.currentTime - step);
  });
  
  /**
   * Step forward button handler
   */
  stepForwardBtn.addEventListener('click', () => {
    const step = isMultiPacketMode ? 2 : 0.5;
    tracker.setTime(tracker.currentTime + step);
  });
  
  /**
   * Reset button handler
   */
  resetBtn.addEventListener('click', () => {
    const tracker = isMultiPacketMode ? multiPacketTracker : packetTracker;
    tracker.reset();
    playPauseBtn.querySelector('.play-icon').style.display = 'inline';
    playPauseBtn.querySelector('.pause-icon').style.display = 'none';
    
    if (isMultiPacketMode) {
      packetsSent = 0;
      packetsDelivered = 0;
      updatePacketCounters();
    }
  });
  
  /**
   * Speed slider handler
   */
  speedSlider.addEventListener('input', (e) => {
    const speed = parseFloat(e.target.value);
    const tracker = isMultiPacketMode ? multiPacketTracker : packetTracker;
    tracker.setPlaybackSpeed(speed);
    speedDisplay.textContent = `${speed}x`;
  });
  
  /**
   * Timeline slider handler
   */
  timelineSlider.addEventListener('input', (e) => {
    const time = parseFloat(e.target.value);
    const tracker = isMultiPacketMode ? multiPacketTracker : packetTracker;
    tracker.setTime(time);
  });
  
  /**
   * Multi-packet mode toggle
   */
  multiPacketMode.addEventListener('change', (e) => {
    isMultiPacketMode = e.target.checked;
    multiPacketControls.style.display = isMultiPacketMode ? 'block' : 'none';
    
    // Stop any running animation
    if (packetTracker && packetTracker.isPlaying) {
      packetTracker.pause();
    }
    if (multiPacketTracker && multiPacketTracker.isPlaying) {
      multiPacketTracker.pause();
    }
    
    // Reload scenario for new mode
    const currentScenario = scenarioSelect.value;
    loadScenario(currentScenario);
    
    // Reset play button
    playPauseBtn.querySelector('.play-icon').style.display = 'inline';
    playPauseBtn.querySelector('.pause-icon').style.display = 'none';
  });
  
  /**
   * Send mode select handler
   */
  sendModeSelect.addEventListener('change', (e) => {
    const mode = e.target.value;
    
    // Show/hide relevant controls
    document.querySelector('.packet-interval-control').style.display = 
      mode !== 'manual' ? 'block' : 'none';
    document.querySelector('.burst-size-control').style.display = 
      mode === 'burst' ? 'block' : 'none';
    sendPacketBtn.style.display = mode === 'manual' ? 'block' : 'none';
    
    // Update tracker settings
    if (tracker && isMultiPacketMode) {
      const interval = parseInt(packetIntervalInput.value);
      const burstSize = parseInt(burstSizeInput.value);
      tracker.setSendMode(mode, interval, burstSize);
    }
  });
  
  /**
   * Packet interval input handler
   */
  packetIntervalInput.addEventListener('input', (e) => {
    if (tracker && isMultiPacketMode) {
      const interval = parseInt(e.target.value);
      const burstSize = parseInt(burstSizeInput.value);
      tracker.setSendMode(sendModeSelect.value, interval, burstSize);
    }
  });
  
  /**
   * Burst size input handler
   */
  burstSizeInput.addEventListener('input', (e) => {
    if (tracker && isMultiPacketMode) {
      const interval = parseInt(packetIntervalInput.value);
      const burstSize = parseInt(e.target.value);
      tracker.setSendMode(sendModeSelect.value, interval, burstSize);
    }
  });
  
  /**
   * Send packet button handler
   */
  sendPacketBtn.addEventListener('click', () => {
    if (tracker && isMultiPacketMode) {
      tracker.manualSend();
      // Update display immediately to show the new packet
      if (tracker.onUpdate) {
        tracker.onUpdate(tracker.getCurrentState());
      }
    }
  });
  
  /**
   * Scenario select handler
   */
  scenarioSelect.addEventListener('change', (e) => {
    // Stop any running animation
    if (packetTracker && packetTracker.isPlaying) {
      packetTracker.pause();
    }
    
    const scenarioName = e.target.value;
    loadScenario(scenarioName);
    
    // Reset the animation to the beginning
    if (packetTracker) {
      packetTracker.reset();
    }
    
    // Reset play button to show play icon
    playPauseBtn.querySelector('.play-icon').style.display = 'inline';
    playPauseBtn.querySelector('.pause-icon').style.display = 'none';
  });
  
  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Space bar to play/pause
    if (e.key === ' ' && !e.target.matches('input, select')) {
      e.preventDefault();
      playPauseBtn.click();
    }
    
    // Arrow keys for stepping
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      stepBackwardBtn.click();
    }
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      stepForwardBtn.click();
    }
    
    // R to reset
    if (e.key === 'r' && !e.target.matches('input, select')) {
      e.preventDefault();
      resetBtn.click();
    }
    
    // Number keys for speed
    if (e.key >= '1' && e.key <= '5' && !e.target.matches('input, select')) {
      const speed = parseInt(e.key);
      speedSlider.value = speed;
      speedSlider.dispatchEvent(new Event('input'));
    }
  });
  
  // Show initial state
  console.log('Ladder Diagram initialized successfully');
});