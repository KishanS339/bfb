/* ============================================
   NagaraSeva — Chart Renderers (Canvas)
   ============================================ */

class ChartRenderer {
  constructor(canvasId, options = {}) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.options = {
      padding: 50,
      animationDuration: 800,
      gridColor: 'rgba(255,255,255,0.06)',
      textColor: 'rgba(255,255,255,0.5)',
      fontFamily: 'Inter, sans-serif',
      ...options
    };
    this.dpr = window.devicePixelRatio || 1;
    this.setupCanvas();
  }

  setupCanvas() {
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * this.dpr;
    this.canvas.height = rect.height * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);
    this.width = rect.width;
    this.height = rect.height;
  }

  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }
}

/* ── Bar Chart ── */
class BarChart extends ChartRenderer {
  constructor(canvasId, data, options = {}) {
    super(canvasId, options);
    if (!this.canvas) return;
    this.data = data;
    this.colors = options.colors || [
      '#00BCD4', '#4DD0E1', '#0097A7', '#00C853',
      '#FF6F00', '#D50000', '#303F9F', '#90CAF9'
    ];
    this.animate();
  }

  animate() {
    const start = performance.now();
    const duration = this.options.animationDuration;

    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      this.draw(eased);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  draw(progress = 1) {
    this.clear();
    const { padding } = this.options;
    const chartWidth = this.width - padding * 2;
    const chartHeight = this.height - padding * 2;
    const maxValue = Math.max(...this.data.map(d => d.value)) * 1.15;
    const barWidth = (chartWidth / this.data.length) * 0.6;
    const gap = (chartWidth / this.data.length) * 0.4;

    // Grid lines
    this.ctx.strokeStyle = this.options.gridColor;
    this.ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding + (chartHeight / 4) * i;
      this.ctx.beginPath();
      this.ctx.moveTo(padding, y);
      this.ctx.lineTo(this.width - padding, y);
      this.ctx.stroke();

      // Grid labels
      const value = Math.round(maxValue - (maxValue / 4) * i);
      this.ctx.fillStyle = this.options.textColor;
      this.ctx.font = `11px ${this.options.fontFamily}`;
      this.ctx.textAlign = 'right';
      this.ctx.fillText(value, padding - 10, y + 4);
    }

    // Bars
    this.data.forEach((d, i) => {
      const x = padding + i * (barWidth + gap) + gap / 2;
      const barHeight = (d.value / maxValue) * chartHeight * progress;
      const y = padding + chartHeight - barHeight;
      const color = this.colors[i % this.colors.length];

      // Bar gradient
      const gradient = this.ctx.createLinearGradient(x, y, x, padding + chartHeight);
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, color + '40');
      
      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      const radius = 4;
      this.ctx.moveTo(x + radius, y);
      this.ctx.lineTo(x + barWidth - radius, y);
      this.ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius);
      this.ctx.lineTo(x + barWidth, padding + chartHeight);
      this.ctx.lineTo(x, padding + chartHeight);
      this.ctx.lineTo(x, y + radius);
      this.ctx.quadraticCurveTo(x, y, x + radius, y);
      this.ctx.fill();

      // Value label
      if (progress > 0.8) {
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = `bold 12px ${this.options.fontFamily}`;
        this.ctx.textAlign = 'center';
        this.ctx.fillText(d.value, x + barWidth / 2, y - 8);
      }

      // X-axis label
      this.ctx.fillStyle = this.options.textColor;
      this.ctx.font = `11px ${this.options.fontFamily}`;
      this.ctx.textAlign = 'center';
      this.ctx.fillText(d.label, x + barWidth / 2, this.height - padding / 3);
    });
  }
}

/* ── Doughnut Chart ── */
class DoughnutChart extends ChartRenderer {
  constructor(canvasId, data, options = {}) {
    super(canvasId, options);
    if (!this.canvas) return;
    this.data = data;
    this.colors = options.colors || [
      '#00BCD4', '#00C853', '#FF6F00', '#D50000',
      '#303F9F', '#90CAF9', '#4DD0E1'
    ];
    this.animate();
  }

  animate() {
    const start = performance.now();
    const duration = this.options.animationDuration;

    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      this.draw(eased);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  draw(progress = 1) {
    this.clear();
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    const radius = Math.min(centerX, centerY) - 40;
    const innerRadius = radius * 0.62;
    const total = this.data.reduce((sum, d) => sum + d.value, 0);
    let startAngle = -Math.PI / 2;

    this.data.forEach((d, i) => {
      const sliceAngle = (d.value / total) * Math.PI * 2 * progress;
      const endAngle = startAngle + sliceAngle;
      const color = this.colors[i % this.colors.length];

      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      this.ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
      this.ctx.closePath();
      this.ctx.fillStyle = color;
      this.ctx.fill();

      // Label
      if (progress > 0.9 && sliceAngle > 0.3) {
        const midAngle = startAngle + sliceAngle / 2;
        const labelRadius = radius + 20;
        const lx = centerX + Math.cos(midAngle) * labelRadius;
        const ly = centerY + Math.sin(midAngle) * labelRadius;
        
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = `500 11px ${this.options.fontFamily}`;
        this.ctx.textAlign = midAngle > Math.PI / 2 && midAngle < Math.PI * 1.5 ? 'right' : 'left';
        this.ctx.fillText(`${d.label} (${Math.round(d.value/total*100)}%)`, lx, ly);
      }

      startAngle = endAngle;
    });

    // Center text
    if (progress > 0.5) {
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.font = `bold 24px ${this.options.fontFamily}`;
      this.ctx.textAlign = 'center';
      this.ctx.fillText(total.toLocaleString(), centerX, centerY + 2);
      this.ctx.fillStyle = this.options.textColor;
      this.ctx.font = `11px ${this.options.fontFamily}`;
      this.ctx.fillText('Total', centerX, centerY + 20);
    }
  }
}

/* ── Line Chart ── */
class LineChart extends ChartRenderer {
  constructor(canvasId, datasets, options = {}) {
    super(canvasId, options);
    if (!this.canvas) return;
    this.datasets = datasets;
    this.colors = options.colors || ['#00BCD4', '#00C853', '#FF6F00', '#D50000'];
    this.animate();
  }

  animate() {
    const start = performance.now();
    const duration = this.options.animationDuration;

    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      this.draw(eased);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  draw(progress = 1) {
    this.clear();
    const { padding } = this.options;
    const chartWidth = this.width - padding * 2;
    const chartHeight = this.height - padding * 2;
    
    const allValues = this.datasets.flatMap(ds => ds.data.map(d => d.value));
    const maxValue = Math.max(...allValues) * 1.15;
    const labels = this.datasets[0].data.map(d => d.label);

    // Grid
    this.ctx.strokeStyle = this.options.gridColor;
    this.ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding + (chartHeight / 4) * i;
      this.ctx.beginPath();
      this.ctx.moveTo(padding, y);
      this.ctx.lineTo(this.width - padding, y);
      this.ctx.stroke();

      const value = Math.round(maxValue - (maxValue / 4) * i);
      this.ctx.fillStyle = this.options.textColor;
      this.ctx.font = `11px ${this.options.fontFamily}`;
      this.ctx.textAlign = 'right';
      this.ctx.fillText(value, padding - 10, y + 4);
    }

    // X labels
    labels.forEach((label, i) => {
      const x = padding + (chartWidth / (labels.length - 1)) * i;
      this.ctx.fillStyle = this.options.textColor;
      this.ctx.font = `11px ${this.options.fontFamily}`;
      this.ctx.textAlign = 'center';
      this.ctx.fillText(label, x, this.height - padding / 3);
    });

    // Lines
    this.datasets.forEach((ds, di) => {
      const color = this.colors[di % this.colors.length];
      const points = ds.data.map((d, i) => ({
        x: padding + (chartWidth / (ds.data.length - 1)) * i,
        y: padding + chartHeight - (d.value / maxValue) * chartHeight * progress
      }));

      // Area fill
      this.ctx.beginPath();
      this.ctx.moveTo(points[0].x, padding + chartHeight);
      points.forEach(p => this.ctx.lineTo(p.x, p.y));
      this.ctx.lineTo(points[points.length-1].x, padding + chartHeight);
      this.ctx.closePath();
      const areaGradient = this.ctx.createLinearGradient(0, padding, 0, padding + chartHeight);
      areaGradient.addColorStop(0, color + '25');
      areaGradient.addColorStop(1, color + '02');
      this.ctx.fillStyle = areaGradient;
      this.ctx.fill();

      // Line
      this.ctx.beginPath();
      points.forEach((p, i) => {
        if (i === 0) this.ctx.moveTo(p.x, p.y);
        else this.ctx.lineTo(p.x, p.y);
      });
      this.ctx.strokeStyle = color;
      this.ctx.lineWidth = 2.5;
      this.ctx.lineJoin = 'round';
      this.ctx.stroke();

      // Dots
      if (progress > 0.7) {
        points.forEach(p => {
          this.ctx.beginPath();
          this.ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
          this.ctx.fillStyle = color;
          this.ctx.fill();
          this.ctx.beginPath();
          this.ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
          this.ctx.fillStyle = '#0D0D1A';
          this.ctx.fill();
        });
      }
    });

    // Legend
    if (this.datasets.length > 1 && progress > 0.9) {
      let legendX = padding;
      this.datasets.forEach((ds, i) => {
        const color = this.colors[i % this.colors.length];
        this.ctx.fillStyle = color;
        this.ctx.fillRect(legendX, 12, 12, 12);
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = `500 11px ${this.options.fontFamily}`;
        this.ctx.textAlign = 'left';
        this.ctx.fillText(ds.name, legendX + 18, 22);
        legendX += this.ctx.measureText(ds.name).width + 36;
      });
    }
  }
}
