/**
 * Problem Engine for generating and managing latency practice problems
 */
import { LatencyCalculator, NetworkHop } from './LatencyCalculator.js';

export class ProblemEngine {
  constructor() {
    this.calculator = new LatencyCalculator();
    this.currentProblem = null;
    this.problemHistory = [];
    this.score = 0;
    this.streak = 0;
  }
  
  /**
   * Load a specific problem
   */
  loadProblem(problem) {
    this.currentProblem = problem;
    this.currentProblem.startTime = Date.now();
    this.currentProblem.attempts = [];
    this.currentProblem.hintsUsed = 0;
    return this.currentProblem;
  }
  
  /**
   * Check student's answer
   */
  checkAnswer(studentAnswer, problemId = null) {
    const problem = problemId ? this.getProblemById(problemId) : this.currentProblem;
    if (!problem) return { correct: false, error: 'No problem loaded' };
    
    const result = {
      correct: false,
      feedback: '',
      expected: null,
      actual: studentAnswer,
      score: 0
    };
    
    // Record attempt
    problem.attempts.push({
      answer: studentAnswer,
      timestamp: Date.now()
    });
    
    // Calculate expected answer if needed
    if (problem.type === 'calculate-total') {
      const expected = this.calculateExpectedAnswer(problem);
      result.expected = expected;
      
      // Check each component
      const tolerance = problem.tolerance || 0.1;
      result.componentResults = {};
      
      ['transmission', 'propagation', 'processing', 'queuing'].forEach(component => {
        if (studentAnswer[component] !== undefined) {
          const diff = Math.abs(studentAnswer[component] - expected.components[component]);
          result.componentResults[component] = {
            correct: diff <= tolerance,
            expected: expected.components[component],
            actual: studentAnswer[component],
            difference: diff
          };
        }
      });
      
      // Check total
      if (studentAnswer.total !== undefined) {
        const totalDiff = Math.abs(studentAnswer.total - expected.total);
        result.correct = totalDiff <= tolerance;
        result.totalDifference = totalDiff;
      }
      
      // Generate feedback
      result.feedback = this.generateFeedback(result, problem);
      
      // Calculate score
      if (result.correct) {
        result.score = this.calculateScore(problem);
        this.score += result.score;
        this.streak++;
      } else {
        this.streak = 0;
      }
    }
    
    // Record result
    problem.completed = true;
    problem.correct = result.correct;
    problem.timeSpent = Date.now() - problem.startTime;
    this.problemHistory.push(problem);
    
    return result;
  }
  
  /**
   * Calculate the expected answer for a problem
   */
  calculateExpectedAnswer(problem) {
    const hops = problem.given.hops.map(hop => ({
      ...hop,
      // Ensure explicit values are used
      processingDelay: hop.processingDelay,
      queuingDelay: hop.queuingDelay
    }));
    return this.calculator.calculateTotalLatency(hops, problem.given.packetSize, problem.given.propagationSpeed);
  }
  
  /**
   * Generate feedback based on the answer
   */
  generateFeedback(result, problem) {
    const feedback = [];
    
    if (result.correct) {
      feedback.push('✅ Correct! Well done!');
      
      if (problem.attempts.length === 1) {
        feedback.push('Perfect on the first try! 🌟');
      }
      
      if (result.expected.dominant) {
        feedback.push(`Note: ${result.expected.dominant.component} delay was dominant (${this.calculator.formatDelay(result.expected.dominant.value)})`);
      }
    } else {
      feedback.push('❌ Not quite right. Let\'s review:');
      
      // Identify which components are wrong
      const errors = [];
      Object.entries(result.componentResults || {}).forEach(([component, res]) => {
        if (!res.correct) {
          errors.push(`${component}: Expected ${res.expected.toFixed(3)}ms, got ${res.actual.toFixed(3)}ms`);
        }
      });
      
      if (errors.length > 0) {
        feedback.push('Component errors:');
        feedback.push(...errors);
      }
      
      // Provide hints based on common mistakes
      const hints = this.identifyCommonMistakes(result, problem);
      if (hints.length > 0) {
        feedback.push('Common issues to check:');
        feedback.push(...hints);
      }
    }
    
    return feedback.join('\n');
  }
  
  /**
   * Identify common mistakes
   */
  identifyCommonMistakes(result, problem) {
    const hints = [];
    
    if (result.componentResults) {
      // Check for unit conversion errors
      const transmissionError = result.componentResults.transmission;
      if (transmissionError && !transmissionError.correct) {
        const ratio = transmissionError.actual / transmissionError.expected;
        if (Math.abs(ratio - 1000) < 10 || Math.abs(ratio - 0.001) < 0.01) {
          hints.push('• Check your unit conversions (bits vs bytes, ms vs s)');
        }
      }
      
      // Check for missing components
      const missingComponents = ['transmission', 'propagation', 'processing', 'queuing']
        .filter(c => result.componentResults[c]?.actual === 0 && result.expected.components[c] > 0.01);
      
      if (missingComponents.length > 0) {
        hints.push(`• Don't forget to calculate: ${missingComponents.join(', ')}`);
      }
      
      // Check for wrong propagation speed
      const propError = result.componentResults.propagation;
      if (propError && !propError.correct) {
        const ratio = propError.actual / propError.expected;
        if (Math.abs(ratio - 1.5) < 0.2) {
          hints.push('• Check the propagation speed for the medium (WiFi is slower than fiber)');
        }
      }
    }
    
    return hints;
  }
  
  /**
   * Calculate score for a correct answer
   */
  calculateScore(problem) {
    let score = 10; // Base score
    
    // Difficulty bonus
    const difficultyMultiplier = {
      'beginner': 1,
      'intermediate': 1.5,
      'advanced': 2
    };
    score *= difficultyMultiplier[problem.difficulty] || 1;
    
    // Speed bonus
    const timeMinutes = problem.timeSpent / 60000;
    if (timeMinutes < 1) {
      score *= 1.5; // 50% bonus for quick solve
    } else if (timeMinutes < 2) {
      score *= 1.2; // 20% bonus
    }
    
    // Streak bonus
    score += Math.min(this.streak * 2, 10);
    
    // Penalty for hints
    score -= problem.hintsUsed * 2;
    
    return Math.max(Math.round(score), 1);
  }
  
  /**
   * Get a hint for the current problem
   */
  getHint(level = 0) {
    if (!this.currentProblem) return 'No problem loaded';
    
    const hints = this.currentProblem.hints || [];
    if (level >= hints.length) {
      return this.generateSolutionHint();
    }
    
    this.currentProblem.hintsUsed++;
    return hints[level];
  }
  
  /**
   * Generate a solution hint showing the calculation
   */
  generateSolutionHint() {
    if (!this.currentProblem) return 'No problem loaded';
    
    const expected = this.calculateExpectedAnswer(this.currentProblem);
    const hints = ['Here\'s how to solve it step by step:\n'];
    
    this.currentProblem.given.hops.forEach((hop, i) => {
      hints.push(`\n**${hop.name || `Hop ${i + 1}`}:**`);
      
      const hopResult = expected.perHop[i];
      
      // Transmission
      hints.push(`• Transmission = ${this.currentProblem.given.packetSize} bytes × 8 bits/byte ÷ ${this.formatBandwidth(hop.bandwidth)}`);
      hints.push(`  = ${hopResult.transmission.toFixed(3)} ms`);
      
      // Propagation
      hints.push(`• Propagation = ${this.formatDistance(hop.distance)} ÷ ${this.formatSpeed(hop.medium)}`);
      hints.push(`  = ${hopResult.propagation.toFixed(3)} ms`);
      
      // Processing
      hints.push(`• Processing = ${hopResult.processing.toFixed(3)} ms`);
      
      // Queuing
      hints.push(`• Queuing = ${hopResult.queuing.toFixed(3)} ms`);
    });
    
    hints.push(`\n**Total = ${expected.total.toFixed(3)} ms**`);
    
    return hints.join('\n');
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
  
  /**
   * Format propagation speed
   */
  formatSpeed(medium) {
    const speeds = {
      'fiber': '2×10⁸ m/s',
      'copper': '2×10⁸ m/s', 
      'wifi': '1.34×10⁸ m/s',
      'satellite': '3×10⁸ m/s'
    };
    return speeds[medium] || '2×10⁸ m/s';
  }
  
  /**
   * Get problem by ID
   */
  getProblemById(id) {
    // This would typically query a database or problem set
    return this.currentProblem?.id === id ? this.currentProblem : null;
  }
  
  /**
   * Get student statistics
   */
  getStatistics() {
    const total = this.problemHistory.length;
    const correct = this.problemHistory.filter(p => p.correct).length;
    
    return {
      totalProblems: total,
      correctAnswers: correct,
      accuracy: total > 0 ? (correct / total) * 100 : 0,
      totalScore: this.score,
      currentStreak: this.streak,
      averageTime: total > 0 
        ? this.problemHistory.reduce((sum, p) => sum + p.timeSpent, 0) / total / 1000
        : 0
    };
  }
}