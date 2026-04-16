# IMPULSE Trading Platform

A modern, professional trading education platform built with Next.js 14, React, TypeScript, and Tailwind CSS.

## Features

- 🎨 Modern, responsive design with custom color scheme
- 📊 Trading indicators showcase
- 🎓 Course catalog and enrollment
- 📰 Market news section
- 👤 User dashboard with progress tracking
- 🔐 Separate dashboard area for logged-in users
- ⚡ Fast and optimized with Next.js App Router
- 💅 Styled with Tailwind CSS
- 🔤 Custom Google Fonts (Cinzel & Montserrat)

## Project Structure

```
impulse-trading-app/
├── app/
│   ├── dashboard/
│   │   └── page.tsx          # Dashboard page
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Home page
├── components/
│   ├── sections/
│   │   ├── About.tsx
│   │   ├── Contact.tsx
│   │   ├── Courses.tsx
│   │   ├── DashboardContent.tsx
│   │   ├── Enrollment.tsx
│   │   ├── Features.tsx
│   │   ├── Hero.tsx
│   │   ├── Indicators.tsx
│   │   └── News.tsx
│   └── ui/
│       ├── Footer.tsx
│       ├── Navigation.tsx
│       └── Sidebar.tsx
├── public/                    # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── next.config.js
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

1. **Install dependencies:**

```bash
npm install
# or
yarn install
# or
pnpm install
```

2. **Run the development server:**

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

3. **Open your browser:**

Navigate to [http://localhost:3000](http://localhost:3000)

### Building for Production

```bash
npm run build
npm run start
```

## Pages

- **Home (`/`)** - Landing page with all sections:
  - Hero
  - Features
  - Indicators
  - Courses
  - News
  - Enrollment Form
  - About
  - Contact

- **Dashboard (`/dashboard`)** - User dashboard with:
  - Stats overview
  - Course progress
  - Quick actions
  - Recent activity

## Customization

### Colors

Edit the color scheme in `tailwind.config.js`:

```javascript
colors: {
  bg: {
    primary: '#0a1a1a',
    secondary: '#0d2626',
    card: '#133333',
  },
  accent: {
    gold: '#d4af37',
    green: '#00ff88',
  },
  // ...
}
```

### Fonts

Fonts are configured in `app/layout.tsx` using Google Fonts:
- **Cinzel** - Headings and branding
- **Montserrat** - Body text

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Fonts:** Google Fonts (Cinzel, Montserrat)
- **UI Components:** Custom React components

## Development

### File Organization

- **`app/`** - Next.js App Router pages and layouts
- **`components/sections/`** - Page section components
- **`components/ui/`** - Reusable UI components
- **`public/`** - Static assets (images, fonts, etc.)

### Best Practices

- Components use TypeScript for type safety
- Client components are marked with `'use client'` directive
- Responsive design using Tailwind's breakpoint system
- Semantic HTML for better accessibility
- SEO-friendly with proper meta tags

## License

This project is private and proprietary.

## Support

For support, email support@impulse.com or contact us through the website.
