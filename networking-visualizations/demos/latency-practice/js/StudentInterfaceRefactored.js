/**
 * StudentInterfaceRefactored - Refactored UI using shared utilities
 * Handles UI updates with consistent formatting from NetworkFormatter
 */

import { NetworkFormatter } from '../../../shared/utils/NetworkFormatter.js';
import { COLORS } from '../../../shared/constants/colors.js';

export class StudentInterfaceRefactored {
  constructor(problemEngine) {
    this.engine = problemEngine;
    this.formatter = NetworkFormatter;
    this.currentHintLevel = 0;
    this.visualizer = null;
    
    // Cache DOM elements
    this.elements = this.cacheElements();
    
    // Bind events
    this.bindEvents();
    
    // Initialize UI
    this.updateStats();
    this.initializeStyles();
  }
  
  /**
   * Cache DOM elements
   */
  cacheElements() {
    return {
      // Stats
      score: document.getElementById('score'),
      streak: document.getElementById('streak'),
      accuracy: document.getElementById('accuracy'),
      problemsSolved: document.getElementById('problems-solved'),
      avgTime: document.getElementById('avg-time'),
      
      // Problem display
      problemDisplay: document.getElementById('problem-display'),
      problemSelect: document.getElementById('problem-select'),
      difficultyBadge: document.getElementById('difficulty-badge'),
      
      // Answer inputs
      answerArea: document.getElementById('answer-area'),
      transmissionInput: document.getElementById('transmission-input'),
      propagationInput: document.getElementById('propagation-input'),
      processingInput: document.getElementById('processing-input'),
      queuingInput: document.getElementById('queuing-input'),
      totalInput: document.getElementById('total-input'),
      bottleneckSelect: null,
      
      // Buttons
      checkAnswer: document.getElementById('check-answer'),
      getHint: document.getElementById('get-hint'),
      showSolution: document.getElementById('show-solution'),
      nextProblem: document.getElementById('next-problem'),
      resetStats: document.getElementById('reset-stats'),
      
      // Feedback
      feedbackArea: document.getElementById('feedback-area'),
      feedbackContent: document.getElementById('feedback-content'),
      
      // Visualization
      visualizationContainer: document.getElementById('visualization-container'),
      canvas: document.getElementById('network-canvas'),
      
      // Hints
      hintContainer: document.getElementById('hint-container'),
      hintContent: document.getElementById('hint-content')
    };
  }
  
  /**
   * Bind event listeners
   */
  bindEvents() {
    // Problem selection
    if (this.elements.problemSelect) {
      this.elements.problemSelect.addEventListener('change', (e) => {
        if (e.target.value) {
          this.loadProblemById(e.target.value);
        }
      });
    }
    
    
    // Answer inputs with auto-calculation
    ['transmission', 'propagation', 'processing', 'queuing'].forEach(component => {
      const input = this.elements[`${component}Input`];
      if (input) {
        input.addEventListener('input', () => this.updateTotal());
        input.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
            this.checkAnswer();
          }
        });
      }
    });
    
    // Button handlers
    if (this.elements.checkAnswer) {
      this.elements.checkAnswer.addEventListener('click', () => this.checkAnswer());
    }
    if (this.elements.getHint) {
      this.elements.getHint.addEventListener('click', () => this.getHint());
    }
    if (this.elements.showSolution) {
      this.elements.showSolution.addEventListener('click', () => this.showSolution());
    }
    if (this.elements.nextProblem) {
      this.elements.nextProblem.addEventListener('click', () => this.nextProblem());
    }
    if (this.elements.resetStats) {
      this.elements.resetStats.addEventListener('click', () => this.resetStats());
    }
  }
  
  /**
   * Initialize styles using shared constants
   */
  initializeStyles() {
    // Apply color scheme from shared constants
    const style = document.createElement('style');
    style.textContent = `
      .difficulty-beginner { 
        background: ${COLORS.UI.SUCCESS}; 
        color: white;
      }
      .difficulty-intermediate { 
        background: ${COLORS.UI.WARNING}; 
        color: white;
      }
      .difficulty-advanced { 
        background: ${COLORS.UI.ERROR}; 
        color: white;
      }
      .delay-transmission { 
        color: ${COLORS.DELAYS.TRANSMISSION}; 
      }
      .delay-propagation { 
        color: ${COLORS.DELAYS.PROPAGATION}; 
      }
      .delay-processing { 
        color: ${COLORS.DELAYS.PROCESSING}; 
      }
      .delay-queuing { 
        color: ${COLORS.DELAYS.QUEUING}; 
      }
      .correct-answer {
        background: ${COLORS.UI.SUCCESS}20;
        border-color: ${COLORS.UI.SUCCESS};
      }
      .incorrect-answer {
        background: ${COLORS.UI.ERROR}20;
        border-color: ${COLORS.UI.ERROR};
      }
    `;
    document.head.appendChild(style);
  }
  
  /**
   * Load problems from configuration
   */
  loadProblems(problemConfigs) {
    this.problems = problemConfigs;
    this.populateProblemSelector();
  }
  
  /**
   * Load problem by ID
   */
  loadProblemById(problemId) {
    try {
      // Find the problem configuration from our stored list
      const problemConfig = this.problems.find(p => p.id === problemId);
      if (!problemConfig) {
        throw new Error(`Problem not found: ${problemId}`);
      }
      
      // Load the problem using the full configuration
      const problem = this.engine.loadProblem(problemConfig);
      this.displayProblem(problem);
      this.resetAnswerArea();
      this.configureAnswerArea(problem);
      
      // Show relevant sections
      if (this.elements.answerArea) {
        this.elements.answerArea.style.display = 'block';
      }
      if (this.elements.feedbackArea) {
        this.elements.feedbackArea.style.display = 'none';
      }
      
      // Visualize the network if visualizer is available
      if (this.visualizer && problem) {
        this.renderProblemVisualization(problem);
      }
    } catch (error) {
      this.showError(`Failed to load problem: ${error.message}`);
    }
  }
  
  /**
   * Display problem details
   */
  displayProblem(problem) {
    if (!this.elements.problemDisplay) return;
    
    // Create problem display HTML matching packet journey style
    const html = `
      <div class="problem-header">
        <h3>${problem.title}</h3>
        <span class="difficulty-badge difficulty-${problem.difficulty}">
          ${problem.difficulty.toUpperCase()}
        </span>
      </div>
      
      <div class="problem-scenario">
        <p>${problem.scenario}</p>
      </div>
      
      <div class="problem-info-bar">
        <div class="info-item">
          <span class="info-label">📦 Packet Size:</span>
          <span class="info-value">${problem.given.packetSize} bytes</span>
        </div>
        <div class="info-item">
          <span class="info-label">🔗 Hops:</span>
          <span class="info-value">${problem.given.hops.length}</span>
        </div>
        <div class="info-item">
          <span class="info-label">💡 Tip:</span>
          <span class="info-value">Hover over network elements for details</span>
        </div>
      </div>
      
      <div class="problem-question">
        <strong>📝 Question:</strong> ${problem.question}
      </div>
    `;
    
    this.elements.problemDisplay.innerHTML = html;
  }
  
  /**
   * Format given data using NetworkFormatter
   */
  formatGivenData(given) {
    // This method is no longer needed as information is displayed in the network visualization
    return '';
  }
  
  /**
   * Render problem visualization using packet journey's visualizer
   * @param {Object} problem - The problem to visualize
   * @param {boolean} showLatency - Whether to show latency calculations (for solution)
   */
  renderProblemVisualization(problem, showLatency = false) {
    if (!this.visualizer || !problem || !problem.given) return;
    
    // Convert problem format to path format expected by VisualizationOrchestrator
    const path = {
      hops: []
    };
    
    // Add source node
    const firstHop = problem.given.hops[0];
    if (firstHop) {
      // Extract source node name from first hop
      const sourceName = firstHop.node ? firstHop.node.split('→')[0].trim() : 'Client';
      path.hops.push({
        node: sourceName,
        nodeType: 'client',
        bandwidth: firstHop.bandwidth,
        distance: firstHop.distance,
        medium: firstHop.medium,
        utilization: firstHop.utilization || 0,
        processingDelay: 0
      });
    }
    
    // Add remaining hops
    problem.given.hops.forEach((hop, index) => {
      const nodeName = hop.node ? 
        (hop.node.split('→')[1] || `Node ${index + 1}`).trim() : 
        `Node ${index + 1}`;
      
      path.hops.push({
        node: nodeName,
        nodeType: hop.nodeType || (index === problem.given.hops.length - 1 ? 'server' : 'router'),
        bandwidth: hop.bandwidth,
        distance: hop.distance,
        medium: hop.medium,
        utilization: hop.utilization || 0,
        processingDelay: hop.processingDelay || 0,
        queuingDelay: hop.queuingDelay
      });
    });
    
    // Render the path
    try {
      if (showLatency && this.visualizer.renderWithLatency) {
        // Show full latency calculations (for solution display)
        this.visualizer.renderWithLatency(path);
      } else {
        // Show only network topology (for practice)
        this.visualizer.render(path);
      }
    } catch (error) {
      console.error('Failed to render visualization:', error);
    }
  }
  
  /**
   * Configure answer area based on problem type
   */
  configureAnswerArea(problem) {
    if (problem.type === 'calculate-total') {
      // Show calculation inputs
      this.showCalculationInputs();
      
      // Add link-by-link mode toggle for multi-hop problems
      if (problem.given.hops.length > 1) {
        // Small delay to ensure DOM is ready
        setTimeout(() => this.addLinkByLinkToggle(), 50);
      }
    } else if (problem.type === 'identify-bottleneck') {
      // Show bottleneck selection
      this.showBottleneckSelection(problem.given.hops);
    } else if (problem.type === 'calculate-per-link') {
      // Show per-link calculation inputs
      this.showPerLinkInputs(problem.given.hops);
    }
  }
  
  /**
   * Show calculation input fields
   */
  showCalculationInputs() {
    // Calculate total processing and queuing delays from all hops if available
    const problem = this.engine.currentProblem;
    let totalProcessingDelay = 0;
    let totalQueuingDelay = 0;
    if (problem && problem.given && problem.given.hops) {
      problem.given.hops.forEach(hop => {
        if (hop.processingDelay !== undefined && hop.processingDelay > 0) {
          totalProcessingDelay += hop.processingDelay;
        }
        // If queuing delay is explicitly given (not calculated from utilization)
        if (hop.queuingDelay !== undefined && hop.queuingDelay > 0 && hop.utilization === undefined) {
          totalQueuingDelay += hop.queuingDelay;
        }
      });
    }
    
    const html = `
      <div class="answer-inputs">
        <h4>Enter your calculations (in milliseconds):</h4>
        <div class="input-grid">
          <div class="input-group">
            <label>Transmission Delay:</label>
            <input type="number" id="transmission-input" step="0.001" min="0" placeholder="0.000">
            <span class="unit">ms</span>
          </div>
          <div class="input-group">
            <label>Propagation Delay:</label>
            <input type="number" id="propagation-input" step="0.001" min="0" placeholder="0.000">
            <span class="unit">ms</span>
          </div>
          <div class="input-group">
            <label>Processing Delay:</label>
            <input type="number" id="processing-input" step="0.001" min="0" placeholder="0.000" value="${totalProcessingDelay > 0 ? totalProcessingDelay.toFixed(3) : ''}">
            <span class="unit">ms</span>
          </div>
          <div class="input-group">
            <label>Queuing Delay:</label>
            <input type="number" id="queuing-input" step="0.001" min="0" placeholder="0.000" value="${totalQueuingDelay > 0 ? totalQueuingDelay.toFixed(3) : ''}">
            <span class="unit">ms</span>
          </div>
          <div class="input-group total-group">
            <label><strong>Total Delay:</strong></label>
            <input type="number" id="total-input" step="0.001" min="0" placeholder="0.000" readonly>
            <span class="unit">ms</span>
          </div>
        </div>
      </div>
    `;
    
    if (this.elements.answerArea) {
      // Check if toggle exists
      const existingToggle = document.querySelector('.calculation-mode-toggle');
      if (existingToggle) {
        // Keep toggle and replace only the inputs
        const answerInputs = document.querySelector('.answer-inputs');
        if (answerInputs) {
          answerInputs.outerHTML = html;
        } else {
          // Add after toggle
          existingToggle.insertAdjacentHTML('afterend', html);
        }
      } else {
        this.elements.answerArea.innerHTML = html;
      }
      
      // Re-cache input elements
      this.elements.transmissionInput = document.getElementById('transmission-input');
      this.elements.propagationInput = document.getElementById('propagation-input');
      this.elements.processingInput = document.getElementById('processing-input');
      this.elements.queuingInput = document.getElementById('queuing-input');
      this.elements.totalInput = document.getElementById('total-input');
      
      // Re-bind events
      ['transmission', 'propagation', 'processing', 'queuing'].forEach(component => {
        const input = this.elements[`${component}Input`];
        if (input) {
          input.addEventListener('input', () => this.updateTotal());
          input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
              this.checkAnswer();
            }
          });
        }
      });
      
      // Calculate initial total if processing delay was pre-filled
      if (this.elements.processingInput && this.elements.processingInput.value) {
        this.updateTotal();
      }
    }
  }
  
  /**
   * Show bottleneck selection interface
   */
  showBottleneckSelection(hops) {
    let html = `
      <div class="answer-inputs">
        <h4>Identify the bottleneck:</h4>
        <select id="bottleneck-select" class="bottleneck-select">
          <option value="">-- Select the hop with highest delay --</option>
    `;
    
    hops.forEach((hop, index) => {
      html += `<option value="${index}">${hop.node}</option>`;
    });
    
    html += `
        </select>
      </div>
    `;
    
    if (this.elements.answerArea) {
      this.elements.answerArea.innerHTML = html;
      this.elements.bottleneckSelect = document.getElementById('bottleneck-select');
    }
  }
  
  /**
   * Add toggle for link-by-link calculation mode
   */
  addLinkByLinkToggle() {
    // Check if toggle already exists
    if (document.getElementById('link-by-link-toggle')) {
      return;
    }
    
    const toggleHtml = `
      <div class="calculation-mode-toggle">
        <label class="mode-switch">
          <input type="checkbox" id="link-by-link-toggle">
          <span class="slider"></span>
          <span class="mode-label">Calculate link-by-link</span>
        </label>
      </div>
    `;
    
    // Insert toggle at the beginning of answer area
    const answerArea = document.getElementById('answer-area');
    if (answerArea) {
      // Insert at the beginning of answer area
      answerArea.insertAdjacentHTML('afterbegin', toggleHtml);
      
      const toggle = document.getElementById('link-by-link-toggle');
      toggle.addEventListener('change', (e) => {
        if (e.target.checked) {
          this.showPerLinkInputs();
        } else {
          this.showTotalInputs();
        }
      });
    }
  }
  
  /**
   * Show per-link latency input interface
   */
  showPerLinkInputs() {
    const problem = this.engine.currentProblem;
    if (!problem || !problem.given || !problem.given.hops) return;
    
    const hops = problem.given.hops;
    let html = `
      <div class="per-link-inputs">
        <h4>Calculate latency for each link:</h4>
        <div class="link-cards">
    `;
    
    hops.forEach((hop, index) => {
      // Each hop represents a link with bandwidth/distance, so show all hops
      html += `
        <div class="link-card" data-link-index="${index}">
          <div class="link-header">
            <span class="link-name">${hop.node || `Link ${index + 1}`}</span>
            <span class="link-info">${this.formatter.bandwidth(hop.bandwidth)} | ${this.formatter.distance(hop.distance)} | ${hop.medium}</span>
          </div>
            <div class="link-inputs">
              <div class="input-row">
                <label>Transmission (ms):</label>
                <input type="number" class="link-transmission" data-link="${index}" step="0.001" min="0">
              </div>
              <div class="input-row">
                <label>Propagation (ms):</label>
                <input type="number" class="link-propagation" data-link="${index}" step="0.001" min="0">
              </div>
              <div class="input-row">
                <label>Processing (ms):</label>
                <input type="number" class="link-processing" data-link="${index}" step="0.001" min="0" value="${hop.processingDelay || 0}">
              </div>
              <div class="input-row">
                <label>Queuing (ms):</label>
                <input type="number" class="link-queuing" data-link="${index}" step="0.001" min="0" value="${(hop.queuingDelay !== undefined && hop.utilization === undefined) ? hop.queuingDelay.toFixed(3) : ''}">
              </div>
              <div class="input-row total-row">
                <label><strong>Link Total (ms):</strong></label>
                <input type="number" class="link-total" data-link="${index}" step="0.001" min="0" readonly>
              </div>
            </div>
            <div class="link-feedback" id="link-feedback-${index}"></div>
          </div>
        `;
    });
    
    // Note: Final node processing is already included in the last hop
    
    html += `
        </div>
        <div class="total-summary">
          <label><strong>End-to-End Total (ms):</strong></label>
          <input type="number" id="per-link-total" step="0.001" min="0" readonly>
        </div>
      </div>
    `;
    
    const answerInputs = document.querySelector('.answer-inputs');
    if (answerInputs) {
      answerInputs.innerHTML = html;
      this.bindPerLinkEvents();
      this.updatePerLinkTotal();
    }
  }
  
  /**
   * Show total input interface (original mode)
   */
  showTotalInputs() {
    // Just show the calculation inputs without re-adding toggle
    this.showCalculationInputs();
  }
  
  /**
   * Bind events for per-link inputs
   */
  bindPerLinkEvents() {
    // Update link totals when component values change
    document.querySelectorAll('.link-transmission, .link-propagation, .link-processing, .link-queuing').forEach(input => {
      input.addEventListener('input', (e) => {
        const linkIndex = parseInt(e.target.dataset.link);
        this.updateLinkTotal(linkIndex);
        this.updatePerLinkTotal();
      });
    });
  }
  
  /**
   * Update total for a specific link
   */
  updateLinkTotal(linkIndex) {
    const transmission = parseFloat(document.querySelector(`.link-transmission[data-link="${linkIndex}"]`)?.value) || 0;
    const propagation = parseFloat(document.querySelector(`.link-propagation[data-link="${linkIndex}"]`)?.value) || 0;
    const processing = parseFloat(document.querySelector(`.link-processing[data-link="${linkIndex}"]`)?.value) || 0;
    const queuing = parseFloat(document.querySelector(`.link-queuing[data-link="${linkIndex}"]`)?.value) || 0;
    
    const total = transmission + propagation + processing + queuing;
    const totalInput = document.querySelector(`.link-total[data-link="${linkIndex}"]`);
    if (totalInput) {
      totalInput.value = total.toFixed(3);
    }
  }
  
  /**
   * Update end-to-end total from all links
   */
  updatePerLinkTotal() {
    let total = 0;
    document.querySelectorAll('.link-total').forEach(input => {
      total += parseFloat(input.value) || 0;
    });
    
    // Add any standalone processing delays
    document.querySelectorAll('.link-card').forEach(card => {
      const linkIndex = parseInt(card.dataset.linkIndex);
      const processingInput = card.querySelector('.link-processing');
      if (processingInput && !card.querySelector('.link-transmission')) {
        // This is a standalone processing delay
        total += parseFloat(processingInput.value) || 0;
      }
    });
    
    const totalInput = document.getElementById('per-link-total');
    if (totalInput) {
      totalInput.value = total.toFixed(3);
    }
  }
  
  /**
   * Update total calculation
   */
  updateTotal() {
    const transmission = parseFloat(this.elements.transmissionInput?.value) || 0;
    const propagation = parseFloat(this.elements.propagationInput?.value) || 0;
    const processing = parseFloat(this.elements.processingInput?.value) || 0;
    const queuing = parseFloat(this.elements.queuingInput?.value) || 0;
    
    const total = transmission + propagation + processing + queuing;
    
    if (this.elements.totalInput) {
      this.elements.totalInput.value = total.toFixed(3);
    }
  }
  
  /**
   * Check answer
   */
  checkAnswer() {
    const problem = this.engine.currentProblem;
    if (!problem) return;
    
    let studentAnswer;
    
    // Check if in link-by-link mode
    const linkByLinkToggle = document.getElementById('link-by-link-toggle');
    const isLinkByLinkMode = linkByLinkToggle && linkByLinkToggle.checked;
    
    if (problem.type === 'calculate-total') {
      if (isLinkByLinkMode) {
        // Collect per-link answers
        studentAnswer = {
          perLink: [],
          total: parseFloat(document.getElementById('per-link-total')?.value) || 0
        };
        
        // Collect each link's values
        document.querySelectorAll('.link-card').forEach(card => {
          const linkIndex = parseInt(card.dataset.linkIndex);
          const linkAnswer = {
            transmission: parseFloat(card.querySelector('.link-transmission')?.value) || 0,
            propagation: parseFloat(card.querySelector('.link-propagation')?.value) || 0,
            processing: parseFloat(card.querySelector('.link-processing')?.value) || 0,
            queuing: parseFloat(card.querySelector('.link-queuing')?.value) || 0,
            total: parseFloat(card.querySelector('.link-total')?.value) || 0
          };
          
          // For final node with only processing
          if (!card.querySelector('.link-transmission')) {
            linkAnswer.transmission = 0;
            linkAnswer.propagation = 0;
            linkAnswer.queuing = 0;
            linkAnswer.total = linkAnswer.processing;
          }
          
          studentAnswer.perLink[linkIndex] = linkAnswer;
        });
      } else {
        // Original total mode
        studentAnswer = {
          transmission: parseFloat(this.elements.transmissionInput?.value) || 0,
          propagation: parseFloat(this.elements.propagationInput?.value) || 0,
          processing: parseFloat(this.elements.processingInput?.value) || 0,
          queuing: parseFloat(this.elements.queuingInput?.value) || 0,
          total: parseFloat(this.elements.totalInput?.value) || 0
        };
      }
    } else if (problem.type === 'identify-bottleneck') {
      const selected = this.elements.bottleneckSelect?.value;
      if (!selected) {
        this.showFeedback({ error: 'Please select a hop' }, false);
        return;
      }
      studentAnswer = {
        hopIndex: parseInt(selected)
      };
    }
    
    // Check answer using engine
    const result = this.engine.checkAnswer(studentAnswer, isLinkByLinkMode);
    
    // Show feedback
    this.showFeedback(result, result.correct);
    
    // Update stats
    this.updateStats();
    
    // Show next problem button if correct
    if (result.correct && this.elements.nextProblem) {
      this.elements.nextProblem.style.display = 'inline-block';
      this.elements.checkAnswer.disabled = true;
    }
    
    // Highlight correct/incorrect inputs
    if (problem.type === 'calculate-total' && result.componentResults) {
      Object.entries(result.componentResults).forEach(([component, componentResult]) => {
        const input = this.elements[`${component}Input`];
        if (input) {
          input.classList.remove('correct-answer', 'incorrect-answer');
          input.classList.add(componentResult.correct ? 'correct-answer' : 'incorrect-answer');
        }
      });
    }
  }
  
  /**
   * Get hint
   */
  getHint() {
    const hint = this.engine.getHint();
    
    if (hint.error) {
      this.showError(hint.error);
      return;
    }
    
    this.displayHint(hint);
    this.updateStats();
  }
  
  /**
   * Display hint
   */
  displayHint(hint) {
    let html = '<div class="hint-display">';
    
    if (hint.hint) {
      html += `<p class="hint-text">${hint.hint}</p>`;
    }
    
    if (hint.component) {
      html += `
        <div class="hint-formula">
          <strong>Formula:</strong> ${hint.component.formula}
        </div>
        <div class="hint-calculation">
          <strong>Calculation:</strong><br>
          <code>${hint.component.calculation}</code>
        </div>
      `;
    }
    
    if (hint.formulas) {
      html += '<div class="formula-reference"><h4>Formulas:</h4><ul>';
      Object.entries(hint.formulas).forEach(([component, formula]) => {
        html += `<li><strong class="delay-${component}">${component}:</strong> ${formula}</li>`;
      });
      html += '</ul></div>';
    }
    
    if (hint.hintsRemaining !== undefined) {
      html += `<p class="hints-remaining">${hint.hintsRemaining} hints remaining</p>`;
    }
    
    html += '</div>';
    
    if (this.elements.hintContainer) {
      this.elements.hintContent.innerHTML = html;
      this.elements.hintContainer.style.display = 'block';
    } else {
      // Create hint container if it doesn't exist
      const container = document.createElement('div');
      container.id = 'hint-container';
      container.className = 'hint-container';
      container.innerHTML = `
        <h4>Hint:</h4>
        <div id="hint-content">${html}</div>
      `;
      this.elements.answerArea.appendChild(container);
      this.elements.hintContainer = container;
      this.elements.hintContent = document.getElementById('hint-content');
    }
  }
  
  /**
   * Show solution
   */
  showSolution() {
    const problem = this.engine.currentProblem;
    if (!problem) return;
    
    const solution = problem.solution;
    
    // Show the network with full latency calculations
    if (this.visualizer && this.visualizer.renderWithLatency) {
      this.renderProblemVisualization(problem, true); // true = show latency
    }
    
    // Check if in link-by-link mode
    const linkByLinkToggle = document.getElementById('link-by-link-toggle');
    const isLinkByLinkMode = linkByLinkToggle && linkByLinkToggle.checked;
    
    // Show correct answers alongside student answers
    if (isLinkByLinkMode && solution.perHop) {
      // For each link, show the correct answer next to student's answer
      solution.perHop.forEach((hop, index) => {
        const hopData = problem.given.hops[index];
        
        const showCorrectAnswer = (selector, correctValue, componentName) => {
          const input = document.querySelector(selector);
          if (input && input.parentElement) {
            // Remove any existing solution display
            const existingSolution = input.parentElement.querySelector('.solution-value');
            if (existingSolution) {
              existingSolution.remove();
            }
            
            // Get student's value (treat empty as 0)
            const studentValue = parseFloat(input.value) || 0;
            
            // More strict validation:
            // 1. If correct value is 0, student must enter 0
            // 2. If correct value is non-zero, student must enter non-zero
            // 3. Check both absolute and relative error
            let isCorrect = false;
            if (correctValue === 0) {
              isCorrect = studentValue === 0;
            } else if (correctValue > 0 && studentValue === 0) {
              // Student entered 0 or empty for non-zero value - always wrong
              isCorrect = false;
            } else {
              // Both values are non-zero, check tolerance
              const absoluteError = Math.abs(studentValue - correctValue);
              const relativeError = absoluteError / correctValue;
              // Accept if within 0.05ms OR within 5% relative error
              isCorrect = absoluteError < 0.05 || relativeError < 0.05;
            }
            
            // Add visual feedback to input
            input.classList.remove('correct', 'incorrect');
            input.classList.add(isCorrect ? 'correct' : 'incorrect');
            
            // Generate calculation explanation
            let calculation = '';
            if (!isCorrect && correctValue > 0) {
              switch(componentName) {
                case 'transmission':
                  const packetBits = problem.given.packetSize * 8;
                  calculation = `${problem.given.packetSize} bytes × 8 = ${packetBits} bits<br>` +
                               `${packetBits} bits ÷ ${this.formatter.bandwidth(hopData.bandwidth)} = ${correctValue.toFixed(3)} ms`;
                  break;
                case 'propagation':
                  const speed = (hopData.medium === 'satellite' || hopData.medium === 'wireless') ? 3e8 : 2e8;
                  const speedStr = speed === 3e8 ? '3×10⁸' : '2×10⁸';
                  calculation = `${this.formatter.distance(hopData.distance)} ÷ ${speedStr} m/s = ${correctValue.toFixed(3)} ms`;
                  break;
                case 'processing':
                  calculation = hopData.processingDelay !== undefined ? 
                    `Given: ${correctValue.toFixed(3)} ms` : 
                    `Device processing time: ${correctValue.toFixed(3)} ms`;
                  break;
                case 'queuing':
                  if (hopData.utilization) {
                    const queuingFactor = (1 / Math.pow(1 - hopData.utilization, 3)) - 1;
                    calculation = `Utilization: ${(hopData.utilization * 100).toFixed(0)}%<br>` +
                                 `(1/(1-${hopData.utilization.toFixed(2)})³ - 1) = ${queuingFactor.toFixed(3)}<br>` +
                                 `= ${correctValue.toFixed(3)} ms`;
                  } else if (hopData.queuingDelay !== undefined) {
                    calculation = `Given: ${correctValue.toFixed(3)} ms`;
                  } else {
                    calculation = `Estimated: ${correctValue.toFixed(3)} ms`;
                  }
                  break;
              }
            }
            
            // Create solution display
            const solutionSpan = document.createElement('span');
            solutionSpan.className = `solution-value ${isCorrect ? 'correct' : 'incorrect'}`;
            
            if (isCorrect) {
              solutionSpan.innerHTML = `<span class="solution-icon">✓</span>`;
            } else {
              solutionSpan.innerHTML = `
                <span class="solution-icon">✗</span>
                <span class="correct-value-wrapper">
                  <span class="correct-value">${correctValue.toFixed(3)} ms</span>
                  ${calculation ? `<span class="calculation-tooltip">${calculation}</span>` : ''}
                </span>
              `;
            }
            
            // Insert after the input
            input.parentElement.appendChild(solutionSpan);
          }
        };
        
        // Show correct values for this link
        showCorrectAnswer(`.link-transmission[data-link="${index}"]`, hop.transmission || 0, 'transmission');
        showCorrectAnswer(`.link-propagation[data-link="${index}"]`, hop.propagation || 0, 'propagation');
        showCorrectAnswer(`.link-processing[data-link="${index}"]`, hop.processing || 0, 'processing');
        showCorrectAnswer(`.link-queuing[data-link="${index}"]`, hop.queuing || 0, 'queuing');
        
        // Show feedback for the link card
        const linkCard = document.querySelector(`.link-card[data-link-index="${index}"]`);
        if (linkCard) {
          const feedback = linkCard.querySelector('.link-feedback');
          if (feedback) {
            // Check if all components are correct for this link
            const allCorrect = ['transmission', 'propagation', 'processing', 'queuing'].every(comp => {
              const input = linkCard.querySelector(`.link-${comp}[data-link="${index}"]`);
              if (!input) return true; // Skip if component doesn't exist
              const studentVal = parseFloat(input.value) || 0;
              const correctVal = hop[comp] || 0;
              
              // Use same strict validation
              if (correctVal === 0) {
                return studentVal === 0;
              } else if (correctVal > 0 && studentVal === 0) {
                return false;
              } else {
                const absoluteError = Math.abs(studentVal - correctVal);
                const relativeError = absoluteError / correctVal;
                return absoluteError < 0.05 || relativeError < 0.05;
              }
            });
            
            feedback.className = `link-feedback ${allCorrect ? 'success' : 'error'}`;
            feedback.textContent = allCorrect ? '✓ All components correct!' : '✗ Some components need correction';
            feedback.style.display = 'block';
          }
        }
      });
    } else if (!isLinkByLinkMode) {
      // Show correct answers for aggregate mode
      const showAggregateAnswer = (inputElement, correctValue, componentName) => {
        if (inputElement && inputElement.parentElement) {
          // Remove existing solution display
          const existingSolution = inputElement.parentElement.querySelector('.solution-value');
          if (existingSolution) {
            existingSolution.remove();
          }
          
          const studentValue = parseFloat(inputElement.value) || 0;
          
          // Same strict validation as link-by-link mode
          let isCorrect = false;
          if (correctValue === 0) {
            isCorrect = studentValue === 0;
          } else if (correctValue > 0 && studentValue === 0) {
            isCorrect = false;
          } else {
            const absoluteError = Math.abs(studentValue - correctValue);
            const relativeError = absoluteError / correctValue;
            isCorrect = absoluteError < 0.05 || relativeError < 0.05;
          }
          
          // Add visual feedback
          inputElement.classList.remove('correct', 'incorrect');
          inputElement.classList.add(isCorrect ? 'correct' : 'incorrect');
          
          // Generate aggregate calculation explanation
          let calculation = '';
          if (!isCorrect && correctValue > 0 && componentName !== 'total') {
            // Build explanation for aggregate values across all hops
            const explanations = [];
            solution.perHop.forEach((hop, idx) => {
              const hopData = problem.given.hops[idx];
              const value = hop[componentName] || 0;
              if (value > 0) {
                let hopCalc = `Hop ${idx + 1}: `;
                switch(componentName) {
                  case 'transmission':
                    hopCalc += `${this.formatter.time(value)}`;
                    break;
                  case 'propagation':
                    hopCalc += `${this.formatter.time(value)}`;
                    break;
                  case 'processing':
                    hopCalc += `${this.formatter.time(value)}`;
                    break;
                  case 'queuing':
                    hopCalc += `${this.formatter.time(value)}`;
                    break;
                }
                explanations.push(hopCalc);
              }
            });
            
            if (explanations.length > 0) {
              calculation = explanations.join('<br>') + '<br>' +
                           `Total: ${correctValue.toFixed(3)} ms`;
            }
          } else if (componentName === 'total' && !isCorrect) {
            calculation = `Sum of all components:<br>` +
                         `${solution.components.transmission.toFixed(3)} + ` +
                         `${solution.components.propagation.toFixed(3)} + ` +
                         `${solution.components.processing.toFixed(3)} + ` +
                         `${solution.components.queuing.toFixed(3)}<br>` +
                         `= ${correctValue.toFixed(3)} ms`;
          }
          
          // Create solution display
          const solutionSpan = document.createElement('span');
          solutionSpan.className = `solution-value ${isCorrect ? 'correct' : 'incorrect'}`;
          
          if (isCorrect) {
            solutionSpan.innerHTML = `<span class="solution-icon">✓</span>`;
          } else {
            solutionSpan.innerHTML = `
              <span class="solution-icon">✗</span>
              <span class="correct-value-wrapper">
                <span class="correct-value">${correctValue.toFixed(3)}</span>
                ${calculation ? `<span class="calculation-tooltip aggregate-tooltip">${calculation}</span>` : ''}
              </span>
            `;
          }
          
          // Insert after the unit span
          const unitSpan = inputElement.parentElement.querySelector('.unit');
          if (unitSpan) {
            unitSpan.insertAdjacentElement('afterend', solutionSpan);
          } else {
            inputElement.parentElement.appendChild(solutionSpan);
          }
        }
      };
      
      showAggregateAnswer(this.elements.transmissionInput, solution.components.transmission, 'transmission');
      showAggregateAnswer(this.elements.propagationInput, solution.components.propagation, 'propagation');
      showAggregateAnswer(this.elements.processingInput, solution.components.processing, 'processing');
      showAggregateAnswer(this.elements.queuingInput, solution.components.queuing, 'queuing');
      showAggregateAnswer(this.elements.totalInput, solution.total, 'total');
    }
    
    // Show success message
    let html = '<div class="solution-display">';
    html += '<span class="feedback-icon success">✓</span>';
    html += '<h4>Solution Revealed!</h4>';
    html += '<p>The correct values have been filled in above. ';
    
    if (isLinkByLinkMode) {
      html += 'Review each link\'s delay components to understand how latency accumulates across the network path.</p>';
    } else {
      html += 'Review the delay components to understand how they contribute to the total latency.</p>';
    }
    
    // Add explanation
    const breakdown = this.engine.calculator.formatDelayBreakdown(solution);
    html += '<div class="solution-explanation">';
    html += '<h5>Dominant Component:</h5>';
    html += `<p>The <strong>${solution.dominant.component}</strong> delay contributes most to the total latency `;
    html += `(${breakdown[solution.dominant.component].percentage} of total).</p>`;
    html += '</div>';
    
    // Show per-hop breakdown if multi-hop
    if (solution.perHop && solution.perHop.length > 1) {
      html += '<h5>Per-Hop Breakdown:</h5><ul class="hop-breakdown">';
      solution.perHop.forEach(hop => {
        html += `<li><strong>${hop.name}:</strong> ${this.formatter.time(hop.total)}</li>`;
      });
      html += '</ul>';
    }
    
    html += '</div>';
    
    this.showFeedback({ solution: html }, false);
    
    // Disable check answer button
    if (this.elements.checkAnswer) {
      this.elements.checkAnswer.disabled = true;
    }
    
    // Show next problem button
    if (this.elements.nextProblem) {
      this.elements.nextProblem.style.display = 'inline-block';
    }
  }
  
  /**
   * Show feedback
   */
  showFeedback(result, isCorrect) {
    if (!this.elements.feedbackArea) return;
    
    let html = '<div class="feedback-content">';
    
    if (result.error) {
      html += `<p class="error-message">${result.error}</p>`;
    } else if (result.solution) {
      html += result.solution;
    } else {
      // Add success/error icon
      html += isCorrect ? 
        '<div class="feedback-icon success">✓</div>' :
        '<div class="feedback-icon error">✗</div>';
      
      // Add message
      if (result.message) {
        html += `<p class="feedback-message">${result.message}</p>`;
      }
      
      // Add feedback details
      if (result.feedback && Array.isArray(result.feedback)) {
        html += '<ul class="feedback-details">';
        result.feedback.forEach(item => {
          html += `<li>${item}</li>`;
        });
        html += '</ul>';
      }
      
      // Add hint if provided
      if (result.hint) {
        html += `<p class="feedback-hint"><strong>Hint:</strong> ${result.hint}</p>`;
      }
      
      // Add breakdown if provided
      if (result.breakdown) {
        if (Array.isArray(result.breakdown)) {
          html += '<div class="breakdown-list"><strong>Breakdown:</strong><ul>';
          result.breakdown.forEach(item => {
            html += `<li class="${item.isBottleneck ? 'bottleneck' : ''}">
              ${item.name}: ${item.delay} ${item.isBottleneck ? '(Bottleneck)' : ''}
            </li>`;
          });
          html += '</ul></div>';
        } else {
          html += '<div class="breakdown-details">';
          Object.entries(result.breakdown).forEach(([key, value]) => {
            html += `<div><strong>${key}:</strong> ${value.value} (${value.percentage})</div>`;
          });
          html += '</div>';
        }
      }
      
      // Add score if earned
      if (result.score) {
        html += `<p class="score-earned">+${result.score} points!</p>`;
      }
    }
    
    html += '</div>';
    
    this.elements.feedbackContent.innerHTML = html;
    this.elements.feedbackArea.style.display = 'block';
    this.elements.feedbackArea.className = `feedback-container ${isCorrect ? 'correct' : 'incorrect'}`;
  }
  
  /**
   * Load next problem
   */
  nextProblem() {
    // Load a random problem
    try {
      const problem = this.engine.loadRandomProblem();
      this.displayProblem(problem);
      this.resetAnswerArea();
      this.configureAnswerArea(problem);
      
      // Reset UI state
      if (this.elements.feedbackArea) {
        this.elements.feedbackArea.style.display = 'none';
      }
      if (this.elements.hintContainer) {
        this.elements.hintContainer.style.display = 'none';
      }
      if (this.elements.nextProblem) {
        this.elements.nextProblem.style.display = 'none';
      }
      if (this.elements.checkAnswer) {
        this.elements.checkAnswer.disabled = false;
      }
      
      // Visualize if available
      if (this.visualizer && problem) {
        this.renderProblemVisualization(problem);
      }
    } catch (error) {
      this.showError(`Failed to load problem: ${error.message}`);
    }
  }
  
  /**
   * Reset answer area
   */
  resetAnswerArea() {
    // Clear all inputs
    ['transmission', 'propagation', 'processing', 'queuing', 'total'].forEach(component => {
      const input = this.elements[`${component}Input`];
      if (input) {
        input.value = '';
        input.classList.remove('correct-answer', 'incorrect-answer', 'correct', 'incorrect');
      }
    });
    
    if (this.elements.bottleneckSelect) {
      this.elements.bottleneckSelect.value = '';
    }
    
    // Remove any solution displays
    document.querySelectorAll('.solution-value').forEach(el => el.remove());
    
    // Clear link inputs if in link-by-link mode
    document.querySelectorAll('.link-transmission, .link-propagation, .link-processing, .link-queuing, .link-total').forEach(input => {
      input.value = '';
      input.classList.remove('correct', 'incorrect');
    });
    
    // Hide link feedback
    document.querySelectorAll('.link-feedback').forEach(feedback => {
      feedback.style.display = 'none';
      feedback.className = 'link-feedback';
    });
    
    // Reset hint level
    this.currentHintLevel = 0;
  }
  
  /**
   * Update statistics display
   */
  updateStats() {
    const stats = this.engine.getStatistics();
    
    if (this.elements.score) {
      this.elements.score.textContent = this.engine.score;
    }
    if (this.elements.streak) {
      this.elements.streak.textContent = this.engine.streak;
    }
    if (this.elements.accuracy) {
      this.elements.accuracy.textContent = stats.successRate;
    }
    if (this.elements.problemsSolved) {
      this.elements.problemsSolved.textContent = stats.correctAnswers;
    }
    if (this.elements.avgTime) {
      this.elements.avgTime.textContent = stats.averageTimeFormatted;
    }
  }
  
  /**
   * Reset statistics
   */
  resetStats() {
    if (confirm('Are you sure you want to reset all statistics?')) {
      this.engine.resetStatistics();
      this.updateStats();
      this.showFeedback({ message: 'Statistics reset successfully' }, true);
    }
  }
  
  /**
   * Populate problem selector
   */
  populateProblemSelector() {
    if (!this.elements.problemSelect) return;
    
    const select = this.elements.problemSelect;
    
    // Clear existing options
    select.innerHTML = '<option value="">-- Random Problem --</option>';
    
    // Group problems by difficulty for better organization
    const grouped = {
      beginner: [],
      intermediate: [],
      advanced: []
    };
    
    this.problems.forEach(problem => {
      if (grouped[problem.difficulty]) {
        grouped[problem.difficulty].push(problem);
      }
    });
    
    // Add all problems grouped by difficulty
    Object.entries(grouped).forEach(([level, problems]) => {
      if (problems.length > 0) {
        const optgroup = document.createElement('optgroup');
        optgroup.label = level.charAt(0).toUpperCase() + level.slice(1);
          
        problems.forEach(problem => {
          const option = document.createElement('option');
          option.value = problem.id;
          option.textContent = problem.title;
          optgroup.appendChild(option);
        });
        
        select.appendChild(optgroup);
      }
    });
  }
  
  /**
   * Filter problems by difficulty
   */
  filterProblems() {
    this.populateProblemSelector();
  }
  
  /**
   * Show error message
   */
  showError(message) {
    this.showFeedback({ error: message }, false);
  }
}