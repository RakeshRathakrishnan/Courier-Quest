# Courier Quest - Prototype Game with Demo Video

## 📦 Files Included
All files must be in the same **Project** folder:
- `index.html` - Main game HTML file
- `main.js` - Game JavaScript code  
- `demo.webm` - Demo gameplay video

## 🚀 How to Use

### Setup:
1. **Keep all three files in the same folder** (your "Project" folder)
   ```
   Project/
   ├── index.html
   ├── main.js
   └── demo.webm
   ```

2. **Open index.html in your web browser**
   - Double-click `index.html`, OR
   - Right-click → "Open with" → your browser (Chrome/Firefox/Edge)

### Playing the Game:
- **Move**: Arrow Keys or WASD
- **Pause**: P key
- **Restart**: R key or click "Restart" button
- **Watch Demo**: Click the "Watch Demo" button to see gameplay video

## 🎮 Game Features

### Objective:
- Collect packages (cyan/teal squares)
- Deliver them to drop-off points (yellow squares)
- Avoid hazards (red cars on street, orange bots in subway)

### Game Mechanics:
- **60 seconds** per run (timer resets when you level up)
- **3 lives** - lose one when hit by hazards
- **Progressive difficulty**: Hazards speed up as timer runs down AND as you level up
- **Level System**:
  - Start at Level 1 on the Street
  - **First switch**: Deliver 20 total packages → switch to Subway (Level 2)
  - **After that**: Every delivery switches areas and increases level
  - Each level makes hazards 25% faster!
- **Two areas** that alternate: 
  - **Street** - horizontal moving cars (red)
  - **Subway** - vertical moving bots (orange)
- **Scoring**: Each package delivered = 1 point
- **Continuous pickups**: Up to 4 active packages spawn throughout gameplay

### Difficulty Scaling:
- **Timer-based**: Hazards get 1x → 3x faster as time runs down (within each level)
- **Level-based**: Each level adds +25% hazard speed (compounds with timer speed)
- **Timer resets**: Each time you level up (switch areas), you get a fresh 60 seconds
- **Rapid progression**: After reaching 20 packages, every delivery increases difficulty!

## 🎥 Demo Video Feature

Click **"Watch Demo"** to:
- View a gameplay recording
- Learn game mechanics
- See strategies in action

The video:
- Opens in a modal overlay
- Plays automatically
- Has standard video controls (play/pause/volume)
- Can be closed by:
  - Clicking the X button
  - Clicking outside the video
  - Using browser's ESC key

## 🎨 Visual Design

### Street Arena (Odd Levels):
- Dark blue background (#15202b)
- White lane markings
- Red hazards (cars moving horizontally)

### Subway Arena (Even Levels):
- Very dark background (#0f1018)  
- Light tile markers
- Orange hazards (bots moving vertically)

### Game Elements:
- **Player**: Green square (flashes when invulnerable)
- **Packages**: Cyan/teal squares
- **Drop-offs**: Yellow squares
- **Hazards**: Red (street) or orange (subway)

## 🔧 Troubleshooting

**Game doesn't load:**
- ✓ All 3 files in same folder
- ✓ Opening `index.html` (not main.js)
- ✓ Try different browser
- ✓ Check browser console for errors (F12)

**Demo video doesn't play:**
- ✓ `demo.webm` in same folder as index.html
- ✓ Browser supports WebM format
- ✓ Try clicking play button on video controls
- ✓ Some browsers block autoplay - just click play

**Game runs but something's wrong:**
- ✓ Hard refresh: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
- ✓ Clear browser cache
- ✓ Make sure you're using a modern browser

## 🎯 Game Tips

1. **First 20 packages**: Take your time, collect multiple packages before delivering
2. **After 20 packages**: Each delivery switches areas and increases difficulty - plan carefully!
3. **Watch the timer**: Hazards speed up dramatically as time runs low
4. **Use invulnerability**: After getting hit, you're safe for 1 second - use it wisely!
5. **Area awareness**: Learn both Street (horizontal) and Subway (vertical) patterns
6. **Strategic delivering**: After level 2, consider if you want to trigger the next level yet!

## 📊 Scoring & Level System

- Each package delivered = 1 point
- Score = Total packages delivered
- **Level progression**:
  - Level 1: Street (starting level)
  - Level 2: Unlocks at 20 delivered packages (switches to Subway)
  - Level 3+: Increases with EVERY delivery after that
- Areas alternate: Street ↔ Subway ↔ Street ↔ Subway...
- Each level = +25% hazard speed (stacks indefinitely!)
- High score tracked across sessions

## 🏆 High Score

Your highest score is tracked! The game will show:
- "(NEW HIGHSCORE!)" flash for 2 seconds when you beat your record
- Special message on game over if you set a new record

## ⌨️ Full Controls Reference

| Key/Button | Action |
|------------|--------|
| ↑ / W | Move Up |
| ↓ / S | Move Down |
| ← / A | Move Left |
| → / D | Move Right |
| P | Pause/Unpause |
| R | Restart Game |
| N | (Not currently used) |
| Restart Button | Restart Game |
| Watch Demo Button | Open Video Modal |

---

**Enjoy playing Courier Quest!** 🚚📦

Good luck achieving the highest score! 🎮
