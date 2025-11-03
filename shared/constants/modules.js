/**
 * Module Configuration
 * Defines all course modules with metadata for navigation and content organization
 */

export const MODULES = [
  {
    number: 1,
    id: 'big-picture',
    title: 'The Big Picture',
    description: 'Internet structure, protocol layers, network performance',
    path: './modules/module1-big-picture/',
    color: '#2563eb',
    lessonCount: 4,
    demoCount: 3,
    practiceCount: 1,
    topics: [
      'Internet structure (edge, core, ISP hierarchy)',
      'Protocol layering and encapsulation',
      'Network performance metrics',
      'Delay and throughput calculations'
    ],
    lessons: [
      { id: '01-internet-structure', title: 'Internet Structure', estimatedTime: '15-20 min' },
      { id: '02-protocol-layers', title: 'Protocol Layers', estimatedTime: '15-20 min' },
      { id: '03-network-performance', title: 'Network Performance', estimatedTime: '15-20 min' },
      { id: '04-delay-throughput', title: 'Delay & Throughput', estimatedTime: '20-25 min' }
    ],
    demos: [
      { id: 'packet-journey', title: 'Packet Journey', estimatedTime: '10-15 min', status: 'ready' },
      { id: 'ladder-diagram', title: 'Ladder Diagram', estimatedTime: '10-15 min', status: 'ready' },
      { id: 'network-topology', title: 'Network Topology Explorer', estimatedTime: '10-15 min', status: 'planned' }
    ],
    practice: [
      { id: 'latency-calculator', title: 'Latency Calculator', estimatedTime: '30-45 min', status: 'ready' }
    ]
  },
  {
    number: 2,
    id: 'application',
    title: 'Application Layer',
    description: 'Application architectures, HTTP, DNS, BitTorrent',
    path: './modules/module2-application/',
    color: '#059669',
    lessonCount: 4,
    demoCount: 3,
    practiceCount: 1,
    topics: [
      'Client-server and P2P architectures',
      'HTTP protocol (requests, responses, methods, headers)',
      'DNS hierarchy and resolution process',
      'BitTorrent protocol and P2P file distribution'
    ],
    lessons: [
      { id: '01-architectures', title: 'Application Architectures', estimatedTime: '15-20 min' },
      { id: '02-http', title: 'HTTP', estimatedTime: '20-25 min' },
      { id: '03-dns', title: 'DNS', estimatedTime: '20-25 min' },
      { id: '04-bittorrent', title: 'BitTorrent', estimatedTime: '15-20 min' }
    ],
    demos: [
      { id: 'http-request-response', title: 'HTTP Request/Response', estimatedTime: '10-15 min', status: 'planned' },
      { id: 'dns-resolution', title: 'DNS Resolution', estimatedTime: '10-15 min', status: 'planned' },
      { id: 'peer-to-peer', title: 'P2P File Sharing', estimatedTime: '10-15 min', status: 'planned' }
    ],
    practice: [
      { id: 'http-dns-problems', title: 'HTTP & DNS Problems', estimatedTime: '30-45 min', status: 'planned' }
    ]
  },
  {
    number: 3,
    id: 'transport',
    title: 'Transport Layer',
    description: 'UDP, reliable data transfer, TCP',
    path: './modules/module3-transport/',
    color: '#7c3aed',
    lessonCount: 4,
    demoCount: 4,
    practiceCount: 1,
    topics: [
      'Transport layer services and multiplexing',
      'UDP protocol',
      'Reliable data transfer principles (rdt 1.0-3.0, pipelining)',
      'TCP connection management, flow control, congestion control'
    ],
    lessons: [
      { id: '01-transport-services', title: 'Transport Layer Services', estimatedTime: '15-20 min' },
      { id: '02-udp', title: 'UDP', estimatedTime: '15-20 min' },
      { id: '03-rdt-principles', title: 'Reliable Data Transfer Principles', estimatedTime: '25-30 min' },
      { id: '04-tcp', title: 'TCP', estimatedTime: '25-30 min' }
    ],
    demos: [
      { id: 'udp-vs-tcp', title: 'UDP vs TCP Comparison', estimatedTime: '10-15 min', status: 'planned' },
      { id: 'rdt-protocols', title: 'RDT Protocols', estimatedTime: '15-20 min', status: 'planned' },
      { id: 'tcp-handshake', title: 'TCP 3-Way Handshake', estimatedTime: '10-15 min', status: 'planned' },
      { id: 'tcp-congestion', title: 'TCP Congestion Control', estimatedTime: '15-20 min', status: 'planned' }
    ],
    practice: [
      { id: 'tcp-scenarios', title: 'TCP Scenarios', estimatedTime: '30-45 min', status: 'planned' }
    ]
  },
  {
    number: 4,
    id: 'network',
    title: 'Network Layer',
    description: 'IPv4, IPv6, routing, NAT, DHCP',
    path: './modules/module4-network/',
    color: '#dc2626',
    lessonCount: 5,
    demoCount: 4,
    practiceCount: 2,
    topics: [
      'Forwarding vs routing',
      'IPv4 and IPv6 addressing, subnetting, CIDR',
      'NAT, DHCP, ICMP protocols',
      'Routing algorithms (Link State, Distance Vector)',
      'Queuing disciplines'
    ],
    lessons: [
      { id: '01-network-layer-overview', title: 'Network Layer Overview', estimatedTime: '15-20 min' },
      { id: '02-ipv4-ipv6', title: 'IPv4, IPv6, and CIDR', estimatedTime: '25-30 min' },
      { id: '03-nat-dhcp', title: 'NAT and DHCP', estimatedTime: '20-25 min' },
      { id: '04-routing-principles', title: 'Routing Principles', estimatedTime: '25-30 min' },
      { id: '05-queuing', title: 'Queuing', estimatedTime: '20-25 min' }
    ],
    demos: [
      { id: 'ip-forwarding', title: 'IP Forwarding', estimatedTime: '10-15 min', status: 'planned' },
      { id: 'routing-algorithms', title: 'Routing Algorithms', estimatedTime: '15-20 min', status: 'planned' },
      { id: 'nat-translation', title: 'NAT Translation', estimatedTime: '10-15 min', status: 'planned' },
      { id: 'queue-management', title: 'Queue Management', estimatedTime: '10-15 min', status: 'planned' }
    ],
    practice: [
      { id: 'subnetting', title: 'Subnetting Calculator', estimatedTime: '30-45 min', status: 'planned' },
      { id: 'routing-tables', title: 'Routing Table Problems', estimatedTime: '30-45 min', status: 'planned' }
    ]
  },
  {
    number: 5,
    id: 'link',
    title: 'Link Layer',
    description: 'Ethernet, switches, spanning tree, ARP, WiFi',
    path: './modules/module5-link/',
    color: '#ea580c',
    lessonCount: 7,
    demoCount: 5,
    practiceCount: 1,
    topics: [
      'Link layer services',
      'Ethernet protocol and frame structure',
      'Self-learning switches and spanning tree protocol',
      'Collision detection and management (CSMA/CD)',
      'Encoding and framing techniques',
      'ARP protocol',
      'WiFi and wireless LANs'
    ],
    lessons: [
      { id: '01-link-layer-overview', title: 'Link Layer Overview', estimatedTime: '15-20 min' },
      { id: '02-ethernet', title: 'Ethernet', estimatedTime: '20-25 min' },
      { id: '03-switches-spanning-tree', title: 'Switches & Spanning Tree', estimatedTime: '25-30 min' },
      { id: '04-collision-management', title: 'Collision Management', estimatedTime: '20-25 min' },
      { id: '05-encoding-framing', title: 'Encoding & Framing', estimatedTime: '20-25 min' },
      { id: '06-arp', title: 'ARP', estimatedTime: '15-20 min' },
      { id: '07-wifi', title: 'WiFi', estimatedTime: '20-25 min' }
    ],
    demos: [
      { id: 'ethernet-frame', title: 'Ethernet Frame Explorer', estimatedTime: '10-15 min', status: 'planned' },
      { id: 'switch-learning', title: 'Switch Learning', estimatedTime: '10-15 min', status: 'planned' },
      { id: 'spanning-tree', title: 'Spanning Tree Protocol', estimatedTime: '15-20 min', status: 'planned' },
      { id: 'csma-cd', title: 'CSMA/CD Simulation', estimatedTime: '10-15 min', status: 'planned' },
      { id: 'arp-resolution', title: 'ARP Resolution', estimatedTime: '10-15 min', status: 'planned' }
    ],
    practice: [
      { id: 'link-layer-scenarios', title: 'Link Layer Scenarios', estimatedTime: '30-45 min', status: 'planned' }
    ]
  },
  {
    number: 6,
    id: 'security',
    title: 'Network Security',
    description: 'Security basics, encryption, authentication',
    path: './modules/module6-security/',
    color: '#1e293b',
    lessonCount: 3,
    demoCount: 3,
    practiceCount: 1,
    topics: [
      'Network security principles (confidentiality, integrity, availability)',
      'Symmetric and asymmetric encryption',
      'Authentication mechanisms',
      'TLS/SSL handshake'
    ],
    lessons: [
      { id: '01-security-basics', title: 'Security Basics', estimatedTime: '15-20 min' },
      { id: '02-encryption', title: 'Encryption', estimatedTime: '25-30 min' },
      { id: '03-authentication', title: 'Authentication', estimatedTime: '20-25 min' }
    ],
    demos: [
      { id: 'symmetric-encryption', title: 'Symmetric Encryption', estimatedTime: '10-15 min', status: 'planned' },
      { id: 'public-key', title: 'Public Key Cryptography', estimatedTime: '15-20 min', status: 'planned' },
      { id: 'tls-handshake', title: 'TLS Handshake', estimatedTime: '15-20 min', status: 'planned' }
    ],
    practice: [
      { id: 'security-scenarios', title: 'Security Scenarios', estimatedTime: '30-45 min', status: 'planned' }
    ]
  }
];

/**
 * Get module by ID
 * @param {string} id - Module ID (e.g., 'big-picture')
 * @returns {Object|undefined} Module object or undefined if not found
 */
export function getModuleById(id) {
  return MODULES.find(m => m.id === id);
}

/**
 * Get module by number
 * @param {number} number - Module number (1-6)
 * @returns {Object|undefined} Module object or undefined if not found
 */
export function getModuleByNumber(number) {
  return MODULES.find(m => m.number === number);
}

/**
 * Get next module
 * @param {number} currentNumber - Current module number
 * @returns {Object|null} Next module object or null if at end
 */
export function getNextModule(currentNumber) {
  return MODULES.find(m => m.number === currentNumber + 1) || null;
}

/**
 * Get previous module
 * @param {number} currentNumber - Current module number
 * @returns {Object|null} Previous module object or null if at beginning
 */
export function getPreviousModule(currentNumber) {
  return MODULES.find(m => m.number === currentNumber - 1) || null;
}

/**
 * Get total activity count for a module
 * @param {number} moduleNumber - Module number
 * @returns {number} Total number of activities (lessons + demos + practice)
 */
export function getModuleActivityCount(moduleNumber) {
  const module = getModuleByNumber(moduleNumber);
  if (!module) return 0;
  return module.lessonCount + module.demoCount + module.practiceCount;
}

/**
 * Get all module numbers
 * @returns {number[]} Array of module numbers
 */
export function getAllModuleNumbers() {
  return MODULES.map(m => m.number);
}

/**
 * Check if a module exists
 * @param {number} moduleNumber - Module number to check
 * @returns {boolean} True if module exists
 */
export function moduleExists(moduleNumber) {
  return MODULES.some(m => m.number === moduleNumber);
}
