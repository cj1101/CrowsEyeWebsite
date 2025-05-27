# Configuration Directory

This directory contains all configuration files for development tools and build processes.

## 📁 Configuration Files

### Testing Configuration
- **`jest.config.js`** - Jest testing framework configuration
- **`jest.setup.js`** - Jest setup file for test environment initialization

### Code Quality & Linting
- **`eslint.config.mjs`** - ESLint configuration for code linting and style enforcement

### Styling & Build Tools
- **`tailwind.config.ts`** - Tailwind CSS configuration for styling
- **`postcss.config.mjs`** - PostCSS configuration for CSS processing

## 🔧 Configuration Details

### Jest Configuration (`jest.config.js`)
- Configures Next.js integration with Jest
- Sets up module name mapping for TypeScript paths
- Defines test environment as jsdom for React component testing
- Points to setup file for test initialization

### ESLint Configuration (`eslint.config.mjs`)
- Extends Next.js recommended ESLint rules
- Configures TypeScript-specific linting rules
- Sets up code style and quality standards

### Tailwind Configuration (`tailwind.config.ts`)
- Defines content paths for Tailwind CSS scanning
- Extends default theme with custom colors and styles
- Configures Crow's Eye brand colors and design tokens

### PostCSS Configuration (`postcss.config.mjs`)
- Integrates Tailwind CSS with PostCSS
- Configures CSS processing pipeline

## 🚀 Usage

These configuration files are automatically used by their respective tools:

```bash
# Jest uses jest.config.js automatically
npm run test

# ESLint uses eslint.config.mjs
npm run lint

# Tailwind and PostCSS configs are used during build
npm run build
```

## 📝 Customization

### Adding New Tailwind Colors
Edit `tailwind.config.ts` to add custom colors:

```typescript
theme: {
  extend: {
    colors: {
      'custom-color': '#your-hex-code',
    }
  }
}
```

### Modifying ESLint Rules
Edit `eslint.config.mjs` to add or modify linting rules:

```javascript
rules: {
  'your-rule': 'error',
}
```

### Jest Test Configuration
Modify `jest.config.js` for test-specific settings:

```javascript
testMatch: ['**/__tests__/**/*.test.ts'],
```

## 🔄 Synchronization

Some configuration files are copied to the project root for tool compatibility:
- `tailwind.config.ts` → `../tailwind.config.ts`
- `postcss.config.mjs` → `../postcss.config.mjs`

When modifying these files, ensure both versions are updated or run the sync script. 