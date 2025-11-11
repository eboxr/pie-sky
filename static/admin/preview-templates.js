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
    
    // Helper functions - convert Immutable.js values to plain JavaScript
    function getField(entry, path, defaultValue = '') {
      try {
        const value = entry.getIn(['data', ...path.split('.')]);
        if (value === undefined || value === null) {
          return defaultValue;
        }
        // Convert Immutable.js values to plain JavaScript
        if (value && typeof value.toJS === 'function') {
          return value.toJS();
        }
        if (value && typeof value.toString === 'function' && value.constructor && value.constructor.name === 'Map') {
          // It's an Immutable Map, convert it
          return value.toJS ? value.toJS() : value;
        }
        // Return plain value (string, number, boolean)
        return value;
      } catch (e) {
        console.warn('getField error for path:', path, e);
        return defaultValue;
      }
    }
    
    function getImages(entry) {
      try {
        const images = entry.getIn(['data', 'images']);
        if (!images) {
          return [];
        }
        // Convert Immutable.js List/Array to plain JavaScript array
        if (images && typeof images.toJS === 'function') {
          const jsImages = images.toJS();
          return Array.isArray(jsImages) ? jsImages : [];
        }
        if (Array.isArray(images)) {
          // Already an array, but might contain Immutable objects
          return images.map(function(img) {
            if (img && typeof img.toJS === 'function') {
              return img.toJS();
            }
            if (img && img.image && typeof img.image === 'object' && img.image.toString) {
              // Image might be an Immutable object
              return {
                image: String(img.image)
              };
            }
            return img;
          });
        }
        return [];
      } catch (e) {
        console.warn('getImages error:', e);
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
        console.log('PiePreviewTemplate called with props:', Object.keys(props || {}));
        const { entry, widgetFor, getAsset } = props || {};
        
        // Always return a valid React element - never return null
        if (!entry) {
          console.warn('PiePreviewTemplate: no entry');
          return h('div', { 
            key: 'no-entry',
            style: { padding: '20px', color: '#666', background: '#fff' } 
          }, 'No entry data available');
        }
        
        // Get data with safe defaults - convert all to plain JS values
        let title, description, shortDescription, price, soldOut, images, ingredients, type, smallSoldOut, bigSoldOut;
        try {
          // Get raw values and convert to plain JS
          const rawTitle = getField(entry, 'title', 'Untitled Pie');
          const rawDescription = getField(entry, 'description');
          const rawShortDescription = getField(entry, 'shortDescription');
          const rawPrice = getField(entry, 'price');
          const rawSoldOut = getField(entry, 'sold_out', false);
          const rawImages = getImages(entry);
          const rawIngredients = getField(entry, 'ingredients');
          const rawType = getField(entry, 'type');
          const rawSmallSoldOut = getField(entry, 'small_sold_out', false);
          const rawBigSoldOut = getField(entry, 'big_sold_out', false);
          
          // Convert to plain JavaScript primitives (strings, numbers, booleans)
          title = rawTitle != null ? String(rawTitle) : 'Untitled Pie';
          description = rawDescription != null ? String(rawDescription) : '';
          shortDescription = rawShortDescription != null ? String(rawShortDescription) : '';
          price = rawPrice != null ? String(rawPrice) : '';
          soldOut = Boolean(rawSoldOut);
          images = Array.isArray(rawImages) ? rawImages : [];
          ingredients = rawIngredients != null ? String(rawIngredients) : '';
          type = rawType != null ? String(rawType) : '';
          smallSoldOut = Boolean(rawSmallSoldOut);
          bigSoldOut = Boolean(rawBigSoldOut);
          
          // Ensure image objects have plain string paths
          images = images.map(function(img, idx) {
            if (!img || typeof img !== 'object') {
              return null;
            }
            // Extract image path and convert to string
            let imgPath = img.image;
            if (imgPath && typeof imgPath !== 'string') {
              if (typeof imgPath.toString === 'function') {
                imgPath = imgPath.toString();
              } else {
                imgPath = String(imgPath);
              }
            }
            return {
              image: imgPath || ''
            };
          }).filter(function(img) { return img && img.image; });
          
        } catch (dataError) {
          console.error('Error getting entry data:', dataError);
          return h('div', {
            key: 'data-error',
            style: { padding: '20px', color: 'red', background: '#fff' }
          }, 'Error loading entry data: ' + String(dataError));
        }
        
        console.log('PiePreviewTemplate data:', { 
          title, 
          description: description ? description.substring(0, 50) : null,
          imagesCount: images ? images.length : 0,
          hasGetAsset: typeof getAsset === 'function',
          imagePaths: images && images.length > 0 ? images.map(function(img) { return img && img.image ? img.image : null; }).filter(Boolean) : []
        });
        
        // Ensure images is an array
        if (!Array.isArray(images)) {
          images = [];
        }
        
        // Get image URL - use getAsset if available, but convert to absolute URL
        // getAsset resolves relative to public_folder, but we need absolute URL
        function getImageUrl(imgPath) {
          if (!imgPath) {
            return '';
          }
          
          // Ensure it's a string
          let path = String(imgPath).trim();
          if (!path) {
            return '';
          }
          
          console.log('getImageUrl: input path:', path);
          
          // If already absolute URL, clean any /admin/ and return
          if (path.startsWith('http://') || path.startsWith('https://')) {
            const cleaned = path.replace(/\/admin\//g, '/').replace(/(https?:\/)\/+/g, '$1/').replace(/^http:\/\//, 'https://');
            console.log('getImageUrl: cleaned absolute URL:', cleaned);
            return cleaned;
          }
          
          // Try getAsset first - it knows about public_folder
          // But getAsset might return a relative path, so we'll convert it to absolute
          if (getAsset && typeof getAsset === 'function') {
            try {
              const asset = getAsset(path);
              if (asset) {
                // getAsset might return a File object, URL string, or path
                let assetUrl = asset;
                if (typeof asset.toString === 'function') {
                  assetUrl = asset.toString();
                } else if (typeof asset === 'string') {
                  assetUrl = asset;
                } else if (asset.url) {
                  assetUrl = asset.url;
                } else if (asset.toString) {
                  assetUrl = String(asset);
                }
                
                assetUrl = String(assetUrl).trim();
                console.log('getImageUrl: getAsset returned:', assetUrl);
                
                // If getAsset returns absolute URL, clean and use it
                if (assetUrl.startsWith('http://') || assetUrl.startsWith('https://')) {
                  const cleaned = assetUrl.replace(/\/admin\//g, '/').replace(/(https?:\/)\/+/g, '$1/');
                  console.log('getImageUrl: using getAsset absolute URL:', cleaned);
                  return cleaned;
                }
                
                // If getAsset returns relative path, remove /admin/ if present and make absolute
                if (assetUrl.startsWith('/')) {
                  // Remove /admin/ if present
                  assetUrl = assetUrl.replace(/^\/admin\//, '/');
                  // Construct absolute URL
                  const absoluteUrl = 'https://pieinthesky-eden.com' + assetUrl;
                  console.log('getImageUrl: converted getAsset path to absolute:', absoluteUrl);
                  return absoluteUrl;
                }
              }
            } catch (e) {
              console.warn('getImageUrl: getAsset error, using manual construction:', e);
            }
          }
          
          // Manual construction - public_folder is "/images"
          // Content files store paths like "images/special-pies/file.jpg"
          // Remove any /admin/ references
          path = path.replace(/^\/admin\//, '').replace(/\/admin\//g, '/').replace(/^\/+/, '');
          
          // Ensure path starts with "images/" (public_folder)
          if (!path.startsWith('images/')) {
            path = 'images/' + path;
          }
          
          // Construct absolute URL
          const absolutePath = '/' + path.replace(/\/+/g, '/');
          const finalUrl = 'https://pieinthesky-eden.com' + absolutePath;
          
          console.log('getImageUrl: final manual URL:', finalUrl);
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
        
        // Combined preview - Card view on top, Page view on bottom
        console.log('Rendering preview with card and page views');
        console.log('CardView type:', typeof CardView);
        console.log('PageView type:', typeof PageView);
        console.log('mainImageUrl:', mainImageUrl);
        
        // Build the preview container with two sections
        try {
          const previewContainer = h('div', {
            key: 'preview-container',
            style: {
              padding: '20px',
              background: '#f9f9f9',
              minHeight: '100vh',
              fontFamily: "system-ui, -apple-system, sans-serif"
            }
          }, [
            // Card View Section (TOP)
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
                  fontWeight: '600'
                }
              }, 'Card View (as shown on homepage)'),
              CardView
            ]),
            // Page View Section (BOTTOM)
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
                  fontWeight: '600'
                }
              }, 'Full Pie Page View'),
              PageView
            ])
          ]);
          
          console.log('Preview container created successfully');
          return previewContainer;
        } catch (renderError) {
          console.error('Error creating preview container:', renderError);
          return h('div', {
            key: 'render-error',
            style: { padding: '20px', color: 'red', background: '#fff' }
          }, 'Error rendering preview: ' + String(renderError));
        }
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
