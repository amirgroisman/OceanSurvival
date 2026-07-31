/* Ocean Feeding Frenzy - Player Fish Entity */

class Player {
  constructor(canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;

    // Position & Velocity
    this.x = canvasWidth / 2;
    this.y = canvasHeight / 2;
    this.vx = 0;
    this.vy = 0;

    // Movement physics parameters
    this.acceleration = 0.6;
    this.friction = 0.90; // Smooth deceleration inertia
    this.maxSpeed = 6.5;

    // Size & Growth parameters
    this.size = 1.0; // Size in cm (Display value)
    this.baseRadius = 18; // Base pixel radius at size 1.0
    this.radius = this.baseRadius; // Current collision radius in pixels

    // Target visual scale factor for smooth growth transition
    this.targetRadius = this.baseRadius;

    // Facing direction: 1 for facing right, -1 for facing left
    this.facing = 1;

    // Tail wagging animation state
    this.tailAngle = 0;
    this.tailSpeed = 0.15;

    // Mouth eating animation timer
    this.mouthOpenTimer = 0;

    // Death animation state
    this.isDead = false;
    this.deathTimer = 0;
    this.rotation = 0;

    // Keys state tracking
    this.keys = {
      up: false,
      down: false,
      left: false,
      right: false
    };
  }

  reset(canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.x = canvasWidth / 2;
    this.y = canvasHeight / 2;
    this.vx = 0;
    this.vy = 0;
    this.size = 1.0;
    this.radius = this.baseRadius;
    this.targetRadius = this.baseRadius;
    this.facing = 1;
    this.isDead = false;
    this.deathTimer = 0;
    this.rotation = 0;
  }

  handleKeyDown(code) {
    if (code === 'KeyW' || code === 'ArrowUp') this.keys.up = true;
    if (code === 'KeyS' || code === 'ArrowDown') this.keys.down = true;
    if (code === 'KeyA' || code === 'ArrowLeft') this.keys.left = true;
    if (code === 'KeyD' || code === 'ArrowRight') this.keys.right = true;
  }

  handleKeyUp(code) {
    if (code === 'KeyW' || code === 'ArrowUp') this.keys.up = false;
    if (code === 'KeyS' || code === 'ArrowDown') this.keys.down = false;
    if (code === 'KeyA' || code === 'ArrowLeft') this.keys.left = false;
    if (code === 'KeyD' || code === 'ArrowRight') this.keys.right = false;
  }

  grow(amount) {
    // Diminishing growth formula so player doesn't scale infinitely huge instantly
    const growthFactor = 0.35 / (1 + (this.size - 1) * 0.15);
    this.size += amount * growthFactor;

    // Radius scales with size (logarithmic feel)
    this.targetRadius = this.baseRadius * (1 + Math.log10(this.size) * 1.5);
    
    // Trigger mouth pop animation
    this.mouthOpenTimer = 0.2;
  }

  update(dt, particleSystem) {
    if (this.isDead) {
      this.deathTimer += 0.016;
      this.rotation += 0.05;
      this.vy = -0.5; // Float upwards dead
      this.y += this.vy;
      return;
    }

    // Apply acceleration based on input keys
    if (this.keys.up) this.vy -= this.acceleration;
    if (this.keys.down) this.vy += this.acceleration;
    if (this.keys.left) {
      this.vx -= this.acceleration;
      this.facing = -1;
    }
    if (this.keys.right) {
      this.vx += this.acceleration;
      this.facing = 1;
    }

    // Clamp speed to maxSpeed
    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    if (speed > this.maxSpeed) {
      this.vx = (this.vx / speed) * this.maxSpeed;
      this.vy = (this.vy / speed) * this.maxSpeed;
    }

    // Apply smooth friction
    this.vx *= this.friction;
    this.vy *= this.friction;

    // Update position
    this.x += this.vx;
    this.y += this.vy;

    // Screen Boundary Clamping
    this.x = Utils.clamp(this.x, this.radius, this.canvasWidth - this.radius);
    this.y = Utils.clamp(this.y, this.radius, this.canvasHeight - this.radius);

    // Smooth radius interpolation towards targetRadius
    this.radius = Utils.lerp(this.radius, this.targetRadius, 0.1);

    // Tail wagging animation tied to velocity
    const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    this.tailAngle += (0.1 + currentSpeed * 0.08);

    // Mouth eating timer
    if (this.mouthOpenTimer > 0) {
      this.mouthOpenTimer -= 0.016;
    }

    // Emit trail bubbles when moving fast
    if (currentSpeed > 2 && particleSystem) {
      const tailX = this.x - this.facing * this.radius;
      particleSystem.spawnSwimBubble(tailX, this.y, this.radius);
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    if (this.isDead) {
      ctx.rotate(this.rotation);
      ctx.scale(1, -1); // Upside down dead fish
    } else {
      // Subtle tilt based on vertical movement
      const tiltAngle = Utils.clamp(this.vy * 0.04 * this.facing, -0.25, 0.25);
      ctx.rotate(tiltAngle);
    }

    // Flip horizontally if facing left
    ctx.scale(this.facing, 1);

    const r = this.radius;

    // 1. Tail Fin (animated sway)
    const tailWiggle = Math.sin(this.tailAngle) * (r * 0.3);
    ctx.save();
    ctx.translate(-r * 0.9, 0);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-r * 0.8, -r * 0.6 + tailWiggle);
    ctx.quadraticCurveTo(-r * 1.1, tailWiggle, -r * 0.8, r * 0.6 + tailWiggle);
    ctx.closePath();

    const tailGrad = ctx.createLinearGradient(-r * 0.8, 0, 0, 0);
    tailGrad.addColorStop(0, '#ff4757');
    tailGrad.addColorStop(1, '#ff7f50');
    ctx.fillStyle = tailGrad;
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#d63031';
    ctx.stroke();
    ctx.restore();

    // 2. Main Body (Cute Rounded Oval Orange Fish)
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 1.2, r * 0.9, 0, 0, Math.PI * 2);
    
    const bodyGrad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r * 1.3);
    bodyGrad.addColorStop(0, '#ffbe76');  // Bright orange highlight
    bodyGrad.addColorStop(0.6, '#ff7979'); // Rich coral orange
    bodyGrad.addColorStop(1, '#badc58');   // Cute gradient transition
    bodyGrad.addColorStop(1, '#eb4d4b');   // Body border shadow
    ctx.fillStyle = bodyGrad;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#c0392b';
    ctx.stroke();

    // 3. Cute White Clownfish Stripes
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    
    // Front stripe
    ctx.beginPath();
    ctx.ellipse(r * 0.2, 0, r * 0.2, r * 0.82, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Back stripe
    ctx.beginPath();
    ctx.ellipse(-r * 0.4, 0, r * 0.15, r * 0.65, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 4. Side Pectoral Fin (wobbling)
    ctx.beginPath();
    ctx.ellipse(r * 0.1, r * 0.3, r * 0.4, r * 0.25, Math.PI / 4 + Math.sin(this.tailAngle * 0.8) * 0.2, 0, Math.PI * 2);
    ctx.fillStyle = '#ff7979';
    ctx.fill();
    ctx.strokeStyle = '#c0392b';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 5. Expressive Big Eye (Pixar / Indie style)
    const eyeX = r * 0.5;
    const eyeY = -r * 0.25;
    const eyeR = r * 0.32;

    // Eye background (White)
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, eyeR, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#2d3436';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Eye Pupil (follows movement direction)
    const pupilOffsetX = Utils.clamp(this.vx * 0.3, -eyeR * 0.3, eyeR * 0.3);
    const pupilOffsetY = Utils.clamp(this.vy * 0.3, -eyeR * 0.3, eyeR * 0.3);
    
    ctx.beginPath();
    ctx.arc(eyeX + pupilOffsetX, eyeY + pupilOffsetY, eyeR * 0.5, 0, Math.PI * 2);
    ctx.fillStyle = '#2d3436';
    ctx.fill();

    // Eye Specular Sparkle Highlight
    ctx.beginPath();
    ctx.arc(eyeX + pupilOffsetX - eyeR * 0.15, eyeY + pupilOffsetY - eyeR * 0.15, eyeR * 0.2, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // 6. Cute Mouth (Open when eating fish)
    const mouthX = r * 1.1;
    const mouthY = r * 0.1;
    ctx.beginPath();
    if (this.mouthOpenTimer > 0) {
      // Big open mouth pop
      ctx.arc(mouthX, mouthY, r * 0.25, 0, Math.PI * 2);
      ctx.fillStyle = '#2d3436';
      ctx.fill();
    } else {
      // Happy smile curve
      ctx.arc(mouthX - r * 0.1, mouthY, r * 0.18, 0.1, Math.PI * 0.8, false);
      ctx.strokeStyle = '#2d3436';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.stroke();
    }

    ctx.restore();
  }
}
