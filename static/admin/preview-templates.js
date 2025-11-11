// Preview templates for Decap CMS (Netlify CMS) v3
// Decap CMS provides React to preview components when they render

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
    
    // Preview template component
    // In Decap CMS v3, React is provided when the component renders
    // We need to access it at render time, not at registration time
    const PiePreviewTemplate = function(props) {
      const { entry, widgetFor, getAsset } = props || {};
      
      if (!entry) {
        return null;
      }
      
      // Get React - we've loaded React 18 explicitly to match Decap CMS v3
      // React should be available as window.React
      const React = window.React;
      
      // Verify React is available
      if (!React || !React.createElement) {
        console.error('React not available! Make sure React is loaded before Decap CMS.');
        return null;
      }
      
      const h = React.createElement;
      
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
      
      // Get image URL - use absolute URL to the actual site
      function getImageUrl(imagePath) {
        if (!imagePath) return '';
        imagePath = String(imagePath).trim();
        
        // Try getAsset first
        if (getAsset && typeof getAsset === 'function') {
          try {
            const asset = getAsset(imagePath);
            if (asset) {
              const url = String(asset);
              if (url && (url.startsWith('http') || url.startsWith('/'))) {
                // If getAsset returns a relative path, make it absolute
                if (url.startsWith('/') && !url.startsWith('//')) {
                  return 'https://pieinthesky-eden.com' + url;
                }
                return url;
              }
            }
          } catch (e) {
            // Fall through
          }
        }
        
        // Remove /admin/ prefix if present
        if (imagePath.startsWith('/admin/')) {
          imagePath = imagePath.replace('/admin/', '/');
        }
        
        // If already full URL, return as is
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('//')) {
          return imagePath;
        }
        
        // Ensure absolute path
        if (!imagePath.startsWith('/')) {
          imagePath = '/' + imagePath;
        }
        
        // Use site's base URL
        return 'https://pieinthesky-eden.com' + imagePath;
      }
      
      const firstImage = images.length > 0 ? images[0] : null;
      const mainImageUrl = firstImage && firstImage.image ? getImageUrl(firstImage.image) : '';
      const isDinnerPie = type === 'dinner';
      const showSoldOutSticker = isDinnerPie ? (smallSoldOut && bigSoldOut) : soldOut;
      
      // Card View
      const cardElements = [];
      
      // Image container
      const imageElements = [];
      if (mainImageUrl) {
        imageElements.push(h('img', {
          key: 'img',
          src: mainImageUrl,
          alt: title,
          style: {
            width: '100%',
            height: 'auto',
            display: 'block',
            objectFit: 'cover'
          }
        }));
      } else {
        imageElements.push(h('div', {
          key: 'no-img',
          style: {
            width: '100%',
            height: '300px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#999',
            backgroundColor: '#f0f0f0'
          }
        }, 'No image'));
      }
      
      if (showSoldOutSticker) {
        imageElements.push(h('div', {
          key: 'sticker',
          style: {
            position: 'absolute',
            top: '10px',
            left: '10px',
            background: '#ff0000',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '5px',
            fontWeight: 'bold',
            fontSize: '14px'
          }
        }, 'SOLD OUT'));
      }
      
      cardElements.push(h('div', {
        key: 'card-image',
        style: {
          position: 'relative',
          width: '100%',
          backgroundColor: '#f0f0f0',
          minHeight: '300px',
          borderRadius: '15px 15px 0 0',
          overflow: 'hidden'
        }
      }, imageElements));
      
      // Card body
      const bodyElements = [];
      bodyElements.push(h('h3', {
        key: 'title',
        style: { margin: '0 0 10px 0', fontSize: '1.5rem', color: '#333' }
      }, title));
      
      if (description) {
        bodyElements.push(h('h4', {
          key: 'desc',
          style: { margin: '0 0 10px 0', fontSize: '1.2rem', color: '#666' }
        }, String(description)));
      }
      
      if (shortDescription) {
        bodyElements.push(h('p', {
          key: 'short',
          style: { margin: '0 0 10px 0', color: '#555' }
        }, String(shortDescription)));
      }
      
      if (ingredients) {
        bodyElements.push(h('p', {
          key: 'ing',
          style: { margin: '10px 0', color: '#666', fontSize: '0.9rem' }
        }, String(ingredients)));
      }
      
      if (price) {
        bodyElements.push(h('p', {
          key: 'price',
          style: { margin: '10px 0', color: '#C6600D', fontSize: '1.2rem', fontWeight: 'bold' }
        }, '$' + String(price)));
      }
      
      cardElements.push(h('div', {
        key: 'card-body',
        style: {
          padding: '1.5rem',
          textAlign: 'center'
        }
      }, bodyElements));
      
      const CardView = h('div', {
        style: {
          maxWidth: '400px',
          margin: '20px auto',
          border: '1px solid #ddd',
          borderRadius: '15px',
          overflow: 'hidden',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }
      }, cardElements);
      
      // Page View
      const pageImageUrl = images.length > 0 && images[0].image ? getImageUrl(images[0].image) : '';
      
      const pageElements = [];
      
      // Page image
      pageElements.push(h('div', {
        key: 'page-img',
        style: { flex: '1 1 300px', minWidth: '300px' }
      }, pageImageUrl ? h('img', {
        src: pageImageUrl,
        alt: title,
        style: {
          width: '100%',
          height: 'auto',
          display: 'block',
          borderRadius: '5px',
          border: '1px solid #C6600D',
          padding: '10px'
        }
      }) : h('div', {
        style: {
          width: '100%',
          height: '300px',
          background: '#f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#999',
          borderRadius: '5px'
        }
      }, 'No images')));
      
      // Page content
      const pageContentElements = [];
      pageContentElements.push(h('h2', {
        key: 'pt',
        style: { fontSize: '2rem', margin: '0 0 15px 0', color: '#333', fontWeight: 500 }
      }, title));
      
      if (description) {
        pageContentElements.push(h('h4', {
          key: 'pd',
          style: { margin: '0 0 20px 0', fontSize: '1.3rem', color: '#666' }
        }, String(description)));
      }
      
      if (price) {
        pageContentElements.push(h('div', {
          key: 'pp',
          style: { margin: '20px 0' }
        }, h('span', {
          style: { fontSize: '1.5rem', color: '#C6600D', fontWeight: 500 }
        }, '$' + String(price))));
      }
      
      if (ingredients) {
        pageContentElements.push(h('div', {
          key: 'pi',
          style: { margin: '20px 0' }
        }, [
          h('h5', {
            key: 'pit',
            style: { fontSize: '1.1rem', margin: '0 0 10px 0', color: '#333' }
          }, 'Ingredients'),
          h('div', {
            key: 'pic',
            style: { color: '#666', lineHeight: 1.6 }
          }, String(ingredients))
        ]));
      }
      
      pageElements.push(h('div', {
        key: 'page-info',
        style: { flex: '1 1 300px', minWidth: '300px' }
      }, pageContentElements));
      
      const PageView = h('div', {
        style: {
          maxWidth: '1200px',
          margin: '20px auto',
          padding: '20px',
          fontFamily: "system-ui, -apple-system, sans-serif"
        }
      }, h('div', {
        style: { display: 'flex', flexWrap: 'wrap', gap: '30px' }
      }, pageElements));
      
      // Return combined preview
      return h('div', {
        style: {
          padding: '20px',
          background: '#f9f9f9',
          minHeight: '100vh',
          fontFamily: "system-ui, -apple-system, sans-serif"
        }
      }, [
        h('div', {
          key: 'card-section',
          style: {
            background: 'white',
            padding: '20px',
            marginBottom: '30px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }
        }, [
          h('h3', {
            key: 'ch',
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
          key: 'page-section',
          style: {
            background: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }
        }, [
          h('h3', {
            key: 'ph',
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
      console.error('Error stack:', e.stack);
    }
  }
  
  // Start registration
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', registerPreviewTemplates);
  } else {
    setTimeout(registerPreviewTemplates, 1000);
  }
})();
