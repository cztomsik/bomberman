# Bomberman Clone

A browser-based Bomberman game with AI opponents, built with vanilla JavaScript.

[Play the game here](https://cztomsik.github.io/bomberman/)

## Features

- Classic Bomberman gameplay
- 3 AI opponents with intelligent behavior
- Power-ups (extra bombs, increased blast power, speed boost)
- Emoji-based graphics
- No build tools required - pure vanilla JavaScript

## How to Play

### Controls
- **Arrow Keys**: Move your character
- **Spacebar**: Place a bomb

### Objective
Be the last player standing by strategically placing bombs to:
- Destroy crates to find power-ups
- Eliminate AI opponents
- Avoid getting caught in explosions

### Power-ups
- 💣 **Extra Bomb**: Increase the number of bombs you can place simultaneously
- 🔥 **Blast Power**: Increase the explosion range of your bombs
- 👟 **Speed Boost**: Move faster around the map

## AI Behavior

The AI opponents feature:
- Smart pathfinding to navigate the map
- Strategic bomb placement to destroy crates and attack players
- Escape planning to avoid their own explosions
- Power-up collection
- Dynamic goal prioritization

## Local Development

1. Clone the repository:
```bash
git clone https://github.com/cztomsik/bomberman.git
cd bomberman
```

2. Open `index.html` in a web browser, or serve it locally:
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve
```

3. Navigate to `http://localhost:8000`

## Testing

Run the test suite:
```bash
npm test
```

Run AI behavior tests:
```bash
node test-ai.js
```

## Project Structure

- `index.html` - Main game page
- `main.js` - UI layer and DOM rendering
- `game.js` - Core game engine
- `ai.js` - AI controller implementation
- `test-ai.js` - AI behavior testing
- `tests/` - Unit tests for game logic

## Browser Compatibility

Requires a modern browser with ES6 module support:
- Chrome/Edge 61+
- Firefox 60+
- Safari 11+

## License

MIT