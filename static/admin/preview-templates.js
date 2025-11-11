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
    
    // Removed getImages function - not needed for text-only preview
    
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
    
    // Ultra-simplified Preview template - Text only, no images
    // This eliminates image path issues and React rendering complexity
    function PiePreviewTemplate(props) {
      try {
        const { entry } = props || {};
        
        if (!entry) {
          return h('div', { style: { padding: '20px' } }, 'Loading...');
        }
        
        // Get data - convert everything to simple strings
        let title = '';
        let description = '';
        let shortDescription = '';
        let ingredients = '';
        let price = '';
        let soldOut = false;
        let type = '';
        let smallSoldOut = false;
        let bigSoldOut = false;
        
        try {
          title = String(getField(entry, 'title') || 'Untitled Pie');
          description = String(getField(entry, 'description') || '');
          shortDescription = String(getField(entry, 'shortDescription') || '');
          ingredients = String(getField(entry, 'ingredients') || '');
          price = String(getField(entry, 'price') || '');
          type = String(getField(entry, 'type') || '');
          soldOut = Boolean(getField(entry, 'sold_out', false));
          smallSoldOut = Boolean(getField(entry, 'small_sold_out', false));
          bigSoldOut = Boolean(getField(entry, 'big_sold_out', false));
        } catch (e) {
          console.warn('Error getting field values:', e);
        }
        
        // Determine sold out status
        const isDinnerPie = type === 'dinner';
        const showSoldOut = isDinnerPie ? (smallSoldOut && bigSoldOut) : soldOut;
        
        // Build simple card body with text content only
        const bodyElements = [];
        
        // Title
        if (title) {
          bodyElements.push(h('h3', { 
            key: 'title',
            style: { marginBottom: '15px', fontSize: '1.5rem', fontWeight: 'bold' }
          }, title));
        }
        
        // Description
        if (description && description.trim()) {
          bodyElements.push(h('h4', { 
            key: 'description',
            style: { marginBottom: '10px', fontSize: '1.2rem', color: '#666' }
          }, description));
        }
        
        // Short Description
        if (shortDescription && shortDescription.trim()) {
          bodyElements.push(h('p', { 
            key: 'shortDesc',
            style: { marginBottom: '10px', color: '#555' }
          }, shortDescription));
        }
        
        // Ingredients
        if (ingredients && ingredients.trim()) {
          bodyElements.push(h('p', { 
            key: 'ingredients',
            style: { marginBottom: '10px', color: '#666', fontSize: '0.9rem' }
          }, ingredients));
        }
        
        // Price
        if (price && price.trim()) {
          bodyElements.push(h('p', { 
            key: 'price',
            style: { marginTop: '15px', fontSize: '1.3rem', fontWeight: 'bold', color: '#C6600D' }
          }, '$' + price));
        }
        
        // Sold Out badge
        if (showSoldOut) {
          bodyElements.push(h('div', {
            key: 'soldOut',
            style: {
              marginTop: '15px',
              padding: '8px 16px',
              backgroundColor: '#ff0000',
              color: '#fff',
              borderRadius: '5px',
              display: 'inline-block',
              fontWeight: 'bold'
            }
          }, 'SOLD OUT'));
        }
        
        // Simple card wrapper - pure HTML/CSS, no Bootstrap dependency
        return h('div', {
          style: {
            padding: '30px 20px',
            background: '#f9f9f9',
            minHeight: '100vh',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }
        }, h('div', {
          style: {
            maxWidth: '500px',
            margin: '0 auto',
            backgroundColor: '#fff',
            padding: '30px',
            borderRadius: '10px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }
        }, bodyElements));
        
      } catch (error) {
        console.error('Preview error:', error);
        return h('div', {
          style: { 
            padding: '20px', 
            color: 'red',
            backgroundColor: '#ffe6e6'
          }
        }, 'Preview Error: ' + String(error.message || error));
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
