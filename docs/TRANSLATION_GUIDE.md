# Translation Guide for Crow's Eye Website

This guide explains how to use and maintain the internationalization (i18n) system for the Crow's Eye Marketing Suite website.

## Overview

The website supports 10 languages, matching the Python desktop application:
- English (en) 🇺🇸
- Spanish (es) 🇪🇸  
- French (fr) 🇫🇷
- German (de) 🇩🇪
- Portuguese (pt) 🇵🇹
- Russian (ru) 🇷🇺
- Japanese (ja) 🇯🇵
- Chinese (zh) 🇨🇳
- Hindi (hi) 🇮🇳
- Arabic (ar) 🇸🇦

## File Structure

```
crows-eye-website/
├── src/
│   ├── lib/
│   │   └── i18n.ts                    # Core i18n configuration
│   └── components/
│       ├── I18nProvider.tsx           # Translation provider component
│       └── LanguageSelector.tsx       # Language switcher component
└── public/
    └── translations/
        ├── en.json                    # English (complete)
        ├── es.json                    # Spanish (complete)
        ├── fr.json                    # French (complete)
        ├── de.json                    # German (complete)
        ├── pt.json                    # Portuguese (placeholder)
        ├── ru.json                    # Russian (placeholder)
        ├── ja.json                    # Japanese (placeholder)
        ├── zh.json                    # Chinese (placeholder)
        ├── hi.json                    # Hindi (placeholder)
        └── ar.json                    # Arabic (placeholder)
```

## How to Use Translations in Components

### 1. Import the hook
```tsx
import { useI18n } from '@/lib/i18n'
```

### 2. Use the translation function
```tsx
export default function MyComponent() {
  const { t } = useI18n()
  
  return (
    <div>
      <h1>{t('hero.title')}</h1>
      <p>{t('hero.description')}</p>
    </div>
  )
}
```

### 3. Using parameters
```tsx
const { t } = useI18n()

// Translation with parameters
const message = t('download.detected_os', { os: 'Windows' })
// Result: "We detected you're using Windows"
```

## Translation Keys Structure

Translation keys use dot notation for organization:

```json
{
  "nav.home": "Home",
  "nav.demo": "Demo",
  "hero.title": "Crow's Eye Marketing Suite",
  "hero.subtitle": "Your AI-Powered Command Center",
  "features.ai_content.title": "AI-Powered Content",
  "features.ai_content.description": "Leverage advanced AI...",
  "common.loading": "Loading...",
  "common.error": "Error"
}
```

### Key Categories:
- `nav.*` - Navigation items
- `hero.*` - Hero section content
- `features.*` - Feature descriptions
- `demo.*` - Demo page content
- `download.*` - Download page content
- `waitlist.*` - Waitlist section
- `cta.*` - Call-to-action sections
- `language.*` - Language selector
- `common.*` - Common UI elements

## Adding New Translations

### 1. Add to English file first
Edit `public/translations/en.json` and add your new key:

```json
{
  "new.section.title": "New Section Title",
  "new.section.description": "Description of the new section"
}
```

### 2. Update other language files
Add the same keys to all other language files with appropriate translations.

### 3. Use in components
```tsx
const { t } = useI18n()
return <h2>{t('new.section.title')}</h2>
```

## Language Detection and Storage

The system automatically:
1. Detects the user's browser language on first visit
2. Falls back to English if the detected language isn't supported
3. Saves the user's language preference in localStorage
4. Remembers the preference on subsequent visits

## Language Switching

Users can switch languages using the language selector in the navigation bar. The component:
- Shows current language with flag and name
- Provides dropdown with all available languages
- Persists selection in localStorage
- Reloads translations immediately

## Fallback System

If a translation is missing:
1. The system tries to load the requested language
2. If that fails, it falls back to English
3. If English also fails, it shows the translation key as-is
4. Errors are logged to the console for debugging

## Maintaining Translations

### Current Status:
- ✅ **English**: Complete and up-to-date
- ✅ **Spanish**: Complete and up-to-date  
- ✅ **French**: Complete and up-to-date
- ✅ **German**: Complete and up-to-date
- ⚠️ **Portuguese**: Placeholder (uses English)
- ⚠️ **Russian**: Placeholder (uses English)
- ⚠️ **Japanese**: Placeholder (uses English)
- ⚠️ **Chinese**: Placeholder (uses English)
- ⚠️ **Hindi**: Placeholder (uses English)
- ⚠️ **Arabic**: Placeholder (uses English)

### To Complete Missing Translations:

1. **Copy the structure** from `en.json`
2. **Translate each value** while keeping the keys identical
3. **Test the translations** by switching languages
4. **Consider cultural context** and local conventions

### Translation Guidelines:

1. **Keep keys consistent** across all language files
2. **Maintain the same parameter placeholders** (e.g., `{os}`, `{size}`)
3. **Consider text length** - some languages are longer than others
4. **Test UI layout** with longer translations
5. **Use appropriate formality** for the target audience
6. **Consider RTL languages** (Arabic) for future UI adjustments

## Python Program Integration

The website's translation system is designed to match the Python desktop application's i18n system:

### Shared Languages:
Both the website and Python app support the same 10 languages, ensuring consistency across platforms.

### Key Mapping:
While the key structures differ between web and desktop, the supported languages and general translation approach are aligned.

### Future Synchronization:
Consider creating a shared translation management system to keep both platforms in sync.

## Development Tips

### 1. Testing Translations
```bash
# Start development server
npm run dev

# Test different languages using the language selector
# Check browser console for missing translation warnings
```

### 2. Adding New Pages
When creating new pages, follow this pattern:

```tsx
'use client'
import { useI18n } from '@/lib/i18n'

export default function NewPage() {
  const { t } = useI18n()
  
  return (
    <div>
      <h1>{t('newpage.title')}</h1>
      <p>{t('newpage.description')}</p>
    </div>
  )
}
```

### 3. Debugging Missing Translations
Check the browser console for warnings like:
```
Failed to load translations for es, falling back to English
```

### 4. Performance Considerations
- Translation files are loaded on-demand
- Only the current language is loaded at any time
- Files are cached by the browser
- Consider lazy loading for very large translation files

## Future Enhancements

1. **Translation Management System**: Implement a CMS for easier translation management
2. **Automated Translation**: Use AI for initial translations that can be refined manually
3. **Pluralization**: Add support for plural forms in different languages
4. **Date/Number Formatting**: Localize dates, numbers, and currencies
5. **RTL Support**: Add right-to-left text support for Arabic
6. **Translation Validation**: Automated checks for missing keys across languages

## Contributing Translations

If you'd like to contribute translations:

1. Fork the repository
2. Complete translations for your language in `public/translations/[lang].json`
3. Test the translations locally
4. Submit a pull request with your changes
5. Include screenshots showing the UI in your language

## Support

For translation-related issues:
- Check this guide first
- Look for console errors in browser dev tools
- Verify translation file syntax (valid JSON)
- Ensure all required keys are present
- Test with different browsers and devices 