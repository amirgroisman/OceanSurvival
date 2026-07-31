/* Ocean Feeding Frenzy - Ocean Environment & Parallax Background */

class Environment {
  constructor(width, height) {
    this.width = width;
    this.height = height;

    // Ambient floating bubbles
    this.ambientBubbles = [];
    this.initAmbientBubbles(35);

    // Drifting plankton particles
    this.plankton = [];
    this.initPlankton(60);

    // Seaweed items along bottom
    this.seaweedList = [];
    this.initSeaweed(12);

    // Time counter for wave & light ray animations
    this.animTime = 0;
  }

  resize(width, height) {
    this.width = width;
    this.height = height;
    this.initSeaweed(12);
  }

  initAmbientBubbles(count) {
    this.ambientBubbles = [];
    for (let i = 0; i < count; i++) {
      this.ambientBubbles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: Utils.randomRange(2, 7),
        speedY: Utils.randomRange(0.4, 1.2),
        wobbleSpeed: Utils.randomRange(0.02, 0.05),
        wobblePhase: Math.random() * Math.PI * 2,
        opacity: Utils.randomRange(0.15, 0.5)
      });
    }
  }

  initPlankton(count) {
    this.plankton = [];
    for (let i = 0; i < count; i++) {
      this.plankton.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: Utils.randomRange(0.8, 2.0),
        vx: Utils.randomRange(-0.3, 0.3),
        vy: Utils.randomRange(-0.1, 0.2),
        alpha: Utils.randomRange(0.2, 0.7)
      });
    }
  }

  initSeaweed(count) {
    this.seaweedList = [];
    const spacing = this.width / count;
    for (let i = 0; i < count; i++) {
      this.seaweedList.push({
        x: i * spacing + Utils.randomRange(-spacing * 0.3, spacing * 0.3),
        height: Utils.randomRange(80, 180),
        segments: Utils.randomInt(4, 7),
        color: Utils.randomChoice(['#10b981', '#059669', '#047857', '#065f46']),
        phaseOffset: Math.random() * Math.PI * 2,
        width: Utils.randomRange(8, 16)
      });
    }
  }

  update(dt) {
    this.animTime += 0.016;

    // Update ambient bubbles
    for (let bubble of this.ambientBubbles) {
      bubble.y -= bubble.speedY;
      bubble.wobblePhase += bubble.wobbleSpeed;
      bubble.x += Math.sin(bubble.wobblePhase) * 0.6;

      // Wrap around bottom if reached top
      if (bubble.y < -20) {
        bubble.y = this.height + 20;
        bubble.x = Math.random() * this.width;
      }
    }

    // Update plankton
    for (let p of this.plankton) {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = this.width;
      if (p.x > this.width) p.x = 0;
      if (p.y < 0) p.y = this.height;
      if (p.y > this.height) p.y = 0;
    }
  }

  draw(ctx) {
    // 1. Animated Ocean Gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0, '#0f4c81');   // Vibrant top ocean turquoise/blue
    gradient.addColorStop(0.3, '#0b325b'); // Deep mid water
    gradient.addColorStop(1, '#031327');   // Dark ocean floor
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.width, this.height);

    // 2. Light Rays from Surface
    this.drawLightRays(ctx);

    // 3. Ocean Floor & Coral Reef Bed
    this.drawOceanFloor(ctx);

    // 4. Parallax Swaying Seaweed
    this.drawSeaweed(ctx);

    // 5. Drifting Plankton Particles
    this.drawPlankton(ctx);

    // 6. Ambient Floating Bubbles
    this.drawAmbientBubbles(ctx);
  }

  drawLightRays(ctx) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    const rayCount = 6;
    for (let i = 0; i < rayCount; i++) {
      const angle = -0.15 + (i * 0.06);
      const rayWidth = 60 + Math.sin(this.animTime + i) * 20;
      const startX = (this.width / rayCount) * i + (this.width * 0.1);
      const alpha = 0.08 + Math.sin(this.animTime * 1.5 + i * 2) * 0.04;

      ctx.beginPath();
      ctx.moveTo(startX, 0);
      ctx.lineTo(startX + Math.tan(angle) * this.height + rayWidth, this.height);
      ctx.lineTo(startX + Math.tan(angle) * this.height - rayWidth, this.height);
      ctx.closePath();

      const rayGrad = ctx.createLinearGradient(startX, 0, startX, this.height);
      rayGrad.addColorStop(0, `rgba(180, 240, 255, ${alpha * 2})`);
      rayGrad.addColorStop(0.6, `rgba(0, 210, 255, ${alpha})`);
      rayGrad.addColorStop(1, 'rgba(0, 210, 255, 0)');

      ctx.fillStyle = rayGrad;
      ctx.fill();
    }
    ctx.restore();
  }

  drawOceanFloor(ctx) {
    ctx.save();

    // Sandy/rocky seabed silhouette
    ctx.beginPath();
    ctx.moveTo(0, this.height);
    ctx.lineTo(0, this.height - 35);

    for (let x = 0; x <= this.width; x += 40) {
      const y = this.height - 35 + Math.sin(x * 0.015) * 12 + Math.cos(x * 0.03) * 8;
      ctx.lineTo(x, y);
    }

    ctx.lineTo(this.width, this.height);
    ctx.closePath();

    const floorGrad = ctx.createLinearGradient(0, this.height - 50, 0, this.height);
    floorGrad.addColorStop(0, '#0a2342');
    floorGrad.addColorStop(1, '#040e1a');
    ctx.fillStyle = floorGrad;
    ctx.fill();

    // Coral silhouettes
    const coralColors = ['#e84393', '#fd79a8', '#00cec9', '#fdcb6e'];
    for (let i = 0; i < 8; i++) {
      const cx = (this.width / 8) * i + 30;
      const cy = this.height - 30;
      const cColor = coralColors[i % coralColors.length];

      ctx.fillStyle = cColor;
      ctx.globalAlpha = 0.35;
      ctx.beginPath();
      ctx.arc(cx, cy, 25, Math.PI, 0, false);
      ctx.arc(cx + 15, cy - 10, 18, Math.PI, 0, false);
      ctx.fill();
    }

    ctx.restore();
  }

  drawSeaweed(ctx) {
    ctx.save();
    for (let plant of this.seaweedList) {
      ctx.strokeStyle = plant.color;
      ctx.lineWidth = plant.width;
      ctx.lineCap = 'round';

      ctx.beginPath();
      let currX = plant.x;
      let currY = this.height - 20;
      ctx.moveTo(currX, currY);

      const segmentLen = plant.height / plant.segments;

      for (let s = 1; s <= plant.segments; s++) {
        const sway = Math.sin(this.animTime * 2 + plant.phaseOffset + s * 0.4) * (s * 4);
        currX = plant.x + sway;
        currY = (this.height - 20) - (s * segmentLen);
        ctx.quadraticCurveTo(plant.x + sway * 0.5, currY + segmentLen * 0.5, currX, currY);
      }

      ctx.stroke();
    }
    ctx.restore();
  }

  drawPlankton(ctx) {
    ctx.save();
    for (let p of this.plankton) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(220, 245, 255, ${p.alpha})`;
      ctx.fill();
    }
    ctx.restore();
  }

  drawAmbientBubbles(ctx) {
    ctx.save();
    for (let b of this.ambientBubbles) {
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${b.opacity * 0.4})`;
      ctx.fill();
      ctx.strokeStyle = `rgba(255, 255, 255, ${b.opacity})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    ctx.restore();
  }
}
