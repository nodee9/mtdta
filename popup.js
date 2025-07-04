document.addEventListener('DOMContentLoaded', function() {
  const imageList = document.getElementById('imageList');
  let openPersistentWindowBtn = document.getElementById('openPersistentWindowBtn'); // Will be null initially if removed from HTML
  const mainContentContainer = document.getElementById('mainContentContainer');

  const urlParams = new URLSearchParams(window.location.search);
  const isPersistentWindow = urlParams.get('persistent') === 'true';

  if (isPersistentWindow) {
    // Ini adalah jendela persisten
    if (mainContentContainer) mainContentContainer.style.display = 'block';
    if (openPersistentWindowBtn) openPersistentWindowBtn.style.display = 'none';

    // Panggil fungsi displayInfo untuk setup UI utama di jendela persisten
    displayInfo();

    // Tambahkan tombol refresh hanya di jendela persisten
    const refreshBtn = document.createElement('button');
    refreshBtn.textContent = '⟳';
    refreshBtn.className = 'btn refresh-btn';
    refreshBtn.onclick = function() {
      // displayInfo(); // Atau untuk refresh penuh:
      window.location.reload();
    };
    // Sebaiknya tambahkan ke container utama jika ada, atau body jika tidak masalah
    if (mainContentContainer) mainContentContainer.appendChild(refreshBtn); 
    else document.body.appendChild(refreshBtn);

    // Tambahkan widget "Nih buat jajan" hanya di jendela persisten
    const jajanLink = document.createElement('a');
    jajanLink.href = 'https://www.nihbuatjajan.com/maggots';
    jajanLink.target = '_blank';
    jajanLink.style.position = 'fixed';
    jajanLink.style.bottom = '10px';
    jajanLink.style.right = '10px';
    jajanLink.style.zIndex = '1000'; // Sama dengan refresh button
    jajanLink.style.lineHeight = '0'; // Mencegah spasi ekstra di bawah gambar

    const jajanImage = document.createElement('img');
    jajanImage.loading = 'lazy';
    jajanImage.src = chrome.runtime.getURL('icons/default-cta.png');
    jajanImage.alt = 'Nih buat jajan';
    jajanImage.style.setProperty('height', '40px', 'important');
    jajanImage.style.display = 'block'; // Memastikan <a> menyesuaikan ukuran gambar

    jajanLink.appendChild(jajanImage);

    // Tambahkan ke kontainer yang sama dengan tombol refresh
    if (mainContentContainer) mainContentContainer.appendChild(jajanLink);
    else document.body.appendChild(jajanLink);

  } else {
    // Ini adalah popup action standar
    if (mainContentContainer) mainContentContainer.style.display = 'none';

    // Create and display the icon button if it doesn't exist (it's removed from HTML)
    if (!openPersistentWindowBtn) {
      openPersistentWindowBtn = document.createElement('img');
      openPersistentWindowBtn.id = 'openPersistentWindowBtn';
      openPersistentWindowBtn.src = chrome.runtime.getURL('icons/icon48.png');
      openPersistentWindowBtn.alt = 'Buka MMX';
      openPersistentWindowBtn.title = 'Buka MMX'; // Tooltip
      openPersistentWindowBtn.className = 'btn icon-btn'; // Added 'icon-btn' for specific styling
      openPersistentWindowBtn.style.cursor = 'pointer'; // Make it look clickable
      openPersistentWindowBtn.style.width = '48px'; // Set explicit size
      openPersistentWindowBtn.style.height = '48px';
      openPersistentWindowBtn.style.display = 'block'; // Or 'inline-block' depending on desired layout
      openPersistentWindowBtn.style.margin = '0 auto 0 auto'; // Center it and add some bottom margin

      const container = document.querySelector('.container');
      if (container) {
        container.insertBefore(openPersistentWindowBtn, mainContentContainer); // Insert before main content
      }
    }
    // Ensure it's visible if it was somehow pre-existing and hidden (fallback)
    else if (openPersistentWindowBtn) {
        openPersistentWindowBtn.style.display = 'block';
    }

    // Event listener should be attached after element creation or if it exists
    // Ensure openPersistentWindowBtn is the correct, potentially newly created, element
    const finalOpenBtn = document.getElementById('openPersistentWindowBtn'); 
    if (finalOpenBtn) {
      finalOpenBtn.addEventListener('click', function() {
        chrome.windows.create({
          url: chrome.runtime.getURL('popup/popup.html?persistent=true'),
          type: 'popup',
          width: 350,
          height: 600
        });
        window.close(); // Tutup popup action standar
      });
    }
    // Tidak perlu displayInfo() atau refreshBtn untuk popup action standar
  }

  // Definisi fungsi-fungsi lainnya (generateMetadata, displayInfo, dll.) tetap di sini
  
  // Fungsi untuk memanggil API pollinations.ai
  async function generateMetadata(imageUrl) {
    try {
      const prompt = `Define image type (Photo/Illustration).
        Photo: If the image looks realistic and was taken using a camera.
        Illustration: If the image is a digital or traditional work of art created manually or with software.
        Choose one category that best match the image: 
        1 Animals, 2 Buildings and Architecture, 3 Business, 4 Drinks, 
        5 The Environment, 6 States of Mind, 7 Food, 8 Graphic Resources, 
        9 Hobbies and Leisure, 10 Industry, 11 Landscapes, 12 Lifestyle, 
        13 People, 14 Plants and Flowers, 15 Culture and Religion, 
        16 Science, 17 Social Issues, 18 Sports, 19 Technology, 
        20 Transport, 21 Travel.
        
        Provide an engaging image caption to be posted to adobe stock marketplace. 
        The caption must be in Proper Case or Capitalized Case, HAVE NO COMMA, HAVE NO DOT, HAVE NO PUNCTUATION, 
        above 50 characters and under 100 characters. Do not exceed this limit under any circumstances. 
        Avoid introductory phrase, be direct and descriptive. 
        Avoid assumptions or guesses. 
        
        If possible, specify the exact name of the object, landmark, or location 
        (e.g., "Eiffel Tower" instead of "tower" or "landmark"; 
        "Bald Eagle" instead of "bird"). 
        
        Use specific terms for identifiable entities or features visible in the image, 
        avoiding overly generic descriptions. 
        Add emotional, engaging language to highlight the beauty, atmosphere, 
        or unique character of the scene. 
        
        Generate no fewer than 40 and up to 45 unique and relevant keywords 
        describing the image to be posted to adobe stock marketplace. 
        Focus on words that are highly relevant to the image content and avoid 
        overly generic words. 
        Use synonyms and related terms (e.g., "gull", "seagull", "waterbird") 
        to diversify the keywords. 
        Avoid repeating the same concept unnecessarily unless it adds value. 
        Each keyword only contains one word. 
        Use lowercases and separate each keyword with a comma followed by a space.
        
        Format response in JSON with these properties:
        - imageType: "Photo" or "Illustration"
        - category: The selected category name
        - caption: The generated caption (50-100 chars, no punctuation)
        - keywords: Array of 40-45 keywords (all lowercase, single words)`;

      const response = await fetch('https://text.pollinations.ai/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4-vision-preview',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: prompt,
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: imageUrl,
                  },
                },
              ],
            },
          ],
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const rawContent = data.choices[0].message.content;
      console.log("generateMetadata: Raw content from API:", rawContent);
      try {
        // Mencoba membersihkan string JSON dari ```json ... ``` jika ada
        let cleanContent = rawContent.trim();
        if (cleanContent.startsWith('```json')) {
          cleanContent = cleanContent.substring(7);
        }
        if (cleanContent.endsWith('```')) {
          cleanContent = cleanContent.substring(0, cleanContent.length - 3);
        }
        cleanContent = cleanContent.trim();

        // Attempt to fix common JSON malformations
        // 1. Remove trailing commas in arrays: e.g., ["a", "b",] -> ["a", "b"]
        cleanContent = cleanContent.replace(/,\s*(?=\])/g, '');
        // Fix extra closing square bracket for an array that is the last property in an object
        // e.g. { "keywords": ["a", "b"] ] } -> { "keywords": ["a", "b"] }
        cleanContent = cleanContent.replace(/(]\s*)\](\s*})/g, '$1$2');

        console.log("generateMetadata: Content after cleaning attempts:", cleanContent);
        const parsedMetadata = JSON.parse(cleanContent);
        console.log("generateMetadata: Parsed metadata:", parsedMetadata);
        return parsedMetadata; // Kembalikan objek JavaScript yang sudah diparsing
      } catch (parseError) {
        console.error('generateMetadata: Failed to parse JSON response from API:', parseError);
        console.error('generateMetadata: Raw content that failed parsing:', rawContent);
        throw new Error(`Failed to parse metadata JSON from API: ${parseError.message}`);
      }
    } catch (error) {
      console.error('Error generating metadata:', error);
      throw error;
    }
  }

  // Fungsi untuk memicu event input dengan benar
  function triggerInputEvent(element, value) {
    if (!element) return false;
    
    try {
      // Set nilai langsung
      element.value = value;
      
      // Trigger events penting
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
      element.dispatchEvent(new Event('blur', { bubbles: true }));
      
      return true;
    } catch (e) {
      console.error('Gagal memicu event input:', e);
      return false;
    }
  }

  // Fungsi untuk mengisi field di Adobe Stock (berjalan di konteks popup)
  async function fillAdobeStockFields(metadata, imageIndex, tabId, generativeAiToggleState) { 
    console.log('POPUP: Memulai pengisian field Adobe Stock dengan metadata:', metadata);

    try {
      if (!tabId) {
        console.error('POPUP: tabId tidak valid atau tidak diberikan ke fillAdobeStockFields.');
        return { success: false, error: 'tabId tidak valid untuk fillAdobeStockFields' };
      }
      console.log('POPUP: Menjalankan script di halaman target dengan tabId:', tabId, 'dan metadata object...');
      const results = await chrome.scripting.executeScript({
        target: { tabId: tabId },
        function: pageScriptToExecuteOnAdobePage, 
        args: [metadata, imageIndex, generativeAiToggleState] 
      });

      console.log('POPUP: Hasil eksekusi script dari halaman:', results);

      if (chrome.runtime.lastError) {
        console.error('POPUP: Error saat mengeksekusi script di halaman:', chrome.runtime.lastError);
        return { success: false, error: `Script execution error: ${chrome.runtime.lastError.message}` };
      }

      if (results && results[0] && results[0].result) {
        console.log('POPUP: Pengisian field di halaman selesai.', results[0].result);
        return results[0].result; // Mengembalikan hasil dari pageScriptToExecuteOnAdobePage
      } else {
        console.warn('POPUP: Tidak ada hasil yang dikembalikan dari script halaman atau format tidak sesuai.');
        return { success: false, error: 'Tidak ada hasil dari script halaman atau format tidak sesuai.' };
      }

    } catch (error) {
      console.error('POPUP: Error dalam fungsi fillAdobeStockFields:', error);
      return { success: false, error: error.message, stack: error.stack };
    }
  }

  // Fungsi ini akan diinjeksi dan dijalankan di konteks halaman Adobe Stock
async function pageScriptToExecuteOnAdobePage(metadataObject, imageIndex, isGenerativeAi) { // Menerima metadataObject dan imageIndex, dijadikan async
  console.log(`PAGE_SCRIPT: Menjalankan untuk imageIndex: ${imageIndex}`);
  console.log('PAGE_SCRIPT: Received metadataObject:', metadataObject);
  let metadata = metadataObject;
  // Parsing logic removed as metadataObject is already an object
  console.log('PAGE_SCRIPT: Final metadata object:', metadata);

  if (!metadata || typeof metadata.caption === 'undefined' || typeof metadata.keywords === 'undefined') {
    console.error('PAGE_SCRIPT: Metadata tidak lengkap atau invalid:', metadata);
    return { 
      success: false, 
      errors: ['Metadata tidak lengkap atau formatnya salah setelah parsing.'], 
      filledFields: [], 
      foundSelectors: { title: '', keywords: '' },
      pageUrl: window.location.href
    };
  }

  console.log('PAGE_SCRIPT: Verifikasi metadata.caption:', metadata.caption);
  console.log('PAGE_SCRIPT: Verifikasi typeof metadata.caption:', typeof metadata.caption);
  console.log('PAGE_SCRIPT: Verifikasi metadata.keywords:', metadata.keywords);
  console.log('PAGE_SCRIPT: Verifikasi Array.isArray(metadata.keywords):', Array.isArray(metadata.keywords));

  // --- Langkah Baru: Klik thumbnail gambar yang sesuai ---
  console.log(`PAGE_SCRIPT: Mencari thumbnail gambar ke-${imageIndex}...`);
  const thumbnailSelectors = [
      'div.upload-tile__wrapper' 
  ];
  let clickedThumbnail = false;
  for (const tsSelector of thumbnailSelectors) {
      const imageThumbnails = document.querySelectorAll(tsSelector);
      if (imageThumbnails.length > imageIndex) {
          const targetThumbnail = imageThumbnails[imageIndex];
          console.log(`PAGE_SCRIPT: Thumbnail gambar ke-${imageIndex} (selector: ${tsSelector}) ditemukan:`, targetThumbnail);
          try {
              console.log(`PAGE_SCRIPT: Mengklik thumbnail...`);
              targetThumbnail.click();
              clickedThumbnail = true;
              console.log(`PAGE_SCRIPT: Menunggu UI update setelah klik (1000ms)...`);
              await new Promise(resolve => setTimeout(resolve, 1000)); 
              console.log(`PAGE_SCRIPT: Selesai menunggu.`);
              break; 
          } catch (clickError) {
              console.warn(`PAGE_SCRIPT: Gagal mengklik thumbnail (selector: ${tsSelector}, index: ${imageIndex}). Error:`, clickError);
          }
      }
  }
  if (!clickedThumbnail) {
      console.warn(`PAGE_SCRIPT: Tidak dapat menemukan atau mengklik thumbnail gambar ke-${imageIndex}.`);
  }
  // --- Akhir Langkah Baru ---

  const results = {
    success: true,
    errors: [],
    filledFields: [], 
    foundSelectors: { title: '', keywords: '' },
    pageUrl: window.location.href,
    log: [],
    warnings: []
  };

  // Fungsi helper untuk dispatch event agar React mendeteksi perubahan
  async function dispatchReactInputEvent(element, value, skipBlur = false) {
    console.log(`PAGE_SCRIPT: dispatchReactInputEvent untuk elemen: `, element, ` dengan nilai: "${value}", skipBlur: ${skipBlur}`);
    
    let prototype = Object.getPrototypeOf(element);
    if (element.tagName === 'INPUT') {
        prototype = window.HTMLInputElement.prototype;
    } else if (element.tagName === 'TEXTAREA') {
        prototype = window.HTMLTextAreaElement.prototype;
    } else if (element.tagName === 'SELECT') {
        console.log("PAGE_SCRIPT: dispatchReactInputEvent targeting SELECT element.");
        prototype = window.HTMLSelectElement.prototype;
    } else {
        console.log("PAGE_SCRIPT: dispatchReactInputEvent targeting generic HTMLElement.");
        prototype = window.HTMLElement.prototype;
    }
    
    const { set: valueSetter } = Object.getOwnPropertyDescriptor(prototype, 'value') || {};
    const { set: checkedSetter } = Object.getOwnPropertyDescriptor(prototype, 'checked') || {};

    if (element.type === 'checkbox' && checkedSetter) {
        console.log("PAGE_SCRIPT: dispatchReactInputEvent for checkbox, using checkedSetter.");
        checkedSetter.call(element, value); // For checkboxes, value is boolean for 'checked'
    } else if (valueSetter) {
        console.log("PAGE_SCRIPT: dispatchReactInputEvent using valueSetter.");
        valueSetter.call(element, value);
    } else {
        console.warn("PAGE_SCRIPT: dispatchReactInputEvent - valueSetter not found for element. Falling back to direct value assignment.", element);
        element.value = value; // Fallback, might not trigger React updates
    }

    // Simulasikan event input dan change
    const inputEvent = new Event('input', { bubbles: true, cancelable: true });
    element.dispatchEvent(inputEvent);
    console.log("PAGE_SCRIPT: Dispatched 'input' event.");

    const changeEvent = new Event('change', { bubbles: true, cancelable: true });
    element.dispatchEvent(changeEvent);
    console.log("PAGE_SCRIPT: Dispatched 'change' event.");
    
    // Beberapa aplikasi React mungkin juga memerlukan event 'blur'
    if (!skipBlur) {
        const blurEvent = new Event('blur', { bubbles: true, cancelable: true });
        element.dispatchEvent(blurEvent);
        console.log("PAGE_SCRIPT: Dispatched 'blur' event.");
    } // Closing brace for if (!skipBlur)
  } // Closing brace for dispatchReactInputEvent

  // --- PENGISIAN FILE TYPE ---
  console.log("PAGE_SCRIPT: Mencari field file type (Photo/Illustration)...");
  const fileTypeSelectSelector = 'select[name="contentType"]';
  const fileTypeSelectElement = document.querySelector(fileTypeSelectSelector);
  if (fileTypeSelectElement) {
    console.log("PAGE_SCRIPT: Select element File Type ditemukan.");
    const fileTypeMap = { "Photo": "1", "Photos": "1", "Illustration": "2", "Illustrations": "2", "Vector": "3", "Vectors": "3" };
    const targetValue = fileTypeMap[metadata.imageType];

    if (targetValue) {
      if (fileTypeSelectElement.value !== targetValue) {
        fileTypeSelectElement.value = targetValue;
        await dispatchReactInputEvent(fileTypeSelectElement, targetValue); // Menggunakan helper yang ada
        console.log(`PAGE_SCRIPT: File Type diatur ke ${metadata.imageType} (value: ${targetValue})`);
        results.filledFields.push('File Type');
        results.foundSelectors.fileType = fileTypeSelectSelector;
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1-second delay
      } else {
        console.log(`PAGE_SCRIPT: File Type sudah benar (${metadata.imageType}). Tidak ada perubahan.`);
        results.filledFields.push('File Type (already correct)');
        results.foundSelectors.fileType = fileTypeSelectSelector;
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1-second delay
      }
    } else {
      console.warn(`PAGE_SCRIPT: Nilai mapping untuk File Type '${metadata.imageType}' tidak ditemukan.`);
      results.errors.push(`Nilai mapping untuk File Type '${metadata.imageType}' tidak ditemukan.`);
    }
  } else {
    console.warn("PAGE_SCRIPT: Select element File Type tidak ditemukan dengan selector: " + fileTypeSelectSelector);
    results.errors.push("Select element File Type tidak ditemukan.");
  }

  // --- PENGISIAN CATEGORY ---
  console.log("PAGE_SCRIPT: Mencari field category...");
  const categorySelectSelector = 'select[name="category"]';
  const categorySelectElement = document.querySelector(categorySelectSelector);
  let categoryValueFound = null;
  if (categorySelectElement) {
    console.log("PAGE_SCRIPT: Select element Category ditemukan.");
    let foundOption = false;
    for (let i = 0; i < categorySelectElement.options.length; i++) {
      const option = categorySelectElement.options[i];
      if (option.textContent.trim().toLowerCase() === metadata.category.trim().toLowerCase()) {
        if (categorySelectElement.value !== option.value) {
          categorySelectElement.value = option.value;
          await dispatchReactInputEvent(categorySelectElement, option.value); // Menggunakan helper yang ada
          console.log(`PAGE_SCRIPT: Category diatur ke ${metadata.category} (value: ${option.value})`);
          results.filledFields.push('Category');
        } else {
          console.log(`PAGE_SCRIPT: Category sudah benar (${metadata.category}). Tidak ada perubahan.`);
          results.filledFields.push('Category (already correct)');
        }
        categoryValueFound = option.value;
        foundOption = true;
        break;
      }
    }
    if (foundOption) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1-second delay
    } else {
      console.warn(`PAGE_SCRIPT: Opsi Category dengan nama '${metadata.category}' tidak ditemukan.`);
      results.errors.push(`Opsi Category dengan nama '${metadata.category}' tidak ditemukan.`);
    }
  } else {
    console.warn("PAGE_SCRIPT: Select element Category tidak ditemukan dengan selector: " + categorySelectSelector);
    results.errors.push("Select element Category tidak ditemukan.");
  }
  console.log(`[MMX - Img ${imageIndex + 1}] Category selected: ${metadata.category} (ID: ${categoryValueFound || metadata.category})`);
  await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for UI to update

  // --- Handle Generative AI Checkboxes ---
  console.log(`[MMX - Img ${imageIndex + 1}] Checking 'isGenerativeAi' flag: ${isGenerativeAi}`);
  results.log.push(`isGenerativeAi flag is: ${isGenerativeAi}`);
  if (isGenerativeAi) {
    console.log(`[MMX - Img ${imageIndex + 1}] 'Created using generative AI tools' is ON. Attempting to check related boxes.`);
    results.log.push("'Created using generative AI tools' is ON.");
    try {
      const generativeAiCheckboxSelector = 'input#content-tagger-generative-ai-checkbox';
      const generativeAiCheckbox = document.querySelector(generativeAiCheckboxSelector);
      console.log(`[MMX - Img ${imageIndex + 1}] Found 'Generative AI checkbox' element:`, generativeAiCheckbox);

      if (generativeAiCheckbox) {
        if (!generativeAiCheckbox.checked) {
          generativeAiCheckbox.click();
          console.log(`[MMX - Img ${imageIndex + 1}] Clicked 'Generative AI checkbox'.`);
          results.log.push("Clicked 'Generative AI checkbox'.");
          await new Promise(resolve => setTimeout(resolve, 1500)); // Wait for dependent elements to potentially appear/update
        } else {
          console.log(`[MMX - Img ${imageIndex + 1}] 'Generative AI checkbox' was already checked.`);
          results.log.push("'Generative AI checkbox' was already checked.");
        }

        const propertyReleaseSelector = 'input#content-tagger-generative-ai-property-release-checkbox';
        let propertyReleaseCheckbox = document.querySelector(propertyReleaseSelector);
        console.log(`[MMX - Img ${imageIndex + 1}] Initial check for 'Property release checkbox':`, propertyReleaseCheckbox);
        let attempts = 0;
        const maxAttempts = 10; // Try for 5 seconds (10 * 500ms)
        const checkInterval = 500; // ms

        while (!propertyReleaseCheckbox && attempts < maxAttempts) {
          console.log(`[MMX - Img ${imageIndex + 1}] Waiting for 'Property release checkbox' to appear... (Attempt ${attempts + 1})`);
          await new Promise(resolve => setTimeout(resolve, checkInterval));
          propertyReleaseCheckbox = document.querySelector(propertyReleaseSelector);
          console.log(`[MMX - Img ${imageIndex + 1}] Found 'Property release checkbox' element (in loop attempt ${attempts + 1}):`, propertyReleaseCheckbox);
          attempts++;
        }

        if (propertyReleaseCheckbox) {
          if (!propertyReleaseCheckbox.checked) {
            propertyReleaseCheckbox.click();
            console.log(`[MMX - Img ${imageIndex + 1}] Clicked 'Property release checkbox'.`);
            results.log.push("Clicked 'Property release checkbox'.");
            await new Promise(resolve => setTimeout(resolve, 500)); // Short wait after click
          } else {
            console.log(`[MMX - Img ${imageIndex + 1}] 'Property release checkbox' was already checked.`);
            results.log.push("'Property release checkbox' was already checked.");
          }
        } else {
          console.warn(`[MMX - Img ${imageIndex + 1}] 'Property release checkbox' not found after ${maxAttempts} attempts.`);
          results.warnings.push("'Property release checkbox' not found after checking 'Generative AI checkbox'.");
        }
      } else {
        console.warn(`[MMX - Img ${imageIndex + 1}] 'Generative AI checkbox' not found with selector: ${generativeAiCheckboxSelector}`);
        results.warnings.push("'Generative AI checkbox' not found on the page.");
      }
    } catch (e) {
      console.error(`[MMX - Img ${imageIndex + 1}] Error handling Generative AI checkboxes: ${e.message}`, e);
      results.errors.push(`Error handling Generative AI checkboxes: ${e.message}`);
    }
  }
  // --- End of Handle Generative AI Checkboxes ---

  // --- PENGISIAN TITLE ---
  console.log("PAGE_SCRIPT: Mencari field title...");
  const titleSelectors = [
    'textarea[name="title"]',
    'textarea[data-t="asset-title-content-tagger"]',
    'textarea[aria-label="Content title"]',
    'textarea#metadata-title', // Fallback from previous attempts
    'textarea[placeholder="Type title here (max: 200 characters)"]'
]; 
  let titleElement;
  for (const selector of titleSelectors) {
    titleElement = document.querySelector(selector);
    if (titleElement) {
      results.foundSelectors.title = selector;
      console.log("PAGE_SCRIPT: Field title ditemukan dengan selector: " + selector);
      break;
    }
  }

  if (titleElement) {
    console.log("PAGE_SCRIPT: Mengisi title dengan: " + metadata.caption);
    await dispatchReactInputEvent(titleElement, metadata.caption);
    results.filledFields.push({ fieldName: 'title', value: metadata.caption, selector: results.foundSelectors.title });
    if (imageIndex === 0) {
      console.log('PAGE_SCRIPT: Menunggu ekstra untuk keywords gambar pertama (2000ms)...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    } else {
      console.log('PAGE_SCRIPT: Menunggu tambahan sebelum mencari/mengisi Keywords (1000ms)...');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  } else {
    console.warn("PAGE_SCRIPT: Field title tidak ditemukan dengan selector manapun.");
    results.errors.push("Field title tidak ditemukan.");
    results.success = false;
  }

  // --- PENGISIAN KEYWORDS ---
  console.log("PAGE_SCRIPT: Mencari field keywords...");
  const keywordsSelectors = [
    'textarea#content-keywords-ui-textarea',
    'textarea[data-t="content-keywords-ui-textarea"]',
    'textarea[aria-label="Paste Keywords..."]',
    'textarea[name="keywordsUITextArea"]',
    'textarea#metadata-keywords' // Fallback from previous attempts
]; 
  let keywordsElement;
  for (const selector of keywordsSelectors) {
    keywordsElement = document.querySelector(selector);
    if (keywordsElement) {
      results.foundSelectors.keywords = keywordsElement.outerHTML.substring(0, 200) + (keywordsElement.outerHTML.length > 200 ? '...' : '');
      console.log("PAGE_SCRIPT: Field keywords ditemukan dengan selector: " + selector);
      break;
    }
  }

  if (keywordsElement) {
    const keywordsString = metadata.keywords.join(', ');
    console.log('PAGE_SCRIPT: Mencoba fokus pada field keywords...');
    keywordsElement.focus();
    await new Promise(resolve => setTimeout(resolve, 100)); // Jeda singkat setelah fokus
    console.log('PAGE_SCRIPT: Fokus selesai, melanjutkan dispatch event.');
    console.log("PAGE_SCRIPT: Mengisi keywords dengan: " + keywordsString);
    await dispatchReactInputEvent(keywordsElement, keywordsString, true); // *** Pass true to skipBlur ***
    results.filledFields.push({ fieldName: 'keywords', value: keywordsString, selector: results.foundSelectors.keywords });

    // Simulate Enter key press to commit tags
    console.log("PAGE_SCRIPT: Attempting to simulate 'Enter' key press on keywords field.");
    try {
        const enterDownEvent = new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true, cancelable: true, composed: true });
        keywordsElement.dispatchEvent(enterDownEvent);
        console.log("PAGE_SCRIPT: 'Enter' keydown event dispatched on keywords field.");

        const enterUpEvent = new KeyboardEvent('keyup', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true, cancelable: true, composed: true });
        keywordsElement.dispatchEvent(enterUpEvent);
        console.log("PAGE_SCRIPT: 'Enter' keyup event dispatched on keywords field.");
        
        await new Promise(resolve => setTimeout(resolve, 300)); // Short delay for Enter to process

        // Now, explicitly blur the field
        console.log("PAGE_SCRIPT: Explicitly blurring keywords field after Enter simulation.");
        keywordsElement.dispatchEvent(new Event('blur', { bubbles: true, cancelable: false }));
        await new Promise(resolve => setTimeout(resolve, 200)); // Delay after explicit blur

    } catch (e) {
        console.error("PAGE_SCRIPT: Error dispatching 'Enter' key event on keywords field:", e);
        results.errors.push("Error dispatching 'Enter' key event for keywords: " + e.toString());
    }
  } else {
    console.warn("PAGE_SCRIPT: Field keywords tidak ditemukan dengan selector manapun.");
    results.errors.push("Field keywords tidak ditemukan.");
    results.success = false;
  }
  
  // Validasi akhir berdasarkan apakah field utama berhasil diisi
  if (!results.filledFields.find(f => f.fieldName === 'title') || !results.filledFields.find(f => f.fieldName === 'keywords')) {
      results.success = false; // Jika salah satu kondisi gagal, tandai sebagai tidak sukses keseluruhan
  }

  console.log("PAGE_SCRIPT: Selesai menjalankan. Hasil operasi:", results);
  return results;
}

  // Fungsi ini akan diinjeksi dan dijalankan di konteks halaman Adobe Stock untuk mengklik tombol Save Work
async function clickSaveWorkButtonScript() {
  console.log("CLICK_SAVE_SCRIPT: Mencoba menemukan dan mengklik tombol 'Save work'.");
  const results = { success: false, log: [], error: null };
  const saveWorkButtonSelector = 'button[data-t="save-work"]';
  const saveWorkButton = document.querySelector(saveWorkButtonSelector);

  if (saveWorkButton) {
    results.log.push(`CLICK_SAVE_SCRIPT: Tombol 'Save work' (selector: ${saveWorkButtonSelector}) ditemukan.`);
    if (saveWorkButton.disabled) {
      results.log.push("CLICK_SAVE_SCRIPT: Tombol 'Save work' ditemukan tetapi dalam keadaan disabled.");
      results.error = "Tombol 'Save work' dinonaktifkan.";
    } else {
      try {
        results.log.push("CLICK_SAVE_SCRIPT: Mengklik tombol 'Save work'...");
        saveWorkButton.click();
        results.log.push("CLICK_SAVE_SCRIPT: Tombol 'Save work' berhasil diklik.");
        results.success = true;
      } catch (e) {
        results.log.push(`CLICK_SAVE_SCRIPT: Error saat mengklik tombol 'Save work': ${e.message}`);
        results.error = `Gagal mengklik tombol 'Save work': ${e.message}`;
      }
    }
  } else {
    results.log.push(`CLICK_SAVE_SCRIPT: Tombol 'Save work' (selector: ${saveWorkButtonSelector}) tidak ditemukan.`);
    results.error = "Tombol 'Save work' tidak ditemukan di halaman.";
  }
  console.log("CLICK_SAVE_SCRIPT: Mengembalikan hasil:", results);
  return results;
}

  // Fungsi untuk menampilkan hasil metadata
async function displayMetadata(metadata, imageIndex, tabId, generativeAiToggleState) { // Tambahkan imageIndex dan tabId
    const container = document.createElement('div');
    container.style.marginTop = '15px';
    container.style.padding = '15px';
    container.style.backgroundColor = '#AD49E1';
    container.style.borderRadius = '8px';
    container.style.fontFamily = 'Arial, sans-serif';

    // Tampilkan loading
    container.innerHTML = `
      <div style="text-align: center; padding: 20px;">
        <div class="spinner" style="width: 30px; height: 30px; border: 3px solid #f3f3f3; border-top: 3px solid #4CAF50; border-radius: 50%; margin: 0 auto 15px; animation: spin 1s linear infinite;"></div>
        <div>Mengisi form Adobe Stock...</div>
      </div>
      <style>
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      </style>
    `;
    
    // Coba isi form secara otomatis
    try {
      console.log('Memulai auto-fill form...');
      // Teruskan imageIndex ke fillAdobeStockFields
      const result = await fillAdobeStockFields(metadata, imageIndex, tabId, generativeAiToggleState);
      console.log(`POPUP: Hasil auto-fill untuk gambar index ${imageIndex}:`, result);
      
      if (!result.success) {
        console.error('Gagal mengisi form:', result.error);
      }
    } catch (error) {
      console.error('Error saat auto-fill:', error);
    }
    
    try {
      // Coba parse JSON jika metadata berupa string
      const metadataObj = typeof metadata === 'string' ? JSON.parse(metadata) : metadata;
      
      container.innerHTML = `
        <h3 style="margin: 0 0 15px 0; color: #2E073F; border-bottom: 1px solid #7A1CAC; padding-bottom: 8px;">Generated Metadata</h3>
        
        <div style="margin-bottom: 12px;">
          <div style="font-weight: 600; margin-bottom: 4px; color: #2E073F;">Image Type</div>
          <div style="background: #2E073F; padding: 10px; border-radius: 6px; border: 1px solid #e0e0e0;">
            ${metadataObj.imageType || 'Not specified'}
          </div>
        </div>
        
        <div style="margin-bottom: 12px;">
          <div style="font-weight: 600; margin-bottom: 4px; color: #2E073F;">Category</div>
          <div style="background: #2E073F; padding: 10px; border-radius: 6px; border: 1px solid #e0e0e0;">
            ${metadataObj.category || 'Not specified'}
          </div>
        </div>
        
        <div style="margin-bottom: 12px;">
          <div style="font-weight: 600; margin-bottom: 4px; color: #2E073F;">Title</div>
          <div style="background: #2E073F; padding: 10px; border-radius: 6px; border: 1px solid #e0e0e0; line-height: 1.4; font-weight: 500;">
            ${metadataObj.caption || 'No title generated'}
          </div>
          <div style="font-size: 12px; color: #666; margin-top: 4px; text-align: right;">
            ${metadataObj.caption ? `${metadataObj.caption.length} characters` : ''}
          </div>
        </div>
        
        <div style="margin-bottom: 12px;">
          <div style="font-weight: 600; margin-bottom: 4px; color: #2E073F;">
            Keywords (${metadataObj.keywords ? metadataObj.keywords.length : 0})
          </div>
          <div style="background: #2E073F; padding: 12px; border-radius: 6px; border: 1px solid #e0e0e0; line-height: 1.6;">
            ${metadataObj.keywords ? metadataObj.keywords.map(kw => `<span style="display: inline-block; background: #7A1CAC; padding: 2px 8px; border-radius: 12px; margin: 0 6px 6px 0;">${kw}</span>`).join('') : 'No keywords generated'}
          </div>
        </div>
        

      `;
      
      // Tampilkan status auto-fill
      const statusElement = document.createElement('div');
      statusElement.style.marginTop = '15px';
      statusElement.style.padding = '10px';
      statusElement.style.borderRadius = '4px';
      statusElement.style.textAlign = 'center';
      statusElement.style.backgroundColor = '#e8f5e9';
      statusElement.style.color = '#2e7d32';
      statusElement.innerHTML = '✓ Form Adobe Stock berhasil diisi';
      container.appendChild(statusElement);
      
      // Sembunyikan status setelah 3 detik
      setTimeout(() => {
        statusElement.style.opacity = '0';
        statusElement.style.transition = 'opacity 0.5s';
        setTimeout(() => statusElement.remove(), 500);
      }, 3000);
    } catch (e) {
      // Jika gagal parse JSON, tampilkan sebagai teks biasa
      container.innerHTML = `
        <h3 style="margin: 0 0 10px 0; color: #2E073F;">Hasil Generate</h3>
        <div style="background: red; padding: 12px; border-radius: 4px; white-space: pre-wrap; font-family: monospace;">
          ${metadata}
        </div>
      `;
    }
    
    return container;
  }

  // Fungsi untuk mendapatkan tab Adobe Stock Contributor yang aktif di jendela normal
  async function getActiveAdobeStockTab() {
    console.log('getActiveAdobeStockTab: Function called');
    try {
      // Query for active tabs in normal browser windows that match the Adobe Stock Contributor URL pattern
      const potentialTabs = await chrome.tabs.query({
        url: "*://contributor.stock.adobe.com/*", // Langsung filter URL yang lebih spesifik
        active: true,                            // Tab harus aktif di jendelanya
        windowType: "normal"                     // Jendela harus bertipe normal (bukan popup)
      });
      console.log('getActiveAdobeStockTab: Queried potential tabs:', JSON.stringify(potentialTabs));

      if (potentialTabs.length > 0) {
        // Biasanya hanya ada satu tab aktif yang cocok per jendela normal.
        // Jika ada beberapa (misalnya, beberapa jendela normal dengan tab Adobe Stock aktif),
        // kita ambil yang pertama ditemukan oleh query.
        const adobeTab = potentialTabs[0];
        console.log('getActiveAdobeStockTab: Found Adobe Stock Contributor tab:', JSON.stringify(adobeTab));
        return adobeTab; // Kembalikan objek tab
      } else {
        console.log('getActiveAdobeStockTab: No active Adobe Stock Contributor tab found in normal windows.');
        return null; // Tidak ada tab yang cocok ditemukan
      }  
    } catch (error) {
      console.error('getActiveAdobeStockTab: Error querying tabs:', error);
    statusDiv.innerHTML = `
      <div style="color: #d32f2f; background-color: #ffebee; padding: 10px; border-radius: 4px; margin-bottom: 10px;">
        Halaman Adobe Stock Contributor tidak ditemukan atau tidak aktif. Pastikan tab Adobe Stock adalah tab aktif di jendela browser utama.
      </div>
    `;
    imageList.innerHTML = ''; // Bersihkan konten sebelumnya
    imageList.appendChild(statusDiv);
    return;
    }
  }
  
  // Fungsi untuk memproses gambar pertama
async function processAllImagesInGrid() {
  const statusDiv = document.createElement('div');
  statusDiv.style.marginTop = '15px';
  statusDiv.style.padding = '15px';
  statusDiv.style.backgroundColor = '#7A1CAC';
  statusDiv.style.borderRadius = '8px';
  statusDiv.style.fontFamily = 'Arial, sans-serif';

  // Dapatkan tab Adobe Stock yang aktif
  const adobeTab = await getActiveAdobeStockTab();

  if (!adobeTab) {
    statusDiv.innerHTML = `
      <div style="color: #d32f2f; background-color: #ffebee; padding: 10px; border-radius: 4px; margin-bottom: 10px;">
        Halaman Adobe Stock Contributor tidak ditemukan atau tidak aktif. Pastikan tab Adobe Stock adalah tab aktif di jendela browser utama.
      </div>
    `;
    imageList.innerHTML = ''; // Bersihkan konten sebelumnya
    imageList.appendChild(statusDiv);
    return;
  }

  // Jika tab ditemukan, lanjutkan dengan UI normal
  statusDiv.innerHTML = `
    <h3 style="margin: 0 0 10px 0; color: #2E073F;">Adobe Stock AI Metadata Injector</h3>
    <div id="processStatus">Mengambil gambar pertama...</div>
    <div id="metadataResult" style="margin-top: 15px;"></div>
  `;
  imageList.innerHTML = ''; // Bersihkan konten sebelumnya
  imageList.appendChild(statusDiv);
  
  const statusElement = statusDiv.querySelector('#processStatus');
  const resultElement = statusDiv.querySelector('#metadataResult');
  resultElement.innerHTML = ''; // Bersihkan hasil sebelumnya

  try {
    // Kita sudah memiliki adobeTab dari getActiveAdobeStockTab()
    const [scriptResults] = await chrome.scripting.executeScript({
      target: { tabId: adobeTab.id },
      function: () => {
        const images = document.querySelectorAll('.content-grid[data-t="assets-content-grid"] img');
        return Array.from(images).map(img => img.src).filter(src => src); // Ambil semua URL gambar yang valid
      }
    });

    // Periksa apakah scriptResults valid sebelum mengakses .result
    if (!scriptResults || !scriptResults.result) {
        throw new Error('Gagal mengambil URL gambar dari halaman. Hasil script kosong atau tidak terduga.');
    }
    const imageUrls = scriptResults.result;

    if (!imageUrls || imageUrls.length === 0) {
      throw new Error('Tidak menemukan gambar di grid halaman ini.');
    }

    statusElement.textContent = `Ditemukan ${imageUrls.length} gambar. Memulai proses...`;

    for (let i = 0; i < imageUrls.length; i++) {
      const imageUrl = imageUrls[i];
      const imageNumber = i + 1;
      statusElement.textContent = `Memproses gambar ${imageNumber} dari ${imageUrls.length}: Mengenerate metadata...`;
      
      try {
        const metadata = await generateMetadata(imageUrl);
        statusElement.textContent = `Memproses gambar ${imageNumber} dari ${imageUrls.length}: Metadata digenerate. Menampilkan & mengisi form...`;
        
        // Teruskan indeks 'i' (0-based) dan adobeTab.id ke displayMetadata
        const generativeAiToggle = document.getElementById('generativeAiToggle');
        const generativeAiToggleState = generativeAiToggle ? generativeAiToggle.checked : false;
        const metadataContainer = await displayMetadata(metadata, i, adobeTab.id, generativeAiToggleState); 
        
        // Tambahkan judul untuk setiap gambar di popup
        const imageTitleElement = document.createElement('h4');
        imageTitleElement.textContent = `Hasil untuk Gambar ${imageNumber}`;
        
        const resultBlock = document.createElement('div');
        resultBlock.appendChild(imageTitleElement);
        resultBlock.appendChild(metadataContainer); // metadataContainer is the result of displayMetadata

        // If resultElement already has content, style its current firstChild (the topmost item)
        // because it will be pushed down by the new resultBlock.
        // This creates a visual separation (margin/border) above the item being pushed down.
        if (resultElement.firstChild) {
          resultElement.firstChild.style.marginTop = '20px';
          resultElement.firstChild.style.borderTop = '1px dashed #ccc';
          resultElement.firstChild.style.paddingTop = '10px';
        }
        resultElement.prepend(resultBlock);

      } catch (imageError) {
        console.error(`Error memproses gambar ${imageNumber} (${imageUrl}):`, imageError);
        const errorDiv = document.createElement('div');
        errorDiv.innerHTML = `
          <h4 style="margin-top:20px; border-top:1px dashed #ccc; padding-top:10px; color: #d32f2f;">Error untuk Gambar ${imageNumber}</h4>
          <div style="color: #d32f2f; background-color: #ffebee; padding: 10px; border-radius: 4px; margin-top: 5px;">
            Gagal memproses gambar: ${imageError.message}
          </div>`;
        resultElement.appendChild(errorDiv);
      }
    }
    statusElement.textContent = `Selesai memproses ${imageUrls.length} gambar.`;

  // Setelah semua gambar diproses, coba klik tombol 'Save work'
  if (imageUrls.length > 0) {
    statusElement.textContent += " Mencoba menyimpan pekerjaan...";
    console.log("PROCESS_GRID: Mencoba mengklik tombol 'Save work' setelah semua gambar diproses.");
    try {
      const [saveWorkResult] = await chrome.scripting.executeScript({
        target: { tabId: adobeTab.id },
        function: clickSaveWorkButtonScript // Menggunakan fungsi yang baru dibuat
      });

      if (saveWorkResult && saveWorkResult.result) {
        if (saveWorkResult.result.success) {
          console.log("PROCESS_GRID: Tombol 'Save work' berhasil diklik via script.");
          statusElement.textContent += " Pekerjaan berhasil disimpan.";
        } else {
          console.warn("PROCESS_GRID: Gagal mengklik tombol 'Save work' via script:", saveWorkResult.result.error);
          statusElement.textContent += ` Gagal menyimpan: ${saveWorkResult.result.error}`;
        }
        // Log detail dari script
        if (saveWorkResult.result.log && saveWorkResult.result.log.length > 0) {
            saveWorkResult.result.log.forEach(logMsg => console.log(`PROCESS_GRID (from clickSaveWorkButtonScript): ${logMsg}`));
        }
      } else {
        console.warn("PROCESS_GRID: Tidak ada hasil dari script klik 'Save work'.");
        statusElement.textContent += " Gagal menyimpan: tidak ada respons dari skrip.";
      }
    } catch (saveError) {
      console.error("PROCESS_GRID: Error saat mencoba mengklik 'Save work':", saveError);
      statusElement.textContent += ` Gagal menyimpan: ${saveError.message}`;
    }
  }

} catch (error) { // Menangkap error dari pengambilan URL gambar atau setup umum
    console.error('Error dalam processAllImagesInGrid:', error);
    statusElement.innerHTML = `
      <div style="color: #d32f2f; background-color: #ffebee; padding: 10px; border-radius: 4px; margin-top: 10px;">
        Gagal memulai proses: ${error.message}
      </div>
    `;
  }
}

  // Fungsi untuk menampilkan informasi di popup
  function displayInfo() {
    imageList.innerHTML = `
      <div style="font-family: Arial, sans-serif; padding: 0px;">
        <h2 style="margin: 0 0 15px 0; color: #AD49E1; font-size: 16px;">Adobe Stock AI Metadata Injector</h2>
        <p style="margin: 0 0 15px 0; color: #EBD3F8; line-height: 1.5;">
          Klik tombol di bawah untuk memulai inject metadata untuk gambar pertama di grid.
        </p>
        <button id="startProcess" class="btn btn-primary">Mulai Inject Metadata</button>
      </div>
    `;
    
    document.getElementById('startProcess').addEventListener('click', processAllImagesInGrid);
  }
  
  // Panggilan displayInfo() dan pembuatan refreshBtn sekarang ditangani dalam blok kondisional di atas.
});
