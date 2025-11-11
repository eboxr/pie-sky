// Preview templates for Decap CMS (Netlify CMS) v3
// Use CMS.createClass and CMS.h as per Decap CMS v3 documentation

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
    
    // Check if CMS.createClass and CMS.h are available
    if (!CMS.createClass || !CMS.h) {
      console.error('CMS.createClass or CMS.h not available');
      console.log('Available CMS methods:', Object.keys(CMS));
      setTimeout(registerPreviewTemplates, 200);
      return;
    }
    
    console.log('Registering preview templates with CMS.createClass...');
    
    const h = CMS.h; // Alias for React.createElement
    const createClass = CMS.createClass;
    
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
    
    // Get image URL - construct absolute URL, handle getAsset properly
    function getImageUrl(imagePath, getAsset) {
      if (!imagePath) return '';
      imagePath = String(imagePath).trim();
      
      // Try getAsset first (CMS provides this)
      if (getAsset && typeof getAsset === 'function') {
        try {
          const asset = getAsset(imagePath);
          if (asset) {
            let url = asset;
            // getAsset might return a string, promise, or object
            if (typeof asset === 'string') {
              url = asset;
            } else if (asset.toString) {
              url = asset.toString();
            } else {
              url = String(asset);
            }
            
            // Remove /admin/ prefix if present (getAsset might add it)
            if (url && typeof url === 'string') {
              url = url.replace(/\/admin\//g, '/');
              
              // If it's a relative path, make it absolute
              if (url.startsWith('/') && !url.startsWith('http')) {
                return 'https://pieinthesky-eden.com' + url;
              }
              
              // If it's already a full URL, return it
              if (url.startsWith('http://') || url.startsWith('https://')) {
                return url;
              }
            }
          }
        } catch (e) {
          console.warn('getAsset failed, using manual path:', e);
        }
      }
      
      // Manual path construction
      // Remove /admin/ if present
      if (imagePath.startsWith('/admin/')) {
        imagePath = imagePath.replace('/admin/', '/');
      }
      
      // If already full URL, clean it and return
      if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath.replace(/\/admin\//g, '/');
      }
      
      // Ensure absolute path from site root
      if (!imagePath.startsWith('/')) {
        imagePath = '/' + imagePath;
      }
      
      // Construct absolute URL to the actual site
      return 'https://pieinthesky-eden.com' + imagePath;
    }
    
    // Create preview template using CMS.createClass
    const PiePreviewTemplate = createClass({
      render: function() {
        const { entry, widgetFor, getAsset } = this.props;
        
        if (!entry) {
          return h('div', null, 'No entry data');
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
        
        const firstImage = images.length > 0 ? images[0] : null;
        const mainImageUrl = firstImage && firstImage.image ? getImageUrl(firstImage.image, getAsset) : '';
        const isDinnerPie = type === 'dinner';
        const showSoldOutSticker = isDinnerPie ? (smallSoldOut && bigSoldOut) : soldOut;
        
        // Card View
        const cardImageElements = [];
        if (mainImageUrl) {
          cardImageElements.push(h('img', {
            key: 'card-img',
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
          cardImageElements.push(h('div', {
            key: 'card-no-img',
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
          cardImageElements.push(h('div', {
            key: 'card-sticker',
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
        
        const cardBodyElements = [
          h('h3', {
            key: 'card-title',
            style: { margin: '0 0 10px 0', fontSize: '1.5rem', color: '#333' }
          }, title)
        ];
        
        if (description) {
          cardBodyElements.push(h('h4', {
            key: 'card-desc',
            style: { margin: '0 0 10px 0', fontSize: '1.2rem', color: '#666' }
          }, String(description)));
        }
        
        if (shortDescription) {
          cardBodyElements.push(h('p', {
            key: 'card-short',
            style: { margin: '0 0 10px 0', color: '#555' }
          }, String(shortDescription)));
        }
        
        if (ingredients) {
          cardBodyElements.push(h('p', {
            key: 'card-ing',
            style: { margin: '10px 0', color: '#666', fontSize: '0.9rem' }
          }, String(ingredients)));
        }
        
        if (price) {
          cardBodyElements.push(h('p', {
            key: 'card-price',
            style: { margin: '10px 0', color: '#C6600D', fontSize: '1.2rem', fontWeight: 'bold' }
          }, '$' + String(price)));
        }
        
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
            key: 'card-image-wrapper',
            style: {
              position: 'relative',
              width: '100%',
              backgroundColor: '#f0f0f0',
              minHeight: '300px',
              borderRadius: '15px 15px 0 0',
              overflow: 'hidden'
            }
          }, cardImageElements),
          h('div', {
            key: 'card-body',
            style: {
              padding: '1.5rem',
              textAlign: 'center'
            }
          }, cardBodyElements)
        ]);
        
        // Page View
        const pageImageUrl = images.length > 0 && images[0].image ? getImageUrl(images[0].image, getAsset) : '';
        
        const pageViewElements = [
          h('div', {
            key: 'page-image',
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
          }, 'No images')),
          h('div', {
            key: 'page-content',
            style: { flex: '1 1 300px', minWidth: '300px' }
          }, [
            h('h2', {
              key: 'page-title',
              style: { fontSize: '2rem', margin: '0 0 15px 0', color: '#333', fontWeight: 500 }
            }, title),
            description ? h('h4', {
              key: 'page-desc',
              style: { margin: '0 0 20px 0', fontSize: '1.3rem', color: '#666' }
            }, String(description)) : null,
            price ? h('div', {
              key: 'page-price-wrapper',
              style: { margin: '20px 0' }
            }, h('span', {
              key: 'page-price',
              style: { fontSize: '1.5rem', color: '#C6600D', fontWeight: 500 }
            }, '$' + String(price))) : null,
            ingredients ? h('div', {
              key: 'page-ingredients-wrapper',
              style: { margin: '20px 0' }
            }, [
              h('h5', {
                key: 'page-ingredients-title',
                style: { fontSize: '1.1rem', margin: '0 0 10px 0', color: '#333' }
              }, 'Ingredients'),
              h('div', {
                key: 'page-ingredients-content',
                style: { color: '#666', lineHeight: 1.6 }
              }, String(ingredients))
            ]) : null
          ])
        ];
        
        const PageView = h('div', {
          style: {
            maxWidth: '1200px',
            margin: '20px auto',
            padding: '20px',
            fontFamily: "system-ui, -apple-system, sans-serif"
          }
        }, h('div', {
          style: { display: 'flex', flexWrap: 'wrap', gap: '30px' }
        }, pageViewElements));
        
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
              key: 'card-section-header',
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
              key: 'page-section-header',
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
    });
    
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
