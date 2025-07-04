// Image processing utilities for MMX extension

// Default image processing options
const DEFAULT_OPTIONS = {
  maxWidth: 2048,
  maxHeight: 2048,
  quality: 0.9,
  mimeType: 'image/jpeg'
};

/**
 * Convert an image to base64 with optional resizing
 * @param {string} imageUrl - URL of the image to process
 * @param {Object} options - Processing options
 * @returns {Promise<string>} - Base64 encoded image
 */
async function processImage(imageUrl, options = {}) {
  const config = { ...DEFAULT_OPTIONS, ...options };
  
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    
    img.onload = function() {
      try {
        // Create canvas for processing
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Calculate new dimensions while maintaining aspect ratio
        let { width, height } = calculateAspectRatio(
          this.naturalWidth,
          this.naturalHeight,
          config.maxWidth,
          config.maxHeight
        );
        
        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;
        
        // Draw image with new dimensions
        ctx.drawImage(this, 0, 0, width, height);
        
        // Convert to base64
        const base64 = canvas.toDataURL(config.mimeType, config.quality);
        
        // Extract just the base64 data
        const base64Data = base64.split(',')[1];
        resolve(base64Data);
      } catch (error) {
        reject(new Error(`Image processing failed: ${error.message}`));
      }
    };
    
    img.onerror = function() {
      reject(new Error('Failed to load image'));
    };
    
    // Start loading the image
    img.src = imageUrl;
  });
}

/**
 * Calculate dimensions while maintaining aspect ratio
 * @param {number} srcWidth - Original width
 * @param {number} srcHeight - Original height
 * @param {number} maxWidth - Maximum allowed width
 * @param {number} maxHeight - Maximum allowed height
 * @returns {Object} - New width and height
 */
function calculateAspectRatio(srcWidth, srcHeight, maxWidth, maxHeight) {
  let width = srcWidth;
  let height = srcHeight;
  
  // Check if scaling is needed
  if (width > maxWidth || height > maxHeight) {
    const ratio = Math.min(
      maxWidth / width,
      maxHeight / height
    );
    
    width = Math.floor(width * ratio);
    height = Math.floor(height * ratio);
  }
  
  return { width, height };
}

/**
 * Get image dimensions
 * @param {string} url - Image URL
 * @returns {Promise<{width: number, height: number}>} - Image dimensions
 */
function getImageDimensions(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = function() {
      resolve({
        width: this.naturalWidth,
        height: this.naturalHeight
      });
    };
    
    img.onerror = function() {
      reject(new Error('Failed to load image for dimension check'));
    };
    
    img.src = url;
  });
}

/**
 * Convert a blob to base64
 * @param {Blob} blob - Blob to convert
 * @returns {Promise<string>} - Base64 string
 */
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      const base64String = reader.result.split(',')[1];
      resolve(base64String);
    };
    
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export {
  processImage,
  calculateAspectRatio,
  getImageDimensions,
  blobToBase64
};
