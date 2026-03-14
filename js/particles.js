/* ============================================
   NagaraSeva — Particle Background (Canvas)
   ============================================ */

class ParticleBackground {
  constructor(canvasId, options = {}) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.animationId = null;
    this.mouse = { x: null, y: null };
    
    // Config
    this.config = {
      count: options.count || 80,
      color: options.color || '0, 188, 212',
      maxSize: options.maxSize || 3,
      minSize: options.minSize || 0.5,
      speed: options.speed || 0.3,
      connectDistance: options.connectDistance || 120,
      connectOpacity: options.connectOpacity || 0.08,
      mouseRadius: options.mouseRadius || 150,
      ...options
    };
    
    this.init();
    this.bindEvents();
    this.animate();
  }
  
  init() {
    this.resize();
    this.createParticles();
  }
  
  resize() {
    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;
  }
  
  createParticles() {
    this.particles = [];
    for (let i = 0; i < this.config.count; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: Math.random() * (this.config.maxSize - this.config.minSize) + this.config.minSize,
        speedX: (Math.random() - 0.5) * this.config.speed,
        speedY: (Math.random() - 0.5) * this.config.speed,
        opacity: Math.random() * 0.5 + 0.2,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.02 + 0.005
      });
    }
  }
  
  bindEvents() {
    window.addEventListener('resize', () => {
      this.resize();
      this.createParticles();
    });
    
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
    });
    
    this.canvas.addEventListener('mouseleave', () => {
      this.mouse.x = null;
      this.mouse.y = null;
    });
  }
  
  drawParticle(p) {
    const pulsedOpacity = p.opacity + Math.sin(p.pulse) * 0.15;
    
    // Glow
    const gradient = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
    gradient.addColorStop(0, `rgba(${this.config.color}, ${pulsedOpacity * 0.6})`);
    gradient.addColorStop(1, `rgba(${this.config.color}, 0)`);
    
    this.ctx.beginPath();
    this.ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
    this.ctx.fillStyle = gradient;
    this.ctx.fill();
    
    // Core dot
    this.ctx.beginPath();
    this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    this.ctx.fillStyle = `rgba(${this.config.color}, ${pulsedOpacity})`;
    this.ctx.fill();
  }
  
  drawConnections() {
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const dx = this.particles[i].x - this.particles[j].x;
        const dy = this.particles[i].y - this.particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < this.config.connectDistance) {
          const opacity = (1 - dist / this.config.connectDistance) * this.config.connectOpacity;
          this.ctx.beginPath();
          this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
          this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
          this.ctx.strokeStyle = `rgba(${this.config.color}, ${opacity})`;
          this.ctx.lineWidth = 0.5;
          this.ctx.stroke();
        }
      }
    }
  }
  
  updateParticle(p) {
    p.x += p.speedX;
    p.y += p.speedY;
    p.pulse += p.pulseSpeed;
    
    // Mouse interaction
    if (this.mouse.x !== null && this.mouse.y !== null) {
      const dx = this.mouse.x - p.x;
      const dy = this.mouse.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < this.config.mouseRadius) {
        const force = (this.config.mouseRadius - dist) / this.config.mouseRadius;
        p.x -= dx * force * 0.01;
        p.y -= dy * force * 0.01;
      }
    }
    
    // Wrap around edges
    if (p.x < -10) p.x = this.canvas.width + 10;
    if (p.x > this.canvas.width + 10) p.x = -10;
    if (p.y < -10) p.y = this.canvas.height + 10;
    if (p.y > this.canvas.height + 10) p.y = -10;
  }
  
  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.drawConnections();
    
    for (const p of this.particles) {
      this.updateParticle(p);
      this.drawParticle(p);
    }
    
    this.animationId = requestAnimationFrame(() => this.animate());
  }
  
  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
}

// Auto-initialize any canvas with data-particles attribute
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('canvas[data-particles]').forEach(canvas => {
    new ParticleBackground(canvas.id, {
      count: parseInt(canvas.dataset.count) || 80,
      color: canvas.dataset.color || '0, 188, 212'
    });
  });
});
