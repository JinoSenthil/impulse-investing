# Installation & Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 18.0 or higher)
  - Download from: https://nodejs.org/
  - Verify: `node --version`

- **npm** (comes with Node.js) or **yarn** or **pnpm**
  - Verify npm: `npm --version`
  - Or install yarn: `npm install -g yarn`
  - Or install pnpm: `npm install -g pnpm`

- **Git** (optional, for version control)
  - Download from: https://git-scm.com/

## Installation Steps

### Step 1: Extract the Project

Extract the `impulse-trading-app.zip` file to your desired location.

```bash
unzip impulse-trading-app.zip
cd impulse-trading-app
```

### Step 2: Install Dependencies

Choose one of the following package managers:

**Using npm:**
```bash
npm install
```

**Using yarn:**
```bash
yarn install
```

**Using pnpm:**
```bash
pnpm install
```

This will install all the required dependencies listed in `package.json`:
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- And more...

### Step 3: Run the Development Server

Start the development server:

**Using npm:**
```bash
npm run dev
```

**Using yarn:**
```bash
yarn dev
```

**Using pnpm:**
```bash
pnpm dev
```

### Step 4: Open in Browser

Open your browser and navigate to:
```
http://localhost:3000
```

You should see the IMPULSE Trading Platform homepage!

## Available Scripts

In the project directory, you can run:

### `npm run dev` (or `yarn dev` / `pnpm dev`)
Runs the app in development mode.
- Open http://localhost:3000 to view it in the browser
- The page will reload when you make changes
- You will see build errors and warnings in the console

### `npm run build` (or `yarn build` / `pnpm build`)
Builds the app for production to the `.next` folder.
- Optimizes the build for best performance
- The build is minified
- Creates optimized production build

### `npm run start` (or `yarn start` / `pnpm start`)
Runs the built app in production mode.
- Must run `npm run build` first
- Server runs on http://localhost:3000

### `npm run lint` (or `yarn lint` / `pnpm lint`)
Runs ESLint to check code quality.
- Identifies potential errors
- Enforces code style

## Project Structure Overview

```
impulse-trading-app/
├── app/                 # Next.js App Router pages
├── components/          # React components
├── public/             # Static files
├── package.json        # Dependencies
└── ...config files
```

See `STRUCTURE.md` for detailed project structure.

## Development Workflow

### 1. Make Changes

Edit files in the `app/` or `components/` directories:

**To modify the home page:**
- Edit sections in `components/sections/`
- Modify `app/page.tsx`

**To modify the dashboard:**
- Edit `app/dashboard/page.tsx`
- Modify `components/sections/DashboardContent.tsx`

**To change styles:**
- Edit `tailwind.config.js` for theme colors
- Edit `app/globals.css` for custom CSS

### 2. See Changes Live

The development server supports hot reload:
- Save your file
- Browser automatically updates
- No manual refresh needed

### 3. Add New Pages

Create new pages by adding files to `app/` directory:

```bash
# Create a new page
mkdir app/new-page
touch app/new-page/page.tsx
```

Example `page.tsx`:
```tsx
export default function NewPage() {
  return <h1>New Page</h1>
}
```

Access at: `http://localhost:3000/new-page`

## Common Issues & Solutions

### Issue: "Cannot find module 'next'"

**Solution:** Run `npm install` to install all dependencies

### Issue: Port 3000 is already in use

**Solution:** 
- Stop the other process using port 3000
- Or run on a different port:
  ```bash
  PORT=3001 npm run dev
  ```

### Issue: TypeScript errors

**Solution:**
- Check `tsconfig.json` is present
- Run `npm install typescript --save-dev`
- Restart your IDE/editor

### Issue: Styles not applying

**Solution:**
- Ensure Tailwind is configured correctly
- Check `tailwind.config.js` and `postcss.config.js`
- Restart the dev server

### Issue: Fonts not loading

**Solution:**
- Fonts are loaded from Google Fonts
- Ensure you have internet connection
- Check `app/layout.tsx` font configuration

## Environment Variables

Create a `.env.local` file in the root directory for environment-specific variables:

```env
# Example environment variables
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_SITE_URL=https://impulse.com
```

Access in code:
```typescript
const apiUrl = process.env.NEXT_PUBLIC_API_URL
```

## Building for Production

### Step 1: Create Production Build

```bash
npm run build
```

This creates an optimized production build in `.next/` folder.

### Step 2: Test Production Build Locally

```bash
npm run start
```

### Step 3: Deploy

Deploy to your preferred hosting platform:

**Vercel (Recommended for Next.js):**
1. Push code to GitHub
2. Import project in Vercel
3. Deploy automatically

**Other Options:**
- Netlify
- AWS
- DigitalOcean
- Your own VPS

## Customization Guide

### Change Colors

Edit `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      accent: {
        gold: '#your-color',
      },
    },
  },
}
```

### Change Fonts

Edit `app/layout.tsx`:

```typescript
import { YourFont } from 'next/font/google'

const yourFont = YourFont({ 
  subsets: ['latin'],
  variable: '--font-your-font'
})
```

### Add New Components

Create in `components/` directory:

```bash
touch components/ui/YourComponent.tsx
```

```tsx
export default function YourComponent() {
  return <div>Your Component</div>
}
```

## Getting Help

- **Documentation:** See README.md and STRUCTURE.md
- **Next.js Docs:** https://nextjs.org/docs
- **React Docs:** https://react.dev
- **Tailwind Docs:** https://tailwindcss.com/docs

## Next Steps

1. ✅ Install dependencies
2. ✅ Run development server
3. 📝 Customize content and styles
4. 🔧 Add your own features
5. 🚀 Build and deploy

Happy coding! 🚀
