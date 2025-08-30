/**
 * Main entry point for Ladder Diagram visualization
 */
import { LadderDiagram } from './js/LadderDiagram.js';
import { PacketTracker } from './js/PacketTracker.js';
import { ScenarioManager } from './js/ScenarioManager.js';

// Global instances
let ladderDiagram;
let packetTracker;
let scenarioManager;

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
    
    // Create new packet tracker
    packetTracker = new PacketTracker(scenario);
    
    // Setup timeline slider
    timelineSlider.max = packetTracker.totalTime;
    timelineSlider.value = 0;
    
    // Set initial speed slider to match PacketTracker default
    speedSlider.value = packetTracker.playbackSpeed;
    speedDisplay.textContent = `${packetTracker.playbackSpeed}x`;
    
    // Setup packet tracker callbacks
    packetTracker.onUpdate = (state) => {
      updateDisplay(state);
      ladderDiagram.updatePacketPosition(state.time);
      timelineSlider.value = state.time;
    };
    
    packetTracker.onComplete = () => {
      playPauseBtn.querySelector('.play-icon').style.display = 'inline';
      playPauseBtn.querySelector('.pause-icon').style.display = 'none';
    };
    
    // Reset display
    updateDisplay(packetTracker.getCurrentState());
  }
  
  /**
   * Update the display with current state
   */
  function updateDisplay(state) {
    // Update time with appropriate precision based on total time
    let timeText;
    if (packetTracker.totalTime < 1) {
      timeText = `${state.time.toFixed(3)} ms`;
    } else if (packetTracker.totalTime < 10) {
      timeText = `${state.time.toFixed(2)} ms`;
    } else if (packetTracker.totalTime < 100) {
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
      if (packetTracker.totalTime < 1) {
        return `${delay.toFixed(3)} ms`;
      } else if (packetTracker.totalTime < 10) {
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
    if (packetTracker.isPlaying) {
      packetTracker.pause();
      playPauseBtn.querySelector('.play-icon').style.display = 'inline';
      playPauseBtn.querySelector('.pause-icon').style.display = 'none';
    } else {
      // Reset if at the end
      if (packetTracker.currentTime >= packetTracker.totalTime) {
        packetTracker.reset();
      }
      packetTracker.play();
      playPauseBtn.querySelector('.play-icon').style.display = 'none';
      playPauseBtn.querySelector('.pause-icon').style.display = 'inline';
    }
  });
  
  /**
   * Step backward button handler
   */
  stepBackwardBtn.addEventListener('click', () => {
    packetTracker.stepBackward(0.5); // Smaller steps for finer control
  });
  
  /**
   * Step forward button handler
   */
  stepForwardBtn.addEventListener('click', () => {
    packetTracker.stepForward(0.5); // Smaller steps for finer control
  });
  
  /**
   * Reset button handler
   */
  resetBtn.addEventListener('click', () => {
    packetTracker.reset();
    playPauseBtn.querySelector('.play-icon').style.display = 'inline';
    playPauseBtn.querySelector('.pause-icon').style.display = 'none';
  });
  
  /**
   * Speed slider handler
   */
  speedSlider.addEventListener('input', (e) => {
    const speed = parseFloat(e.target.value);
    packetTracker.setPlaybackSpeed(speed);
    speedDisplay.textContent = `${speed}x`;
  });
  
  /**
   * Timeline slider handler
   */
  timelineSlider.addEventListener('input', (e) => {
    const time = parseFloat(e.target.value);
    packetTracker.setTime(time);
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