/**
 * Configuration-driven practice problems for latency calculations
 * Organized by difficulty level with realistic networking scenarios
 */

export const practiceProblems = {
  beginner: {
    description: 'Single-hop scenarios with straightforward calculations',
    templates: [
      {
        id: 'beginner-home-wifi',
        type: 'calculate-total',
        title: 'Home WiFi Connection',
        generate: () => ({
          scenario: 'Your laptop is connected to your home router via WiFi. The router is 10 meters away.',
          given: {
            hops: [{
              node: 'Laptop → Router',
              nodeType: 'router',
              bandwidth: 100e6, // 100 Mbps
              distance: 10,
              medium: 'wireless',
              processingDelay: 0.1, // ms
              utilization: 0.3
            }],
            packetSize: 1500 // Standard MTU
          },
          question: 'Calculate the total latency for sending a packet.',
          hints: [
            'Start with transmission delay: packet size ÷ bandwidth',
            'WiFi travels at speed of light in air (3×10⁸ m/s)',
            'Processing delay is given as 0.1ms',
            'Queuing delay depends on utilization (30%)'
          ]
        })
      },
      {
        id: 'beginner-ethernet',
        type: 'calculate-total',
        title: 'Gigabit Ethernet Connection',
        generate: () => ({
          scenario: 'Your desktop is connected to a switch with a 5-meter Ethernet cable.',
          given: {
            hops: [{
              node: 'Desktop → Switch',
              nodeType: 'switch',
              bandwidth: 1e9, // 1 Gbps
              distance: 5,
              medium: 'copper',
              processingDelay: 0.002, // 2 μs for switch
              utilization: 0.1
            }],
            packetSize: 1500
          },
          question: 'What is the total latency?',
          hints: [
            'Gigabit = 1,000,000,000 bits per second',
            'Copper cable: signals travel at ~2×10⁸ m/s',
            'Switches have very low processing delay',
            'Low utilization means minimal queuing'
          ]
        })
      },
      {
        id: 'beginner-small-packet',
        type: 'calculate-total',
        title: 'Ping Packet Latency',
        generate: () => ({
          scenario: 'You send a small 64-byte ping packet to your router.',
          given: {
            hops: [{
              node: 'Host → Router',
              nodeType: 'router',
              bandwidth: 100e6, // 100 Mbps
              distance: 3,
              medium: 'copper',
              processingDelay: 0.1,
              utilization: 0.2
            }],
            packetSize: 64 // ICMP ping size
          },
          question: 'Calculate the latency for this small packet.',
          hints: [
            'Small packets have lower transmission delay',
            '64 bytes = 512 bits',
            'Propagation delay is independent of packet size',
            'Processing delay is the same regardless of packet size'
          ]
        })
      }
    ]
  },
  
  intermediate: {
    description: 'Multi-hop paths with varied link types',
    templates: [
      {
        id: 'intermediate-campus',
        type: 'calculate-total',
        title: 'Campus Network Path',
        generate: () => ({
          scenario: 'Data travels from your dorm room to the campus data center.',
          given: {
            hops: [
              {
                node: 'Laptop → Access Point',
                nodeType: 'router',
                bandwidth: 100e6, // 100 Mbps WiFi
                distance: 20,
                medium: 'wireless',
                processingDelay: 0.1,
                utilization: 0.4
              },
              {
                node: 'Access Point → Building Switch',
                nodeType: 'switch',
                bandwidth: 1e9, // 1 Gbps
                distance: 100,
                medium: 'copper',
                processingDelay: 0.002,
                utilization: 0.3
              },
              {
                node: 'Building Switch → Core Router',
                nodeType: 'router',
                bandwidth: 10e9, // 10 Gbps
                distance: 500,
                medium: 'fiber',
                processingDelay: 0.01,
                utilization: 0.5
              },
              {
                node: 'Core Router → Data Center',
                nodeType: 'server',
                bandwidth: 10e9, // 10 Gbps
                distance: 1000,
                medium: 'fiber',
                processingDelay: 0.05,
                utilization: 0.2
              }
            ],
            packetSize: 1500
          },
          question: 'Calculate the end-to-end latency.',
          hints: [
            'Add up delays for each hop',
            'Different media have different propagation speeds',
            'Higher utilization increases queuing delay',
            'Fiber links have very low propagation delay'
          ]
        })
      },
      {
        id: 'intermediate-internet',
        type: 'calculate-total',
        title: 'Internet Path to CDN',
        generate: () => ({
          scenario: 'Accessing a video from a content delivery network.',
          given: {
            hops: [
              {
                node: 'Client → Home Router',
                nodeType: 'router',
                bandwidth: 100e6,
                distance: 5,
                medium: 'copper',
                processingDelay: 0.1,
                utilization: 0.3
              },
              {
                node: 'Home Router → ISP Edge',
                nodeType: 'router',
                bandwidth: 500e6, // 500 Mbps
                distance: 5000, // 5 km
                medium: 'fiber',
                processingDelay: 0.5,
                utilization: 0.6
              },
              {
                node: 'ISP Edge → CDN POP',
                nodeType: 'router',
                bandwidth: 10e9,
                distance: 50000, // 50 km
                medium: 'fiber',
                processingDelay: 0.01,
                utilization: 0.4
              }
            ],
            packetSize: 1500
          },
          question: 'What is the total latency to reach the CDN?',
          hints: [
            'ISP links often have higher utilization',
            'Fiber backbones have high bandwidth but distance matters',
            'CDN POPs are strategically placed to reduce latency',
            'Consider both transmission and propagation for long distances'
          ]
        })
      },
      {
        id: 'intermediate-identify-bottleneck',
        type: 'identify-bottleneck',
        title: 'Find the Bottleneck',
        generate: () => ({
          scenario: 'Identify which hop contributes most to the total delay.',
          given: {
            hops: [
              {
                node: 'Mobile → Cell Tower',
                nodeType: 'router',
                bandwidth: 50e6, // 50 Mbps LTE
                distance: 2000,
                medium: 'wireless',
                processingDelay: 5, // Higher for cellular
                utilization: 0.7 // Congested cell
              },
              {
                node: 'Cell Tower → Core Network',
                nodeType: 'router',
                bandwidth: 10e9,
                distance: 10000,
                medium: 'fiber',
                processingDelay: 0.1,
                utilization: 0.3
              },
              {
                node: 'Core → Internet Exchange',
                nodeType: 'router',
                bandwidth: 100e9,
                distance: 100000,
                medium: 'fiber',
                processingDelay: 0.01,
                utilization: 0.2
              }
            ],
            packetSize: 1500
          },
          question: 'Which hop is the bottleneck and why?',
          hints: [
            'Calculate delay for each hop separately',
            'Consider all four delay components',
            'High utilization dramatically increases queuing delay',
            'Cellular networks often have higher processing delays'
          ]
        })
      }
    ]
  },
  
  advanced: {
    description: 'Complex scenarios with satellite links and congestion',
    templates: [
      {
        id: 'advanced-satellite',
        type: 'calculate-total',
        title: 'Satellite Internet Connection',
        generate: () => ({
          scenario: 'Rural internet via geostationary satellite.',
          given: {
            hops: [
              {
                node: 'Home → Satellite Dish',
                nodeType: 'router',
                bandwidth: 25e6, // 25 Mbps uplink
                distance: 10,
                medium: 'copper',
                processingDelay: 0.5,
                utilization: 0.2
              },
              {
                node: 'Dish → Satellite',
                nodeType: 'satellite',
                bandwidth: 25e6,
                distance: 35786000, // GEO orbit altitude
                medium: 'satellite',
                processingDelay: 10, // Satellite processing
                utilization: 0.5
              },
              {
                node: 'Satellite → Ground Station',
                nodeType: 'router',
                bandwidth: 1e9, // Ground station has more bandwidth
                distance: 35786000,
                medium: 'satellite',
                processingDelay: 2,
                utilization: 0.3
              },
              {
                node: 'Ground Station → Internet',
                nodeType: 'router',
                bandwidth: 10e9,
                distance: 1000,
                medium: 'fiber',
                processingDelay: 0.1,
                utilization: 0.2
              }
            ],
            packetSize: 1500
          },
          question: 'Calculate the one-way latency. Why is satellite internet high-latency?',
          hints: [
            'Geostationary orbit is ~36,000 km above Earth',
            'Radio waves travel at speed of light in vacuum',
            'The propagation delay alone is >100ms each way',
            'Satellite processing adds additional delay'
          ]
        })
      },
      {
        id: 'advanced-congested',
        type: 'calculate-total',
        title: 'Congested Network Path',
        generate: () => ({
          scenario: 'Network path during peak hours with high congestion.',
          given: {
            hops: [
              {
                node: 'Client → Router',
                nodeType: 'router',
                bandwidth: 100e6,
                distance: 5,
                medium: 'copper',
                processingDelay: 0.1,
                utilization: 0.85 // Very high utilization
              },
              {
                node: 'Router → ISP',
                nodeType: 'router',
                bandwidth: 1e9,
                distance: 5000,
                medium: 'fiber',
                processingDelay: 0.5,
                utilization: 0.9 // Congested ISP link
              },
              {
                node: 'ISP → Backbone',
                nodeType: 'router',
                bandwidth: 10e9,
                distance: 50000,
                medium: 'fiber',
                processingDelay: 0.01,
                utilization: 0.7 // Moderate congestion
              }
            ],
            packetSize: 1500
          },
          question: 'Calculate latency under congestion. How does high utilization affect delay?',
          hints: [
            'Queuing delay increases exponentially as utilization approaches 100%',
            'At 90% utilization, queuing delay can be 10x the service time',
            'Use the formula: queuing factor = (1/(1-ρ)³) - 1 where ρ is utilization',
            'Congestion is often the dominant factor in real-world latency'
          ]
        })
      },
      {
        id: 'advanced-global',
        type: 'calculate-total',
        title: 'Transpacific Connection',
        generate: () => ({
          scenario: 'Connection from San Francisco to Tokyo via undersea cable.',
          given: {
            hops: [
              {
                node: 'SF Data Center → Cable Landing',
                nodeType: 'router',
                bandwidth: 100e9, // 100 Gbps
                distance: 50000, // 50 km to coast
                medium: 'fiber',
                processingDelay: 0.01,
                utilization: 0.4
              },
              {
                node: 'Cable Landing → Undersea Repeater 1',
                nodeType: 'repeater',
                bandwidth: 400e9, // Modern undersea cable
                distance: 2000000, // 2000 km
                medium: 'fiber',
                processingDelay: 0.001, // Optical amplification
                utilization: 0.5
              },
              {
                node: 'Repeater 1 → Repeater 2',
                nodeType: 'repeater',
                bandwidth: 400e9,
                distance: 2000000,
                medium: 'fiber',
                processingDelay: 0.001,
                utilization: 0.5
              },
              {
                node: 'Repeater 2 → Japan Landing',
                nodeType: 'repeater',
                bandwidth: 400e9,
                distance: 2000000,
                medium: 'fiber',
                processingDelay: 0.001,
                utilization: 0.5
              },
              {
                node: 'Japan Landing → Tokyo DC',
                nodeType: 'router',
                bandwidth: 100e9,
                distance: 100000, // 100 km inland
                medium: 'fiber',
                processingDelay: 0.01,
                utilization: 0.3
              }
            ],
            packetSize: 1500
          },
          question: 'Calculate transpacific latency. What dominates: transmission or propagation?',
          hints: [
            'Total distance is over 6000 km',
            'Even at 2×10⁸ m/s, propagation takes time',
            'High bandwidth means low transmission delay',
            'For long distances, propagation often dominates'
          ]
        })
      }
    ]
  }
};

/**
 * Get problems by difficulty level
 */
export function getProblemsByDifficulty(difficulty) {
  const problemSet = practiceProblems[difficulty];
  if (!problemSet) {
    throw new Error(`Unknown difficulty level: ${difficulty}`);
  }
  
  return problemSet.templates.map(template => ({
    ...template,
    difficulty,
    description: problemSet.description
  }));
}

/**
 * Get all problems across all difficulties
 */
export function getAllProblems() {
  const allProblems = [];
  
  Object.keys(practiceProblems).forEach(difficulty => {
    const problems = getProblemsByDifficulty(difficulty);
    allProblems.push(...problems);
  });
  
  return allProblems;
}

/**
 * Get a random problem of specified difficulty
 */
export function getRandomProblem(difficulty = null) {
  let problems;
  
  if (difficulty) {
    problems = getProblemsByDifficulty(difficulty);
  } else {
    problems = getAllProblems();
  }
  
  if (problems.length === 0) {
    throw new Error('No problems available');
  }
  
  const randomIndex = Math.floor(Math.random() * problems.length);
  return problems[randomIndex];
}

/**
 * Generate a problem instance from a template
 */
export function generateProblemInstance(templateId) {
  // Find the template across all difficulties
  for (const difficulty of Object.keys(practiceProblems)) {
    const template = practiceProblems[difficulty].templates.find(t => t.id === templateId);
    if (template) {
      const instance = template.generate();
      return {
        ...instance,
        id: templateId,
        title: template.title || instance.title || 'Latency Problem',  // Preserve title
        type: template.type || instance.type || 'calculate-total',      // Preserve type
        difficulty,
        templateId
      };
    }
  }
  
  throw new Error(`Problem template not found: ${templateId}`);
}