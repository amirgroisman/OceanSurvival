/* Ocean Feeding Frenzy - Utilities */

const Utils = {
  // Clamp value between min and max
  clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  },

  // Linear interpolation
  lerp(start, end, amt) {
    return (1 - amt) * start + amt * end;
  },

  // Random number within range [min, max)
  randomRange(min, max) {
    return min + Math.random() * (max - min);
  },

  // Random integer within range [min, max]
  randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  // Pick random element from an array
  randomChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  },

  // Calculate Euclidean distance between two points
  distance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  },

  // Format seconds to MM:SS string
  formatTime(seconds) {
    const totalSecs = Math.floor(seconds);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    const formattedMins = String(mins).padStart(2, '0');
    const formattedSecs = String(secs).padStart(2, '0');
    return `${formattedMins}:${formattedSecs}`;
  },

  // Draw rounded rectangle path on canvas context
  drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  },

  // Easing function for smooth animation transitions
  easeOutBack(x) {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
  }
};
