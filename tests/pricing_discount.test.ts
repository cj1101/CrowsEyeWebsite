import { TIERS, BYOK_DISCOUNT } from '../src/data/tiers';

describe('Pricing Discount Tests', () => {
  test('BYOK discount should be 30%', () => {
    expect(BYOK_DISCOUNT).toBe(0.30);
  });

  test('All paid tiers should have BYOK pricing calculated correctly', () => {
    const paidTiers = TIERS.filter(tier => tier.monthly > 0);
    
    paidTiers.forEach(tier => {
      const expectedByokPrice = +(tier.monthly * (1 - BYOK_DISCOUNT)).toFixed(0);
      expect(tier.monthlyByok).toBe(expectedByokPrice);
    });
  });

  test('Free and Enterprise tiers should not have BYOK pricing', () => {
    const freeTier = TIERS.find(tier => tier.id === 'spark');
    const enterpriseTier = TIERS.find(tier => tier.id === 'enterprise');
    
    expect(freeTier?.monthlyByok).toBeUndefined();
    expect(enterpriseTier?.monthlyByok).toBeUndefined();
  });

  test('Tier structure should match expected pricing', () => {
    const expectedPricing = {
      spark: 0,
      creator: 19,
      growth: 49,
      pro: 89,
      enterprise: 0
    };

    TIERS.forEach(tier => {
      expect(tier.monthly).toBe(expectedPricing[tier.id as keyof typeof expectedPricing]);
    });
  });

  test('BYOK prices should be correct for each tier', () => {
    const creator = TIERS.find(tier => tier.id === 'creator');
    const growth = TIERS.find(tier => tier.id === 'growth');
    const pro = TIERS.find(tier => tier.id === 'pro');

    expect(creator?.monthlyByok).toBe(13); // 19 * 0.7 = 13.3 -> 13
    expect(growth?.monthlyByok).toBe(34);  // 49 * 0.7 = 34.3 -> 34
    expect(pro?.monthlyByok).toBe(62);     // 89 * 0.7 = 62.3 -> 62
  });

  test('All tiers should have required properties', () => {
    TIERS.forEach(tier => {
      expect(tier).toHaveProperty('id');
      expect(tier).toHaveProperty('name');
      expect(tier).toHaveProperty('monthly');
      expect(tier).toHaveProperty('description');
      expect(tier).toHaveProperty('socialSets');
      expect(tier).toHaveProperty('seats');
      expect(tier).toHaveProperty('aiCredits');
      expect(tier).toHaveProperty('aiEdits');
      expect(tier).toHaveProperty('videoSuite');
      expect(tier).toHaveProperty('storageGB');
      expect(tier).toHaveProperty('contextFiles');
      expect(tier).toHaveProperty('analytics');
      expect(tier).toHaveProperty('support');
    });
  });
}); 