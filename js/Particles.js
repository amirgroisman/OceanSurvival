/* Ocean Feeding Frenzy - Particle System */

class Particle {
  constructor(x, y, options = {}) {
    this.x = x;
    this.y = y;
    this.vx = options.vx || (Math.random() - 0.5) * 2;
    this.vy = options.vy || (Math.random() - 0.5) * 2;
    this.radius = options.radius || Utils.randomRange(2, 6);
    this.color = options.color || '#ffffff';
    this.alpha = options.alpha !== undefined ? options.alpha : 1.0;
    this.fadeRate = options.fadeRate || Utils.randomRange(0.01, 0.025);
    this.shrinkRate = options.shrinkRate || 0.98;
    this.type = options.type || 'bubble'; // 'bubble', 'sparkle', 'ripple', 'confetti'
    this.life = 1.0;
    this.maxLife = options.maxLife || 1.0;
    this.angle = Math.random() * Math.PI * 2;
    this.spin = (Math.random() - 0.5) * 0.1;
    this.wobblePhase = Math.random() * Math.PI * 2;
  }

  update(dt) {
    this.life -= this.fadeRate;

    if (this.type === 'bubble') {
      this.wobblePhase += 0.05;
      this.vx = Math.sin(this.wobblePhase) * 0.8;
      this.vy -= 0.02; // Float upwards
    } else if (this.type === 'sparkle') {
      this.vx *= 0.95;
      this.vy *= 0.95;
    } else if (this.type === 'ripple') {
      this.radius += 1.5;
    } else if (this.type === 'confetti') {
      this.vy += 0.05; // Gravity
      this.angle += this.spin;
    }

    this.x += this.vx;
    this.y += this.vy;
    this.radius *= this.shrinkRate;
    this.alpha = Math.max(0, this.life / this.maxLife);
  }

  draw(ctx) {
    if (this.alpha <= 0) return;

    ctx.save();
    ctx.globalAlpha = this.alpha;

    if (this.type === 'bubble') {
      // Draw glossy bubble
      ctx.beginPath();
      ctx.arc(this.x, this.y, Math.max(0.5, this.radius), 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.fill();
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.stroke();

      // Bubble highlight shine
      ctx.beginPath();
      ctx.arc(this.x - this.radius * 0.3, this.y - this.radius * 0.3, Math.max(0.2, this.radius * 0.3), 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fill();

    } else if (this.type === 'sparkle') {
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);
      ctx.fillStyle = this.color;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 10;

      // 4-point star sparkle
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        ctx.lineTo(Math.cos(i * Math.PI / 2) * this.radius, Math.sin(i * Math.PI / 2) * this.radius);
        ctx.lineTo(Math.cos((i + 0.5) * Math.PI / 2) * (this.radius * 0.3), Math.sin((i + 0.5) * Math.PI / 2) * (this.radius * 0.3));
      }
      ctx.closePath();
      ctx.fill();

    } else if (this.type === 'ripple') {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 2;
      ctx.stroke();

    } else if (this.type === 'confetti') {
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);
      ctx.fillStyle = this.color;
      ctx.fillRect(-this.radius, -this.radius / 2, this.radius * 2, this.radius);
    }

    ctx.restore();
  }

  isDead() {
    return this.life <= 0 || this.radius <= 0.2;
  }
}

class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  update(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].update(dt);
      if (this.particles[i].isDead()) {
        this.particles.splice(i, 1);
      }
    }
  }

  draw(ctx) {
    for (let particle of this.particles) {
      particle.draw(ctx);
    }
  }

  // Create burst of bubbles & ripples on eat
  spawnEatBurst(x, y, color = '#00d2ff', count = 12) {
    // Add shockwave ripple
    this.particles.push(new Particle(x, y, {
      type: 'ripple',
      color: color,
      radius: 4,
      fadeRate: 0.04
    }));

    // Add popping bubbles
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Utils.randomRange(1.5, 4.5);
      this.particles.push(new Particle(x, y, {
        type: Math.random() > 0.3 ? 'bubble' : 'sparkle',
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: Utils.randomRange(3, 8),
        color: color,
        fadeRate: Utils.randomRange(0.02, 0.04)
      }));
    }
  }

  // Golden fish sparkle emission
  spawnGoldenSparkles(x, y) {
    for (let i = 0; i < 2; i++) {
      this.particles.push(new Particle(x + Utils.randomRange(-10, 10), y + Utils.randomRange(-10, 10), {
        type: 'sparkle',
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        radius: Utils.randomRange(3, 6),
        color: '#ffd700',
        fadeRate: 0.05
      }));
    }
  }

  // Swim bubble trail behind player
  spawnSwimBubble(x, y, radius = 3) {
    if (Math.random() > 0.4) return;
    this.particles.push(new Particle(x, y, {
      type: 'bubble',
      vx: (Math.random() - 0.5) * 0.5,
      vy: Utils.randomRange(-0.5, -1.5),
      radius: radius * Utils.randomRange(0.2, 0.5),
      fadeRate: 0.03
    }));
  }

  // Victory celebration explosion
  spawnVictoryBurst(width, height) {
    const colors = ['#ff4757', '#2ed573', '#1e90ff', '#ffd700', '#ff6b81', '#70a1ff'];
    for (let i = 0; i < 80; i++) {
      this.particles.push(new Particle(width / 2, height / 2, {
        type: 'confetti',
        vx: (Math.random() - 0.5) * 14,
        vy: Utils.randomRange(-12, -2),
        radius: Utils.randomRange(4, 10),
        color: Utils.randomChoice(colors),
        fadeRate: Utils.randomRange(0.008, 0.015),
        shrinkRate: 0.99
      }));
    }
  }

  clear() {
    this.particles = [];
  }
}
