/**
 * LatencyPracticeCalculator - Wrapper around shared utilities for the practice demo
 * Provides problem-specific functionality while delegating core calculations to shared utilities
 */

import { DelayCalculator } from '../../../shared/utils/DelayCalculator.js';
import { NetworkFormatter } from '../../../shared/utils/NetworkFormatter.js';

export class LatencyPracticeCalculator {
  constructor() {
    // Use shared utilities
    this.calculator = DelayCalculator;
    this.formatter = NetworkFormatter;
    
    // Problem-specific configuration
    this.tolerance = 0.05; // 5% tolerance by default
    this.problemTemplates = this.initializeProblemTemplates();
  }
  
  /**
   * Generate a problem based on difficulty
   */
  generateProblem(difficulty) {
    const templates = this.problemTemplates[difficulty];
    if (!templates || templates.length === 0) {
      throw new Error(`No templates available for difficulty: ${difficulty}`);
    }
    
    // Randomly select a template
    const template = templates[Math.floor(Math.random() * templates.length)];
    const problem = template.generate();
    
    // Calculate the solution using shared utilities
    problem.solution = this.calculateSolution(problem);
    
    return problem;
  }
  
  /**
   * Calculate the solution for a problem
   */
  calculateSolution(problem) {
    const result = {
      components: {
        transmission: 0,
        propagation: 0,
        processing: 0,
        queuing: 0
      },
      perHop: [],
      total: 0
    };
    
    // Process each hop
    problem.given.hops.forEach((hop, index) => {
      // Use shared DelayCalculator for consistent calculations
      const delays = DelayCalculator.calculateHopDelays(hop, problem.given.packetSize);
      
      // If explicit delays are provided in the problem, use those
      if (hop.processingDelay !== undefined) {
        delays.processing = hop.processingDelay;
      }
      if (hop.queuingDelay !== undefined) {
        delays.queuing = hop.queuingDelay;
      }
      
      // Accumulate components
      result.components.transmission += delays.transmission;
      result.components.propagation += delays.propagation;
      result.components.processing += delays.processing;
      result.components.queuing += delays.queuing;
      
      // Store per-hop breakdown
      result.perHop.push({
        name: hop.name || `Hop ${index + 1}`,
        ...delays,
        total: delays.transmission + delays.propagation + delays.processing + delays.queuing
      });
    });
    
    // Calculate total
    result.total = Object.values(result.components).reduce((sum, val) => sum + val, 0);
    
    // Find dominant component
    result.dominant = this.findDominantComponent(result.components);
    
    return result;
  }
  
  /**
   * Check student's answer against the expected solution
   */
  checkAnswer(studentAnswer, expectedSolution, tolerance = null) {
    const tol = tolerance || this.tolerance;
    const result = {
      correct: false,
      componentResults: {},
      feedback: []
    };
    
    // Check each component
    ['transmission', 'propagation', 'processing', 'queuing'].forEach(component => {
      if (studentAnswer[component] !== undefined) {
        const expected = expectedSolution.components[component];
        const actual = studentAnswer[component];
        
        let isCorrect = false;
        if (expected === 0) {
          isCorrect = actual === 0;
        } else if (expected > 0 && actual === 0) {
          // Student entered 0 for non-zero value - always wrong
          isCorrect = false;
        } else {
          const diff = Math.abs(actual - expected);
          const percentError = (diff / expected) * 100;
          isCorrect = diff <= tol || percentError <= 5; // Within tolerance or 5%
        }
        
        result.componentResults[component] = {
          correct: isCorrect,
          expected: expected,
          actual: actual,
          difference: diff,
          percentError: percentError
        };
        
        if (!isCorrect) {
          result.feedback.push(
            `${component.charAt(0).toUpperCase() + component.slice(1)} delay: ` +
            `Expected ${this.formatter.time(expected)}, got ${this.formatter.time(actual)}`
          );
        }
      }
    });
    
    // Check total
    if (studentAnswer.total !== undefined) {
      const totalDiff = Math.abs(studentAnswer.total - expectedSolution.total);
      const totalPercentError = expectedSolution.total > 0 ? 
        (totalDiff / expectedSolution.total) * 100 : 0;
      
      if (expectedSolution.total === 0) {
        result.correct = studentAnswer.total === 0;
      } else if (expectedSolution.total > 0 && studentAnswer.total === 0) {
        result.correct = false;
      } else {
        result.correct = totalDiff <= tol || totalPercentError <= 5;
      }
      result.totalDifference = totalDiff;
      result.totalPercentError = totalPercentError;
      
      if (!result.correct) {
        result.feedback.push(
          `Total latency: Expected ${this.formatter.time(expectedSolution.total)}, ` +
          `got ${this.formatter.time(studentAnswer.total)}`
        );
      }
    }
    
    // Generate success feedback if correct
    if (result.correct) {
      result.feedback = ['Correct! Well done.'];
    }
    
    return result;
  }
  
  /**
   * Find which component contributes most to delay
   */
  findDominantComponent(components) {
    let maxValue = 0;
    let dominantComponent = 'transmission';
    
    Object.entries(components).forEach(([key, value]) => {
      if (value > maxValue) {
        maxValue = value;
        dominantComponent = key;
      }
    });
    
    return {
      component: dominantComponent,
      value: maxValue,
      percentage: (maxValue / Object.values(components).reduce((a, b) => a + b, 0)) * 100
    };
  }
  
  /**
   * Generate a hint for a specific component
   */
  generateHint(problem, component) {
    const hop = problem.given.hops[0]; // Use first hop for simple problems
    const packetSizeBits = problem.given.packetSize * 8;
    
    // Calculate all delays using the available method
    const delays = DelayCalculator.calculateHopDelays(hop, problem.given.packetSize);
    
    const hints = {
      transmission: {
        formula: 'Transmission Delay = Packet Size (bits) ÷ Bandwidth (bps)',
        calculation: `${problem.given.packetSize} bytes × 8 = ${packetSizeBits} bits\n` +
                    `${packetSizeBits} ÷ ${this.formatter.bandwidth(hop.bandwidth)} = ` +
                    `${this.formatter.time(delays.transmission)}`
      },
      propagation: {
        formula: 'Propagation Delay = Distance ÷ Speed',
        calculation: `${this.formatter.distance(hop.distance)} ÷ ` +
                    `${hop.medium === 'satellite' || hop.medium === 'wireless' ? '3×10⁸' : '2×10⁸'} m/s = ` +
                    `${this.formatter.time(delays.propagation)}`
      },
      processing: {
        formula: 'Processing Delay = Device-specific delay',
        calculation: hop.processingDelay !== undefined ?
          `Given: ${this.formatter.time(hop.processingDelay)}` :
          `Estimated: ${this.formatter.time(delays.processing)}`
      },
      queuing: {
        formula: 'Queuing Delay = (1/(1-u)³ - 1) ms where u = utilization',
        calculation: hop.queuingDelay !== undefined ?
          `Given: ${this.formatter.time(hop.queuingDelay)}` :
          `Utilization: ${Math.round((hop.utilization || 0) * 100)}%\n` +
          `Queuing: ${this.formatter.time(delays.queuing)}`
      }
    };
    
    return hints[component] || { formula: 'Unknown component', calculation: '' };
  }
  
  /**
   * Calculate score based on problem difficulty and attempts
   */
  calculateScore(problem, attempts, hintsUsed) {
    const baseScores = {
      beginner: 10,
      intermediate: 20,
      advanced: 30
    };
    
    let score = baseScores[problem.difficulty] || 10;
    
    // Reduce score for multiple attempts
    score = Math.max(score - (attempts - 1) * 2, 5);
    
    // Reduce score for hints used
    score = Math.max(score - hintsUsed * 3, 5);
    
    return Math.round(score);
  }
  
  /**
   * Initialize problem templates
   */
  initializeProblemTemplates() {
    return {
      beginner: [
        {
          name: 'Single Hop LAN',
          generate: () => ({
            type: 'calculate-total',
            difficulty: 'beginner',
            title: 'Local Network Transfer',
            scenario: 'Calculate latency for a single hop in a local network.',
            given: {
              hops: [{
                name: 'Host to Switch',
                bandwidth: 1e9, // 1 Gbps
                distance: 20,
                medium: 'copper',
                processingDelay: 0.01,
                queuingDelay: 0
              }],
              packetSize: 1500
            },
            question: 'What is the total latency for this packet?'
          })
        },
        {
          name: 'WiFi Connection',
          generate: () => ({
            type: 'calculate-total',
            difficulty: 'beginner',
            title: 'WiFi Latency',
            scenario: 'Calculate latency for a WiFi connection.',
            given: {
              hops: [{
                name: 'Laptop to Router',
                bandwidth: 100e6, // 100 Mbps
                distance: 10,
                medium: 'wireless',
                processingDelay: 0.1,
                queuingDelay: 0.2
              }],
              packetSize: 1500
            },
            question: 'What is the total latency?'
          })
        }
      ],
      intermediate: [
        {
          name: 'Multi-hop Path',
          generate: () => ({
            type: 'calculate-total',
            difficulty: 'intermediate',
            title: 'Internet Path',
            scenario: 'Calculate end-to-end latency across multiple hops.',
            given: {
              hops: [
                {
                  name: 'Client to Router',
                  bandwidth: 100e6,
                  distance: 5,
                  medium: 'copper',
                  processingDelay: 0.1,
                  queuingDelay: 0.1
                },
                {
                  name: 'Router to ISP',
                  bandwidth: 1e9,
                  distance: 5000,
                  medium: 'fiber',
                  processingDelay: 0.5,
                  queuingDelay: 2
                },
                {
                  name: 'ISP to Server',
                  bandwidth: 10e9,
                  distance: 50000,
                  medium: 'fiber',
                  processingDelay: 0.01,
                  queuingDelay: 0.5
                }
              ],
              packetSize: 1500
            },
            question: 'Calculate the total end-to-end latency.'
          })
        }
      ],
      advanced: [
        {
          name: 'Satellite Connection',
          generate: () => ({
            type: 'calculate-total',
            difficulty: 'advanced',
            title: 'Satellite Internet',
            scenario: 'Calculate latency for a satellite internet connection.',
            given: {
              hops: [
                {
                  name: 'Home to Satellite',
                  bandwidth: 25e6,
                  distance: 35786000, // Geostationary orbit
                  medium: 'satellite',
                  processingDelay: 1,
                  queuingDelay: 5
                },
                {
                  name: 'Satellite to Ground Station',
                  bandwidth: 25e6,
                  distance: 35786000,
                  medium: 'satellite',
                  processingDelay: 1,
                  queuingDelay: 3
                }
              ],
              packetSize: 1500
            },
            question: 'What is the total round-trip latency?'
          })
        }
      ]
    };
  }
  
  /**
   * Format delay components for display
   */
  formatDelayBreakdown(solution) {
    const components = solution.components;
    const total = solution.total;
    
    return {
      transmission: {
        value: this.formatter.time(components.transmission),
        percentage: ((components.transmission / total) * 100).toFixed(1) + '%'
      },
      propagation: {
        value: this.formatter.time(components.propagation),
        percentage: ((components.propagation / total) * 100).toFixed(1) + '%'
      },
      processing: {
        value: this.formatter.time(components.processing),
        percentage: ((components.processing / total) * 100).toFixed(1) + '%'
      },
      queuing: {
        value: this.formatter.time(components.queuing),
        percentage: ((components.queuing / total) * 100).toFixed(1) + '%'
      },
      total: {
        value: this.formatter.time(total),
        percentage: '100%'
      }
    };
  }
}