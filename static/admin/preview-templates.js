// Preview templates for Decap CMS (Netlify CMS) v3
// These templates show both the card view (as on index page) and the full pie page

// Register preview templates when CMS is ready
(function() {
  'use strict';
  
  function registerPreviewTemplates() {
    // Check if CMS is available
    if (typeof window === 'undefined' || !window.CMS) {
      console.log('CMS not ready, retrying...');
      setTimeout(registerPreviewTemplates, 200);
      return;
    }
    
    const CMS = window.CMS;
    
    // Check if registerPreviewTemplate is available
    if (typeof CMS.registerPreviewTemplate !== 'function') {
      console.log('registerPreviewTemplate not available yet, retrying...');
      setTimeout(registerPreviewTemplates, 200);
      return;
    }
    
    console.log('Registering preview templates...');
    
    // Helper functions that will be used by preview components
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
    
    function getImageUrl(imagePath) {
      if (!imagePath) return '';
      imagePath = imagePath.trim();
      
      // If it's already a full URL, return it
      if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
      }
      
      // Remove /admin/ prefix if present
      if (imagePath.startsWith('/admin/')) {
        imagePath = imagePath.replace('/admin/', '/');
      }
      
      // Ensure it starts with /
      if (!imagePath.startsWith('/')) {
        imagePath = '/' + imagePath;
      }
      
      return imagePath;
    }
    
    // Get React - it should be available globally after we included it
    const React = window.React;
    
    if (!React || !React.createElement) {
      console.error('React not available! Make sure React is loaded before this script.');
      return;
    }
    
    const h = React.createElement;
    
    // Create preview template function
    function createPiePreviewTemplate() {
      // This function will be called by CMS with entry, widgetFor, etc.
      return function PiePreviewTemplate({ entry, widgetFor, getAsset }) {
        
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
        const smallSoldOutComment = getField(entry, 'small_sold_out_comment');
        const bigSoldOutComment = getField(entry, 'big_sold_out_comment');
        
        const firstImage = images.length > 0 ? images[0] : null;
        const imageUrl = firstImage ? getImageUrl(firstImage.image) : '';
        const isDinnerPie = type === 'dinner';
        const showSoldOutSticker = isDinnerPie ? (smallSoldOut && bigSoldOut) : soldOut;
        
        // Card View Component
        const CardView = h('div', {
          style: {
            maxWidth: '400px',
            margin: '20px auto',
            border: '1px solid #ddd',
            borderRadius: '15px',
            overflow: 'hidden',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }
        }, [
          h('div', {
            style: {
              position: 'relative',
              width: '100%',
              overflow: 'hidden',
              borderRadius: '15px 15px 0 0'
            }
          }, [
            imageUrl ? h('img', {
              key: 'img',
              src: imageUrl,
              alt: title,
              style: {
                width: '100%',
                height: 'auto',
                display: 'block',
                aspectRatio: '1/1',
                objectFit: 'cover'
              },
              onError: (e) => {
                console.error('Image failed to load:', imageUrl);
                e.target.style.display = 'none';
              }
            }) : h('div', {
              key: 'no-img',
              style: {
                width: '100%',
                aspectRatio: '1/1',
                background: '#f0f0f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#999'
              }
            }, 'No image'),
            showSoldOutSticker ? h('div', {
              key: 'sticker',
              style: {
                position: 'absolute',
                top: '10px',
                left: '10px',
                zIndex: 5,
                background: '#ff0000',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '5px',
                fontWeight: 'bold',
                fontSize: '14px'
              }
            }, 'SOLD OUT') : null
          ]),
          h('div', {
            style: {
              padding: '1.5rem',
              textAlign: 'center'
            }
          }, [
            h('h3', { style: { margin: '0 0 10px 0', fontSize: '1.5rem', color: '#333' } }, title),
            description ? h('h4', { style: { margin: '0 0 10px 0', fontSize: '1.2rem', color: '#666' } }, description) : null,
            shortDescription ? h('p', { style: { margin: '0 0 10px 0', color: '#555' } }, shortDescription) : null,
            ingredients ? h('p', { style: { margin: '10px 0', color: '#666', fontSize: '0.9rem' } }, ingredients) : null,
            price ? h('p', { style: { margin: '10px 0', color: '#C6600D', fontSize: '1.2rem', fontWeight: 'bold' } }, '$' + price) : null
          ])
        ]);
        
        // Full Page View Component
        const PageView = h('div', {
          style: {
            maxWidth: '1200px',
            margin: '20px auto',
            padding: '20px',
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          }
        }, h('div', {
          style: { display: 'flex', flexWrap: 'wrap', gap: '30px' }
        }, [
          h('div', { style: { flex: 1, minWidth: '300px' } }, [
            images.length > 0 ? h('img', {
              src: getImageUrl(images[0].image),
              alt: title,
              style: { width: '100%', height: 'auto', display: 'block', borderRadius: '5px' }
            }) : h('div', {
              style: {
                width: '100%',
                aspectRatio: '1/1',
                background: '#f0f0f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#999',
                borderRadius: '5px'
              }
            }, 'No images')
          ]),
          h('div', { style: { flex: 1, minWidth: '300px' } }, [
            h('h2', { style: { fontSize: '2rem', margin: '0 0 15px 0', color: '#333' } }, title),
            description ? h('h4', { style: { margin: '0 0 20px 0', fontSize: '1.3rem', color: '#666' } }, description) : null,
            price ? h('div', { style: { margin: '20px 0' } }, 
              h('span', { style: { fontSize: '1.5rem', color: '#C6600D', fontWeight: 500 } }, '$' + price)
            ) : null,
            ingredients ? h('div', { style: { margin: '20px 0' } }, [
              h('h5', { style: { fontSize: '1.1rem', margin: '0 0 10px 0', color: '#333' } }, 'Ingredients'),
              h('div', { style: { color: '#666', lineHeight: 1.6 } }, ingredients)
            ]) : null
          ])
        ]));
        
        // Combined preview
        return h('div', {
          style: { padding: '20px', background: '#f9f9f9', minHeight: '100vh' }
        }, [
          h('div', {
            style: {
              background: 'white',
              padding: '20px',
              marginBottom: '30px',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }
          }, [
            h('h3', {
              style: {
                margin: '0 0 20px 0',
                color: '#333',
                borderBottom: '2px solid #C6600D',
                paddingBottom: '10px',
                fontSize: '1.2rem'
              }
            }, 'Card View (as shown on homepage)'),
            CardView
          ]),
          h('div', {
            style: {
              background: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }
          }, [
            h('h3', {
              style: {
                margin: '0 0 20px 0',
                color: '#333',
                borderBottom: '2px solid #C6600D',
                paddingBottom: '10px',
                fontSize: '1.2rem'
              }
            }, 'Full Pie Page View'),
            PageView
          ])
        ]);
      };
    }
    
    // Register templates for all collections
    try {
      const PreviewTemplate = createPiePreviewTemplate();
      
      CMS.registerPreviewTemplate('fruit_pies', PreviewTemplate);
      CMS.registerPreviewTemplate('cream_pies', PreviewTemplate);
      CMS.registerPreviewTemplate('special_pies', PreviewTemplate);
      CMS.registerPreviewTemplate('dinner_pies', PreviewTemplate);
      CMS.registerPreviewTemplate('hand_pies', PreviewTemplate);
      
      console.log('✅ Preview templates registered successfully!');
    } catch (e) {
      console.error('❌ Error registering preview templates:', e);
    }
  }
  
  // Start registration when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', registerPreviewTemplates);
  } else {
    registerPreviewTemplates();
  }
})();
