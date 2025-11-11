// Preview templates for Decap CMS (Netlify CMS) v3
// Simple function component that CMS will render

(function() {
  'use strict';
  
  function registerPreviewTemplates() {
    if (typeof window === 'undefined' || !window.CMS) {
      setTimeout(registerPreviewTemplates, 200);
      return;
    }
    
    const CMS = window.CMS;
    
    if (typeof CMS.registerPreviewTemplate !== 'function') {
      setTimeout(registerPreviewTemplates, 200);
      return;
    }
    
    console.log('Registering preview templates...');
    
    // Helper functions
    function getField(entry, path, defaultValue = '') {
      try {
        const value = entry.getIn(['data', ...path.split('.')]);
        return value !== undefined && value !== null ? value : defaultValue;
      } catch (e) {
        return defaultValue;
      }
    }
    
    function getImages(entry) {
      try {
        const images = entry.getIn(['data', 'images']);
        if (images && images.toJS) {
          return images.toJS();
        }
        return Array.isArray(images) ? images : [];
      } catch (e) {
        return [];
      }
    }
    
    // Get React from window (we loaded it explicitly)
    // React must be available before we can create the preview template
    const React = window.React;
    
    if (!React || !React.createElement) {
      console.error('React not available! Cannot create preview templates.');
      console.error('window.React:', window.React);
      return;
    }
    
    console.log('React is available, creating preview templates');
    const h = React.createElement;
    
    // Preview template function
    // React is available from closure
    function PiePreviewTemplate(props) {
      try {
        console.log('PiePreviewTemplate called');
        const { entry, widgetFor, getAsset } = props || {};
        
        // Always return a valid React element - never return null
        if (!entry) {
          console.warn('PiePreviewTemplate: no entry');
          return h('div', { 
            key: 'no-entry',
            style: { padding: '20px', color: '#666' } 
          }, 'No entry data available');
        }
        
        // Get data
        const title = getField(entry, 'title', 'Untitled Pie');
        const description = getField(entry, 'description');
        const shortDescription = getField(entry, 'shortDescription');
        const price = getField(entry, 'price');
        const soldOut = getField(entry, 'sold_out', false);
        const images = getImages(entry);
        const ingredients = getField(entry, 'ingredients');
        const type = getField(entry, 'type');
        const smallSoldOut = getField(entry, 'small_sold_out', false);
        const bigSoldOut = getField(entry, 'big_sold_out', false);
        
        console.log('PiePreviewTemplate data:', { title, imagesCount: images.length, hasGetAsset: typeof getAsset === 'function' });
        if (images.length > 0 && images[0]) {
          console.log('First image data:', images[0]);
        }
        
        // Get image URL using getAsset function from CMS (proper way)
        function getImageUrl(imgPath) {
          if (!imgPath) return '';
          
          // Use getAsset if available (preferred method for CMS previews)
          // getAsset resolves the path relative to public_folder which is "/images"
          if (getAsset && typeof getAsset === 'function') {
            try {
              const asset = getAsset(imgPath);
              if (asset) {
                // getAsset returns a File object or string URL
                const url = asset.toString ? asset.toString() : String(asset);
                // getAsset should return a proper URL - if it does, use it
                if (url && typeof url === 'string' && url.length > 0) {
                  // If it's a full URL, use it directly (but remove /admin/ if present)
                  if (url.startsWith('http://') || url.startsWith('https://')) {
                    const cleaned = url.replace(/\/admin\/images\//g, '/images/').replace(/\/admin\//g, '/');
                    console.log('getAsset returned URL:', imgPath, '->', cleaned);
                    return cleaned;
                  }
                  // If it's a relative path starting with /, make it absolute
                  if (url.startsWith('/')) {
                    const cleaned = url.replace(/^\/admin\//, '/');
                    const finalUrl = 'https://pieinthesky-eden.com' + cleaned;
                    console.log('getAsset returned path:', imgPath, '->', finalUrl);
                    return finalUrl;
                  }
                }
              }
            } catch (e) {
              console.warn('Error using getAsset for path:', imgPath, e);
            }
          }
          
          // Fallback: manual path resolution
          imgPath = String(imgPath).trim();
          
          // If already a full URL, remove /admin/ if present and return
          if (imgPath.startsWith('http://') || imgPath.startsWith('https://')) {
            return imgPath.replace(/\/admin\/images\//g, '/images/').replace(/\/admin\//g, '/');
          }
          
          // Remove any /admin/ prefix that might have been added (be thorough)
          // Handle cases like: /admin/images/..., admin/images/..., /admin/images/...
          imgPath = imgPath
            .replace(/^\/+admin\/+/, '')  // Remove /admin/ at start
            .replace(/^admin\/+/, '')     // Remove admin/ at start (no leading slash)
            .replace(/\/+admin\/+/g, '/'); // Remove any /admin/ in middle
          
          // Normalize the path to always be /images/...
          // Content files store paths like "images/special-pies/file.jpg" 
          // or CMS might store "special-pies/file.jpg" (relative to public_folder)
          // public_folder is "/images", so final path should be "/images/..."
          
          // Remove any leading/trailing slashes for consistent processing
          let normalizedPath = imgPath.trim().replace(/^\/+|\/+$/g, '');
          
          // If it already starts with "images/", use it; otherwise prepend "images/"
          if (!normalizedPath.startsWith('images/')) {
            normalizedPath = 'images/' + normalizedPath;
          }
          
          // Ensure it starts with a single slash (absolute path on site)
          normalizedPath = '/' + normalizedPath;
          
          // Clean up any duplicate slashes (replace 2+ consecutive slashes with single slash)
          normalizedPath = normalizedPath.replace(/\/{2,}/g, '/');
          
          // Construct absolute URL to prevent browser from resolving relative to /admin/
          // Always use https:// to ensure absolute URL
          const finalUrl = 'https://pieinthesky-eden.com' + normalizedPath;
          console.log('Resolved image URL:', finalUrl, '(from original:', imgPath + ')');
          return finalUrl;
        }
        
        const firstImage = images.length > 0 ? images[0] : null;
        const rawImagePath = firstImage && firstImage.image ? firstImage.image : null;
        console.log('Raw image path from entry:', rawImagePath, 'Type:', typeof rawImagePath);
        const mainImageUrl = rawImagePath ? getImageUrl(rawImagePath) : '';
        const pageImageUrl = mainImageUrl; // Use same image for both views
        const isDinnerPie = type === 'dinner';
        const showSoldOutSticker = isDinnerPie ? (smallSoldOut && bigSoldOut) : soldOut;
        
        // Image error handler - log errors for debugging
        function handleImageError(event) {
          console.error('Image failed to load. Attempted URL:', event.target.src);
        }
        
        // Card View
        const cardImageContainerChildren = [];
        if (mainImageUrl) {
          cardImageContainerChildren.push(h('img', {
            key: 'card-image',
            src: mainImageUrl,
            alt: title,
            onError: handleImageError,
            style: {
              width: '100%',
              height: 'auto',
              display: 'block',
              aspectRatio: '1/1',
              objectFit: 'cover'
            }
          }));
        } else {
          cardImageContainerChildren.push(h('div', {
            key: 'card-image-placeholder',
            style: {
              width: '100%',
              height: '300px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#999'
            }
          }, 'No image'));
        }
        if (showSoldOutSticker) {
          cardImageContainerChildren.push(h('div', {
            key: 'card-sold-out',
            style: {
              position: 'absolute',
              top: '10px',
              left: '10px',
              background: '#ff0000',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '5px',
              fontWeight: 'bold',
              fontSize: '14px',
              zIndex: 10
            }
          }, 'SOLD OUT'));
        }
        
        const cardContentChildren = [
          h('h3', { key: 'card-title', style: { margin: '0 0 10px 0', fontSize: '1.5rem', color: '#333', fontWeight: 'bold' } }, title)
        ];
        if (description) {
          cardContentChildren.push(h('h4', { key: 'card-description', style: { margin: '0 0 10px 0', fontSize: '1.2rem', color: '#666' } }, String(description)));
        }
        if (shortDescription) {
          cardContentChildren.push(h('p', { key: 'card-short-desc', style: { margin: '0 0 10px 0', color: '#555' } }, String(shortDescription)));
        }
        if (ingredients) {
          cardContentChildren.push(h('p', { key: 'card-ingredients', style: { margin: '10px 0', color: '#666', fontSize: '0.9rem' } }, String(ingredients)));
        }
        if (price) {
          cardContentChildren.push(h('p', { key: 'card-price', style: { margin: '15px 0 10px 0', color: '#C6600D', fontSize: '1.3rem', fontWeight: 'bold' } }, '$' + String(price)));
        }
        
        const CardView = h('div', {
          key: 'card-view',
          style: {
            maxWidth: '400px',
            margin: '0 auto 30px',
            border: '1px solid #ddd',
            borderRadius: '15px',
            overflow: 'hidden',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            backgroundColor: 'white'
          }
        }, [
          h('div', {
            key: 'card-image-container',
            style: {
              position: 'relative',
              width: '100%',
              backgroundColor: '#f0f0f0',
              minHeight: '300px',
              borderRadius: '15px 15px 0 0',
              overflow: 'hidden'
            }
          }, cardImageContainerChildren),
          h('div', {
            key: 'card-content',
            style: {
              padding: '1.5rem',
              textAlign: 'center'
            }
          }, cardContentChildren)
        ]);
        
        // Page View
        const pageImageElement = pageImageUrl ? h('img', {
          key: 'page-image',
          src: pageImageUrl,
          alt: title,
          onError: handleImageError,
          style: {
            width: '100%',
            height: 'auto',
            display: 'block',
            borderRadius: '5px',
            border: '1px solid #C6600D',
            padding: '10px',
            backgroundColor: 'white'
          }
        }) : h('div', {
          key: 'page-image-placeholder',
          style: {
            width: '100%',
            height: '400px',
            background: '#f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#999',
            borderRadius: '5px'
          }
        }, 'No images');
        
        const pageContentChildren = [
          h('h2', { key: 'page-title', style: { fontSize: '2rem', margin: '0 0 15px 0', color: '#333', fontWeight: 500 } }, title)
        ];
        if (description) {
          pageContentChildren.push(h('h4', { key: 'page-description', style: { margin: '0 0 20px 0', fontSize: '1.3rem', color: '#666' } }, String(description)));
        }
        if (price) {
          pageContentChildren.push(h('div', { key: 'page-price-container', style: { margin: '20px 0' } }, h('span', { style: { fontSize: '1.8rem', color: '#C6600D', fontWeight: 600 } }, '$' + String(price))));
        }
        if (ingredients) {
          pageContentChildren.push(h('div', { 
            key: 'page-ingredients',
            style: { margin: '25px 0' } 
          }, [
            h('h5', { key: 'ingredients-title', style: { fontSize: '1.2rem', margin: '0 0 12px 0', color: '#333', fontWeight: 600 } }, 'Ingredients'),
            h('div', { key: 'ingredients-content', style: { color: '#666', lineHeight: 1.8, fontSize: '1rem' } }, String(ingredients))
          ]));
        }
        
        const PageView = h('div', {
          key: 'page-view',
          style: {
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '30px 20px',
            fontFamily: "system-ui, -apple-system, sans-serif"
          }
        }, h('div', {
          key: 'page-content-wrapper',
          style: {
            display: 'flex',
            flexWrap: 'wrap',
            gap: '30px',
            alignItems: 'flex-start'
          }
        }, [
          h('div', {
            key: 'page-image-wrapper',
            style: { flex: '1 1 300px', minWidth: '300px', maxWidth: '500px' }
          }, pageImageElement),
          h('div', {
            key: 'page-text-wrapper',
            style: { flex: '1 1 300px', minWidth: '300px', paddingLeft: '20px' }
          }, pageContentChildren)
        ]));
        
        // Combined preview
        return h('div', {
          key: 'preview-container',
          style: {
            padding: '20px',
            background: '#f9f9f9',
            minHeight: '100vh',
            fontFamily: "system-ui, -apple-system, sans-serif"
          }
        }, [
          h('div', {
            key: 'card-preview-section',
            style: {
              background: 'white',
              padding: '25px',
              marginBottom: '30px',
              borderRadius: '10px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }
          }, [
            h('h3', {
              key: 'card-section-title',
              style: {
                margin: '0 0 25px 0',
                color: '#333',
                borderBottom: '3px solid #C6600D',
                paddingBottom: '12px',
                fontSize: '1.3rem',
                fontWeight: 600
              }
            }, '📱 Card View (as shown on homepage)'),
            CardView
          ]),
          h('div', {
            key: 'page-preview-section',
            style: {
              background: 'white',
              padding: '25px',
              borderRadius: '10px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }
          }, [
            h('h3', {
              key: 'page-section-title',
              style: {
                margin: '0 0 25px 0',
                color: '#333',
                borderBottom: '3px solid #C6600D',
                paddingBottom: '12px',
                fontSize: '1.3rem',
                fontWeight: 600
              }
            }, '🖥️ Full Pie Page View'),
            PageView
          ])
        ]);
      } catch (error) {
        console.error('Error rendering PiePreviewTemplate:', error);
        console.error('Error stack:', error.stack);
        // Return error message as React element with keys
        return h('div', { 
          key: 'error-container',
          style: { padding: '20px', color: 'red', backgroundColor: '#ffe6e6' } 
        }, [
          h('h3', { key: 'error-title', style: { margin: '0 0 10px 0' } }, 'Preview Error'),
          h('p', { key: 'error-message', style: { margin: '0' } }, error.message || String(error))
        ]);
      }
    }
    
    // Register templates
    try {
      CMS.registerPreviewTemplate('fruit_pies', PiePreviewTemplate);
      CMS.registerPreviewTemplate('cream_pies', PiePreviewTemplate);
      CMS.registerPreviewTemplate('special_pies', PiePreviewTemplate);
      CMS.registerPreviewTemplate('dinner_pies', PiePreviewTemplate);
      CMS.registerPreviewTemplate('hand_pies', PiePreviewTemplate);
      console.log('✅ Preview templates registered successfully!');
    } catch (e) {
      console.error('❌ Error registering preview templates:', e);
    }
  }
  
  // Start registration
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(registerPreviewTemplates, 1000);
    });
  } else {
    setTimeout(registerPreviewTemplates, 1000);
  }
})();
