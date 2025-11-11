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
    
    // Pie card preview template matching website design
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
        let smallSoldOutComment = '';
        let bigSoldOutComment = '';
        
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
          smallSoldOutComment = String(getField(entry, 'small_sold_out_comment') || '');
          bigSoldOutComment = String(getField(entry, 'big_sold_out_comment') || '');
        } catch (e) {
          console.warn('Error getting field values:', e);
        }
        
        // Determine sold out status
        const isDinnerPie = type === 'dinner';
        const showSoldOut = isDinnerPie ? (smallSoldOut && bigSoldOut) : soldOut;
        
        // Build card elements
        const cardElements = [];
        
        // Image placeholder
        const imagePlaceholderChildren = [h('div', { key: 'placeholder-text' }, 'Image will appear here')];
        if (showSoldOut) {
          imagePlaceholderChildren.push(h('div', {
            key: 'sold-out-overlay',
            style: {
              position: 'absolute',
              top: '10px',
              left: '10px',
              backgroundColor: 'rgba(255, 0, 0, 0.8)',
              color: '#fff',
              padding: '5px 15px',
              borderRadius: '5px',
              fontSize: '12px',
              fontWeight: 'bold',
              zIndex: 5
            }
          }, 'SOLD OUT'));
        }
        
        const imagePlaceholder = h('div', {
          key: 'image-placeholder',
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
            position: 'relative'
          }
        }, imagePlaceholderChildren);
        
        cardElements.push(imagePlaceholder);
        
        // Card body
        const bodyElements = [];
        
        // Title
        if (title && title.trim()) {
          bodyElements.push(h('h3', { 
            key: 'title',
            style: { 
              marginBottom: '10px', 
              fontSize: '1.5rem', 
              fontWeight: 'bold',
              color: '#222'
            }
          }, title));
        }
        
        // Description (h4)
        if (description && description.trim()) {
          bodyElements.push(h('h4', { 
            key: 'description',
            style: { 
              marginBottom: '10px', 
              fontSize: '1.1rem', 
              color: '#333',
              fontWeight: 'normal'
            }
          }, description));
        }
        
        // Short Description (pricing info - supports markdown)
        if (shortDescription && shortDescription.trim()) {
          const markdownParts = parseMarkdownToElements(shortDescription, h);
          const validParts = markdownParts.filter(part => part != null && part !== '');
          if (validParts.length > 0) {
            bodyElements.push(h('p', { 
              key: 'shortDesc',
              style: { 
                marginBottom: '10px', 
                color: '#333',
                fontSize: '1rem',
                lineHeight: '1.5'
              }
            }, validParts));
          }
        }
        
        // Ingredients
        if (ingredients && ingredients.trim()) {
          bodyElements.push(h('p', { 
            key: 'ingredients',
            style: { 
              marginBottom: '10px', 
              color: '#666', 
              fontSize: '0.95rem',
              lineHeight: '1.5'
            }
          }, ingredients));
        }
        
        // Sold out messages for dinner pies (when not fully sold out)
        if (isDinnerPie && !showSoldOut) {
          if (smallSoldOut && smallSoldOutComment && smallSoldOutComment.trim()) {
            const markdownParts = parseMarkdownToElements(smallSoldOutComment, h);
            const validParts = markdownParts.filter(part => part != null && part !== '');
            if (validParts.length > 0) {
              bodyElements.push(h('p', {
                key: 'small-sold-out',
                style: {
                  marginTop: '10px',
                  color: '#ff0000',
                  fontSize: '0.9rem',
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
                  color: '#ff0000',
                  fontSize: '0.9rem',
                  marginBottom: '5px'
                }
              }, validParts));
            }
          }
        }
        
        // Ensure we have at least some content
        if (bodyElements.length === 0) {
          bodyElements.push(h('p', { key: 'no-content' }, 'No content available'));
        }
        
        const cardBody = h('div', {
          key: 'card-body',
          style: {
            padding: '1.5rem',
            textAlign: 'center'
          }
        }, bodyElements);
        
        cardElements.push(cardBody);
        
        // Card wrapper matching website styling
        const card = h('div', {
          key: 'card',
          style: {
            borderRadius: '15px',
            overflow: 'hidden',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            backgroundColor: '#fff',
            maxWidth: '400px',
            margin: '0 auto'
          }
        }, cardElements);
        
        // Container wrapper
        return h('div', {
          key: 'preview-container',
          style: {
            padding: '30px 20px',
            background: '#f9f9f9',
            minHeight: '100vh',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }
        }, card);
        
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
