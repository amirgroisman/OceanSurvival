/* Ocean Feeding Frenzy - Spawner & Difficulty Scaling Engine */

class Spawner {
  constructor(canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;

    this.activeFish = [];
    this.spawnTimer = 0;

    // Progression constants
    this.gameTime = 0; // Elapsed game time in seconds
  }

  reset(canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.activeFish = [];
    this.spawnTimer = 0;
    this.gameTime = 0;
  }

  update(dt, playerSize, baseRadius, particleSystem) {
    this.gameTime += dt;

    // Linear progression factor (0.0 at 0s, 1.0 at 300s / 5 mins)
    const progression = Math.min(1.0, this.gameTime / 300);

    // Difficulty curve scaling
    const minActiveFish = Math.floor(Utils.lerp(6, 18, progression));
    const spawnInterval = Utils.lerp(1.8, 0.6, progression); // seconds between spawns
    const baseSpeed = Utils.lerp(1.8, 3.8, progression);

    // Update & check off-screen fish
    for (let i = this.activeFish.length - 1; i >= 0; i--) {
      const fish = this.activeFish[i];
      fish.update(dt, particleSystem);

      if (fish.isOffScreen(this.canvasWidth)) {
        // Remove completely from memory
        this.activeFish.splice(i, 1);
      }
    }

    // Spawn timer tick
    this.spawnTimer += dt;
    if (this.activeFish.length < minActiveFish || this.spawnTimer >= spawnInterval) {
      this.spawnFish(playerSize, baseRadius, baseSpeed);
      this.spawnTimer = 0;
    }
  }

  spawnFish(playerSize, baseRadius, baseSpeed) {
    // 1. Direction: 50% Left->Right, 50% Right->Left
    const direction = Math.random() < 0.5 ? 1 : -1;

    // 2. Spawn X position outside the screen canvas
    const spawnX = direction === 1 ? -60 : this.canvasWidth + 60;

    // 3. Roll for Golden Fish (5% chance)
    const isGoldenRoll = Math.random() < 0.05;
    let selectedSpecies = null;
    let fishSize = 1.0;

    if (isGoldenRoll) {
      selectedSpecies = FISH_SPECIES.find(s => s.id === 'golden');
      fishSize = Math.max(0.4, playerSize * Utils.randomRange(0.4, 0.8)); // Always edible!
    } else {
      // Determine if fish should be Edible (60%) or Predator (40%)
      const isEdible = Math.random() < 0.60;

      if (isEdible) {
        // Size range: 0.3x to 0.92x of player size
        const minSize = Math.max(0.3, playerSize * 0.3);
        const maxSize = Math.max(0.4, playerSize * 0.92);
        fishSize = Utils.randomRange(minSize, maxSize);
      } else {
        // Size range: 1.1x to 2.2x of player size
        const minSize = playerSize * 1.1;
        const maxSize = Math.min(12.0, playerSize * 2.2);
        fishSize = Utils.randomRange(minSize, maxSize);
      }

      // Pick closest matching species from FISH_SPECIES based on size
      const nonGolden = FISH_SPECIES.filter(s => !s.isGolden);
      selectedSpecies = nonGolden.reduce((prev, curr) => {
        return Math.abs(curr.baseSize - (fishSize / playerSize)) < Math.abs(prev.baseSize - (fishSize / playerSize)) ? curr : prev;
      });
    }

    // Collision radius calculation based on size ratio
    const radius = baseRadius * (1 + Math.log10(fishSize) * 1.5);

    // Random Y coordinate within screen boundaries (with safety margin)
    const margin = radius + 30;
    const spawnY = Utils.randomRange(margin, this.canvasHeight - margin - 40);

    // Speed variation (+- 20%)
    const speed = baseSpeed * Utils.randomRange(0.85, 1.2);

    const newFish = new Fish({
      x: spawnX,
      y: spawnY,
      direction: direction,
      species: selectedSpecies,
      size: fishSize,
      radius: radius,
      speed: speed
    });

    this.activeFish.push(newFish);
  }

  draw(ctx) {
    for (let fish of this.activeFish) {
      fish.draw(ctx);
    }
  }

  removeFish(fishInstance) {
    const idx = this.activeFish.indexOf(fishInstance);
    if (idx !== -1) {
      this.activeFish.splice(idx, 1);
    }
  }
}
