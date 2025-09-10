/**
 * ProblemEngineRefactored - Refactored problem engine using shared utilities
 * Manages problem generation, validation, and scoring with configuration-driven approach
 */

import { LatencyPracticeCalculator } from './LatencyPracticeCalculator.js';
import { NetworkFormatter } from '../../../shared/utils/NetworkFormatter.js';
import { 
  practiceProblems, 
  getProblemsByDifficulty, 
  getRandomProblem,
  generateProblemInstance 
} from './configs/practiceProblems.js';

export class ProblemEngineRefactored {
  constructor() {
    this.calculator = new LatencyPracticeCalculator();
    this.formatter = NetworkFormatter;
    
    // Problem state
    this.currentProblem = null;
    this.problemHistory = [];
    
    // Scoring
    this.score = 0;
    this.streak = 0;
    this.statistics = {
      totalAttempts: 0,
      correctAnswers: 0,
      hintsUsed: 0,
      averageTime: 0,
      difficultyBreakdown: {
        beginner: { attempted: 0, correct: 0 },
        intermediate: { attempted: 0, correct: 0 },
        advanced: { attempted: 0, correct: 0 }
      }
    };
  }
  
  /**
   * Load a problem from configuration
   */
  loadProblem(problemConfig) {
    // Generate problem instance from template if needed
    if (typeof problemConfig.generate === 'function') {
      this.currentProblem = {
        ...problemConfig.generate(),
        templateId: problemConfig.id,
        title: problemConfig.title || 'Latency Problem',  // Preserve title from template
        type: problemConfig.type || 'calculate-total',
        difficulty: problemConfig.difficulty || 'beginner'
      };
    } else {
      this.currentProblem = problemConfig;
    }
    
    // Add metadata
    this.currentProblem.startTime = Date.now();
    this.currentProblem.attempts = [];
    this.currentProblem.hintsUsed = 0;
    this.currentProblem.hintsShown = [];
    
    // Calculate solution using shared utilities
    this.currentProblem.solution = this.calculator.calculateSolution(this.currentProblem);
    
    return this.currentProblem;
  }
  
  /**
   * Load a random problem of specified difficulty
   */
  loadRandomProblem(difficulty = null) {
    const problem = getRandomProblem(difficulty);
    return this.loadProblem(problem);
  }
  
  /**
   * Load problem by template ID
   */
  loadProblemById(templateId) {
    const instance = generateProblemInstance(templateId);
    this.currentProblem = {
      ...instance,
      startTime: Date.now(),
      attempts: [],
      hintsUsed: 0,
      hintsShown: []
    };
    
    // Calculate solution
    this.currentProblem.solution = this.calculator.calculateSolution(this.currentProblem);
    
    return this.currentProblem;
  }
  
  /**
   * Check student's answer
   */
  checkAnswer(studentAnswer, isLinkByLinkMode = false) {
    if (!this.currentProblem) {
      return {
        correct: false,
        error: 'No problem loaded'
      };
    }
    
    // Record attempt
    this.currentProblem.attempts.push({
      answer: studentAnswer,
      timestamp: Date.now(),
      mode: isLinkByLinkMode ? 'per-link' : 'total'
    });
    
    // Update statistics
    this.statistics.totalAttempts++;
    const difficulty = this.currentProblem.difficulty;
    this.statistics.difficultyBreakdown[difficulty].attempted++;
    
    // Check answer based on problem type
    let result;
    
    if (this.currentProblem.type === 'calculate-total') {
      if (isLinkByLinkMode && studentAnswer.perLink) {
        result = this.checkPerLinkAnswer(studentAnswer);
      } else {
        result = this.checkCalculationAnswer(studentAnswer);
      }
    } else if (this.currentProblem.type === 'identify-bottleneck') {
      result = this.checkBottleneckAnswer(studentAnswer);
    } else {
      result = {
        correct: false,
        error: 'Unknown problem type'
      };
    }
    
    // Update scoring if correct
    if (result.correct) {
      const earnedScore = this.calculator.calculateScore(
        this.currentProblem,
        this.currentProblem.attempts.length,
        this.currentProblem.hintsUsed
      );
      
      result.score = earnedScore;
      this.score += earnedScore;
      this.streak++;
      
      // Update statistics
      this.statistics.correctAnswers++;
      this.statistics.difficultyBreakdown[difficulty].correct++;
      
      // Calculate time taken
      const timeTaken = Date.now() - this.currentProblem.startTime;
      this.updateAverageTime(timeTaken);
      
      // Add to history
      this.problemHistory.push({
        problem: this.currentProblem,
        result: result,
        timeTaken: timeTaken,
        score: earnedScore
      });
    } else {
      this.streak = 0;
    }
    
    return result;
  }
  
  /**
   * Check per-link answer
   */
  checkPerLinkAnswer(studentAnswer) {
    const tolerance = 0.05; // 5% tolerance in ms
    const feedback = [];
    let allCorrect = true;
    const solution = this.currentProblem.solution;
    
    // Check each link
    solution.perHop.forEach((expectedHop, index) => {
      const studentLink = studentAnswer.perLink[index];
      if (!studentLink) return;
      
      // Check each component
      ['transmission', 'propagation', 'processing', 'queuing'].forEach(component => {
        const expected = expectedHop[component] || 0;
        const actual = studentLink[component] || 0;
        
        let isCorrect = false;
        if (expected === 0) {
          isCorrect = actual === 0;
        } else if (expected > 0 && actual === 0) {
          // Student entered 0 for non-zero value - always wrong
          isCorrect = false;
        } else {
          const diff = Math.abs(actual - expected);
          const percentError = (diff / expected) * 100;
          isCorrect = diff <= tolerance || percentError <= 5;
        }
        
        if (!isCorrect) {
          allCorrect = false;
          feedback.push(
            `${expectedHop.name} - ${component}: Expected ${this.formatter.time(expected)}, got ${this.formatter.time(actual)}`
          );
        }
      });
    });
    
    // Check total
    const expectedTotal = solution.total;
    const actualTotal = studentAnswer.total;
    
    let totalCorrect = false;
    if (expectedTotal === 0) {
      totalCorrect = actualTotal === 0;
    } else if (expectedTotal > 0 && actualTotal === 0) {
      totalCorrect = false;
    } else {
      const totalDiff = Math.abs(actualTotal - expectedTotal);
      const totalPercentError = (totalDiff / expectedTotal) * 100;
      totalCorrect = totalDiff <= tolerance || totalPercentError <= 5;
    }
    
    if (!totalCorrect) {
      allCorrect = false;
      feedback.push(
        `Total: Expected ${this.formatter.time(expectedTotal)}, got ${this.formatter.time(actualTotal)}`
      );
    }
    
    if (allCorrect) {
      return {
        correct: true,
        message: this.getSuccessMessage(),
        feedback: ['Excellent! All link calculations are correct.'],
        breakdown: this.calculator.formatDelayBreakdown(solution)
      };
    } else {
      return {
        correct: false,
        message: 'Some calculations need adjustment.',
        feedback: feedback.length > 0 ? feedback : ['Check your calculations for each link.'],
        hint: 'Review the delay formulas for each component.'
      };
    }
  }
  
  /**
   * Check calculation-type answer
   */
  checkCalculationAnswer(studentAnswer) {
    const solution = this.currentProblem.solution;
    
    // Use the calculator's check answer method
    const result = this.calculator.checkAnswer(
      studentAnswer,
      solution,
      this.currentProblem.tolerance
    );
    
    // Add formatted feedback
    if (result.correct) {
      result.message = this.getSuccessMessage();
      result.breakdown = this.calculator.formatDelayBreakdown(solution);
    } else {
      result.message = 'Not quite right. Check your calculations.';
      result.hint = this.getCalculationHint(result.componentResults);
    }
    
    return result;
  }
  
  /**
   * Check bottleneck identification answer
   */
  checkBottleneckAnswer(studentAnswer) {
    const solution = this.currentProblem.solution;
    
    // Find the actual bottleneck
    let maxDelay = 0;
    let bottleneckIndex = -1;
    let bottleneckComponent = '';
    
    solution.perHop.forEach((hop, index) => {
      if (hop.total > maxDelay) {
        maxDelay = hop.total;
        bottleneckIndex = index;
      }
    });
    
    // Also find which component is dominant
    const dominant = this.calculator.findDominantComponent(solution.components);
    bottleneckComponent = dominant.component;
    
    // Check if student identified correct hop
    const correct = studentAnswer.hopIndex === bottleneckIndex;
    
    return {
      correct: correct,
      expected: {
        hopIndex: bottleneckIndex,
        hopName: solution.perHop[bottleneckIndex].name,
        delay: this.formatter.time(maxDelay),
        component: bottleneckComponent
      },
      actual: studentAnswer,
      message: correct ? 
        `Correct! Hop ${bottleneckIndex + 1} is the bottleneck with ${this.formatter.time(maxDelay)} delay.` :
        `Not quite. The bottleneck is at hop ${bottleneckIndex + 1}, not hop ${studentAnswer.hopIndex + 1}.`,
      breakdown: solution.perHop.map((hop, i) => ({
        name: hop.name,
        delay: this.formatter.time(hop.total),
        isBottleneck: i === bottleneckIndex
      }))
    };
  }
  
  /**
   * Get a hint for the current problem
   */
  getHint() {
    if (!this.currentProblem) {
      return { error: 'No problem loaded' };
    }
    
    // Track hint usage
    this.currentProblem.hintsUsed++;
    this.statistics.hintsUsed++;
    
    // Get next hint
    const hints = this.currentProblem.hints || [];
    const hintIndex = this.currentProblem.hintsShown.length;
    
    if (hintIndex < hints.length) {
      const hint = hints[hintIndex];
      this.currentProblem.hintsShown.push(hint);
      
      return {
        hint: hint,
        hintsRemaining: hints.length - hintIndex - 1,
        component: this.getComponentHint(hintIndex)
      };
    } else {
      // No more hints, provide formula
      return {
        hint: 'No more hints available. Review the formulas:',
        formulas: this.getFormulas()
      };
    }
  }
  
  /**
   * Get component-specific hint
   */
  getComponentHint(hintIndex) {
    const components = ['transmission', 'propagation', 'processing', 'queuing'];
    if (hintIndex < components.length) {
      const component = components[hintIndex];
      return this.calculator.generateHint(this.currentProblem, component);
    }
    return null;
  }
  
  /**
   * Get calculation hint based on errors
   */
  getCalculationHint(componentResults) {
    // Find the component with largest error
    let maxError = 0;
    let errorComponent = null;
    
    Object.entries(componentResults).forEach(([component, result]) => {
      if (!result.correct && result.percentError > maxError) {
        maxError = result.percentError;
        errorComponent = component;
      }
    });
    
    if (errorComponent) {
      return `Check your ${errorComponent} delay calculation. ` +
             `You're off by ${maxError.toFixed(1)}%.`;
    }
    
    return 'Double-check your calculations.';
  }
  
  /**
   * Get formulas for all delay components
   */
  getFormulas() {
    return {
      transmission: 'Packet Size (bits) ÷ Bandwidth (bps)',
      propagation: 'Distance (m) ÷ Propagation Speed (m/s)',
      processing: 'Device-specific processing time',
      queuing: '(1/(1-utilization)³) - 1) × service time',
      total: 'Sum of all four components'
    };
  }
  
  /**
   * Get a success message
   */
  getSuccessMessage() {
    const messages = [
      'Excellent work!',
      'Perfect! Well done.',
      'Correct! Great job.',
      'Spot on! You\'ve got it.',
      'Exactly right! Nice work.',
      `Correct! Streak: ${this.streak}`
    ];
    
    if (this.streak > 5) {
      return `Amazing! ${this.streak} in a row!`;
    }
    
    return messages[Math.floor(Math.random() * messages.length)];
  }
  
  /**
   * Update average time statistic
   */
  updateAverageTime(newTime) {
    const count = this.statistics.correctAnswers;
    const oldAverage = this.statistics.averageTime;
    
    // Calculate new average
    this.statistics.averageTime = ((oldAverage * (count - 1)) + newTime) / count;
  }
  
  /**
   * Get current statistics
   */
  getStatistics() {
    const stats = { ...this.statistics };
    
    // Calculate success rate
    stats.successRate = stats.totalAttempts > 0 ?
      (stats.correctAnswers / stats.totalAttempts * 100).toFixed(1) + '%' :
      'N/A';
    
    // Format average time
    stats.averageTimeFormatted = stats.averageTime > 0 ?
      this.formatTime(stats.averageTime) :
      'N/A';
    
    // Calculate difficulty success rates
    Object.keys(stats.difficultyBreakdown).forEach(difficulty => {
      const breakdown = stats.difficultyBreakdown[difficulty];
      breakdown.successRate = breakdown.attempted > 0 ?
        (breakdown.correct / breakdown.attempted * 100).toFixed(1) + '%' :
        'N/A';
    });
    
    return stats;
  }
  
  /**
   * Format time duration
   */
  formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${seconds}s`;
  }
  
  /**
   * Reset statistics
   */
  resetStatistics() {
    this.score = 0;
    this.streak = 0;
    this.problemHistory = [];
    this.statistics = {
      totalAttempts: 0,
      correctAnswers: 0,
      hintsUsed: 0,
      averageTime: 0,
      difficultyBreakdown: {
        beginner: { attempted: 0, correct: 0 },
        intermediate: { attempted: 0, correct: 0 },
        advanced: { attempted: 0, correct: 0 }
      }
    };
  }
  
  /**
   * Get problem history
   */
  getHistory() {
    return this.problemHistory.map(entry => ({
      title: entry.problem.title,
      difficulty: entry.problem.difficulty,
      correct: entry.result.correct,
      score: entry.score,
      time: this.formatTime(entry.timeTaken),
      attempts: entry.problem.attempts.length,
      hints: entry.problem.hintsUsed
    }));
  }
  
  /**
   * Export results to JSON
   */
  exportResults() {
    return {
      score: this.score,
      statistics: this.getStatistics(),
      history: this.getHistory(),
      timestamp: new Date().toISOString()
    };
  }
}