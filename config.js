// Configuration for MMX extension

/**
 * Default configuration values
 */
const DEFAULT_CONFIG = {
  // API settings
  api: {
    endpoint: 'https://text.pollinations.ai/openai',
    model: 'gpt-4-vision-preview',
    timeout: 30000, // 30 seconds
    maxRetries: 3,
    rateLimit: {
      requests: 10, // Max requests
      perSeconds: 60 // Per 60 seconds
    }
  },
  
  // Image processing
  image: {
    maxWidth: 2048,
    maxHeight: 2048,
    quality: 0.9,
    mimeType: 'image/jpeg'
  },
  
  // Form handling
  form: {
    autoSubmit: false,
    fieldMappings: {
      title: ['title', 'name', 'headline'],
      description: ['description', 'summary', 'caption'],
      keywords: ['keywords', 'tags', 'categories'],
      category: ['category', 'type', 'section']
    },
    delayBetweenFields: 100, // ms between filling fields
    validationTimeout: 2000 // ms to wait for validation
  },
  
  // UI settings
  ui: {
    showNotifications: true,
    showProgress: true,
    maxLogEntries: 100,
    theme: 'light' // 'light' or 'dark'
  },
  
  // Feature flags
  features: {
    batchProcessing: true,
    autoCategorize: true,
    keywordExtraction: true,
    smartTagging: true
  },
  
  // Advanced settings
  advanced: {
    debug: false,
    cacheResponses: true,
    cacheTtl: 24 * 60 * 60 * 1000, // 24 hours in ms
    maxCacheSize: 50 // Max number of cached responses
  }
};

/**
 * Load configuration from storage or return defaults
 * @returns {Promise<Object>} Configuration object
 */
async function loadConfig() {
  try {
    const result = await chrome.storage.local.get('config');
    
    // Merge with defaults
    return {
      ...DEFAULT_CONFIG,
      ...(result.config || {})
    };
  } catch (error) {
    console.error('Failed to load config:', error);
    return DEFAULT_CONFIG;
  }
}

/**
 * Save configuration to storage
 * @param {Object} config - Configuration to save
 * @returns {Promise<boolean>} Whether save was successful
 */
async function saveConfig(config) {
  try {
    await chrome.storage.local.set({ config });
    return true;
  } catch (error) {
    console.error('Failed to save config:', error);
    return false;
  }
}

/**
 * Reset configuration to defaults
 * @returns {Promise<boolean>} Whether reset was successful
 */
async function resetConfig() {
  try {
    await chrome.storage.local.set({ config: DEFAULT_CONFIG });
    return true;
  } catch (error) {
    console.error('Failed to reset config:', error);
    return false;
  }
}

export {
  DEFAULT_CONFIG,
  loadConfig,
  saveConfig,
  resetConfig
};
