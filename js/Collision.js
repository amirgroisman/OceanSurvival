/* Ocean Feeding Frenzy - Collision Detection & Interaction Rules */

class CollisionDetector {
  static checkCollisions(player, spawner, particleSystem, audioManager, uiManager) {
    if (player.isDead) return null;

    const playerX = player.x;
    const playerY = player.y;
    // Forgiving collision: 80% visual radius for collision hitbox
    const playerHitRadius = player.radius * 0.8;

    const activeFish = spawner.activeFish;

    for (let i = activeFish.length - 1; i >= 0; i--) {
      const fish = activeFish[i];
      const fishHitRadius = fish.radius * 0.8;

      const dist = Utils.distance(playerX, playerY, fish.x, fish.y);

      // Circle collision check
      if (dist < playerHitRadius + fishHitRadius) {
        
        // Eating tolerance check (player must be strictly larger by 2% threshold)
        const sizeRatio = player.size / fish.size;

        if (sizeRatio >= 1.02) {
          // --- EAT FISH SUCCESS ---
          const growthGain = fish.isGolden ? 0.35 : Math.max(0.04, fish.size * 0.12);
          player.grow(growthGain);

          // Spawn particle burst
          const burstColor = fish.isGolden ? '#ffd700' : fish.species.colorGrad[0];
          particleSystem.spawnEatBurst(fish.x, fish.y, burstColor, fish.isGolden ? 20 : 12);

          // Audio
          if (fish.isGolden) {
            audioManager.playGolden();
          } else {
            audioManager.playEat();
          }

          // UI score popup
          const text = fish.isGolden ? '+0.35cm ⭐' : `+${growthGain.toFixed(2)}cm`;
          uiManager.showFloatingPopup(fish.x, fish.y, text, fish.isGolden ? '#ffd700' : '#00d2ff');

          // Remove fish from spawner
          spawner.removeFish(fish);

          return {
            type: 'EAT',
            fish: fish,
            growth: growthGain,
            isGolden: fish.isGolden
          };

        } else {
          // --- PLAYER GETS EATEN (GAME OVER) ---
          player.isDead = true;
          audioManager.playGameOver();
          particleSystem.spawnEatBurst(player.x, player.y, '#ff4757', 25);

          return {
            type: 'GAME_OVER',
            predator: fish
          };
        }
      }
    }

    return null;
  }
}
