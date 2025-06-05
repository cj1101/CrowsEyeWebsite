import { Translate } from '@google-cloud/translate/build/src/v2';
import { AVAILABLE_LANGUAGES, LanguageCode } from '@/lib/i18n';
import fs from 'fs';
import path from 'path';

// Google Translate language codes mapping
const GOOGLE_TRANSLATE_CODES: Record<LanguageCode, string> = {
  en: 'en',
  es: 'es', 
  fr: 'fr',
  de: 'de',
  it: 'it',
  pt: 'pt',
  ru: 'ru',
  ja: 'ja',
  zh: 'zh',
  hi: 'hi',
  ar: 'ar'
};

// Translation keys that should NOT be translated (keep original)
const PROTECTED_KEYS = [
  'site.title', // Keep brand name
  'hero.title', // Keep brand name
  'demo.title', // Keep brand name
  'download.installer_title' // Keep brand name
];

// Links and URLs that should not be translated
const URL_REGEX = /https?:\/\/[^\s]+/g;
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

export class TranslationManager {
  private translate: Translate;
  private translationsDir: string;
  private baseLanguage: LanguageCode = 'en';

  constructor(apiKey?: string) {
    this.translate = new Translate({
      key: apiKey || process.env.GOOGLE_TRANSLATE_API_KEY,
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID
    });
    
    this.translationsDir = path.join(process.cwd(), 'public', 'translations');
  }

  /**
   * Load translation file for a specific language
   */
  private loadTranslations(lang: LanguageCode): Record<string, string> {
    const filePath = path.join(this.translationsDir, `${lang}.json`);
    
    if (!fs.existsSync(filePath)) {
      return {};
    }
    
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      console.error(`Error loading translations for ${lang}:`, error);
      return {};
    }
  }

  /**
   * Save translation file for a specific language
   */
  private saveTranslations(lang: LanguageCode, translations: Record<string, string>): void {
    const filePath = path.join(this.translationsDir, `${lang}.json`);
    
    // Ensure directory exists
    if (!fs.existsSync(this.translationsDir)) {
      fs.mkdirSync(this.translationsDir, { recursive: true });
    }
    
    // Sort keys for consistent file structure
    const sortedTranslations = Object.keys(translations)
      .sort()
      .reduce((result, key) => {
        result[key] = translations[key];
        return result;
      }, {} as Record<string, string>);
    
    fs.writeFileSync(filePath, JSON.stringify(sortedTranslations, null, 2));
    console.log(`✅ Saved translations for ${lang} (${Object.keys(translations).length} keys)`);
  }

  /**
   * Protect URLs and emails from translation
   */
  private protectSpecialContent(text: string): { text: string; placeholders: Record<string, string> } {
    const placeholders: Record<string, string> = {};
    let protectedText = text;
    let counter = 0;

    // Protect URLs
    protectedText = protectedText.replace(URL_REGEX, (match) => {
      const placeholder = `__URL_${counter++}__`;
      placeholders[placeholder] = match;
      return placeholder;
    });

    // Protect emails
    protectedText = protectedText.replace(EMAIL_REGEX, (match) => {
      const placeholder = `__EMAIL_${counter++}__`;
      placeholders[placeholder] = match;
      return placeholder;
    });

    return { text: protectedText, placeholders };
  }

  /**
   * Restore protected content after translation
   */
  private restoreSpecialContent(text: string, placeholders: Record<string, string>): string {
    let restoredText = text;
    
    Object.entries(placeholders).forEach(([placeholder, original]) => {
      restoredText = restoredText.replace(placeholder, original);
    });
    
    return restoredText;
  }

  /**
   * Translate a single text string
   */
  private async translateText(text: string, targetLang: LanguageCode): Promise<string> {
    if (!text || text.trim() === '') return text;
    
    try {
      // Protect URLs and emails
      const { text: protectedText, placeholders } = this.protectSpecialContent(text);
      
      const [translation] = await this.translate.translate(
        protectedText,
        {
          from: GOOGLE_TRANSLATE_CODES[this.baseLanguage],
          to: GOOGLE_TRANSLATE_CODES[targetLang]
        }
      );
      
      // Restore protected content
      return this.restoreSpecialContent(translation, placeholders);
    } catch (error) {
      console.error(`Error translating "${text}" to ${targetLang}:`, error);
      return text; // Return original text if translation fails
    }
  }

  /**
   * Translate all missing keys for a specific language
   */
  async translateLanguage(targetLang: LanguageCode, forceRetranslate: boolean = false): Promise<void> {
    if (targetLang === this.baseLanguage) {
      console.log(`⏭️  Skipping base language: ${targetLang}`);
      return;
    }

    console.log(`🌍 Translating to ${AVAILABLE_LANGUAGES[targetLang].name} (${targetLang})...`);
    
    const baseTranslations = this.loadTranslations(this.baseLanguage);
    const targetTranslations = this.loadTranslations(targetLang);
    
    const updatedTranslations = { ...targetTranslations };
    const translationPromises: Promise<void>[] = [];
    
    for (const [key, baseText] of Object.entries(baseTranslations)) {
      // Skip if translation exists and we're not forcing retranslation
      if (!forceRetranslate && updatedTranslations[key]) {
        continue;
      }
      
      // Skip protected keys (keep original)
      if (PROTECTED_KEYS.includes(key)) {
        updatedTranslations[key] = baseText;
        continue;
      }
      
      // Create translation promise
      const translationPromise = this.translateText(baseText, targetLang)
        .then(translatedText => {
          updatedTranslations[key] = translatedText;
          console.log(`  ✓ ${key}: "${baseText}" → "${translatedText}"`);
        })
        .catch(error => {
          console.error(`  ✗ Failed to translate ${key}:`, error);
          updatedTranslations[key] = baseText; // Fallback to original
        });
      
      translationPromises.push(translationPromise);
      
      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Wait for all translations to complete
    await Promise.all(translationPromises);
    
    // Save updated translations
    this.saveTranslations(targetLang, updatedTranslations);
  }

  /**
   * Translate all languages
   */
  async translateAllLanguages(forceRetranslate: boolean = false): Promise<void> {
    console.log('🚀 Starting automatic translation for all languages...');
    console.log(`📝 Base language: ${AVAILABLE_LANGUAGES[this.baseLanguage].name} (${this.baseLanguage})`);
    
    const languages = Object.keys(AVAILABLE_LANGUAGES) as LanguageCode[];
    
    for (const lang of languages) {
      await this.translateLanguage(lang, forceRetranslate);
    }
    
    console.log('✅ All translations completed!');
  }

  /**
   * Check for missing translations across all languages
   */
  checkMissingTranslations(): void {
    console.log('🔍 Checking for missing translations...');
    
    const baseTranslations = this.loadTranslations(this.baseLanguage);
    const baseKeys = Object.keys(baseTranslations);
    
    const languages = Object.keys(AVAILABLE_LANGUAGES) as LanguageCode[];
    
    for (const lang of languages) {
      if (lang === this.baseLanguage) continue;
      
      const langTranslations = this.loadTranslations(lang);
      const langKeys = Object.keys(langTranslations);
      
      const missingKeys = baseKeys.filter(key => !langKeys.includes(key));
      
      if (missingKeys.length > 0) {
        console.log(`❌ ${AVAILABLE_LANGUAGES[lang].name} (${lang}) missing ${missingKeys.length} translations:`);
        missingKeys.forEach(key => console.log(`  - ${key}`));
      } else {
        console.log(`✅ ${AVAILABLE_LANGUAGES[lang].name} (${lang}) - all translations present`);
      }
    }
  }

  /**
   * Validate translation file structure
   */
  validateTranslations(): void {
    console.log('🔧 Validating translation file structure...');
    
    const baseTranslations = this.loadTranslations(this.baseLanguage);
    const languages = Object.keys(AVAILABLE_LANGUAGES) as LanguageCode[];
    
    for (const lang of languages) {
      const translations = this.loadTranslations(lang);
      
      // Check for extra keys (not in base language)
      const extraKeys = Object.keys(translations).filter(
        key => !Object.keys(baseTranslations).includes(key)
      );
      
      if (extraKeys.length > 0) {
        console.log(`⚠️  ${AVAILABLE_LANGUAGES[lang].name} (${lang}) has extra keys:`);
        extraKeys.forEach(key => {
          console.log(`  - ${key}: "${translations[key]}"`);
          delete translations[key]; // Remove extra key
        });
        this.saveTranslations(lang, translations);
      }
    }
    
    console.log('✅ Translation validation completed!');
  }

  /**
   * Get translation statistics
   */
  getStats(): void {
    console.log('📊 Translation Statistics:');
    
    const baseTranslations = this.loadTranslations(this.baseLanguage);
    const totalKeys = Object.keys(baseTranslations).length;
    
    console.log(`Total translation keys: ${totalKeys}`);
    console.log('\nPer language:');
    
    const languages = Object.keys(AVAILABLE_LANGUAGES) as LanguageCode[];
    
    for (const lang of languages) {
      const translations = this.loadTranslations(lang);
      const translatedKeys = Object.keys(translations).length;
      const percentage = Math.round((translatedKeys / totalKeys) * 100);
      
      console.log(`  ${AVAILABLE_LANGUAGES[lang].flag} ${AVAILABLE_LANGUAGES[lang].name} (${lang}): ${translatedKeys}/${totalKeys} (${percentage}%)`);
    }
  }
}

// Export singleton instance
export const translationManager = new TranslationManager(); 