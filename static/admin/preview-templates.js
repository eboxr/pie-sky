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
        
        console.log('PiePreviewTemplate data:', { title, imagesCount: images.length });
        
        // Get image URL - use absolute URL
        function getImageUrl(imgPath) {
          if (!imgPath) return '';
          imgPath = String(imgPath).trim();
          
          // Remove /admin/ if present
          imgPath = imgPath.replace(/\/admin\//g, '/');
          
          // If full URL, return cleaned
          if (imgPath.startsWith('http://') || imgPath.startsWith('https://')) {
            return imgPath.replace(/\/admin\//g, '/');
          }
          
          // Make absolute path
          if (!imgPath.startsWith('/')) {
            imgPath = '/' + imgPath;
          }
          
          // Return full URL to site
          return 'https://pieinthesky-eden.com' + imgPath;
        }
        
        const firstImage = images.length > 0 ? images[0] : null;
        const mainImageUrl = firstImage && firstImage.image ? getImageUrl(firstImage.image) : '';
        const pageImageUrl = images.length > 0 && images[0].image ? getImageUrl(images[0].image) : '';
        const isDinnerPie = type === 'dinner';
        const showSoldOutSticker = isDinnerPie ? (smallSoldOut && bigSoldOut) : soldOut;
        
        // Card View
        const CardView = h('div', {
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
            style: {
              position: 'relative',
              width: '100%',
              backgroundColor: '#f0f0f0',
              minHeight: '300px',
              borderRadius: '15px 15px 0 0',
              overflow: 'hidden'
            }
          }, [
            mainImageUrl ? h('img', {
              src: mainImageUrl,
              alt: title,
              style: {
                width: '100%',
                height: 'auto',
                display: 'block',
                aspectRatio: '1/1',
                objectFit: 'cover'
              }
            }) : h('div', {
              style: {
                width: '100%',
                height: '300px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#999'
              }
            }, 'No image'),
            showSoldOutSticker ? h('div', {
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
            }, 'SOLD OUT') : null
          ]),
          h('div', {
            style: {
              padding: '1.5rem',
              textAlign: 'center'
            }
          }, [
            h('h3', { style: { margin: '0 0 10px 0', fontSize: '1.5rem', color: '#333', fontWeight: 'bold' } }, title),
            description ? h('h4', { style: { margin: '0 0 10px 0', fontSize: '1.2rem', color: '#666' } }, String(description)) : null,
            shortDescription ? h('p', { style: { margin: '0 0 10px 0', color: '#555' } }, String(shortDescription)) : null,
            ingredients ? h('p', { style: { margin: '10px 0', color: '#666', fontSize: '0.9rem' } }, String(ingredients)) : null,
            price ? h('p', { style: { margin: '15px 0 10px 0', color: '#C6600D', fontSize: '1.3rem', fontWeight: 'bold' } }, '$' + String(price)) : null
          ])
        ]);
        
        // Page View
        const PageView = h('div', {
          style: {
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '30px 20px',
            fontFamily: "system-ui, -apple-system, sans-serif"
          }
        }, h('div', {
          style: {
            display: 'flex',
            flexWrap: 'wrap',
            gap: '30px',
            alignItems: 'flex-start'
          }
        }, [
          h('div', {
            style: { flex: '1 1 300px', minWidth: '300px', maxWidth: '500px' }
          }, pageImageUrl ? h('img', {
            src: pageImageUrl,
            alt: title,
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
          }, 'No images')),
          h('div', {
            style: { flex: '1 1 300px', minWidth: '300px', paddingLeft: '20px' }
          }, [
            h('h2', { style: { fontSize: '2rem', margin: '0 0 15px 0', color: '#333', fontWeight: 500 } }, title),
            description ? h('h4', { style: { margin: '0 0 20px 0', fontSize: '1.3rem', color: '#666' } }, String(description)) : null,
            price ? h('div', { style: { margin: '20px 0' } }, h('span', { style: { fontSize: '1.8rem', color: '#C6600D', fontWeight: 600 } }, '$' + String(price))) : null,
            ingredients ? h('div', { style: { margin: '25px 0' } }, [
              h('h5', { style: { fontSize: '1.2rem', margin: '0 0 12px 0', color: '#333', fontWeight: 600 } }, 'Ingredients'),
              h('div', { style: { color: '#666', lineHeight: 1.8, fontSize: '1rem' } }, String(ingredients))
            ]) : null
          ])
        ]));
        
        // Combined preview
        return h('div', {
          style: {
            padding: '20px',
            background: '#f9f9f9',
            minHeight: '100vh',
            fontFamily: "system-ui, -apple-system, sans-serif"
          }
        }, [
          h('div', {
            style: {
              background: 'white',
              padding: '25px',
              marginBottom: '30px',
              borderRadius: '10px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }
          }, [
            h('h3', {
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
            style: {
              background: 'white',
              padding: '25px',
              borderRadius: '10px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }
          }, [
            h('h3', {
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
        // Return error message as React element
        return h('div', { 
          style: { padding: '20px', color: 'red', backgroundColor: '#ffe6e6' } 
        }, [
          h('h3', { style: { margin: '0 0 10px 0' } }, 'Preview Error'),
          h('p', { style: { margin: '0' } }, error.message || String(error))
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
