/**
 * Student Interface for the latency practice system
 * Handles UI updates, input validation, and user interactions
 */
export class StudentInterface {
  constructor(problemEngine) {
    this.engine = problemEngine;
    this.currentHintLevel = 0;
    
    // Cache DOM elements
    this.elements = {
      // Stats
      score: document.getElementById('score'),
      streak: document.getElementById('streak'),
      accuracy: document.getElementById('accuracy'),
      problemsSolved: document.getElementById('problems-solved'),
      avgTime: document.getElementById('avg-time'),
      
      // Problem display
      problemDisplay: document.getElementById('problem-display'),
      problemSelect: document.getElementById('problem-select'),
      
      // Answer inputs
      answerArea: document.getElementById('answer-area'),
      transmissionInput: document.getElementById('transmission-input'),
      propagationInput: document.getElementById('propagation-input'),
      processingInput: document.getElementById('processing-input'),
      queuingInput: document.getElementById('queuing-input'),
      totalInput: document.getElementById('total-input'),
      
      // Buttons
      checkAnswer: document.getElementById('check-answer'),
      getHint: document.getElementById('get-hint'),
      showSolution: document.getElementById('show-solution'),
      nextProblem: document.getElementById('next-problem'),
      
      // Feedback
      feedbackArea: document.getElementById('feedback-area'),
      feedbackContent: document.getElementById('feedback-content'),
      
      // Visualization
      visualizationContainer: document.getElementById('visualization-container'),
      canvas: document.getElementById('network-canvas')
    };
    
    this.bindEvents();
    this.updateStats();
  }
  
  /**
   * Bind event listeners
   */
  bindEvents() {
    // Problem selection
    this.elements.problemSelect.addEventListener('change', (e) => {
      if (e.target.value) {
        this.loadProblem(e.target.value);
      }
    });
    
    // Difficulty filters
    document.querySelectorAll('input[name="difficulty"]').forEach(radio => {
      radio.addEventListener('change', () => this.filterProblems());
    });
    
    // Answer inputs - auto-calculate total
    ['transmission', 'propagation', 'processing', 'queuing'].forEach(component => {
      const input = this.elements[`${component}Input`];
      input.addEventListener('input', () => this.updateTotal());
      
      // Add Enter key support
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.checkAnswer();
        }
      });
    });
    
    // Buttons
    this.elements.checkAnswer.addEventListener('click', () => this.checkAnswer());
    this.elements.getHint.addEventListener('click', () => this.getHint());
    this.elements.showSolution.addEventListener('click', () => this.showSolution());
    this.elements.nextProblem.addEventListener('click', () => this.nextProblem());
  }
  
  /**
   * Load available problems
   */
  loadProblemSet(problems) {
    this.problems = problems;
    this.populateProblemSelector();
  }
  
  /**
   * Populate problem selector dropdown
   */
  populateProblemSelector() {
    const select = this.elements.problemSelect;
    const difficulty = document.querySelector('input[name="difficulty"]:checked').value;
    
    // Clear existing options except the first
    while (select.options.length > 1) {
      select.remove(1);
    }
    
    // Filter and add problems
    const filtered = difficulty === 'all' 
      ? this.problems 
      : this.problems.filter(p => p.difficulty === difficulty);
    
    filtered.forEach(problem => {
      const option = document.createElement('option');
      option.value = problem.id;
      option.textContent = `${problem.title} (${problem.difficulty})`;
      select.appendChild(option);
    });
  }
  
  /**
   * Filter problems based on difficulty
   */
  filterProblems() {
    this.populateProblemSelector();
  }
  
  /**
   * Load a specific problem
   */
  loadProblem(problemId) {
    const problem = this.problems.find(p => p.id === problemId);
    if (!problem) return;
    
    // Load problem in engine
    this.engine.loadProblem(problem);
    this.currentHintLevel = 0;
    
    // Display problem
    this.displayProblem(problem);
    
    // Reset answer area
    this.resetAnswerArea();
    
    // Show relevant sections
    this.elements.answerArea.style.display = 'block';
    this.elements.visualizationContainer.style.display = 'block';
    this.elements.feedbackArea.style.display = 'none';
    
    // Draw network visualization
    this.drawNetwork(problem);
    
    // Enable buttons
    this.elements.checkAnswer.disabled = false;
    this.elements.getHint.disabled = false;
    this.elements.showSolution.disabled = false;
    this.elements.nextProblem.style.display = 'none';
  }
  
  /**
   * Display problem content
   */
  displayProblem(problem) {
    const html = `
      <div class="problem-content">
        <h2 class="problem-title">${problem.title}</h2>
        <span class="problem-difficulty difficulty-${problem.difficulty}">${problem.difficulty}</span>
        <p class="problem-scenario">${problem.scenario}</p>
        
        <div class="problem-given">
          <h3>Given Information:</h3>
          <table class="given-table">
            <thead>
              <tr>
                <th>Hop</th>
                <th>Bandwidth</th>
                <th>Distance</th>
                <th>Medium</th>
                <th>Processing Delay</th>
                <th>Queuing Delay</th>
              </tr>
            </thead>
            <tbody>
              ${problem.given.hops.map(hop => `
                <tr>
                  <td>${hop.name}</td>
                  <td>${this.formatBandwidth(hop.bandwidth)}</td>
                  <td>${this.formatDistance(hop.distance)}</td>
                  <td>${hop.medium}</td>
                  <td>${hop.processingDelay} ms</td>
                  <td>${hop.queuingDelay} ms</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <p><strong>Packet Size:</strong> ${problem.given.packetSize} bytes</p>
          ${problem.given.propagationSpeed ? `
          <p><strong>Propagation Speeds:</strong></p>
          <ul style="list-style: none; padding-left: 0;">
            ${Object.entries(problem.given.propagationSpeed).map(([medium, speed]) => `
              <li>${medium}: ${(speed/1e8).toFixed(0)}×10⁸ m/s</li>
            `).join('')}
          </ul>
          ` : ''}
        </div>
        
        <div class="problem-question">
          <h3>Question:</h3>
          <p>${problem.question}</p>
        </div>
      </div>
    `;
    
    this.elements.problemDisplay.innerHTML = html;
  }
  
  /**
   * Draw network visualization
   */
  drawNetwork(problem) {
    const canvas = this.elements.canvas;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    const width = rect.width;
    const height = rect.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Calculate positions
    const hops = problem.given.hops;
    const nodeCount = hops.length + 1; // Include destination
    const spacing = width / (nodeCount + 1);
    const y = height / 2;
    
    // Draw links
    ctx.strokeStyle = '#95a5a6';
    ctx.lineWidth = 2;
    
    for (let i = 0; i < hops.length; i++) {
      const x1 = spacing * (i + 1);
      const x2 = spacing * (i + 2);
      
      ctx.beginPath();
      ctx.moveTo(x1 + 25, y);
      ctx.lineTo(x2 - 25, y);
      ctx.stroke();
      
      // Draw link label
      ctx.fillStyle = '#7f8c8d';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(
        `${this.formatBandwidth(hops[i].bandwidth)}`,
        (x1 + x2) / 2,
        y - 20
      );
      ctx.fillText(
        `${this.formatDistance(hops[i].distance)}`,
        (x1 + x2) / 2,
        y + 30
      );
    }
    
    // Draw nodes
    const nodeLabels = ['Source', ...hops.map(h => h.name.split(' ')[0]), 'Dest'];
    
    nodeLabels.forEach((label, i) => {
      const x = spacing * (i + 1);
      
      // Node circle
      ctx.beginPath();
      ctx.arc(x, y, 25, 0, Math.PI * 2);
      ctx.fillStyle = i === 0 ? '#3498db' : i === nodeLabels.length - 1 ? '#27ae60' : '#e67e22';
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 3;
      ctx.stroke();
      
      // Node label
      ctx.fillStyle = 'white';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, x, y);
    });
  }
  
  /**
   * Reset answer area
   */
  resetAnswerArea() {
    this.elements.transmissionInput.value = '';
    this.elements.propagationInput.value = '';
    this.elements.processingInput.value = '';
    this.elements.queuingInput.value = '';
    this.elements.totalInput.value = '';
    
    // Remove validation classes
    [this.elements.transmissionInput, this.elements.propagationInput,
     this.elements.processingInput, this.elements.queuingInput].forEach(input => {
      input.classList.remove('correct', 'incorrect');
    });
  }
  
  /**
   * Update total based on component inputs
   */
  updateTotal() {
    const transmission = parseFloat(this.elements.transmissionInput.value) || 0;
    const propagation = parseFloat(this.elements.propagationInput.value) || 0;
    const processing = parseFloat(this.elements.processingInput.value) || 0;
    const queuing = parseFloat(this.elements.queuingInput.value) || 0;
    
    const total = transmission + propagation + processing + queuing;
    this.elements.totalInput.value = total.toFixed(3);
  }
  
  /**
   * Check the student's answer
   */
  checkAnswer() {
    const answer = {
      transmission: parseFloat(this.elements.transmissionInput.value) || 0,
      propagation: parseFloat(this.elements.propagationInput.value) || 0,
      processing: parseFloat(this.elements.processingInput.value) || 0,
      queuing: parseFloat(this.elements.queuingInput.value) || 0,
      total: parseFloat(this.elements.totalInput.value) || 0
    };
    
    const result = this.engine.checkAnswer(answer);
    
    // Update input styles
    if (result.componentResults) {
      Object.entries(result.componentResults).forEach(([component, res]) => {
        const input = this.elements[`${component}Input`];
        if (res.correct) {
          input.classList.remove('incorrect');
          input.classList.add('correct');
        } else {
          input.classList.remove('correct');
          input.classList.add('incorrect');
        }
      });
    }
    
    // Show feedback
    this.showFeedback(result);
    
    // Update stats
    this.updateStats();
    
    // Show next problem button if correct
    if (result.correct) {
      this.elements.checkAnswer.disabled = true;
      this.elements.nextProblem.style.display = 'inline-block';
    }
  }
  
  /**
   * Get a hint
   */
  getHint() {
    const hint = this.engine.getHint(this.currentHintLevel);
    this.currentHintLevel++;
    
    this.showFeedback({
      feedback: hint,
      type: 'hint'
    });
  }
  
  /**
   * Show the full solution
   */
  showSolution() {
    const solution = this.engine.generateSolutionHint();
    const expected = this.engine.calculateExpectedAnswer(this.engine.currentProblem);
    
    // Fill in the correct answers
    this.elements.transmissionInput.value = expected.components.transmission.toFixed(3);
    this.elements.propagationInput.value = expected.components.propagation.toFixed(3);
    this.elements.processingInput.value = expected.components.processing.toFixed(3);
    this.elements.queuingInput.value = expected.components.queuing.toFixed(3);
    this.updateTotal();
    
    // Mark all as correct
    [this.elements.transmissionInput, this.elements.propagationInput,
     this.elements.processingInput, this.elements.queuingInput].forEach(input => {
      input.classList.remove('incorrect');
      input.classList.add('correct');
    });
    
    this.showFeedback({
      feedback: solution,
      type: 'solution'
    });
    
    // Disable check answer
    this.elements.checkAnswer.disabled = true;
    this.elements.nextProblem.style.display = 'inline-block';
  }
  
  /**
   * Show feedback to the student
   */
  showFeedback(result) {
    this.elements.feedbackArea.style.display = 'block';
    this.elements.feedbackContent.textContent = result.feedback;
    
    // Style based on type
    this.elements.feedbackArea.classList.remove('feedback-success', 'feedback-error', 'feedback-hint');
    
    if (result.correct) {
      this.elements.feedbackArea.classList.add('feedback-success');
    } else if (result.type === 'hint') {
      this.elements.feedbackArea.classList.add('feedback-hint');
    } else if (result.type === 'solution') {
      this.elements.feedbackArea.classList.add('feedback-hint');
    } else {
      this.elements.feedbackArea.classList.add('feedback-error');
    }
  }
  
  /**
   * Load next problem
   */
  nextProblem() {
    // Find next problem in list
    const currentId = this.engine.currentProblem?.id;
    const currentIndex = this.problems.findIndex(p => p.id === currentId);
    
    if (currentIndex < this.problems.length - 1) {
      const nextProblem = this.problems[currentIndex + 1];
      this.elements.problemSelect.value = nextProblem.id;
      this.loadProblem(nextProblem.id);
    } else {
      // No more problems
      this.showFeedback({
        feedback: '🎉 Congratulations! You\'ve completed all available problems!',
        correct: true
      });
      this.elements.nextProblem.style.display = 'none';
    }
  }
  
  /**
   * Update statistics display
   */
  updateStats() {
    const stats = this.engine.getStatistics();
    
    this.elements.score.textContent = stats.totalScore;
    this.elements.streak.textContent = stats.currentStreak;
    this.elements.accuracy.textContent = stats.accuracy.toFixed(0) + '%';
    this.elements.problemsSolved.textContent = stats.correctAnswers + '/' + stats.totalProblems;
    
    if (stats.averageTime > 0) {
      const minutes = Math.floor(stats.averageTime / 60);
      const seconds = Math.floor(stats.averageTime % 60);
      this.elements.avgTime.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    } else {
      this.elements.avgTime.textContent = '--';
    }
  }
  
  /**
   * Format bandwidth for display
   */
  formatBandwidth(bps) {
    if (bps >= 1e9) return `${(bps / 1e9).toFixed(1)} Gbps`;
    if (bps >= 1e6) return `${(bps / 1e6).toFixed(1)} Mbps`;
    if (bps >= 1e3) return `${(bps / 1e3).toFixed(1)} Kbps`;
    return `${bps} bps`;
  }
  
  /**
   * Format distance for display
   */
  formatDistance(meters) {
    if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
    if (meters < 1) return `${(meters * 100).toFixed(1)} cm`;
    return `${meters.toFixed(1)} m`;
  }
}