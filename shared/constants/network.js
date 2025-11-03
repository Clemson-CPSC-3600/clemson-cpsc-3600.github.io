/**
 * Shared network constants for all networking visualizations
 * Provides standard network values and configurations
 */

export const NETWORK = {
  // Propagation speeds (meters per second)
  PROPAGATION_SPEED: {
    VACUUM: 3e8,           // Speed of light in vacuum
    FIBER: 2e8,            // ~66% speed of light
    COPPER: 2e8,           // Similar to fiber for electrical signals
    COAX: 2e8,             // Coaxial cable
    WIRELESS_2_4GHZ: 3e8,  // Radio waves in air (essentially c)
    WIRELESS_5GHZ: 3e8,    // Radio waves in air
    SATELLITE: 3e8,        // Radio waves to satellite
    INFRARED: 3e8,         // Infrared in air
    DEFAULT: 2e8           // Default assumption
  },
  
  // Standard bandwidths (bits per second)
  BANDWIDTH: {
    // Ethernet standards
    ETHERNET_10: 10e6,        // 10 Mbps (10BASE-T)
    ETHERNET_100: 100e6,      // 100 Mbps (Fast Ethernet)
    ETHERNET_1G: 1e9,         // 1 Gbps (Gigabit Ethernet)
    ETHERNET_10G: 10e9,       // 10 Gbps
    ETHERNET_40G: 40e9,       // 40 Gbps
    ETHERNET_100G: 100e9,     // 100 Gbps
    
    // WiFi standards
    WIFI_B: 11e6,            // 802.11b - 11 Mbps
    WIFI_G: 54e6,            // 802.11g - 54 Mbps
    WIFI_N_2_4: 150e6,       // 802.11n 2.4GHz - up to 150 Mbps
    WIFI_N_5: 600e6,         // 802.11n 5GHz - up to 600 Mbps
    WIFI_AC: 1.3e9,          // 802.11ac - up to 1.3 Gbps
    WIFI_AX: 9.6e9,          // 802.11ax (WiFi 6) - up to 9.6 Gbps
    
    // Mobile networks
    MOBILE_2G: 64e3,         // 64 Kbps (GPRS)
    MOBILE_3G: 2e6,          // 2 Mbps (3G UMTS)
    MOBILE_4G: 100e6,        // 100 Mbps (4G LTE)
    MOBILE_5G: 10e9,         // 10 Gbps (5G theoretical)
    
    // WAN connections
    T1: 1.544e6,             // T1 line
    T3: 44.736e6,            // T3 line
    OC3: 155.52e6,           // OC-3
    OC12: 622.08e6,          // OC-12
    OC48: 2.488e9,           // OC-48
    OC192: 9.953e9,          // OC-192
    
    // Home/Office connections
    DSL_BASIC: 1e6,          // 1 Mbps
    DSL_STANDARD: 10e6,      // 10 Mbps
    CABLE_BASIC: 25e6,       // 25 Mbps
    CABLE_STANDARD: 100e6,   // 100 Mbps
    CABLE_PREMIUM: 1e9,      // 1 Gbps
    FIBER_HOME: 1e9,         // 1 Gbps FTTH
    
    // Legacy
    DIALUP: 56e3,            // 56K dialup
    ISDN: 128e3              // ISDN
  },
  
  // Standard packet sizes (bytes)
  PACKET_SIZE: {
    // Ethernet
    ETHERNET_MIN: 64,         // Minimum Ethernet frame
    ETHERNET_MAX: 1518,       // Maximum Ethernet frame
    ETHERNET_JUMBO: 9000,     // Jumbo frame
    ETHERNET_SUPER_JUMBO: 16000, // Super jumbo frame
    
    // IP
    IP_MIN: 20,              // IP header only
    IP_MAX: 65535,           // Maximum IP packet
    
    // Common MTUs
    MTU_ETHERNET: 1500,      // Standard Ethernet MTU
    MTU_WIFI: 2304,          // WiFi MTU
    MTU_PPPOEDS: 1492,       // PPPoE DSL
    MTU_VPN: 1400,           // Common VPN MTU
    MTU_IPV6_MIN: 1280,      // IPv6 minimum MTU
    
    // Application layer
    TCP_SEGMENT: 1460,       // TCP segment (1500 - 40 bytes headers)
    UDP_TYPICAL: 512,        // Typical UDP packet
    DNS_QUERY: 512,          // Standard DNS query
    HTTP_REQUEST: 1024,      // Typical HTTP request
    VIDEO_CHUNK: 1400,       // Video streaming chunk
    VOIP_PACKET: 160,        // VoIP packet (20ms audio)
    
    // Default for simulations
    DEFAULT: 1500
  },
  
  // Standard delays (milliseconds)
  DELAYS: {
    // Processing delays
    SWITCH_PROCESSING: 0.01,    // L2 switch
    ROUTER_PROCESSING: 0.5,     // L3 router
    FIREWALL_PROCESSING: 1,     // Firewall inspection
    LOADBALANCER_PROCESSING: 0.5, // Load balancer
    PROXY_PROCESSING: 2,        // Proxy server
    
    // Typical queuing delays
    QUEUING_NONE: 0,
    QUEUING_LIGHT: 0.5,
    QUEUING_MODERATE: 2,
    QUEUING_HEAVY: 10,
    QUEUING_CONGESTED: 50,
    
    // Typical one-way latencies
    LAN: 1,                    // Local network
    METRO: 5,                  // Metropolitan area
    REGIONAL: 20,              // Regional (same country)
    CONTINENTAL: 50,           // Cross-continental
    INTERCONTINENTAL: 150,     // Between continents
    SATELLITE: 500,            // Geostationary satellite
    
    // Application response times
    DNS_LOOKUP: 20,
    TCP_HANDSHAKE: 30,
    HTTP_REQUEST: 100,
    DATABASE_QUERY: 5,
    API_CALL: 50
  },
  
  // Distance references (meters)
  DISTANCES: {
    // Local
    DESK_TO_DESK: 5,
    ROOM_TO_ROOM: 20,
    FLOOR_TO_FLOOR: 50,
    BUILDING_TO_BUILDING: 200,
    CAMPUS: 1000,
    
    // Metropolitan
    CITY_BLOCK: 200,
    NEIGHBORHOOD: 2000,
    CITY: 20000,
    METRO_AREA: 50000,
    
    // Regional/National
    STATE: 500000,
    REGION: 1000000,
    COAST_TO_COAST_US: 4500000,
    
    // International
    TRANSATLANTIC: 6000000,
    TRANSPACIFIC: 10000000,
    EARTH_CIRCUMFERENCE: 40075000,
    GEOSTATIONARY_ORBIT: 35786000
  },
  
  // Protocol overhead (bytes)
  OVERHEAD: {
    // Layer 2
    ETHERNET: 18,             // Ethernet header + trailer
    WIFI: 30,                 // WiFi header
    
    // Layer 3
    IPV4: 20,                 // IPv4 header
    IPV6: 40,                 // IPv6 header
    
    // Layer 4
    TCP: 20,                  // TCP header (without options)
    TCP_OPTIONS: 40,          // TCP header with options
    UDP: 8,                   // UDP header
    
    // Combined common overheads
    ETHERNET_IPV4_TCP: 58,    // Ethernet + IPv4 + TCP
    ETHERNET_IPV4_UDP: 46,    // Ethernet + IPv4 + UDP
    ETHERNET_IPV6_TCP: 78,    // Ethernet + IPv6 + TCP
    ETHERNET_IPV6_UDP: 66,    // Ethernet + IPv6 + UDP
    
    // VPN/Tunnel overhead
    IPSEC: 50,                // IPSec overhead
    GRE: 24,                  // GRE tunnel
    VXLAN: 50,                // VXLAN encapsulation
    MPLS: 4                   // MPLS label
  },
  
  // Port numbers
  PORTS: {
    // Well-known ports (0-1023)
    FTP_DATA: 20,
    FTP_CONTROL: 21,
    SSH: 22,
    TELNET: 23,
    SMTP: 25,
    DNS: 53,
    DHCP_SERVER: 67,
    DHCP_CLIENT: 68,
    TFTP: 69,
    HTTP: 80,
    POP3: 110,
    NTP: 123,
    IMAP: 143,
    SNMP: 161,
    HTTPS: 443,
    
    // Registered ports (1024-49151)
    MYSQL: 3306,
    RDP: 3389,
    POSTGRESQL: 5432,
    MONGODB: 27017,
    REDIS: 6379,
    HTTP_ALT: 8080,
    HTTPS_ALT: 8443,
    
    // Dynamic/Private ports (49152-65535)
    DYNAMIC_START: 49152,
    DYNAMIC_END: 65535
  },
  
  // TCP states
  TCP_STATES: {
    CLOSED: 'CLOSED',
    LISTEN: 'LISTEN',
    SYN_SENT: 'SYN_SENT',
    SYN_RECEIVED: 'SYN_RECEIVED',
    ESTABLISHED: 'ESTABLISHED',
    FIN_WAIT_1: 'FIN_WAIT_1',
    FIN_WAIT_2: 'FIN_WAIT_2',
    CLOSE_WAIT: 'CLOSE_WAIT',
    CLOSING: 'CLOSING',
    LAST_ACK: 'LAST_ACK',
    TIME_WAIT: 'TIME_WAIT'
  },
  
  // Quality of Service (QoS) classes
  QOS: {
    BEST_EFFORT: 0,
    BACKGROUND: 1,
    EXCELLENT_EFFORT: 2,
    CRITICAL_APPLICATIONS: 3,
    VIDEO: 4,
    VOICE: 5,
    INTERNETWORK_CONTROL: 6,
    NETWORK_CONTROL: 7
  },
  
  // Error rates and thresholds
  THRESHOLDS: {
    // Packet loss rates
    PACKET_LOSS: {
      EXCELLENT: 0.001,      // < 0.1%
      GOOD: 0.01,           // < 1%
      ACCEPTABLE: 0.02,     // < 2%
      POOR: 0.05,           // < 5%
      UNACCEPTABLE: 0.1     // >= 10%
    },
    
    // Latency thresholds (ms)
    LATENCY: {
      EXCELLENT: 20,
      GOOD: 50,
      ACCEPTABLE: 100,
      POOR: 200,
      UNACCEPTABLE: 500
    },
    
    // Jitter thresholds (ms)
    JITTER: {
      EXCELLENT: 5,
      GOOD: 10,
      ACCEPTABLE: 20,
      POOR: 50,
      UNACCEPTABLE: 100
    },
    
    // Utilization percentages
    UTILIZATION: {
      LOW: 0.3,             // < 30%
      MODERATE: 0.6,        // < 60%
      HIGH: 0.8,            // < 80%
      CRITICAL: 0.9,        // < 90%
      SATURATED: 0.95       // >= 95%
    }
  },
  
  // Calculation constants
  CALC: {
    BITS_PER_BYTE: 8,
    BYTES_PER_KB: 1024,
    BYTES_PER_MB: 1048576,
    BYTES_PER_GB: 1073741824,
    MS_PER_SECOND: 1000,
    US_PER_MS: 1000,
    NS_PER_US: 1000
  }
};

/**
 * Get bandwidth category
 * @param {number} bps - Bandwidth in bits per second
 * @returns {string} Category name
 */
export function getBandwidthCategory(bps) {
  if (bps >= 10e9) return 'Ultra High Speed';
  if (bps >= 1e9) return 'Gigabit';
  if (bps >= 100e6) return 'Fast Ethernet';
  if (bps >= 10e6) return 'Ethernet';
  if (bps >= 1e6) return 'Broadband';
  if (bps >= 128e3) return 'Basic Broadband';
  return 'Narrowband';
}

/**
 * Get latency quality
 * @param {number} ms - Latency in milliseconds
 * @returns {string} Quality descriptor
 */
export function getLatencyQuality(ms) {
  const thresholds = NETWORK.THRESHOLDS.LATENCY;
  if (ms < thresholds.EXCELLENT) return 'Excellent';
  if (ms < thresholds.GOOD) return 'Good';
  if (ms < thresholds.ACCEPTABLE) return 'Acceptable';
  if (ms < thresholds.POOR) return 'Poor';
  return 'Unacceptable';
}

/**
 * Calculate theoretical maximum throughput
 * @param {number} bandwidth - Link bandwidth in bps
 * @param {number} packetSize - Packet size in bytes
 * @param {number} overhead - Protocol overhead in bytes
 * @returns {number} Effective throughput in bps
 */
export function calculateEffectiveThroughput(bandwidth, packetSize, overhead) {
  const efficiency = packetSize / (packetSize + overhead);
  return bandwidth * efficiency;
}

/**
 * Get appropriate MTU for network type
 * @param {string} networkType - Type of network
 * @returns {number} MTU in bytes
 */
export function getMTU(networkType) {
  const mtuMap = {
    'ethernet': NETWORK.PACKET_SIZE.MTU_ETHERNET,
    'wifi': NETWORK.PACKET_SIZE.MTU_WIFI,
    'pppoe': NETWORK.PACKET_SIZE.MTU_PPPOEDS,
    'vpn': NETWORK.PACKET_SIZE.MTU_VPN,
    'ipv6': NETWORK.PACKET_SIZE.MTU_IPV6_MIN
  };
  
  return mtuMap[networkType.toLowerCase()] || NETWORK.PACKET_SIZE.MTU_ETHERNET;
}

// Export default for convenience
export default NETWORK;