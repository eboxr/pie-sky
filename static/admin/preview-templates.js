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
    
    // Simplified Preview template - Only shows the card component
    // Uses Bootstrap classes to match the website exactly
    function PiePreviewTemplate(props) {
      try {
        const { entry, getAsset } = props || {};
        
        if (!entry) {
          return h('div', { style: { padding: '20px' } }, 'Loading...');
        }
        
        // Get data and convert to strings
        const title = String(getField(entry, 'title') || 'Untitled Pie');
        const description = String(getField(entry, 'description') || '');
        const shortDescription = String(getField(entry, 'shortDescription') || '');
        const ingredients = String(getField(entry, 'ingredients') || '');
        const price = String(getField(entry, 'price') || '');
        const type = String(getField(entry, 'type') || '');
        const soldOut = Boolean(getField(entry, 'sold_out', false));
        const smallSoldOut = Boolean(getField(entry, 'small_sold_out', false));
        const bigSoldOut = Boolean(getField(entry, 'big_sold_out', false));
        
        // Get first image
        const images = getImages(entry);
        const firstImage = images && images.length > 0 ? images[0] : null;
        const imagePath = firstImage && firstImage.image ? String(firstImage.image) : '';
        
        // Determine if sold out (dinner pies need both sizes sold out)
        const isDinnerPie = type === 'dinner';
        const showSoldOut = isDinnerPie ? (smallSoldOut && bigSoldOut) : soldOut;
        
        // Get image URL - simple absolute URL construction
        let imageUrl = '';
        if (imagePath) {
          // Clean path
          let path = String(imagePath).trim();
          
          // Remove /admin/ if present
          path = path.replace(/^\/admin\//, '').replace(/\/admin\//g, '/');
          
          // Remove leading slash for processing
          path = path.replace(/^\/+/, '');
          
          // Ensure it starts with images/
          if (!path.startsWith('images/')) {
            path = 'images/' + path;
          }
          
          // Construct absolute URL
          imageUrl = 'https://pieinthesky-eden.com/' + path.replace(/\/+/g, '/');
        }
        
        // Build card using Bootstrap classes (matching website structure)
        const cardChildren = [];
        
        // Image wrapper (matching website: <div class="pie-image-wrapper">)
        const imageWrapperChildren = [];
        if (imageUrl) {
          imageWrapperChildren.push(h('img', {
            key: 'pie-image',
            src: imageUrl,
            alt: title,
            className: 'card-img-top',
            style: { width: '100%', height: 'auto', display: 'block' }
          }));
        }
        
        // Sold out sticker (if needed)
        if (showSoldOut) {
          const soldOutUrl = 'https://pieinthesky-eden.com/images/sold-out-sticker.png';
          imageWrapperChildren.push(h('div', {
            key: 'sold-out',
            className: 'sold-out-sticker',
            style: { position: 'absolute', top: '10px', left: '10px', zIndex: 10 }
          }, h('img', {
            src: soldOutUrl,
            alt: 'SOLD OUT',
            style: { maxWidth: '100px' }
          })));
        }
        
        cardChildren.push(h('div', {
          key: 'imageWrapper',
          className: 'pie-image-wrapper',
          style: { position: 'relative' }
        }, imageWrapperChildren));
        
        // Card body (matching website: <div class="card-body">)
        const cardBodyChildren = [];
        if (title) {
          cardBodyChildren.push(h('h3', { key: 'title' }, title));
        }
        if (description && description.trim()) {
          cardBodyChildren.push(h('h4', { key: 'description' }, description));
        }
        if (shortDescription && shortDescription.trim()) {
          cardBodyChildren.push(h('p', { key: 'shortDesc' }, shortDescription));
        }
        if (ingredients && ingredients.trim()) {
          cardBodyChildren.push(h('p', { key: 'ingredients' }, ingredients));
        }
        
        if (cardBodyChildren.length > 0) {
          cardChildren.push(h('div', {
            key: 'cardBody',
            className: 'card-body'
          }, cardBodyChildren));
        }
        
        // Return card with Bootstrap classes (matching website: <div class="card border-0 text-center">)
        // Wrap in container for proper preview display
        return h('div', {
          style: { 
            padding: '20px', 
            background: '#f9f9f9',
            minHeight: '100vh'
          }
        }, h('div', {
          className: 'card border-0 text-center',
          style: { 
            maxWidth: '400px', 
            margin: '0 auto',
            backgroundColor: '#fff'
          }
        }, cardChildren));
        
      } catch (error) {
        console.error('Preview error:', error);
        return h('div', {
          style: { padding: '20px', color: 'red' }
        }, 'Error: ' + String(error.message || error));
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
