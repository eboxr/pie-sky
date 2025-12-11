// Preview templates for Decap CMS (Netlify CMS) v3
// Custom preview component matching website pie card design
// Version: 2.0 - Fixed props.entry undefined error

(function() {
  'use strict';
  
  function registerPreviewTemplates() {
    // Wait for CMS to be available
    if (typeof window === 'undefined' || !window.CMS) {
      setTimeout(registerPreviewTemplates, 200);
      return;
    }
    
    const CMS = window.CMS;
    
    // Check if React is available
    if (!window.React || !window.React.createElement) {
      console.warn('React not yet available, retrying...');
      setTimeout(registerPreviewTemplates, 200);
      return;
    }
    
    // Check for both possible API methods
    if (typeof CMS.registerPreviewTemplate !== 'function') {
      // Wait a bit more for CMS to fully initialize
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
    // Functional component compatible with React 18 and Decap CMS v3
    function PiePreviewTemplate(props) {
      try {
        // Handle case where props might be undefined or null
        if (!props || typeof props !== 'object') {
          console.warn('No props provided to preview template, props:', props);
          return h('div', { 
            key: 'no-props',
            style: { 
              padding: '20px', 
              color: '#666',
              fontFamily: "'Quicksand', sans-serif"
            } 
          }, 'No preview data available');
        }
        
        // Entry should come from props.entry, but handle various cases
        let entry = props.entry;
        
        // If entry is not in props.entry, check if props itself might be the entry
        if (!entry && props && (props.getIn || props.toJS)) {
          // Props might be the entry itself in some cases
          entry = props;
        }
        
        // Properly extract data from Immutable.js entry structure
        let data = null;
        try {
          if (!entry) {
            console.warn('No entry provided to preview template');
            return h('div', { 
              style: { 
                padding: '20px', 
                color: '#666',
                fontFamily: "'Quicksand', sans-serif"
              } 
            }, 'No entry data available');
          }

          // Debug: Log entry structure (only in development)
          if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.log('Entry object:', entry);
            console.log('Entry type:', typeof entry);
            try {
              if (entry && typeof entry === 'object') {
                // Safe check for Object.keys - Immutable objects might not work with Object.keys
                if (entry.constructor && entry.constructor.name === 'Map') {
                  console.log('Entry is Immutable Map');
                } else {
                  console.log('Entry keys:', Object.keys(entry));
                }
              }
            } catch (e) {
              console.log('Could not get entry keys:', e);
            }
            console.log('Has getIn?', entry && typeof entry.getIn === 'function');
            console.log('Has data?', entry && entry.data !== undefined);
          }

          // Try multiple ways to access the data
          if (entry.getIn && typeof entry.getIn === 'function') {
            // Standard Decap CMS structure: entry.getIn(['data']).toJS()
            try {
              const dataMap = entry.getIn(['data']);
              if (dataMap) {
                if (dataMap.toJS && typeof dataMap.toJS === 'function') {
                  data = dataMap.toJS();
                } else if (typeof dataMap === 'object' && dataMap !== null) {
                  // If it's already a plain object
                  data = dataMap;
                }
              }
            } catch (getInError) {
              console.warn('Error using getIn:', getInError);
              // Try alternative access
              if (entry.data !== undefined) {
                const entryData = entry.data;
                if (entryData && entryData.toJS && typeof entryData.toJS === 'function') {
                  data = entryData.toJS();
                } else if (entryData && typeof entryData === 'object') {
                  data = entryData;
                }
              }
            }
          } else if (entry.data !== undefined) {
            // Fallback for plain object structure
            const entryData = entry.data;
            if (entryData && entryData.toJS && typeof entryData.toJS === 'function') {
              data = entryData.toJS();
            } else if (entryData && typeof entryData === 'object') {
              data = entryData;
            }
          } else if (entry.toJS && typeof entry.toJS === 'function') {
            // Entry itself might be the data
            try {
              data = entry.toJS();
            } catch (toJSError) {
              console.warn('Error using toJS:', toJSError);
            }
          }
          
          // Final fallback: if entry is already a plain object, use it directly
          if (!data && entry && typeof entry === 'object' && entry.constructor === Object) {
            data = entry;
          }
        } catch (e) {
          console.error('Error extracting data from entry:', e);
          console.error('Entry object:', entry);
          // Return error message instead of crashing
          return h('div', {
            style: { 
              padding: '20px', 
              color: 'red',
              backgroundColor: '#ffe6e6',
              fontFamily: "'Quicksand', sans-serif"
            }
          }, 'Error loading preview data. Please check the browser console for details.');
        }
        
        // If no data, show loading state
        if (!data || typeof data !== 'object') {
          return h('div', { 
            key: 'loading',
            style: { 
              padding: '20px', 
              color: '#666',
              fontFamily: "'Quicksand', sans-serif"
            } 
          }, 'Loading preview...');
        }
        
        // Extract all fields with proper fallbacks - safely handle undefined/null
        const title = data.title || data.Title || 'Untitled Pie';
        const description = data.description || data.Description || '';
        const shortDescription = data.shortDescription || data.ShortDescription || '';
        const ingredients = data.ingredients || data.Ingredients || '';
        const price = data.price || data.Price || '';
        const type = data.type || data.Type || '';
        const soldOut = Boolean(data.sold_out || data.soldOut || false);
        const smallSoldOut = Boolean(data.small_sold_out || data.smallSoldOut || false);
        const bigSoldOut = Boolean(data.big_sold_out || data.bigSoldOut || false);
        const smallSoldOutComment = data.small_sold_out_comment || data.smallSoldOutComment || '';
        const bigSoldOutComment = data.big_sold_out_comment || data.bigSoldOutComment || '';
        
        // Convert to strings safely
        const titleStr = String(title || '').trim();
        const descriptionStr = String(description || '').trim();
        const shortDescriptionStr = String(shortDescription || '').trim();
        const ingredientsStr = String(ingredients || '').trim();
        const priceStr = String(price || '').trim();
        const typeStr = String(type || '').trim();
        const smallSoldOutCommentStr = String(smallSoldOutComment || '').trim();
        const bigSoldOutCommentStr = String(bigSoldOutComment || '').trim();
        
        // Determine sold out status
        const isDinnerPie = typeStr === 'dinner';
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
        if (titleStr) {
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
          }, titleStr));
        }
        
        // Description (h4) - only show if it exists, matches website: 18px, #222222
        if (descriptionStr) {
          try {
            const descParts = parseMarkdownToElements(descriptionStr, h);
            const validDescParts = descParts.filter(part => part != null && part !== '' && part !== undefined);
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
              }, ...validDescParts));
            }
          } catch (e) {
            console.warn('Error parsing description markdown:', e);
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
            }, descriptionStr));
          }
        }
        
        // Short Description (pricing info - supports markdown) - matches website: 15px, #333333, line-height 1.7
        if (shortDescriptionStr) {
          try {
            const markdownParts = parseMarkdownToElements(shortDescriptionStr, h);
            // Filter out null/undefined and ensure all parts are valid React children
            const validParts = markdownParts.filter(part => part != null && part !== '' && part !== undefined);
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
              }, ...validParts));
            }
          } catch (e) {
            console.warn('Error parsing short description markdown:', e);
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
            }, shortDescriptionStr));
          }
        }
        
        // Ingredients - matches website: 15px, #333333, line-height 1.7
        if (ingredientsStr) {
          try {
            const ingredientsParts = parseMarkdownToElements(ingredientsStr, h);
            // Filter out null/undefined and ensure all parts are valid React children
            const validIngredientsParts = ingredientsParts.filter(part => part != null && part !== '' && part !== undefined);
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
              }, ...validIngredientsParts));
            }
          } catch (e) {
            console.warn('Error parsing ingredients markdown:', e);
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
            }, ingredientsStr));
          }
        }
        
        // Sold out messages for dinner pies (when not fully sold out) - matches website: red color
        if (isDinnerPie && !showSoldOut) {
          if (smallSoldOut && smallSoldOutCommentStr) {
            try {
              const markdownParts = parseMarkdownToElements(smallSoldOutCommentStr, h);
              const validParts = markdownParts.filter(part => part != null && part !== '' && part !== undefined);
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
                }, ...validParts));
              }
            } catch (e) {
              console.warn('Error parsing small sold out comment markdown:', e);
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
              }, smallSoldOutCommentStr));
            }
          }
          if (bigSoldOut && bigSoldOutCommentStr) {
            try {
              const markdownParts = parseMarkdownToElements(bigSoldOutCommentStr, h);
              const validParts = markdownParts.filter(part => part != null && part !== '' && part !== undefined);
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
                }, ...validParts));
              }
            } catch (e) {
              console.warn('Error parsing big sold out comment markdown:', e);
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
              }, bigSoldOutCommentStr));
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
        }, ...bodyElements);
        
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
        }, ...cardElements);
        
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
        console.error('Error stack:', error.stack);
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
      // Wrap the template in a try-catch to prevent errors from crashing the CMS
      const SafePiePreviewTemplate = function(props) {
        try {
          // Ensure props is always an object (handle undefined, null, or non-object)
          const safeProps = (props && typeof props === 'object') ? props : {};
          
          // Debug logging - only log if entry is missing (not just during initial render)
          if (!safeProps.entry && Object.keys(safeProps).length > 0) {
            console.warn('Preview template called without entry prop');
            console.warn('Props received:', safeProps);
            try {
              console.warn('Props keys:', Object.keys(safeProps));
            } catch (e) {
              // Ignore errors getting keys
            }
          }
          
          // Call the actual preview template
          const result = PiePreviewTemplate(safeProps);
          
          // Ensure we always return a valid React element
          if (!result) {
            return React.createElement('div', {
              style: { 
                padding: '20px', 
                color: '#666',
                fontFamily: "'Quicksand', sans-serif"
              }
            }, 'Loading preview...');
          }
          
          return result;
        } catch (error) {
          console.error('Error in preview template render:', error);
          console.error('Error stack:', error.stack);
          console.error('Props that caused error:', props);
          // Use React.createElement to ensure we return a valid element
          return React.createElement('div', {
            style: { 
              padding: '20px', 
              color: 'red',
              backgroundColor: '#ffe6e6',
              fontFamily: "'Quicksand', sans-serif"
            }
          }, 'Preview Error: ' + String(error.message || error));
        }
      };
      
      // Try the standard method first
      if (typeof CMS.registerPreviewTemplate === 'function') {
        const collections = ['fruit_pies', 'cream_pies', 'special_pies', 'dinner_pies', 'hand_pies'];
        collections.forEach(collection => {
          try {
            CMS.registerPreviewTemplate(collection, SafePiePreviewTemplate);
            console.log(`✅ Registered preview template for ${collection}`);
          } catch (e) {
            console.error(`❌ Could not register template for ${collection}:`, e);
          }
        });
        console.log('✅ Preview templates registered using registerPreviewTemplate');
      } else {
        console.warn('⚠️ CMS.registerPreviewTemplate is not available');
        console.warn('Available CMS methods:', Object.keys(CMS).filter(k => k.toLowerCase().includes('preview')));
      }
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
