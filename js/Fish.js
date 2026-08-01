/* Ocean Feeding Frenzy - AI Fish Entity & Species Definitions */

// Fish Species Catalog
const FISH_SPECIES = [
  {
    id: 'minnow',
    name: 'Blue Minnow',
    baseSize: 0.5, // Relative size factor
    colorGrad: ['#00d2ff', '#3a7bd5'],
    outline: '#0056b3',
    stripeColor: 'rgba(255, 255, 255, 0.4)',
    bodyShape: 'oval',
    speedMultiplier: 1.2
  },
  {
    id: 'tang',
    name: 'Yellow Tang',
    baseSize: 0.9,
    colorGrad: ['#f1c40f', '#f39c12'],
    outline: '#d35400',
    stripeColor: 'rgba(52, 73, 94, 0.5)',
    bodyShape: 'tall',
    speedMultiplier: 1.0
  },
  {
    id: 'butterfly',
    name: 'Purple Butterflyfish',
    baseSize: 1.4,
    colorGrad: ['#9b59b6', '#8e44ad'],
    outline: '#4a235a',
    stripeColor: 'rgba(241, 196, 15, 0.7)',
    bodyShape: 'round',
    speedMultiplier: 0.95
  },
  {
    id: 'snapper',
    name: 'Red Snapper',
    baseSize: 2.2,
    colorGrad: ['#e74c3c', '#c0392b'],
    outline: '#78281f',
    stripeColor: 'rgba(255, 255, 255, 0.3)',
    bodyShape: 'sleek',
    speedMultiplier: 1.1
  },
  {
    id: 'shark',
    name: 'Great Blue Shark',
    baseSize: 3.8,
    colorGrad: ['#34495e', '#2c3e50'],
    outline: '#1a252f',
    stripeColor: 'rgba(236, 240, 241, 0.2)',
    bodyShape: 'predator',
    speedMultiplier: 1.25
  },
  {
    id: 'golden',
    name: 'Golden Fish',
    baseSize: 1.0,
    colorGrad: ['#ffeaa7', '#fdcb6e'],
    outline: '#e1b12c',
    stripeColor: 'rgba(255, 255, 255, 0.9)',
    bodyShape: 'round',
    speedMultiplier: 1.4,
    isGolden: true
  }
];

class Fish {
  constructor(options) {
    this.x = options.x;
    this.y = options.y;
    this.direction = options.direction; // 1 (left to right) or -1 (right to left)
    
    this.species = options.species;
    this.size = options.size; // Numerical size value in cm
    this.radius = options.radius; // Collision radius in pixels
    this.speed = options.speed * this.species.speedMultiplier;

    this.tailAngle = Math.random() * Math.PI * 2;
    this.tailSpeed = Utils.randomRange(0.12, 0.22);

    this.isGolden = !!options.species.isGolden;

    // Golden fish sparkle timer
    this.sparkleTimer = 0;
  }

  update(dt, particleSystem) {
    // Frame-rate independent time step (normalized to 60fps baseline)
    const step = dt * 60;

    // Strictly horizontal movement (dt-based)
    this.x += this.speed * this.direction * step;

    // Tail swimming animation (dt-based)
    this.tailAngle += this.tailSpeed * step;

    // Spawn sparkles if Golden Fish
    if (this.isGolden && particleSystem) {
      this.sparkleTimer += dt;
      if (this.sparkleTimer > 0.1) {
        particleSystem.spawnGoldenSparkles(this.x, this.y);
        this.sparkleTimer = 0;
      }
    }
  }

  // Check if fish has swum completely off screen
  isOffScreen(canvasWidth) {
    const margin = this.radius * 3;
    if (this.direction === 1 && this.x > canvasWidth + margin) return true;
    if (this.direction === -1 && this.x < -margin) return true;
    return false;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(this.direction, 1); // Flip horizontally if moving left

    const r = this.radius;

    // Glow effect for Golden Fish
    if (this.isGolden) {
      ctx.shadowColor = '#ffd700';
      ctx.shadowBlur = 18;
    }

    // 1. Tail Fin (Animated Wiggle)
    const tailWiggle = Math.sin(this.tailAngle) * (r * 0.28);
    ctx.save();
    ctx.translate(-r * 0.9, 0);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-r * 0.85, -r * 0.6 + tailWiggle);
    ctx.quadraticCurveTo(-r * 1.1, tailWiggle, -r * 0.85, r * 0.6 + tailWiggle);
    ctx.closePath();

    const tailGrad = ctx.createLinearGradient(-r * 0.85, 0, 0, 0);
    tailGrad.addColorStop(0, this.species.colorGrad[1]);
    tailGrad.addColorStop(1, this.species.colorGrad[0]);
    ctx.fillStyle = tailGrad;
    ctx.fill();
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = this.species.outline;
    ctx.stroke();
    ctx.restore();

    // 2. Main Body Shape Rendering
    ctx.beginPath();
    const shape = this.species.bodyShape;
    if (shape === 'tall') {
      ctx.ellipse(0, 0, r * 1.0, r * 1.25, 0, 0, Math.PI * 2);
    } else if (shape === 'round') {
      ctx.ellipse(0, 0, r * 1.1, r * 1.1, 0, 0, Math.PI * 2);
    } else if (shape === 'sleek') {
      ctx.ellipse(0, 0, r * 1.4, r * 0.8, 0, 0, Math.PI * 2);
    } else if (shape === 'predator') {
      // Shark predator sharp body shape
      ctx.moveTo(-r * 1.3, 0);
      ctx.quadraticCurveTo(0, -r * 1.1, r * 1.3, 0);
      ctx.quadraticCurveTo(0, r * 1.1, -r * 1.3, 0);
    } else {
      // Default oval
      ctx.ellipse(0, 0, r * 1.2, r * 0.9, 0, 0, Math.PI * 2);
    }

    const bodyGrad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r * 1.3);
    bodyGrad.addColorStop(0, this.species.colorGrad[0]);
    bodyGrad.addColorStop(1, this.species.colorGrad[1]);
    ctx.fillStyle = bodyGrad;
    ctx.fill();
    ctx.lineWidth = 1.8;
    ctx.strokeStyle = this.species.outline;
    ctx.stroke();

    // 3. Body Stripes
    ctx.save();
    ctx.fillStyle = this.species.stripeColor;
    ctx.beginPath();
    ctx.ellipse(r * 0.1, 0, r * 0.18, r * 0.8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 4. Dorsal Fin (Top fin)
    ctx.beginPath();
    ctx.moveTo(-r * 0.3, -r * 0.8);
    ctx.quadraticCurveTo(0, -r * 1.4, r * 0.4, -r * 0.6);
    ctx.lineTo(r * 0.1, -r * 0.7);
    ctx.closePath();
    ctx.fillStyle = this.species.colorGrad[1];
    ctx.fill();
    ctx.strokeStyle = this.species.outline;
    ctx.stroke();

    // 5. Expressive Eyes
    const eyeX = r * 0.55;
    const eyeY = -r * 0.22;
    const eyeR = r * 0.28;

    ctx.beginPath();
    ctx.arc(eyeX, eyeY, eyeR, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#2d3436';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Pupil
    ctx.beginPath();
    ctx.arc(eyeX + eyeR * 0.2, eyeY, eyeR * 0.48, 0, Math.PI * 2);
    ctx.fillStyle = this.isGolden ? '#d35400' : '#2d3436';
    ctx.fill();

    // Specular highlight
    ctx.beginPath();
    ctx.arc(eyeX + eyeR * 0.05, eyeY - eyeR * 0.15, eyeR * 0.18, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    ctx.restore();
  }
}
