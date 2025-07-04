// API utility functions for MMX extension

// Default API configuration
const DEFAULT_CONFIG = {
  apiEndpoint: 'https://text.pollinations.ai/openai',
  model: 'gpt-4-vision-preview',
  maxRetries: 3,
  timeout: 30000, // 30 seconds
};

// Cache for API responses
const responseCache = new Map();

/**
 * Analyze an image using the Pollinations.ai API
 * @param {string} imageBase64 - Base64 encoded image
 * @param {Object} options - Optional configuration
 * @returns {Promise<Object>} - Analysis results
 */
async function analyzeImage(imageBase64, options = {}) {
  const config = { ...DEFAULT_CONFIG, ...options };
  const cacheKey = `img_${hashString(imageBase64)}`;
  
  // Check cache first
  if (responseCache.has(cacheKey)) {
    return responseCache.get(cacheKey);
  }
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), config.timeout);
  
  let retryCount = 0;
  let lastError;
  
  while (retryCount < config.maxRetries) {
    try {
      const response = await fetch(config.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Analyze this image and provide: 1) A descriptive title (max 50 chars), 2) Detailed description (max 200 chars), 3) Relevant keywords (comma-separated, max 10 keywords), 4) Main category. Format as JSON: {title: string, description: string, keywords: string, category: string}'
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${imageBase64}`,
                    detail: 'high'
                  }
                }
              ]
            }
          ],
          model: config.model,
          max_tokens: 500
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      const messageContent = data.choices?.[0]?.message?.content;
      
      if (!messageContent) {
        throw new Error('Invalid response format from API');
      }
      
      // Extract JSON from markdown code block if present
      const jsonMatch = messageContent.match(/```(?:json\n)?([\s\S]*?)\n```/);
      const jsonString = jsonMatch ? jsonMatch[1] : messageContent;
      const result = JSON.parse(jsonString);
      
      // Validate the result
      if (!result.title || !result.description || !result.keywords || !result.category) {
        throw new Error('Incomplete analysis results');
      }
      
      // Cache the result
      responseCache.set(cacheKey, result);
      
      return result;
      
    } catch (error) {
      lastError = error;
      retryCount++;
      
      if (error.name === 'AbortError' || retryCount >= config.maxRetries) {
        break;
      }
      
      // Exponential backoff
      await new Promise(resolve => 
        setTimeout(resolve, 1000 * Math.pow(2, retryCount))
      );
    }
  }
  
  clearTimeout(timeoutId);
  throw lastError || new Error('Unknown error occurred during image analysis');
}

/**
 * Simple string hashing function for cache keys
 * @param {string} str - String to hash
 * @returns {string} - Hash string
 */
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(16);
}

export { analyzeImage };
