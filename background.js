// Background script for MMX extension

// Listen for installation/update
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Initialize default settings
    chrome.storage.local.set({
      isProcessing: false,
      progress: 0,
      logs: [],
      settings: {
        autoStart: false,
        autoSubmit: false,
        apiEndpoint: 'https://text.pollinations.ai/openai',
        model: 'gpt-4-vision-preview',
        maxRetries: 3,
        timeout: 30000 // 30 seconds
      }
    });
    
    console.log('MMX: Extension installed');
  } else if (details.reason === 'update') {
    console.log('MMX: Extension updated');
  }
});

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'log') {
    // Forward log messages to popup if it's open
    chrome.runtime.sendMessage({
      type: 'log',
      message: request.message,
      logType: request.logType
    }).catch(() => {});
    
    // Store logs (keep last 100 entries)
    chrome.storage.local.get(['logs'], (result) => {
      const logs = result.logs || [];
      logs.unshift({
        message: request.message,
        type: request.logType || 'info',
        timestamp: Date.now()
      });
      
      // Keep only the 100 most recent logs
      if (logs.length > 100) {
        logs.length = 100;
      }
      
      chrome.storage.local.set({ logs });
    });
  }
  
  // Always respond to keep the message channel open
  sendResponse({ status: 'ok' });
  return true;
});

// Handle tab updates to inject content scripts when needed
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.url.includes('contributor.stock.adobe.com')) {
    // Content script will be automatically injected based on manifest.json
    console.log('MMX: Detected Adobe Stock upload page');
    
    // Check if we should start processing automatically
    chrome.storage.local.get(['settings'], (result) => {
      if (result.settings?.autoStart) {
        chrome.tabs.sendMessage(tabId, { action: 'startProcessing' }).catch(() => {});
      }
    });
  }
});

// Handle browser action click (icon click)
chrome.action.onClicked.addListener((tab) => {
  // This will show the popup defined in manifest.json
  console.log('MMX: Browser action clicked');
});
