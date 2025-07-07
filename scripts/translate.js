#!/usr/bin/env node

/**
 * Crow's Eye Website - Automatic Translation Script
 * 
 * This script automatically translates all website content to all 11 supported languages.
 * Run this whenever you update content to keep all translations synchronized.
 * 
 * Usage:
 *   node scripts/translate.js [options]
 * 
 * Options:
 *   --force       Force retranslation of all content (even existing translations)
 *   --check       Only check for missing translations, don't translate
 *   --stats       Show translation statistics
 *   --validate    Validate translation file structure
 *   --lang=XX     Translate only specific language (e.g., --lang=es)
 *   --help        Show this help message
 */

const fs = require('fs');
const path = require('path');
const { Translate } = require('@google-cloud/translate').v2;

// Available languages configuration
const AVAILABLE_LANGUAGES = {
  en: { name: 'English', flag: '🇺🇸' },
  es: { name: 'Español', flag: '🇪🇸' },
  fr: { name: 'Français', flag: '🇫🇷' },
  de: { name: 'Deutsch', flag: '🇩🇪' },
  it: { name: 'Italiano', flag: '🇮🇹' },
  pt: { name: 'Português', flag: '🇵🇹' },
  ru: { name: 'Русский', flag: '🇷🇺' },
  ja: { name: '日本語', flag: '🇯🇵' },
  zh: { name: '中文', flag: '🇨🇳' },
  hi: { name: 'हिन्दी', flag: '🇮🇳' },
  ar: { name: 'العربية', flag: '🇸🇦' }
};

// Google Translate language codes
const GOOGLE_TRANSLATE_CODES = {
  en: 'en', es: 'es', fr: 'fr', de: 'de', it: 'it',
  pt: 'pt', ru: 'ru', ja: 'ja', zh: 'zh', hi: 'hi', ar: 'ar'
};

// Keys that should NOT be translated (brand names, etc.)
const PROTECTED_KEYS = [
  'site.title',
  'hero.title', 
  'demo.title',
  'download.installer_title'
];

// URLs and emails protection
const URL_REGEX = /https?:\/\/[^\s]+/g;
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

class AutoTranslator {
  constructor() {
    this.baseLanguage = 'en';
    this.translationsDir = path.join(process.cwd(), 'public', 'translations');
    
    // Initialize Google Translate
    const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
    if (!apiKey) {
      console.warn('⚠️  GOOGLE_TRANSLATE_API_KEY not found. Using fallback translation service.');
      this.translate = null;
    } else {
      this.translate = new Translate({ key: apiKey });
    }
  }

  /**
   * Load translation file
   */
  loadTranslations(lang) {
    const filePath = path.join(this.translationsDir, `${lang}.json`);
    
    if (!fs.existsSync(filePath)) {
      return {};
    }
    
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch (error) {
      console.error(`❌ Error loading ${lang}.json:`, error.message);
      return {};
    }
  }

  /**
   * Save translation file
   */
  saveTranslations(lang, translations) {
    const filePath = path.join(this.translationsDir, `${lang}.json`);
    
    // Ensure directory exists
    if (!fs.existsSync(this.translationsDir)) {
      fs.mkdirSync(this.translationsDir, { recursive: true });
    }
    
    // Sort keys alphabetically for consistency
    const sorted = {};
    Object.keys(translations).sort().forEach(key => {
      sorted[key] = translations[key];
    });
    
    fs.writeFileSync(filePath, JSON.stringify(sorted, null, 2) + '\n');
    console.log(`✅ Saved ${lang}.json (${Object.keys(translations).length} keys)`);
  }

  /**
   * Protect special content from translation
   */
  protectContent(text) {
    const placeholders = {};
    let protectedText = text;
    let counter = 0;

    // Protect URLs
    protectedText = protectedText.replace(URL_REGEX, (match) => {
      const placeholder = `__URL${counter++}__`;
      placeholders[placeholder] = match;
      return placeholder;
    });

    // Protect emails  
    protectedText = protectedText.replace(EMAIL_REGEX, (match) => {
      const placeholder = `__EMAIL${counter++}__`;
      placeholders[placeholder] = match;
      return placeholder;
    });

    return { text: protectedText, placeholders };
  }

  /**
   * Restore protected content
   */
  restoreContent(text, placeholders) {
    let restored = text;
    Object.entries(placeholders).forEach(([placeholder, original]) => {
      restored = restored.replace(placeholder, original);
    });
    return restored;
  }

  /**
   * Fallback translation using a simple replacement approach
   */
  async fallbackTranslate(text, targetLang) {
    // This is a very basic fallback - in a real scenario you might want to use
    // another translation service or API
    console.log(`⚠️  Using fallback translation for: ${text.substring(0, 50)}...`);
    return text; // Return original text as fallback
  }

  /**
   * Translate single text
   */
  async translateText(text, targetLang) {
    if (!text || text.trim() === '') return text;
    
    try {
      const { text: protectedText, placeholders } = this.protectContent(text);
      
      let translation;
      if (this.translate) {
        [translation] = await this.translate.translate(protectedText, {
          from: GOOGLE_TRANSLATE_CODES[this.baseLanguage],
          to: GOOGLE_TRANSLATE_CODES[targetLang]
        });
      } else {
        translation = await this.fallbackTranslate(protectedText, targetLang);
      }
      
      return this.restoreContent(translation, placeholders);
    } catch (error) {
      console.error(`❌ Translation error for "${text.substring(0, 30)}...":`, error.message);
      return text; // Return original on error
    }
  }

  /**
   * Translate specific language
   */
  async translateLanguage(targetLang, forceRetranslate = false) {
    if (targetLang === this.baseLanguage) {
      console.log(`⏭️  Skipping base language: ${targetLang}`);
      return;
    }

    console.log(`\n🌍 Translating to ${AVAILABLE_LANGUAGES[targetLang].name} (${targetLang})...`);
    
    const baseTranslations = this.loadTranslations(this.baseLanguage);
    const currentTranslations = this.loadTranslations(targetLang);
    const updatedTranslations = { ...currentTranslations };
    
    let translatedCount = 0;
    let skippedCount = 0;
    
    for (const [key, baseText] of Object.entries(baseTranslations)) {
      // Skip if translation exists and not forcing retranslation
      if (!forceRetranslate && updatedTranslations[key]) {
        skippedCount++;
        continue;
      }
      
      // Keep protected keys unchanged
      if (PROTECTED_KEYS.includes(key)) {
        updatedTranslations[key] = baseText;
        console.log(`  🔒 Protected: ${key}`);
        continue;
      }
      
      // Translate
      console.log(`  🔄 Translating: ${key}`);
      const translatedText = await this.translateText(baseText, targetLang);
      updatedTranslations[key] = translatedText;
      translatedCount++;
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    // Save results
    this.saveTranslations(targetLang, updatedTranslations);
    console.log(`  ✅ Completed: ${translatedCount} translated, ${skippedCount} skipped`);
  }

  /**
   * Translate all languages
   */
  async translateAll(forceRetranslate = false) {
    console.log('🚀 Starting automatic translation process...');
    console.log(`📝 Base language: ${AVAILABLE_LANGUAGES[this.baseLanguage].name} (${this.baseLanguage})`);
    console.log(`🔄 Force retranslate: ${forceRetranslate ? 'Yes' : 'No'}`);
    
    const languages = Object.keys(AVAILABLE_LANGUAGES);
    const startTime = Date.now();
    
    for (const lang of languages) {
      await this.translateLanguage(lang, forceRetranslate);
    }
    
    const duration = Math.round((Date.now() - startTime) / 1000);
    console.log(`\n✅ Translation completed in ${duration} seconds!`);
    console.log(`🌍 All ${languages.length} languages are now synchronized.`);
  }

  /**
   * Check for missing translations
   */
  checkMissing() {
    console.log('🔍 Checking for missing translations...\n');
    
    const baseTranslations = this.loadTranslations(this.baseLanguage);
    const baseKeys = Object.keys(baseTranslations);
    
    let totalMissing = 0;
    
    Object.keys(AVAILABLE_LANGUAGES).forEach(lang => {
      if (lang === this.baseLanguage) return;
      
      const translations = this.loadTranslations(lang);
      const missingKeys = baseKeys.filter(key => !(key in translations));
      
      if (missingKeys.length > 0) {
        console.log(`❌ ${AVAILABLE_LANGUAGES[lang].flag} ${AVAILABLE_LANGUAGES[lang].name} (${lang}): ${missingKeys.length} missing`);
        missingKeys.slice(0, 5).forEach(key => console.log(`     - ${key}`));
        if (missingKeys.length > 5) {
          console.log(`     ... and ${missingKeys.length - 5} more`);
        }
        totalMissing += missingKeys.length;
      } else {
        console.log(`✅ ${AVAILABLE_LANGUAGES[lang].flag} ${AVAILABLE_LANGUAGES[lang].name} (${lang}): Complete`);
      }
    });
    
    console.log(`\n📊 Total missing translations: ${totalMissing}`);
    
    if (totalMissing > 0) {
      console.log('\n💡 Run "node scripts/translate.js" to fill missing translations');
    }
  }

  /**
   * Show translation statistics
   */
  showStats() {
    console.log('📊 Translation Statistics\n');
    
    const baseTranslations = this.loadTranslations(this.baseLanguage);
    const totalKeys = Object.keys(baseTranslations).length;
    
    console.log(`📝 Total translation keys: ${totalKeys}\n`);
    
    Object.keys(AVAILABLE_LANGUAGES).forEach(lang => {
      const translations = this.loadTranslations(lang);
      const count = Object.keys(translations).length;
      const percentage = Math.round((count / totalKeys) * 100);
      const bar = '█'.repeat(Math.floor(percentage / 5));
      
      console.log(`${AVAILABLE_LANGUAGES[lang].flag} ${AVAILABLE_LANGUAGES[lang].name.padEnd(12)} ${count.toString().padStart(3)}/${totalKeys} (${percentage.toString().padStart(3)}%) ${bar}`);
    });
  }

  /**
   * Validate translation files
   */
  validate() {
    console.log('🔧 Validating translation files...\n');
    
    const baseTranslations = this.loadTranslations(this.baseLanguage);
    const baseKeys = new Set(Object.keys(baseTranslations));
    
    Object.keys(AVAILABLE_LANGUAGES).forEach(lang => {
      if (lang === this.baseLanguage) return;
      
      const translations = this.loadTranslations(lang);
      const extraKeys = Object.keys(translations).filter(key => !baseKeys.has(key));
      
      if (extraKeys.length > 0) {
        console.log(`⚠️  ${AVAILABLE_LANGUAGES[lang].name} (${lang}) has ${extraKeys.length} extra keys:`);
        extraKeys.forEach(key => console.log(`     - ${key}`));
        
        // Remove extra keys
        extraKeys.forEach(key => delete translations[key]);
        this.saveTranslations(lang, translations);
        console.log(`   🧹 Cleaned up extra keys\n`);
      } else {
        console.log(`✅ ${AVAILABLE_LANGUAGES[lang].name} (${lang}): Structure valid`);
      }
    });
    
    console.log('\n✅ Validation completed!');
  }
}

// Command line interface
async function main() {
  const args = process.argv.slice(2);
  const translator = new AutoTranslator();
  
  // Parse arguments
  const hasFlag = (flag) => args.some(arg => arg === flag || arg === `--${flag}`);
  const getFlag = (flag) => {
    const arg = args.find(arg => arg.startsWith(`--${flag}=`));
    return arg ? arg.split('=')[1] : null;
  };
  
  // Show help
  if (hasFlag('help') || hasFlag('h')) {
    console.log(`
🦅 Crow's Eye Website - Automatic Translation Tool

Usage: node scripts/translate.js [options]

Options:
  --force       Force retranslation of all content
  --check       Only check for missing translations
  --stats       Show translation statistics  
  --validate    Validate and clean translation files
  --lang=XX     Translate only specific language (e.g., es, fr, de)
  --help        Show this help message

Examples:
  node scripts/translate.js                    # Translate missing content
  node scripts/translate.js --force            # Retranslate everything
  node scripts/translate.js --check            # Check what's missing
  node scripts/translate.js --lang=es          # Translate only Spanish
  node scripts/translate.js --stats            # Show statistics

Environment Variables:
  GOOGLE_TRANSLATE_API_KEY    Your Google Translate API key
    `);
    return;
  }
  
  try {
    // Check for missing only
    if (hasFlag('check')) {
      translator.checkMissing();
      return;
    }
    
    // Show statistics only
    if (hasFlag('stats')) {
      translator.showStats();
      return;
    }
    
    // Validate files only
    if (hasFlag('validate')) {
      translator.validate();
      return;
    }
    
    // Translate specific language
    const specificLang = getFlag('lang');
    if (specificLang) {
      if (!AVAILABLE_LANGUAGES[specificLang]) {
        console.error(`❌ Unknown language: ${specificLang}`);
        console.log(`Available: ${Object.keys(AVAILABLE_LANGUAGES).join(', ')}`);
        process.exit(1);
      }
      await translator.translateLanguage(specificLang, hasFlag('force'));
      return;
    }
    
    // Translate all languages
    await translator.translateAll(hasFlag('force'));
    
  } catch (error) {
    console.error('❌ Translation failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { AutoTranslator }; 