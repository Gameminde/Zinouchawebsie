# Design Guidelines - Premium Women's Fashion E-Commerce

## Design Approach
**Selected Approach**: Reference-Based (Premium E-Commerce)
- **Primary References**: Net-a-Porter, Sephora, and luxury fashion platforms
- **Design Philosophy**: Elegant, feminine, and sophisticated with modern animations
- **Key Principles**: Premium aesthetics, seamless UX, emotional engagement through visual storytelling

## Core Design Elements

### A. Color Palette

**Primary Colors:**
- Background: #FFF5F7 (soft pink white)
- Primary Accent: #E8B4BC (dusty rose)
- Text Primary: #1A1A1A (deep black)
- CTA/Gold Accent: #D4AF37 (elegant gold)

**Supporting Colors:**
- White: #FFFFFF for cards and contrast
- Light Gray: #F5F5F5 for subtle backgrounds
- Border/Divider: #E5E5E5

### B. Typography

**Font Families:**
- **Display/Headings**: 'Playfair Display' (serif, elegant)
- **Body Text**: 'Inter' (clean, modern readability)

**Font Scale:**
- Hero Title: text-6xl to text-7xl (bold/semibold)
- Section Headers: text-3xl to text-4xl
- Product Titles: text-xl to text-2xl
- Body: text-base to text-lg
- Captions: text-sm

### C. Layout System

**Spacing Units**: Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24, 32
- Section padding: py-16 to py-24 (desktop), py-8 to py-12 (mobile)
- Card padding: p-6 to p-8
- Component gaps: gap-4 to gap-8

**Responsive Breakpoints:**
- Mobile: 320px (base)
- Tablet: 768px (md:)
- Desktop: 1024px (lg:)
- Large Desktop: 1440px (xl:)

**Grid System:**
- Products: grid-cols-1 md:grid-cols-2 lg:grid-cols-4
- Collections: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Max-width containers: max-w-7xl

### D. Component Library

**Hero Section:**
- Full-screen (min-h-screen) with large lifestyle image
- Parallax scrolling effect
- Fade-in animations (0.6s duration)
- Centered CTA with gold gradient button
- Overlay gradient for text readability

**Product Cards:**
- Image with aspect-ratio-square
- Hover: scale-105 transform with shadow-xl
- Transition duration: 0.3s
- Badge overlays (New, Sale) in top-right
- Quick-view button on hover
- Wishlist heart icon (top-left)

**Buttons:**
- Primary: Gold gradient with white text
- Secondary: Outline with pink accent
- Hover: Ripple effect + slight scale (1.02)
- Border-radius: rounded-full for CTAs, rounded-lg for others

**Form Elements:**
- Input fields: rounded-lg with focus:ring-2 ring-pink-300
- Checkboxes/Radio: Custom styled with pink accents
- Dropdowns: Clean with chevron icons

**Navigation:**
- Desktop: Transparent header with backdrop-blur on scroll
- Mobile: Slide-in hamburger menu with smooth animation
- Sticky header with shadow on scroll

**Modals & Sidebars:**
- Backdrop blur with bg-black/30
- Slide animations (right for cart, center for modals)
- Glassmorphism effect: backdrop-blur-md bg-white/90

**Product Gallery:**
- Main image with click-to-zoom lightbox
- Thumbnail carousel below
- Hover magnification on desktop

### E. Animations

**Page Load:**
- Fade-in elements with stagger (0.1s intervals)
- Slide-up for content sections

**Interactions:**
- Button hover: scale(1.02) with shadow enhancement
- Card hover: scale(1.05) with shadow-2xl
- Image hover: slight zoom (1.1) within container
- Smooth transitions: 0.3s ease-in-out

**Micro-animations:**
- Cart icon bounce on add-to-cart
- Wishlist heart fill animation
- Success checkmarks with scale-in
- Loading spinners: rotating gradient

**Scroll Effects:**
- Fade-in on viewport entry
- Parallax on hero sections
- Fixed/sticky elements with smooth reveal

## Images

**Hero Section:**
- Large lifestyle image (1920x1080px minimum)
- Professional model in elegant pose wearing featured collection
- Soft, natural lighting with pink/gold color grading
- Blurred background for text overlay clarity

**Product Images:**
- High-quality product photography on white background
- Lifestyle shots for category headers
- Multiple angles (front, back, detail shots)
- Consistent aspect ratio (1:1 for products)

**Collection Cards:**
- Curated lifestyle imagery matching each collection theme
- Models in aspirational settings
- Consistent color treatment with brand palette

**Additional Imagery:**
- Instagram-style feed integration in footer
- Customer review photos (user-generated content)
- About/Story section with founder imagery
- Trust badges and payment icons

## Special Features

**Glassmorphism Elements:**
- Apply to premium section cards
- CSS: backdrop-filter: blur(12px); background: rgba(255,255,255,0.7)
- Subtle shadow for depth

**Loading States:**
- Skeleton screens with shimmer animation
- Progress indicators during checkout
- Smooth content replacement (no flash)

**Mobile-First Optimizations:**
- Touch-friendly targets (min 44x44px)
- Swipe gestures for image galleries
- Bottom sheet modals for mobile
- Hamburger menu with full-screen overlay

This design creates a luxurious, conversion-optimized shopping experience that balances visual elegance with functional clarity, perfect for a premium women's fashion e-commerce platform.