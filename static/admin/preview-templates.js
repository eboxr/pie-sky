// Preview templates for Decap CMS (Netlify CMS) v3
// Custom preview component matching website pie card design
// Version: 3.0 - Complete rewrite using Decap CMS's built-in utilities

(function() {
  'use strict';
  
  function registerPreviewTemplates() {
    // Wait for CMS to be available
    if (typeof window === 'undefined' || !window.CMS) {
      setTimeout(registerPreviewTemplates, 200);
      return;
    }
    
    const CMS = window.CMS;
    
    // Check for registerPreviewTemplate method
    if (typeof CMS.registerPreviewTemplate !== 'function') {
      setTimeout(registerPreviewTemplates, 200);
      return;
    }
    
    // Decap CMS provides 'h' (React.createElement) and 'createClass' globally
    // Wait for them to be available
    if (typeof h === 'undefined') {
      setTimeout(registerPreviewTemplates, 200);
      return;
    }
    
    console.log('Registering preview templates...');
    console.log('CMS object:', CMS);
    console.log('h function available:', typeof h);
    console.log('createClass available:', typeof createClass);
    
    // Helper function to safely get field value from Immutable entry
    function getFieldValue(entry, fieldName, defaultValue = '') {
      try {
        const value = entry.getIn(['data', fieldName]);
        if (value === undefined || value === null) {
          return defaultValue;
        }
        // Convert Immutable values to plain JS
        if (value && typeof value.toJS === 'function') {
          return value.toJS();
        }
        return value;
      } catch (e) {
        return defaultValue;
      }
    }
    
    // Simple markdown parser for bold text
    function parseBold(text) {
      if (!text || typeof text !== 'string') {
        return [text || ''];
      }
      
      const parts = [];
      const regex = /\*\*(.*?)\*\*/g;
      let lastIndex = 0;
      let match;
      let key = 0;
      
      while ((match = regex.exec(text)) !== null) {
        // Add text before match
        if (match.index > lastIndex) {
          const before = text.substring(lastIndex, match.index);
          if (before) parts.push(before);
        }
        // Add bold element
        parts.push(h('strong', { key: 'bold-' + key++ }, match[1]));
        lastIndex = match.index + match[0].length;
      }
      
      // Add remaining text
      if (lastIndex < text.length) {
        const remaining = text.substring(lastIndex);
        if (remaining) parts.push(remaining);
      }
      
      return parts.length > 0 ? parts : [text];
    }
    
    // Pie Preview Template using createClass (Decap CMS pattern)
    const PiePreviewTemplate = createClass({
      render: function() {
        const entry = this.props.entry;
        
        if (!entry) {
          return h('div', {
            style: { padding: '20px', color: '#666', fontFamily: "'Quicksand', sans-serif" }
          }, 'Loading preview...');
        }
        
        // Extract data from entry
        const title = getFieldValue(entry, 'title', 'Untitled Pie');
        const description = getFieldValue(entry, 'description', '');
        const shortDescription = getFieldValue(entry, 'shortDescription', '');
        const ingredients = getFieldValue(entry, 'ingredients', '');
        const price = getFieldValue(entry, 'price', '');
        const type = getFieldValue(entry, 'type', '');
        const soldOut = getFieldValue(entry, 'sold_out', false);
        const smallSoldOut = getFieldValue(entry, 'small_sold_out', false);
        const bigSoldOut = getFieldValue(entry, 'big_sold_out', false);
        const smallSoldOutComment = getFieldValue(entry, 'small_sold_out_comment', '');
        const bigSoldOutComment = getFieldValue(entry, 'big_sold_out_comment', '');
        
        const isDinnerPie = type === 'dinner';
        const showSoldOut = isDinnerPie ? (smallSoldOut && bigSoldOut) : soldOut;
        
        // Build card body elements
        const bodyElements = [];
        
        // Title
        if (title) {
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
        
        // Description
        if (description) {
          const descParts = parseBold(description);
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
          }, descParts));
        }
        
        // Short Description
        if (shortDescription) {
          const shortParts = parseBold(shortDescription);
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
          }, shortParts));
        }
        
        // Ingredients
        if (ingredients) {
          const ingParts = parseBold(ingredients);
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
          }, ingParts));
        }
        
        // Sold out messages for dinner pies
        if (isDinnerPie && !showSoldOut) {
          if (smallSoldOut && smallSoldOutComment) {
            const smallParts = parseBold(smallSoldOutComment);
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
            }, smallParts));
          }
          if (bigSoldOut && bigSoldOutComment) {
            const bigParts = parseBold(bigSoldOutComment);
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
            }, bigParts));
          }
        }
        
        // Ensure we have content
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
        
        // Image placeholder
        const imageChildren = [
          h('div', {
            key: 'placeholder-text',
            style: {
              fontSize: '14px',
              color: '#999'
            }
          }, 'Image will appear here')
        ];
        
        if (showSoldOut) {
          imageChildren.push(h('div', {
            key: 'sold-out-overlay',
            style: {
              position: 'absolute',
              top: '10px',
              left: '10px',
              zIndex: 5,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              padding: '8px 15px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 'bold',
              color: '#C6600D',
              border: '2px solid #C6600D',
              filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))'
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
            position: 'relative',
            overflow: 'hidden'
          }
        }, imageChildren);
        
        const cardBody = h('div', {
          key: 'card-body',
          style: {
            padding: '1.5rem',
            textAlign: 'center'
          }
        }, bodyElements);
        
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
            border: '0'
          }
        }, [imagePlaceholder, cardBody]);
        
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
      }
    });
    
    // Register preview styles
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
      `;
      
      const styleSheet = document.createElement('style');
      styleSheet.type = 'text/css';
      styleSheet.innerText = previewStyles;
      document.head.appendChild(styleSheet);
      console.log('✅ Preview styles added');
    } catch (e) {
      console.warn('Could not add preview styles:', e);
    }
    
    // Register templates for all pie collections
    try {
      const collections = ['fruit_pies', 'cream_pies', 'special_pies', 'dinner_pies', 'hand_pies'];
      collections.forEach(collection => {
        try {
          CMS.registerPreviewTemplate(collection, PiePreviewTemplate);
          console.log(`✅ Registered preview template for ${collection}`);
        } catch (e) {
          console.error(`❌ Could not register template for ${collection}:`, e);
        }
      });
      console.log('✅ Preview templates registered successfully');
    } catch (e) {
      console.error('❌ Error registering preview templates:', e);
    }
  }
  
  // Start registration when DOM is ready
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
})();
