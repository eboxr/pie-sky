// Preview templates for Decap CMS (Netlify CMS) v3
// Custom preview component matching website pie card design

(function() {
  'use strict';
  
  function registerPreviewTemplates() {
    // Wait for CMS to be available
    if (typeof window === 'undefined' || !window.CMS) {
      setTimeout(registerPreviewTemplates, 200);
      return;
    }
    
    const CMS = window.CMS;
    
    // Check for both possible API methods
    if (typeof CMS.registerPreviewTemplate !== 'function' && typeof CMS.registerPreviewStyle !== 'function') {
      setTimeout(registerPreviewTemplates, 200);
      return;
    }
    
    console.log('Registering preview templates...');
    console.log('CMS object:', CMS);
    console.log('Available methods:', Object.keys(CMS).filter(k => k.includes('preview') || k.includes('Preview')));
    
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
    
    // Simple function to parse markdown and create React elements
    // Returns an array of React elements and strings
    function parseMarkdownToElements(text, createElement) {
      if (!text || typeof text !== 'string') return [text || ''];
      
      const parts = [];
      let lastIndex = 0;
      const boldRegex = /\*\*(.*?)\*\*/g;
      let match;
      let keyIndex = 0;
      
      while ((match = boldRegex.exec(text)) !== null) {
        // Add text before the match
        if (match.index > lastIndex) {
          const beforeText = text.substring(lastIndex, match.index);
          if (beforeText) {
            parts.push(beforeText);
          }
        }
        // Add bold text as React element
        parts.push(createElement('strong', { key: 'bold-' + (keyIndex++) }, match[1]));
        lastIndex = match.index + match[0].length;
      }
      
      // Add remaining text
      if (lastIndex < text.length) {
        const remainingText = text.substring(lastIndex);
        if (remainingText) {
          parts.push(remainingText);
        }
      }
      
      // If no matches, return original text as single string
      if (parts.length === 0) {
        return [text];
      }
      
      return parts;
    }
    
    // Pie card preview template matching website design exactly
    function PiePreviewTemplate(props) {
      try {
        const { entry, widget, field } = props || {};
        
        // Debug logging
        console.log('PiePreviewTemplate called with props:', { 
          hasEntry: !!entry, 
          hasWidget: !!widget, 
          hasField: !!field,
          entryType: entry ? typeof entry : 'none',
          entryKeys: entry && typeof entry === 'object' ? Object.keys(entry) : []
        });
        
        // Try multiple ways to get the data (Decap CMS v3 might pass it differently)
        let data = null;
        if (entry) {
          // Try Immutable.js structure
          if (entry.getIn && typeof entry.getIn === 'function') {
            data = entry.getIn(['data']) || entry.get('data');
            if (data && data.toJS) {
              data = data.toJS();
            }
          }
          // Try plain object structure
          else if (entry.data) {
            data = entry.data;
          }
          // Try direct structure
          else if (typeof entry === 'object' && !entry.getIn) {
            data = entry;
          }
        }
        
        // Fallback: try widget or field
        if (!data && widget && widget.value) {
          data = widget.value;
        }
        
        console.log('Extracted data:', data);
        
        if (!data && !entry) {
          return h('div', { style: { padding: '20px', color: '#666' } }, 
            'Loading preview... (No data available yet)'
          );
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
        let smallSoldOutComment = '';
        let bigSoldOutComment = '';
        
        try {
          // Try getting from data object first
          if (data) {
            title = String(data.title || data.Title || 'Untitled Pie');
            description = String(data.description || data.Description || '');
            shortDescription = String(data.shortDescription || data.ShortDescription || '');
            ingredients = String(data.ingredients || data.Ingredients || '');
            price = String(data.price || data.Price || '');
            type = String(data.type || data.Type || '');
            soldOut = Boolean(data.sold_out || data.soldOut || false);
            smallSoldOut = Boolean(data.small_sold_out || data.smallSoldOut || false);
            bigSoldOut = Boolean(data.big_sold_out || data.bigSoldOut || false);
            smallSoldOutComment = String(data.small_sold_out_comment || data.smallSoldOutComment || '');
            bigSoldOutComment = String(data.big_sold_out_comment || data.bigSoldOutComment || '');
          }
          // Fallback to getField method
          else if (entry) {
            title = String(getField(entry, 'title') || 'Untitled Pie');
            description = String(getField(entry, 'description') || '');
            shortDescription = String(getField(entry, 'shortDescription') || '');
            ingredients = String(getField(entry, 'ingredients') || '');
            price = String(getField(entry, 'price') || '');
            type = String(getField(entry, 'type') || '');
            soldOut = Boolean(getField(entry, 'sold_out', false));
            smallSoldOut = Boolean(getField(entry, 'small_sold_out', false));
            bigSoldOut = Boolean(getField(entry, 'big_sold_out', false));
            smallSoldOutComment = String(getField(entry, 'small_sold_out_comment') || '');
            bigSoldOutComment = String(getField(entry, 'big_sold_out_comment') || '');
          }
        } catch (e) {
          console.warn('Error getting field values:', e);
        }
        
        // Determine sold out status
        const isDinnerPie = type === 'dinner';
        const showSoldOut = isDinnerPie ? (smallSoldOut && bigSoldOut) : soldOut;
        
        // Build card elements
        const cardElements = [];
        
        // Image placeholder with sold out sticker
        const imagePlaceholderChildren = [
          h('div', { 
            key: 'placeholder-text',
            style: {
              fontSize: '14px',
              color: '#999'
            }
          }, 'Image will appear here')
        ];
        
        if (showSoldOut) {
          // Create sold out sticker overlay (matching website style)
          imagePlaceholderChildren.push(h('div', {
            key: 'sold-out-overlay',
            style: {
              position: 'absolute',
              top: '10px',
              left: '10px',
              zIndex: 5,
              width: '200px',
              height: 'auto',
              filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))',
              pointerEvents: 'none',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              padding: '8px 15px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 'bold',
              color: '#C6600D',
              border: '2px solid #C6600D'
            }
          }, 'SOLD OUT'));
        }
        
        const imagePlaceholder = h('div', {
          key: 'image-placeholder',
          className: 'card-img-placeholder',
          style: {
            width: '100%',
            aspectRatio: '1 / 1',
            backgroundColor: '#f0f0f0',
            border: '2px dashed #ccc',
            borderRadius: '15px 15px 0 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#999',
            fontSize: '14px',
            textAlign: 'center',
            padding: '20px',
            boxSizing: 'border-box',
            position: 'relative',
            overflow: 'hidden'
          }
        }, imagePlaceholderChildren);
        
        cardElements.push(imagePlaceholder);
        
        // Card body - matching website structure exactly
        const bodyElements = [];
        
        // Title (h3) - matches website: 22px, bold, #222222
        if (title && title.trim()) {
          bodyElements.push(h('h3', { 
            key: 'title',
            style: { 
              marginBottom: '10px', 
              fontSize: '22px', 
              fontWeight: 'bold',
              color: '#222222',
              fontFamily: "'Quicksand', sans-serif",
              lineHeight: '1.2'
            }
          }, title));
        }
        
        // Description (h4) - only show if it exists, matches website: 18px, #222222
        if (description && description.trim()) {
          const descParts = parseMarkdownToElements(description, h);
          const validDescParts = descParts.filter(part => part != null && part !== '');
          if (validDescParts.length > 0) {
            bodyElements.push(h('h4', { 
              key: 'description',
              style: { 
                marginBottom: '10px', 
                fontSize: '18px', 
                color: '#222222',
                fontFamily: "'Quicksand', sans-serif",
                fontWeight: '400',
                lineHeight: '1.2'
              }
            }, validDescParts));
          }
        }
        
        // Short Description (pricing info - supports markdown) - matches website: 15px, #333333, line-height 1.7
        if (shortDescription && shortDescription.trim()) {
          const markdownParts = parseMarkdownToElements(shortDescription, h);
          const validParts = markdownParts.filter(part => part != null && part !== '');
          if (validParts.length > 0) {
            bodyElements.push(h('p', { 
              key: 'shortDesc',
              style: { 
                marginBottom: '10px', 
                color: '#333333',
                fontSize: '15px',
                lineHeight: '1.7',
                fontFamily: "'Quicksand', sans-serif",
                fontWeight: '400'
              }
            }, validParts));
          }
        }
        
        // Ingredients - matches website: 15px, #333333, line-height 1.7
        if (ingredients && ingredients.trim()) {
          const ingredientsParts = parseMarkdownToElements(ingredients, h);
          const validIngredientsParts = ingredientsParts.filter(part => part != null && part !== '');
          if (validIngredientsParts.length > 0) {
            bodyElements.push(h('p', { 
              key: 'ingredients',
              style: { 
                marginBottom: '10px', 
                color: '#333333', 
                fontSize: '15px',
                lineHeight: '1.7',
                fontFamily: "'Quicksand', sans-serif",
                fontWeight: '400'
              }
            }, validIngredientsParts));
          }
        }
        
        // Sold out messages for dinner pies (when not fully sold out) - matches website: red color
        if (isDinnerPie && !showSoldOut) {
          if (smallSoldOut && smallSoldOutComment && smallSoldOutComment.trim()) {
            const markdownParts = parseMarkdownToElements(smallSoldOutComment, h);
            const validParts = markdownParts.filter(part => part != null && part !== '');
            if (validParts.length > 0) {
              bodyElements.push(h('p', {
                key: 'small-sold-out',
                style: {
                  marginTop: '10px',
                  color: 'red',
                  fontSize: '15px',
                  lineHeight: '1.7',
                  fontFamily: "'Quicksand', sans-serif",
                  marginBottom: '5px'
                }
              }, validParts));
            }
          }
          if (bigSoldOut && bigSoldOutComment && bigSoldOutComment.trim()) {
            const markdownParts = parseMarkdownToElements(bigSoldOutComment, h);
            const validParts = markdownParts.filter(part => part != null && part !== '');
            if (validParts.length > 0) {
              bodyElements.push(h('p', {
                key: 'big-sold-out',
                style: {
                  marginTop: '10px',
                  color: 'red',
                  fontSize: '15px',
                  lineHeight: '1.7',
                  fontFamily: "'Quicksand', sans-serif",
                  marginBottom: '5px'
                }
              }, validParts));
            }
          }
        }
        
        // Ensure we have at least some content
        if (bodyElements.length === 0) {
          bodyElements.push(h('p', { 
            key: 'no-content',
            style: {
              color: '#333333',
              fontSize: '15px',
              fontFamily: "'Quicksand', sans-serif"
            }
          }, 'No content available'));
        }
        
        const cardBody = h('div', {
          key: 'card-body',
          className: 'card-body',
          style: {
            padding: '1.5rem',
            textAlign: 'center'
          }
        }, bodyElements);
        
        cardElements.push(cardBody);
        
        // Card wrapper matching website styling exactly
        const card = h('div', {
          key: 'card',
          className: 'card border-0 text-center',
          style: {
            borderRadius: '15px',
            overflow: 'hidden',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            backgroundColor: '#fff',
            maxWidth: '400px',
            margin: '0 auto',
            border: '0',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease'
          }
        }, cardElements);
        
        // Container wrapper with website background and CSS class
        return h('div', {
          key: 'preview-container',
          className: 'pie-card-preview',
          style: {
            padding: '30px 20px',
            background: '#fff',
            minHeight: '100vh',
            fontFamily: "'Quicksand', sans-serif",
            fontSize: '15px',
            lineHeight: '1.4'
          }
        }, card);
        
      } catch (error) {
        console.error('Preview error:', error);
        return h('div', {
          style: { 
            padding: '20px', 
            color: 'red',
            backgroundColor: '#ffe6e6',
            fontFamily: "'Quicksand', sans-serif"
          }
        }, 'Preview Error: ' + String(error.message || error));
      }
    }
    
    // Register preview styles (CSS) for the preview pane
    try {
      const previewStyles = `
        .pie-card-preview {
          font-family: 'Quicksand', sans-serif;
        }
        .pie-card-preview .card {
          border-radius: 15px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          background-color: #fff;
          max-width: 400px;
          margin: 0 auto;
          border: 0;
        }
        .pie-card-preview .card-img-placeholder {
          width: 100%;
          aspect-ratio: 1 / 1;
          background-color: #f0f0f0;
          border: 2px dashed #ccc;
          border-radius: 15px 15px 0 0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #999;
          font-size: 14px;
          text-align: center;
          padding: 20px;
          box-sizing: border-box;
          position: relative;
          overflow: hidden;
        }
        .pie-card-preview .card-body {
          padding: 1.5rem;
          text-align: center;
        }
        .pie-card-preview h3 {
          margin-bottom: 10px;
          font-size: 22px;
          font-weight: bold;
          color: #222222;
          font-family: 'Quicksand', sans-serif;
          line-height: 1.2;
        }
        .pie-card-preview h4 {
          margin-bottom: 10px;
          font-size: 18px;
          color: #222222;
          font-family: 'Quicksand', sans-serif;
          font-weight: 400;
          line-height: 1.2;
        }
        .pie-card-preview p {
          margin-bottom: 10px;
          color: #333333;
          font-size: 15px;
          line-height: 1.7;
          font-family: 'Quicksand', sans-serif;
          font-weight: 400;
        }
        .pie-card-preview .sold-out-sticker {
          position: absolute;
          top: 10px;
          left: 10px;
          z-index: 5;
          background-color: rgba(255, 255, 255, 0.9);
          padding: 8px 15px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: bold;
          color: #C6600D;
          border: 2px solid #C6600D;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
        }
      `;
      
      // Add styles to the page
      const styleSheet = document.createElement('style');
      styleSheet.type = 'text/css';
      styleSheet.innerText = previewStyles;
      document.head.appendChild(styleSheet);
      console.log('✅ Preview styles added');
    } catch (e) {
      console.warn('Could not add preview styles:', e);
    }
    
    // Register templates using the correct API
    try {
      // Try the standard method first
      if (typeof CMS.registerPreviewTemplate === 'function') {
        CMS.registerPreviewTemplate('fruit_pies', PiePreviewTemplate);
        CMS.registerPreviewTemplate('cream_pies', PiePreviewTemplate);
        CMS.registerPreviewTemplate('special_pies', PiePreviewTemplate);
        CMS.registerPreviewTemplate('dinner_pies', PiePreviewTemplate);
        CMS.registerPreviewTemplate('hand_pies', PiePreviewTemplate);
        console.log('✅ Preview templates registered using registerPreviewTemplate');
      } 
      // Try alternative method for Decap CMS v3
      else if (CMS.registerPreviewStyle) {
        // For Decap CMS v3, we might need to use registerPreviewStyle
        console.log('Using alternative registration method');
        // Register as a widget preview
        if (CMS.registerWidget) {
          // This might be needed for Decap CMS v3
        }
      }
      
      // Also try registering with collection names (in case they're different)
      const collections = ['fruit_pies', 'cream_pies', 'special_pies', 'dinner_pies', 'hand_pies'];
      collections.forEach(collection => {
        try {
          if (typeof CMS.registerPreviewTemplate === 'function') {
            CMS.registerPreviewTemplate(collection, PiePreviewTemplate);
          }
        } catch (e) {
          console.warn(`Could not register template for ${collection}:`, e);
        }
      });
      
      console.log('✅ Preview templates registration attempted');
    } catch (e) {
      console.error('❌ Error registering preview templates:', e);
      console.error('Stack:', e.stack);
    }
  }
  
  // Start registration - try multiple times with increasing delays
  function startRegistration() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        setTimeout(registerPreviewTemplates, 500);
        setTimeout(registerPreviewTemplates, 1500);
        setTimeout(registerPreviewTemplates, 3000);
      });
    } else {
      setTimeout(registerPreviewTemplates, 500);
      setTimeout(registerPreviewTemplates, 1500);
      setTimeout(registerPreviewTemplates, 3000);
    }
  }
  
  startRegistration();
})();
