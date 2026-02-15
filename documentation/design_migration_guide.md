# Design Migration Guide: Lesury MVP to Next.js

This document provides detailed specifications for replicating the exact design and feel of the Lesury MVP website in the new Next.js codebase.

---

## 1. Typography & Fonts

### Primary Font
**Font Family:** `Inter` (from Google Fonts)  
**Import:** `https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap`

### Font Stack
```css
font-family: 'Inter', 'DM Sans', 'Archivo', system-ui, sans-serif;
```

### Font Weights Used
- **Regular:** 400
- **Medium:** 500
- **Semibold:** 600
- **Bold:** 700
- **Extra Bold:** 800

### Typography Classes (Critical)
- **Headings (h1):** `text-5xl md:text-7xl font-extrabold` (font-weight: 800)
- **Subheadings (h2):** `text-3xl md:text-4xl font-bold` (font-weight: 700)
- **Body large:** `text-xl md:text-2xl` (font-weight: 400)
- **Buttons:** `font-bold` or `font-semibold`

> [!IMPORTANT]
> The Inter font must be loaded with weights 400, 500, 600, 700, and 800. Missing weights will cause text to render incorrectly.

---

## 2. Color Palette ("Paper & Ink" Theme)

### Background Colors
```javascript
cream: '#FAF9F5'      // Primary background
cararra: '#F0EFEA'    // Secondary background, cards
lightGray: '#E8E6DC'  // Borders, tertiary background
```

### Text Colors
```javascript
codGray: '#141413'    // Primary text, almost black
midGray: '#B0AEA5'    // Secondary text, muted
```

### Accent Colors
```javascript
terracotta: '#D97757' // Primary accent (orange-red)
mutedBlue: '#6A9BCC'  // Secondary accent (blue)
sage: '#788C5D'       // Tertiary accent (green)
antiqueBrass: '#CC785C' // Alternative accent
```

### Usage Guidelines
- **Page background:** `bg-cream` (#FAF9F5)
- **Section alternates:** `bg-cararra` (#F0EFEA)
- **Primary buttons:** `bg-codGray text-cream`
- **Secondary buttons:** `bg-cararra text-codGray border-2 border-lightGray`
- **Accents/highlights:** `text-terracotta` or `bg-terracotta`

---

## 3. Logo Component

### Logo Specifications

**Image:** A circular sloth illustration with a thick black border  
**Format:** PNG with transparent background  
**Styling:** `rounded-full object-cover`

### Implementation Details
```jsx
// Logo sizes
small: 'h-8 w-8'     // Text: text-lg
default: 'h-10 w-10' // Text: text-2xl
large: 'h-12 w-12'   // Text: text-3xl

// Logo structure
<button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
  <img 
    src="/lesury-logo.png" 
    alt="Lesury"
    className="h-10 w-10 rounded-full object-cover"
  />
  <span className="text-2xl font-extrabold text-codGray">
    lesury
  </span>
</button>
```

> [!IMPORTANT]
> The logo must use `rounded-full` class to achieve the circular appearance. Do NOT use the image as a squared picture.

### Logo Branding
![Lesury Logo](file:///home/clickout/Projekty/lesury/client/public/lesury-logo.png)

The logo shows a minimalist sloth face design with:
- Thick circular black border
- Clean line art illustration
- Cream/light background inside the circle
- Must always be displayed as `rounded-full`

---

## 4. Animated Header Illustration (Homepage Hero)

### Animation Requirements

The animated illustration consists of multiple elements with **Framer Motion** animations:

#### Main Structure
```jsx
<div className="relative w-full max-w-md">
  {/* TV/Monitor - Static */}
  <div className="bg-codGray rounded-3xl p-4 shadow-2xl">
    <div className="bg-cream rounded-2xl p-8 aspect-video flex items-center justify-center">
      {/* Game Screen Content */}
    </div>
  </div>

  {/* Floating Phone 1 - Animated */}
  <motion.div
    animate={{ y: [0, -8, 0] }}
    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    className="absolute -bottom-4 -left-8 bg-codGray rounded-2xl p-2 shadow-xl"
  >
    <div className="bg-cream rounded-xl w-16 h-24 flex items-center justify-center">
      <span className="text-2xl">📱</span>
    </div>
  </motion.div>

  {/* Floating Phone 2 - Animated with delay */}
  <motion.div
    animate={{ y: [0, -10, 0] }}
    transition={{ duration: 2.3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
    className="absolute -bottom-2 -right-6 bg-codGray rounded-2xl p-2 shadow-xl"
  >
    <div className="bg-cream rounded-xl w-16 h-24 flex items-center justify-center">
      <span className="text-2xl">📱</span>
    </div>
  </motion.div>

  {/* Connection dots - Pulsing animation */}
  <div className="absolute top-1/2 -left-16 flex gap-1">
    {[...Array(4)].map((_, i) => (
      <motion.div
        key={i}
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
        className="w-2 h-2 bg-terracotta rounded-full"
      />
    ))}
  </div>
</div>
```

### Critical Animation Details

1. **Phone 1 (Left):**
   - Vertical bounce: `y: [0, -8, 0]`
   - Duration: `2s`
   - Easing: `easeInOut`
   - Infinite loop
   - No delay

2. **Phone 2 (Right):**
   - Vertical bounce: `y: [0, -10, 0]`
   - Duration: `2.3s`
   - Easing: `easeInOut`
   - Delay: `0.5s`
   - Infinite loop

3. **Connection Dots:**
   - 4 dots in a row
   - Opacity pulse: `[0.3, 1, 0.3]`
   - Duration: `1.5s`
   - Each dot delayed by `i * 0.2` seconds
   - Color: `bg-terracotta`

> [!WARNING]
> The illustration MUST use Framer Motion animations. Static illustrations will not match the original design. Install `framer-motion` package: `npm install framer-motion`

---

## 5. Button Styles

### Primary Button (Dark)
```jsx
className="px-8 py-4 bg-codGray text-cream font-bold text-lg rounded-2xl 
  hover:bg-opacity-90 transition-all duration-200 shadow-lg hover:shadow-xl
  active:scale-[0.98]"
```

**Specifications:**
- Background: `#141413` (codGray)
- Text: `#FAF9F5` (cream)
- Padding: `px-8 py-4` (2rem horizontal, 1rem vertical)
- Border radius: `rounded-2xl` (1rem)
- Font: `font-bold text-lg`
- Hover: Reduces opacity to 90%, increases shadow
- Active: Scales down to 98%
- Transition: `200ms` for all properties

### Secondary Button (Light)
```jsx
className="px-8 py-4 bg-cararra text-codGray font-bold text-lg rounded-2xl 
  border-2 border-lightGray hover:border-codGray transition-all duration-200
  shadow-md hover:shadow-lg active:scale-[0.98]"
```

**Specifications:**
- Background: `#F0EFEA` (cararra)
- Text: `#141413` (codGray)
- Border: `2px solid #E8E6DC` (lightGray), hover changes to codGray
- Padding: Same as primary
- Border radius: `rounded-2xl`
- Font: `font-bold text-lg`
- Active: Scales down to 98%

### Small Navigation Button
```jsx
className="px-6 py-2 bg-codGray text-cream font-semibold rounded-full
  hover:bg-opacity-90 transition-all duration-200"
```

**Specifications:**
- Uses `rounded-full` instead of `rounded-2xl`
- Smaller padding: `px-6 py-2`
- Font: `font-semibold` instead of `font-bold`

> [!IMPORTANT]
> Buttons must include the `active:scale-[0.98]` class for the subtle press effect that's present in the MVP.

---

## 6. Game Cards (Games Library Page)

### Card Structure
```jsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: index * 0.1 }}
  onClick={() => game.available && navigate(game.path)}
  className={`
    relative bg-cararra rounded-2xl p-6 shadow-md transition-all duration-200
    ${game.available
      ? 'cursor-pointer hover:shadow-xl hover:scale-[1.02] hover:bg-white'
      : 'opacity-60 cursor-not-allowed'
    }
  `}
>
  {/* Coming Soon Badge */}
  {!game.available && (
    <div className="absolute top-4 right-4 bg-midGray text-cream text-xs font-semibold px-2 py-1 rounded-full">
      Coming Soon
    </div>
  )}

  {/* Icon */}
  <div className="text-5xl mb-4">{game.icon}</div>

  {/* Title */}
  <h3 className="text-xl font-bold text-codGray mb-2">{game.title}</h3>

  {/* Description */}
  <p className="text-midGray text-sm mb-4 line-clamp-2">{game.description}</p>

  {/* Meta info */}
  <div className="flex gap-4 text-sm text-midGray">
    <div className="flex items-center gap-1">
      <span>👥</span>
      <span>{game.players}</span>
    </div>
    <div className="flex items-center gap-1">
      <span>⏱️</span>
      <span>{game.duration}</span>
    </div>
  </div>

  {/* Play button overlay for available games */}
  {game.available && (
    <motion.div
      initial={{ opacity: 0 }}
      whileHover={{ opacity: 1 }}
      className="absolute inset-0 bg-codGray bg-opacity-90 rounded-2xl 
        flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
    >
      <span className="text-cream font-bold text-lg">Play Now →</span>
    </motion.div>
  )}
</motion.div>
```

### Card Specifications

**Base Styling:**
- Background: `bg-cararra` (#F0EFEA)
- Border radius: `rounded-2xl`
- Padding: `p-6`
- Shadow: `shadow-md`

**Available Games:**
- Cursor: `cursor-pointer`
- Hover: `hover:shadow-xl hover:scale-[1.02] hover:bg-white`
- Clickable overlay that shows on hover

**Coming Soon Games:**
- Opacity: `opacity-60`
- Cursor: `cursor-not-allowed`
- Badge: Top-right corner, gray background

**Icon:**
- Size: `text-5xl`
- Margin bottom: `mb-4`

**Title:**
- Size: `text-xl`
- Font: `font-bold`
- Color: `text-codGray`

**Description:**
- Color: `text-midGray`
- Size: `text-sm`
- Limited to 2 lines: `line-clamp-2`

**Meta Info:**
- Emoji icons (👥 for players, ⏱️ for duration)
- Color: `text-midGray`
- Size: `text-sm`
- Flex layout with gap

**Hover Overlay:**
- Dark overlay: `bg-codGray bg-opacity-90`
- Centered text: "Play Now →"
- Framer Motion: `initial={{ opacity: 0 }} whileHover={{ opacity: 1 }}`

### Card Grid Layout
```jsx
<div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  {/* Cards here */}
</div>
```

---

## 7. Layout Sections & Spacing

### Page Structure
```jsx
<div className="min-h-screen bg-cream">
  {/* Navigation */}
  <nav className="flex justify-between items-center px-8 py-6 max-w-7xl mx-auto">
    {/* Logo and nav items */}
  </nav>

  {/* Other sections */}
</div>
```

### Container Widths
- **Standard content:** `max-w-7xl mx-auto`
- **Narrow content:** `max-w-5xl mx-auto`
- **Form/CTA sections:** `max-w-3xl mx-auto`
- **Buttons group:** `max-w-sm`

### Padding & Spacing
- **Page sections:** `px-8 py-16` or `px-8 py-12`
- **Hero section:** `px-8 py-16 md:py-24`
- **Navigation:** `px-8 py-6`
- **Footer:** `px-8 py-8`

---

## 8. Framer Motion Animations

### Page Entry Animations

**Standard fade-in with slide up:**
```jsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
>
```

**Delayed animations:**
```jsx
<motion.div
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.7, delay: 0.2 }}
>
```

**List/Grid items with staggered entry:**
```jsx
{items.map((item, index) => (
  <motion.div
    key={item.id}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
  >
```

**Scroll-triggered animations:**
```jsx
<motion.div
  initial={{ opacity: 0 }}
  whileInView={{ opacity: 1 }}
  viewport={{ once: true }}
>
```

### Navigation Animations
```jsx
// Logo (from left)
<motion.div
  initial={{ opacity: 0, x: -20 }}
  animate={{ opacity: 1, x: 0 }}
>

// Button (from right)
<motion.div
  initial={{ opacity: 0, x: 20 }}
  animate={{ opacity: 1, x: 0 }}
>
```

---

## 9. Additional Styling Details

### Border Radius Standards
- **Large containers:** `rounded-3xl` (1.5rem)
- **Cards and buttons:** `rounded-2xl` (1rem)
- **Small elements:** `rounded-xl` (0.75rem)
- **Pills/badges:** `rounded-full`

### Shadow Levels
- **Base:** `shadow-md`
- **Hover (cards):** `shadow-xl`
- **Large elements:** `shadow-2xl`
- **Buttons:** `shadow-lg`, hover to `shadow-xl`

### Transitions
- **Standard duration:** `duration-200` (200ms)
- **Smooth easing:** Use `transition-all` for multiple properties
- **Specific properties:** `transition-colors`, `transition-opacity`, `transition-shadow`

### Custom Scrollbar Styling
```css
::-webkit-scrollbar {
  height: 8px;
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #F0EFEA; /* cararra */
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #B0AEA5; /* midGray */
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #141413; /* codGray */
}
```

---

## 10. Key Dependencies

### Required NPM Packages
```json
{
  "dependencies": {
    "framer-motion": "^11.0.3"
  }
}
```

### TailwindCSS Configuration
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        cream: '#FAF9F5',
        cararra: '#F0EFEA',
        lightGray: '#E8E6DC',
        codGray: '#141413',
        midGray: '#B0AEA5',
        terracotta: '#D97757',
        mutedBlue: '#6A9BCC',
        sage: '#788C5D',
        antiqueBrass: '#CC785C',
      },
      fontFamily: {
        sans: ['Inter', 'DM Sans', 'Archivo', 'system-ui', 'sans-serif'],
      },
    },
  },
}
```

### Global CSS
```css
body {
  font-family: 'Inter', 'DM Sans', 'Archivo', system-ui, sans-serif;
  background-color: #FAF9F5; /* cream */
  color: #141413; /* codGray */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

---

## 11. Common Mistakes to Avoid

> [!CAUTION]
> These are the exact issues mentioned by the user that you must avoid:

### ❌ Font Issues
**Problem:** Using default system fonts instead of Inter  
**Solution:** Import Inter from Google Fonts with weights 400-800

### ❌ Static Illustrations
**Problem:** Using static images instead of animated components  
**Solution:** Implement Framer Motion animations exactly as specified in Section 4

### ❌ Square Logo
**Problem:** Displaying the logo with square corners  
**Solution:** Always use `rounded-full` class on the logo image

### ❌ Button Styling Mismatch
**Problem:** Using different padding, border-radius, or missing hover effects  
**Solution:** Copy exact button classes from Section 5

### ❌ Card Appearance
**Problem:** Cards look different from the MVP  
**Solution:** Follow the exact structure in Section 6, including hover overlays and badge positioning

---

## 12. Quick Reference Checklist

- [ ] Import Inter font with weights 400, 500, 600, 700, 800
- [ ] Configure all color values in Tailwind config
- [ ] Install framer-motion package
- [ ] Logo uses `rounded-full` class
- [ ] Hero illustration has animated floating phones
- [ ] Connection dots pulse with terracotta color
- [ ] Primary buttons use `bg-codGray` with `rounded-2xl`
- [ ] Secondary buttons have border that changes on hover
- [ ] Game cards have hover overlay with "Play Now →"
- [ ] All animations use proper Framer Motion syntax
- [ ] Custom scrollbar styles applied
- [ ] Page background is `bg-cream` (#FAF9F5)

---

## Visual Reference

### Color Swatches
- **cream:** `#FAF9F5` - Light warm background
- **cararra:** `#F0EFEA` - Slightly darker warm background
- **lightGray:** `#E8E6DC` - Borders and subtle elements
- **codGray:** `#141413` - Almost black text and dark buttons
- **midGray:** `#B0AEA5` - Muted secondary text
- **terracotta:** `#D97757` - Warm orange-red accent

This palette creates a warm, paper-like aesthetic with high readability and subtle elegance.
