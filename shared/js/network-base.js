export class NetworkNode {
  constructor(x, y, id, label) {
    this.x = x;
    this.y = y;
    this.id = id;
    this.label = label;
    this.radius = 30;
    this.color = '#4a90e2';
    this.connections = new Set();
  }
  
  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.strokeStyle = '#2e5c8a';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.fillStyle = 'white';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.label, this.x, this.y);
  }
  
  containsPoint(x, y) {
    const dx = x - this.x;
    const dy = y - this.y;
    return dx * dx + dy * dy <= this.radius * this.radius;
  }
}

export class Packet {
  constructor(startNode, endNode, data = {}) {
    this.start = startNode;
    this.end = endNode;
    this.data = data;
    this.progress = 0;
    this.speed = 0.02;
    this.color = '#2ecc71';
    this.size = 10;
  }
  
  update(deltaTime = 1) {
    this.progress = Math.min(1, this.progress + this.speed * deltaTime);
    return this.progress < 1;
  }
  
  getCurrentPosition() {
    const t = this.easeInOutQuad(this.progress);
    return {
      x: this.start.x + (this.end.x - this.start.x) * t,
      y: this.start.y + (this.end.y - this.start.y) * t
    };
  }
  
  easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }
  
  draw(ctx) {
    const pos = this.getCurrentPosition();
    
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    
    if (this.data.label) {
      ctx.fillStyle = 'black';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(this.data.label, pos.x, pos.y - 20);
    }
  }
}

export class NetworkSimulation {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.nodes = [];
    this.packets = [];
    this.connections = [];
    this.animationId = null;
    this.lastTime = 0;
    
    this.setupCanvas();
    this.bindEvents();
  }
  
  setupCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.scale(dpr, dpr);
    
    this.canvas.style.width = rect.width + 'px';
    this.canvas.style.height = rect.height + 'px';
  }
  
  start() {
    this.lastTime = performance.now();
    this.animate();
  }
  
  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
  
  animate(currentTime = 0) {
    const deltaTime = (currentTime - this.lastTime) / 16.67;
    this.lastTime = currentTime;
    
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.update(deltaTime);
    this.draw();
    
    this.animationId = requestAnimationFrame((time) => this.animate(time));
  }
  
  update(deltaTime) {
    this.packets = this.packets.filter(packet => packet.update(deltaTime));
  }
  
  draw() {
    this.drawConnections();
    
    this.packets.forEach(packet => packet.draw(this.ctx));
    
    this.nodes.forEach(node => node.draw(this.ctx));
  }
  
  drawConnections() {
    this.ctx.strokeStyle = '#95a5a6';
    this.ctx.lineWidth = 2;
    
    this.connections.forEach(([node1, node2]) => {
      this.ctx.beginPath();
      this.ctx.moveTo(node1.x, node1.y);
      this.ctx.lineTo(node2.x, node2.y);
      this.ctx.stroke();
    });
  }
  
  bindEvents() {
  }
  
  addNode(x, y, id, label) {
    const node = new NetworkNode(x, y, id, label);
    this.nodes.push(node);
    return node;
  }
  
  connectNodes(node1, node2) {
    this.connections.push([node1, node2]);
    node1.connections.add(node2);
    node2.connections.add(node1);
  }
  
  sendPacket(from, to, data = {}) {
    const packet = new Packet(from, to, data);
    this.packets.push(packet);
    return packet;
  }
}