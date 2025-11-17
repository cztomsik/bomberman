# Poker Game Design Specification

## Overview
A single-player Texas Hold'em poker game implemented in one HTML file with embedded CSS and JavaScript. The player competes against a simple AI opponent.

## Game Rules
- **Texas Hold'em Variant**: Each player receives 2 hole cards, 5 community cards are dealt (3 flop, 1 turn, 1 river)
- **Single Opponent**: Player vs. AI dealer
- **Starting Chips**: Both players start with 1000 chips
- **Betting Rounds**: Pre-flop, flop, turn, river
- **Actions**: Fold, Check/Call, Raise
- **Hand Rankings**: Standard poker hand rankings (high card to royal flush)

## User Interface Layout

### Game Board Structure
```
┌─────────────────────────────────────────┐
│              POKER GAME                 │
├─────────────────────────────────────────┤
│  AI Chips: 1000    [AI Cards: ?? ??]   │
│                                         │
│      [Community Cards Area]            │
│         □ □ □ □ □                      │
│                                         │
│  Player Chips: 1000                    │
│    [Player Cards: A♠ K♠]              │
│                                         │
│  Pot: $50                              │
│  [Fold] [Call $10] [Raise]             │
│                                         │
│  Game Messages: "Your turn to act"     │
└─────────────────────────────────────────┘
```

### Visual Elements
- **Cards**: Standard 52-card deck with suit symbols (♠♥♦♣)
- **Card Back**: Generic card back design for hidden cards
- **Chip Counter**: Display current chip counts for both players
- **Pot Display**: Show current pot amount
- **Action Buttons**: Styled buttons for player actions
- **Game Status**: Text area for game messages and instructions

## Technical Architecture

### HTML Structure
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Poker Game</title>
    <style>/* Embedded CSS */</style>
</head>
<body>
    <div id="game-container">
        <div id="ai-area"><!-- AI cards and chips --></div>
        <div id="community-area"><!-- Community cards --></div>
        <div id="player-area"><!-- Player cards and chips --></div>
        <div id="controls"><!-- Action buttons --></div>
        <div id="game-info"><!-- Pot, messages --></div>
    </div>
    <script>/* Embedded JavaScript */</script>
</body>
</html>
```

### CSS Features
- **Flexbox Layout**: Responsive design using flexbox
- **Card Styling**: CSS-based playing cards with proper suit colors
- **Animations**: Smooth card dealing and betting animations
- **Button Styling**: Attractive, clickable action buttons
- **Color Scheme**: Green felt background, white cards, gold accents

### JavaScript Functionality

#### Core Classes/Objects
```javascript
class Card {
    constructor(suit, rank)
    toString()
    getValue()
}

class Deck {
    constructor()
    shuffle()
    deal()
}

class Player {
    constructor(name, chips)
    addCard(card)
    bet(amount)
    fold()
}

class Game {
    constructor()
    startHand()
    dealCards()
    evaluateHands()
    determineWinner()
}
```

#### Game Flow
1. **Initialization**: Create deck, players, shuffle cards
2. **Hand Start**: Deal 2 cards to each player, post blinds
3. **Betting Rounds**:
   - Pre-flop: Players act on hole cards
   - Flop: Deal 3 community cards, betting round
   - Turn: Deal 1 community card, betting round
   - River: Deal 1 community card, final betting round
4. **Showdown**: Evaluate best hands, determine winner
5. **Hand End**: Award pot, check for game end, start new hand

#### Hand Evaluation Algorithm
- **Hand Types**: High card, pair, two pair, three of a kind, straight, flush, full house, four of a kind, straight flush, royal flush
- **Comparison Logic**: Compare hand types, then compare high cards within type
- **Best Hand Selection**: Choose best 5-card hand from 7 available cards

#### AI Behavior
- **Simple Strategy**: Based on hand strength and pot odds
- **Pre-flop**: Fold weak hands, call/raise strong hands
- **Post-flop**: Consider hand strength and potential draws
- **Betting Patterns**: Randomized within strategy guidelines

## Game Features

### Core Features
- [x] Complete 52-card deck implementation
- [x] Two-player Texas Hold'em gameplay
- [x] All betting actions (fold, check, call, raise)
- [x] Proper hand evaluation and comparison
- [x] Chip management and pot calculation
- [x] Game state management

### User Experience Features
- [x] Clear visual card representation
- [x] Intuitive button controls
- [x] Real-time game status updates
- [x] Smooth animations for card dealing
- [x] Responsive design for different screen sizes

### Nice-to-Have Features
- [ ] Sound effects for actions
- [ ] Card dealing animations
- [ ] Betting history display
- [ ] Statistics tracking
- [ ] Multiple AI difficulty levels

## Technical Constraints
- **Single File**: All code must be in one HTML file
- **No External Dependencies**: Pure HTML, CSS, and JavaScript
- **Browser Compatibility**: Modern browsers (ES6+ features allowed)
- **Performance**: Smooth gameplay on typical desktop/mobile devices

## File Structure
```
poker-game/
├── DESIGN.md (this file)
└── index.html (complete game implementation)
```

## Development Approach
1. Create basic HTML structure and CSS styling
2. Implement card and deck classes
3. Add player and game management
4. Implement hand evaluation logic
5. Add AI decision-making
6. Polish UI and add animations
7. Test gameplay and fix bugs