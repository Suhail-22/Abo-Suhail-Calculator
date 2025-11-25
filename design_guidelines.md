# Abo Suhail Calculator - Design Guidelines

## Design Approach
**Reference-Based (Material Design + Custom Dark/Gold Theme)** - Professional calculator with strong visual identity, optimized for Arabic RTL layout.

## Core Design Principles
1. **Offline-First Excellence** - Visual feedback for cached/uncached states
2. **Arabic-Centric** - RTL layout, Arabic numerals support, elegant Arabic typography
3. **Dual Theme System** - Light (minimalist) and Dark (premium gold accent)
4. **Touch-Optimized** - Large, tactile buttons with haptic feedback
5. **Progressive Enhancement** - Core functionality works, enhanced features layer on top

## Typography
- **Primary Fonts**: Tajawal (default), Cairo, Almarai via Google Fonts CDN
- **Font Scaling**: Base 16px with user-adjustable scale (0.8x - 1.2x)
- **Hierarchy**:
  - Display Numbers: 2.5rem-4rem (dynamic based on length), bold, tabular numerals
  - Expressions: 1.25rem, regular weight, monospace feel
  - UI Labels: 0.875rem-1rem, medium weight
  - Branding: Serif italic for "𝒜𝒷ℴ 𝒮𝓊𝒽𝒶𝒾𝓁"

## Layout System
**Spacing Units (Tailwind)**: Consistent use of 2, 3, 4, 6, 8, 12 units
- Component padding: `p-4` to `p-6`
- Gap between elements: `gap-2` to `gap-4`
- Section margins: `mb-4` to `mb-6`
- Panel padding: `p-5`

**Grid Structure**:
- Calculator buttons: 5-column grid (`grid-cols-5`)
- Settings sections: Single column with collapsible groups
- History items: Stacked cards with left border accent

## Color System

### Light Theme
- Background: Linear gradient `#f0f4f8` to `#d9e2ec`
- Calculator body: `#ffffff`
- Number buttons: `#f0f4f8`
- Function buttons: `#d9e2ec`
- Equals button: `#2196F3` (blue) with white text
- Text: `#102a43` (primary), `#627d98` (secondary)
- Borders: `#bcccdc`
- Display: `#f8fafc` background

### Dark Theme (Premium)
- Background: Black to `#050A14` gradient
- Calculator body: `#050A14`
- Number buttons: `#101B35` (dark blue-gray)
- Function buttons: `#1A2B4D` (medium blue-gray)
- Equals button: `#00C853` (green) with white text
- Text: `#FFD700` (gold primary), `#B0C4DE` (light blue secondary)
- Accent color: `#FFD700` (gold) throughout
- Display: Pure `#000000` background with `#E0FFFF` cyan text
- Borders: `#1A2B4D`

### Error States
- Error background: `rgba(255,61,0,0.15)`
- Error border: Gold to red gradient with glow
- Error text: `#ff3d00`

## Component Library

### Calculator Body
- Rounded corners: `12px` (light), `4px` (dark - more technical feel)
- Elevation: Subtle shadow in light mode, none in dark
- Backdrop blur: `backdrop-blur-xl` for glassmorphism
- Border: 1px solid primary border color
- Landscape mode: Split layout with Display+Header on left, Buttons on right

### Display Component
- Min height: 220px, grows with content
- Inset shadow for depth
- Dynamic font sizing (6xl down to 2xl based on result length)
- Error highlighting: Red background with bold text
- Tax indicators: Small cyan labels above numbers
- Editable on tap (textarea replacement)
- LTR text direction for numbers

### Buttons
- Height: `py-4` (generous touch target)
- Text size: `text-2xl`
- Border: 1px with theme color
- Shadow: Raised 3D effect (2-3px drop shadow)
- Active state: Translate down 2px, inset shadow
- Brightness reduction on active
- Transition: 100ms for responsiveness
- Equals button: 2-column span, subtle pulse animation

### Header Bar
- Fixed height icons: 48px × 48px (`w-12 h-12`)
- Rounded: `10px`
- Background: Inset subtle dark overlay
- Branding: Center with serif script font + tax mode badge
- Entry counter: Mini badge with icon + number

### Side Panels (Settings, History, Support)
- Width: `320px` or `85vw` (mobile)
- Full height, fixed position
- Border: 2px on edge
- Slide animation: 300ms cubic-bezier easing
- Header: Title + close button, bottom border
- Content: Scrollable with custom scrollbar (8px, accent color)

### History Cards
- Background: Light inset color
- Rounded: `lg`
- Padding: `p-3`
- Hover: Darker background
- Daily groups: Date header with total in center, count on left, share button
- Left border accent: 2px, 30% opacity
- Inline notes: Edit on tap, save/cancel buttons

### About Modal
- Centered overlay with backdrop blur
- Max width: 360px
- Gold glow effect: Blurred circle at top
- Logo: 80px rounded square with gradient background
- Feature list: Right-aligned with emoji icons
- Footer: Version info in tiny gray text

### Offline Resource Manager
- Progress bars: Slim (1.5px), blue accent
- Status badges: Colored (blue=downloading, green=cached, red=error)
- Download buttons: Small, rounded, primary color

## Animations
- **Entry animations**: `animate-container-in` (scale + opacity), `animate-pop-in` (slide up)
- **Panel slides**: 300ms transform translateX
- **Button press**: Translate down 2px with shadow change
- **Pulse effect**: Equals button subtle scale (1.0 to 1.02)
- **Notifications**: Bounce in from bottom, fade out after 3s
- **No excessive motion** - prioritize performance

## Accessibility
- ARIA labels on icon-only buttons
- Role attributes for dialogs
- Keyboard navigation support (editable display)
- Color contrast: WCAG AA compliant (gold on dark backgrounds)
- Touch targets: Minimum 48px height
- Screen reader friendly labels in Arabic

## Images
**No images required** - Pure UI components with SVG icons only.
- Icon library: Custom SVG paths defined in `Icon.tsx`
- App icon: `assets/icon.svg` (stylized calculator)
- Emojis used for decorative accents (✨, 📊, 📡, 🎨, etc.)

## Special Features
- **Haptic Feedback**: Vibration on button press (20-70ms based on action)
- **Sound Effects**: Web Audio API with frequency-based tones per button type
- **Theme Switching**: Instant with CSS variable updates
- **Custom Colors**: User-selectable via color pickers for 5 different UI elements
- **Font Customization**: Family selection + scaling slider
- **Orientation Lock**: Portrait mode option for mobile

## Responsive Behavior
- Portrait: Stacked layout (Header → Display → Buttons)
- Landscape: Split horizontal (Display+Header | Buttons)
- Panels: Always overlay, never push content
- Font sizes: Scale with user preference, not viewport
- Button grid: Always 5 columns, scales naturally