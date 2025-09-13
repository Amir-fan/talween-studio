/**
 * Pricing configuration for Talween Studio
 * Based on client requirements: 1 USD = 22 credits, 1 credit = $0.045
 */

export const PRICING_CONFIG = {
  // Credit conversion rates
  USD_TO_CREDITS: 22,
  CREDIT_TO_USD: 0.045,
  
  // Feature costs in credits
  FEATURE_COSTS: {
    STORY_WITH_CHILD_NAME: 66,        // $3.00
    TEXT_TO_COLORING: 35,             // $1.60
    PHOTO_TO_COLORING: 27,            // $1.20
    REGENERATE_CONTENT: 9,            // $0.40
    READY_TEMPLATE: 44,               // $2.00
    PDF_COMPILATION: 22,              // $1.00
    AUDIO_FILE: 35,                   // $1.60
  },
  
  // Subscription tiers
  SUBSCRIPTION_TIERS: {
    FREE: {
      name: 'المجانية',
      price: 0,
      credits: 128,
      value: 5.8,
      features: [
        'قصة البداية: أول قصة تفاعلية باسم الطفل',
        'ألوان التجربة: صفحتان للتلوين لاكتشاف الفكرة',
        'كراسة معاينة: نسخة تعليمية مبسطة',
        'طباعة محدودة: مقاس واحد + يظهر شعار'
      ]
    },
    EXPLORER: {
      name: 'المكتشف',
      price: 12.99,
      credits: 1368,
      value: 62,
      features: [
        'كل مزايا المجانية',
        'قصص الاستكشاف: 5 مغامرات قصيرة باسم الطفل',
        'ألوان إضافية: 10 صفحات للتلوين منوعة',
        'كراسات التعلم: 3 كراسات تعليمية جاهزة للطباعة',
        'ذكريات مرسومة: تحويل صورتين إلى صفحات تلوين',
        'طباعة منزلية: جودة عالية بدون شعار',
        'خيارات مقاس: A4 أو Letter'
      ]
    },
    CREATIVE_WORLD: {
      name: 'عالم الإبداع',
      price: 29.99,
      credits: 3440,
      value: 156,
      features: [
        'كل مزايا المكتشف',
        'قصص الإبداع: 15 قصة متكاملة باسم الطفل',
        'ألوان بلا حدود: 30 صفحة تلوين جديدة شهرياً',
        'كراسات متقدمة: 10 كراسات إضافية تنمي القيم والمهارات',
        'صور عائلية ملونة: تحويل 5 صور شخصية/عائلية',
        'طباعة فاخرة: مقاسات متعددة (Letter – Poster – A3 – A4)',
        'تخصيص متطور: اسم + صورة الطفل داخل القصة',
        'مكتبة مفتوحة: قوالب وقصص تعليمية متجددة',
        'تحديثات حصرية + دعم أولوية'
      ]
    },
    CREATIVE_TEACHER: {
      name: 'المعلم المبدع',
      price: 59.99,
      credits: 7938,
      value: 360,
      features: [
        'كل مزايا عالم الإبداع',
        'قصص جماعية: أكثر من 40 قصة لعدة أطفال (حتى 5)',
        'ألوان الصف: 100+ صفحة تلوين إضافية',
        'كراسات شاملة: 20 كراسة تربوية كاملة',
        'ذكريات ممتدة: تحويل 15 صورة شخصية إلى صفحات تلوين',
        'طباعة احترافية: جودة K4 / HD لجميع المقاسات',
        'إدارة الصف: حسابات متعددة + تقارير متابعة لكل طفل',
        'محتوى حصري: أدوات وورش للمدارس والروضات',
        'خدمة VIP + بونص شهري (300 نقطة إضافية)'
      ]
    }
  }
} as const;

export type SubscriptionTier = keyof typeof PRICING_CONFIG.SUBSCRIPTION_TIERS;
export type FeatureType = keyof typeof PRICING_CONFIG.FEATURE_COSTS;

/**
 * Get the cost in credits for a specific feature
 */
export function getFeatureCost(feature: FeatureType): number {
  return PRICING_CONFIG.FEATURE_COSTS[feature];
}

/**
 * Get the cost in USD for a specific feature
 */
export function getFeatureCostUSD(feature: FeatureType): number {
  return PRICING_CONFIG.FEATURE_COSTS[feature] * PRICING_CONFIG.CREDIT_TO_USD;
}

/**
 * Convert USD to credits
 */
export function usdToCredits(usd: number): number {
  return Math.round(usd * PRICING_CONFIG.USD_TO_CREDITS);
}

/**
 * Convert credits to USD
 */
export function creditsToUsd(credits: number): number {
  return credits * PRICING_CONFIG.CREDIT_TO_USD;
}

/**
 * Get subscription tier information
 */
export function getSubscriptionTier(tier: SubscriptionTier) {
  return PRICING_CONFIG.SUBSCRIPTION_TIERS[tier];
}

/**
 * Calculate story cost based on number of pages
 * Stories cost 66 credits regardless of page count (as per new pricing)
 */
export function calculateStoryCost(numberOfPages: number): number {
  return PRICING_CONFIG.FEATURE_COSTS.STORY_WITH_CHILD_NAME;
}

/**
 * Get all available subscription tiers
 */
export function getAllSubscriptionTiers() {
  return Object.entries(PRICING_CONFIG.SUBSCRIPTION_TIERS).map(([key, value]) => ({
    id: key as SubscriptionTier,
    ...value
  }));
}
