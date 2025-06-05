# 🌍 Automatic Translation System

This document explains how the automatic translation system works for the Crow's Eye Website. The system automatically translates all website content into **11 languages** whenever you update content.

## 🎯 Supported Languages

The website supports the following 11 languages:

1. 🇺🇸 **English** (en) - Base language
2. 🇪🇸 **Español** (es) - Spanish  
3. 🇫🇷 **Français** (fr) - French
4. 🇩🇪 **Deutsch** (de) - German
5. 🇮🇹 **Italiano** (it) - Italian
6. 🇵🇹 **Português** (pt) - Portuguese
7. 🇷🇺 **Русский** (ru) - Russian
8. 🇯🇵 **日本語** (ja) - Japanese
9. 🇨🇳 **中文** (zh) - Chinese
10. 🇮🇳 **हिन्दी** (hi) - Hindi
11. 🇸🇦 **العربية** (ar) - Arabic

## 🚀 Quick Start

### Check Translation Status
```bash
npm run translate:check
```

### Translate Missing Content
```bash
npm run translate
```

### Force Retranslation of Everything
```bash
npm run translate:force
```

### View Translation Statistics
```bash
npm run translate:stats
```

## 🔧 How It Works

### 1. Base Language System
- **English** is the base language for all translations
- All content is written first in English in `/public/translations/en.json`
- Other languages are automatically generated from English

### 2. Automatic Translation Process
When you run the translation commands:

1. **Loads** the English translation file
2. **Compares** with existing translation files for each language
3. **Identifies** missing or outdated translations
4. **Translates** content using Google Translate API
5. **Protects** special content (URLs, emails, brand names)
6. **Saves** updated translation files

### 3. Protected Content
Certain content is **never translated** to preserve accuracy:

- **Brand names**: "Crow's Eye Marketing Suite"
- **URLs**: `https://crowseyeapp.com`
- **Email addresses**: `help@crowseye.tech`
- **Technical terms**: API keys, file paths

### 4. Real-Time Language Switching
Users can switch languages using the language selector in the navigation:
- Instantly loads translations for the selected language
- Remembers user preference in localStorage
- Falls back to English if translations are missing

## 📁 File Structure

```
public/translations/
├── en.json          # English (base language)
├── es.json          # Spanish
├── fr.json          # French  
├── de.json          # German
├── it.json          # Italian
├── pt.json          # Portuguese
├── ru.json          # Russian
├── ja.json          # Japanese
├── zh.json          # Chinese
├── hi.json          # Hindi
└── ar.json          # Arabic

src/
├── lib/i18n.ts                    # Translation configuration
├── components/I18nProvider.tsx    # Translation context provider
├── components/LanguageSelector.tsx # Language switcher UI
└── utils/translation-manager.ts   # Translation management utilities

scripts/
└── translate.js                   # Automatic translation script
```

## 🛠️ Available Commands

### Basic Commands
```bash
# Check what translations are missing
npm run translate:check

# Translate only missing content (recommended)
npm run translate

# Force retranslation of everything (use carefully)  
npm run translate:force

# Show detailed statistics
npm run translate:stats

# Validate and clean translation files
npm run translate:validate
```

### Advanced Commands
```bash
# Translate only Spanish
node scripts/translate.js --lang=es

# Check status for specific language
node scripts/translate.js --lang=fr --check

# Show help
node scripts/translate.js --help
```

## 🔄 Workflow for Content Updates

### When You Add New Content:

1. **Add English text** to `/public/translations/en.json`
   ```json
   {
     "new.feature.title": "Amazing New Feature",
     "new.feature.description": "This feature will revolutionize your workflow."
   }
   ```

2. **Check missing translations**
   ```bash
   npm run translate:check
   ```

3. **Run automatic translation**
   ```bash
   npm run translate
   ```

4. **Verify results** in browser by switching languages

### When You Update Existing Content:

1. **Update English text** in `/public/translations/en.json`

2. **Force retranslation** for updated content
   ```bash
   npm run translate:force
   ```

3. **Test** the updated translations

## 🔑 Google Translate API Setup

For automatic translation to work, you need to set up Google Translate API:

### 1. Get API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the **Cloud Translation API**
4. Create credentials (API Key)
5. Copy your API key

### 2. Set Environment Variable
Create a `.env.local` file in your project root:

```bash
GOOGLE_TRANSLATE_API_KEY=your_api_key_here
GOOGLE_CLOUD_PROJECT_ID=your_project_id
```

### 3. Alternative: Manual Translation
If you don't have Google Translate API, the system will:
- Show warnings about missing API key
- Use fallback mode (returns original text)
- You can manually edit translation files

## 🎨 Using Translations in Components

### Basic Usage
```tsx
import { useI18n } from '@/lib/i18n'

function MyComponent() {
  const { t } = useI18n()
  
  return (
    <div>
      <h1>{t('page.title')}</h1>
      <p>{t('page.description')}</p>
    </div>
  )
}
```

### With Parameters
```tsx
function WelcomeMessage({ userName }: { userName: string }) {
  const { t } = useI18n()
  
  return <h1>{t('welcome.message', { name: userName })}</h1>
  // English: "welcome.message": "Welcome, {name}!"
  // Output: "Welcome, John!"
}
```

### Language Detection
```tsx
function LanguageInfo() {
  const { language } = useI18n()
  
  return <div>Current language: {language}</div>
}
```

## 🐛 Troubleshooting

### Missing Translations
```bash
# Check what's missing
npm run translate:check

# Fill missing translations
npm run translate
```

### Invalid Translation Files
```bash
# Validate and clean up
npm run translate:validate
```

### Translation Errors
```bash
# Check the console for specific error messages
# Verify your Google Translate API key
# Check network connectivity
```

### Cache Issues
If translations aren't updating:
1. Clear browser cache and localStorage
2. Force retranslation: `npm run translate:force`
3. Restart the development server

## 📊 Translation Quality

### Automatic vs Manual
- **Automatic translations** are good for initial setup and quick updates
- **Manual review** is recommended for:
  - Marketing copy
  - Technical documentation  
  - Cultural-specific content
  - Critical user-facing text

### Best Practices
1. **Keep English text clear** and well-written
2. **Use consistent terminology** across the site
3. **Review automatic translations** for accuracy
4. **Test in different languages** regularly
5. **Consider cultural context** for different markets

## 🔄 Integration with Build Process

The translation system is integrated with your build process:

```bash
# Before every build, check translations
npm run build  # Automatically runs translate:check

# For deployment
npm run translate        # Update translations
npm run build           # Build with updated translations  
npm run deploy          # Deploy to production
```

## 📝 Adding New Languages

To add a new language (e.g., Korean):

1. **Update language configuration** in `src/lib/i18n.ts`:
   ```ts
   export const AVAILABLE_LANGUAGES = {
     // ... existing languages
     ko: { name: '한국어', flag: '🇰🇷' }
   }
   ```

2. **Update translation script** in `scripts/translate.js`:
   ```js
   const GOOGLE_TRANSLATE_CODES = {
     // ... existing codes
     ko: 'ko'
   }
   ```

3. **Run translation**:
   ```bash
   npm run translate:force
   ```

4. **Test the new language** in the language selector

## 🎯 Performance Optimization

The translation system is optimized for performance:

- **Lazy loading**: Translation files loaded only when needed
- **Caching**: Translations cached in memory and localStorage
- **Bundling**: Only active language included in bundle
- **CDN**: Translation files served from CDN for fast loading

## 📚 Advanced Usage

### Custom Translation Keys
```json
{
  "dynamic.content": "You have {count} {type}",
  "pluralization": "{count, plural, =0 {no items} =1 {one item} other {# items}}"
}
```

### Context-Aware Translations
```tsx
const { t, language } = useI18n()

// Different formatting for different languages
const formatDate = (date: Date) => {
  if (language === 'ar') {
    return date.toLocaleDateString('ar-SA')
  }
  return date.toLocaleDateString()
}
```

## 🤝 Contributing

When contributing new features:

1. **Add English translations** first
2. **Run translation check** before submitting PR
3. **Test in multiple languages** 
4. **Update documentation** if needed

## 📞 Support

If you encounter issues with the translation system:

1. **Check this documentation** first
2. **Run diagnostic commands** (`npm run translate:check`)
3. **Check console logs** for error messages
4. **Contact the development team** with specific error details

---

## 🎉 You're All Set!

Your website now automatically translates content into 11 languages! 

**Remember**: Every time you update content, just run `npm run translate` to keep all languages synchronized.

Happy translating! 🌍✨ 