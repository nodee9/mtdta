// Fungsi untuk menampilkan link gambar dari container-inline-block
function showImageLinks() {
  try {
    console.log('[MMX] Mencari gambar...');
    // Cari semua elemen dengan class container-inline-block
    const containers = document.querySelectorAll('.container-inline-block');
    
    if (containers.length === 0) {
      console.log('[MMX] Tidak ada container dengan class container-inline-block ditemukan');
      return [];
    }
    
    console.log(`[MMX] Ditemukan ${containers.length} container`);
    
    const results = [];
    
    containers.forEach((container, index) => {
      console.log(`[MMX] Memeriksa container #${index + 1}`);
      
      // Cari semua elemen gambar di dalam container
      const images = container.querySelectorAll('img');
      
      if (images.length === 0) {
        console.log(`[MMX] Tidak ada gambar di container #${index + 1}`);
        return;
      }
      
      console.log(`[MMX] Ditemukan ${images.length} gambar di container #${index + 1}`);
      
      // Kumpulkan informasi gambar
      images.forEach((img, imgIndex) => {
        try {
          if (img.src) {
            const url = new URL(img.src);
            // Hanya izinkan URL dengan protokol http/https
            if (url.protocol === 'http:' || url.protocol === 'https:') {
              results.push({
                src: img.src,
                alt: img.alt || 'No alt text',
                containerClass: container.className
              });
              console.log(`[MMX] Gambar #${imgIndex + 1} ditambahkan:`, img.src);
            }
          }
        } catch (e) {
          console.warn(`[MMX] Error memproses gambar #${imgIndex + 1}:`, e);
        }
      });
    });
    
    console.log(`[MMX] Total ${results.length} gambar valid ditemukan`);
    return results;
    
  } catch (error) {
    console.error('[MMX] Error di showImageLinks:', error);
    return [];
  }
}

// Fungsi untuk mendapatkan elemen gambar yang valid
function getImageElements() {
  const containers = document.querySelectorAll('.container-inline-block');
  const validImages = [];
  
  containers.forEach(container => {
    const images = container.querySelectorAll('img');
    
    images.forEach(img => {
      if (img.src) {
        try {
          const url = new URL(img.src);
          // Hanya izinkan URL dengan protokol http/https
          if (url.protocol === 'http:' || url.protocol === 'https:') {
            validImages.push({
              element: img,
              src: img.src,
              alt: img.alt || 'No alt text'
            });
          }
        } catch (e) {
          // Lewati URL yang tidak valid
          console.warn('URL gambar tidak valid:', img.src);
        }
      }
    });
  });
  
  return validImages;
}

// Jalankan fungsi saat halaman selesai dimuat
document.addEventListener('DOMContentLoaded', function() {
  console.log('Ekstensi MMX aktif');
  
  // Tampilkan link gambar
  showImageLinks();
  
  // Gunakan MutationObserver untuk mendeteksi perubahan DOM
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.addedNodes.length) {
        showImageLinks();
      }
    });
  });
  
  // Mulai mengamati perubahan pada body
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
});

// Tangani pesan dari popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'getImageLinks') {
    const containers = document.querySelectorAll('.container-inline-block');
    const imageLinks = [];
    
    containers.forEach(container => {
      const images = container.querySelectorAll('img');
      images.forEach(img => {
        if (img.src) {
          imageLinks.push({
            src: img.src,
            alt: img.alt || 'No alt text',
            containerClass: container.className
          });
        }
      });
    });
    
    sendResponse({ imageLinks: imageLinks });
  }
  return true;
});
