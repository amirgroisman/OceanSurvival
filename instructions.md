Here's a more complete prompt that gives an AI coding agent enough information to produce a polished game instead of just a prototype.

---

# Browser Game Prompt

## Project

Create a polished browser game using HTML5, CSS, and JavaScript (Canvas API or Phaser.js if preferred). The game should run entirely in the browser with no backend.

## Game Concept

The player controls a small orange fish swimming through the ocean. Numerous AI-controlled fish of different species, colors, patterns, and sizes continuously swim across the screen.

The gameplay is inspired by classic "eat smaller fish to grow" mechanics.

---

## Gameplay

### Player

- The player controls a small orange fish.
    
- Movement uses the Arrow Keys or WASD.
    
- The player can freely move in both X and Y directions.
    
- Movement should feel smooth with slight acceleration and deceleration rather than instant movement.
    
- The player cannot leave the visible screen.
    

---

### AI Fish

Generate many fish with:

- Different sizes
    
- Different colors
    
- Different body shapes
    
- Different fins
    
- Different swimming speeds
    
- Slight swimming animation (tail movement)
    

Rules:

- Every fish moves only horizontally.
    
- Each fish chooses its direction when spawned:
    
    - Left → Right
        
    - Right → Left
        
- It never changes direction.
    
- Fish can spawn anywhere on the Y axis.
    
- Fish must begin outside the screen.
    
- Fish swim completely across the screen before disappearing.
    

When a fish leaves the opposite side:

- Remove it completely from memory.
    
- Immediately spawn another fish outside the screen.
    

Never recycle invisible fish indefinitely.

---

## Difficulty Progression

The game starts relaxed.

At time = 0

- Fish spawn slowly.
    
- Few fish exist simultaneously.
    

As time increases:

Increase linearly:

- Average fish speed
    
- Spawn frequency
    
- Number of simultaneous fish
    

Avoid sudden difficulty spikes.

The progression should feel natural over approximately 5–10 minutes.

---

## Eating Rules

Every fish has a size value.

If:

Player size > target fish size

→ Player eats the fish.

If:

Player size < target fish size

→ Game Over.

If sizes are nearly identical (within a small tolerance)

→ Treat as dangerous (Game Over).

---

## Growth

Every fish eaten:

- Increases player size slightly.
    
- Increases collision radius.
    
- Slightly scales the player sprite.
    

Growth should slow as the player becomes larger to avoid exponential scaling.

---

## Winning

The player wins after reaching a predefined size threshold.

Display:

# YOU GREW INTO THE KING OF THE OCEAN!

with a simple victory animation.

---

## Game Over

If the player collides with a larger fish:

- Freeze gameplay.
    
- Play a short death animation.
    
- Display:
    

GAME OVER

Along with:

- Final size
    
- Fish eaten
    
- Survival time
    

Include a Restart button.

---

## Collision

Collision should feel forgiving.

Use circular collision rather than pixel-perfect collision.

---

## Ocean Environment

Create an immersive underwater atmosphere.

Include:

- Animated water gradient
    
- Light rays from above
    
- Floating bubbles
    
- Tiny drifting particles
    
- Occasional seaweed near the bottom
    
- Slight camera movement or parallax
    
- Soft underwater color palette
    

The environment should feel alive without distracting from gameplay.

---

## Visual Style

The game should feel cute rather than realistic.

Fish should have:

- Big expressive eyes
    
- Rounded shapes
    
- Bright colors
    
- Smooth animations
    

Avoid photo-realism.

Think:

- Mobile indie game
    
- Casual arcade
    
- Family friendly
    

---

## Audio

Include:

- Calm underwater ambient music
    
- Bubble sound effects
    
- Eating sound
    
- Game Over sound
    
- Victory fanfare
    

Provide volume controls.

---

## UI

Display:

Top Left:

- Current Size
    

Top Right:

- Fish Eaten
    

Center Top:

- Time Survived
    

Start screen includes:

- Title
    
- Play button
    
- Controls
    
- Objective
    

---

## Performance

Target:

- 60 FPS
    
- Smooth animation
    
- Efficient memory usage
    
- Remove off-screen objects immediately
    
- Object pooling is acceptable if implemented cleanly
    

---

## Nice-to-Have Features

If time allows:

- Multiple fish species
    
- Rare golden fish worth extra growth
    
- Bubble particle effects when eating
    
- Combo bonus for quick consecutive eats
    
- Pause menu
    
- High score stored in Local Storage
    
- Responsive layout for desktop and mobile
    

---

## Code Quality

Produce clean, modular, well-commented code.

Organize into:

- Game
    
- Player
    
- Fish
    
- Collision
    
- Spawner
    
- UI
    
- Audio
    
- Utilities
    

Avoid monolithic files.

---

# Image Generation Prompt

Use this prompt to generate consistent game art assets.

> **Create a cheerful 2D underwater game art style for a casual browser game. The scene features a cute small orange fish with large expressive eyes, rounded fins, and a friendly personality. Surround it with many colorful tropical fish of different shapes, sizes, and vibrant colors (blue, yellow, purple, green, red, striped, spotted). The underwater environment contains turquoise water, soft light rays from the ocean surface, floating bubbles, tiny particles, coral reefs, seaweed, rocks, shells, and subtle parallax layers. The art should have clean vector-like shapes, smooth gradients, soft shadows, colorful cartoon aesthetics, polished mobile-game quality, Pixar-inspired charm (without copying any specific character), bright, playful, family-friendly, high readability, and a consistent 2D game asset style with transparent backgrounds where appropriate.**

### Asset Variations

Generate separate assets for:

- Main orange fish (5 growth stages)
    
- Small edible fish (15–20 variations)
    
- Medium fish
    
- Large dangerous fish
    
- Rare golden fish
    
- Coral
    
- Seaweed
    
- Rocks
    
- Bubble sprites
    
- Ocean background layers
    
- Light rays
    
- UI buttons
    
- Start screen illustration
    
- Game Over screen illustration
    
- Victory screen illustration
    

This will give you a cohesive visual set suitable for assembling into the game while keeping the art style consistent.