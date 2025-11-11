// Preview templates for Decap CMS (Netlify CMS)
// These templates show both the card view (as on index page) and the full pie page

(function() {
  'use strict';

  // Wait for CMS to initialize - try multiple ways to access CMS
  const CMS = window.CMS || window.DecapCMS || (window.netlify && window.netlify.cms);
  
  if (typeof window !== 'undefined' && CMS) {
    // Try multiple ways to get React
    let React;
    try {
      React = CMS.get('react');
    } catch (e) {
      try {
        React = window.React;
      } catch (e2) {
        console.error('Could not access React:', e2);
        return;
      }
    }
    
    if (!React) {
      console.error('React not available in CMS');
      return;
    }

    const { createElement: h } = React;

    // Helper to safely get field values
    function getField(entry, path, defaultValue = '') {
      try {
        const value = entry.getIn(['data', ...path.split('.')]);
        return value !== undefined && value !== null ? value : defaultValue;
      } catch (e) {
        return defaultValue;
      }
    }

    // Helper to get images array
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

    // Helper to render markdown-like text
    function renderMarkdown(text) {
      if (!text) return '';
      // Simple markdown rendering
      return text
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br>');
    }

    // Helper to get image URL
    function getImageUrl(imagePath) {
      if (!imagePath) return '';
      return imagePath.startsWith('/') ? imagePath : '/' + imagePath;
    }

    // Card view preview component
    function PieCardPreview({ entry, widgetFor }) {
      const title = getField(entry, 'title', 'Untitled Pie');
      const description = getField(entry, 'description');
      const shortDescription = getField(entry, 'shortDescription');
      const price = getField(entry, 'price');
      const soldOut = getField(entry, 'sold_out', false);
      const images = getImages(entry);
      const ingredients = getField(entry, 'ingredients');
      const type = getField(entry, 'type');
      
      // Dinner pie specific fields
      const smallSoldOut = getField(entry, 'small_sold_out', false);
      const bigSoldOut = getField(entry, 'big_sold_out', false);
      const smallSoldOutComment = getField(entry, 'small_sold_out_comment');
      const bigSoldOutComment = getField(entry, 'big_sold_out_comment');
      
      const firstImage = images.length > 0 ? images[0] : null;
      const imageUrl = firstImage ? getImageUrl(firstImage.image) : '';
      const isDinnerPie = type === 'dinner';
      const showSoldOutSticker = isDinnerPie 
        ? (smallSoldOut && bigSoldOut)
        : soldOut;

      return h('div', {
        style: {
          maxWidth: '400px',
          margin: '20px auto',
          border: '1px solid #ddd',
          borderRadius: '15px',
          overflow: 'hidden',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }
      }, [
        h('a', { 
          href: '#', 
          style: { textDecoration: 'none', color: 'inherit' },
          onClick: (e) => e.preventDefault()
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
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }
            }) : null,
            h('div', {
              style: {
                width: '100%',
                aspectRatio: '1/1',
                background: '#f0f0f0',
                display: imageUrl ? 'none' : 'flex',
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
                zIndex: 5,
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
                pointerEvents: 'none'
              }
            }, h('div', {
              style: {
                background: '#ff0000',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '5px',
                fontWeight: 'bold',
                fontSize: '14px'
              }
            }, 'SOLD OUT')) : null
          ])
        ]),
        h('div', {
          style: {
            padding: '1.5rem',
            textAlign: 'center'
          }
        }, [
          h('h3', { 
            style: { margin: '0 0 10px 0', fontSize: '1.5rem', color: '#333' } 
          }, title),
          description ? h('h4', { 
            style: { margin: '0 0 10px 0', fontSize: '1.2rem', color: '#666' } 
          }, h('span', { dangerouslySetInnerHTML: { __html: renderMarkdown(description) } })) : null,
          shortDescription ? h('p', { 
            style: { margin: '0 0 10px 0', color: '#555' } 
          }, h('span', { dangerouslySetInnerHTML: { __html: renderMarkdown(shortDescription) } })) : null,
          ingredients ? h('p', { 
            style: { margin: '10px 0', color: '#666', fontSize: '0.9rem' } 
          }, h('span', { dangerouslySetInnerHTML: { __html: renderMarkdown(ingredients) } })) : null,
          isDinnerPie && (smallSoldOut || bigSoldOut) && !(smallSoldOut && bigSoldOut) ? [
            smallSoldOut && smallSoldOutComment ? h('p', { 
              key: 'small', 
              style: { color: 'red', margin: '5px 0' } 
            }, h('span', { dangerouslySetInnerHTML: { __html: renderMarkdown(smallSoldOutComment) } })) : null,
            bigSoldOut && bigSoldOutComment ? h('p', { 
              key: 'big', 
              style: { color: 'red', margin: '5px 0' } 
            }, h('span', { dangerouslySetInnerHTML: { __html: renderMarkdown(bigSoldOutComment) } })) : null
          ] : null
        ])
      ]);
    }

    // Full pie page preview component
    function PiePagePreview({ entry, widgetFor }) {
      const title = getField(entry, 'title', 'Untitled Pie');
      const description = getField(entry, 'description');
      const price = getField(entry, 'price', '0');
      const soldOut = getField(entry, 'sold_out', false);
      const images = getImages(entry);
      const ingredients = getField(entry, 'ingredients');
      const content = widgetFor('body');
      const type = getField(entry, 'type');
      
      // Dinner pie specific fields
      const smallSoldOut = getField(entry, 'small_sold_out', false);
      const bigSoldOut = getField(entry, 'big_sold_out', false);
      
      const isDinnerPie = type === 'dinner';
      const showSoldOutSticker = isDinnerPie 
        ? (smallSoldOut && bigSoldOut)
        : soldOut;

      return h('div', {
        style: {
          maxWidth: '1200px',
          margin: '20px auto',
          padding: '20px',
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif"
        }
      }, h('div', {
        style: {
          display: 'flex',
          flexWrap: 'wrap',
          gap: '30px'
        }
      }, [
        h('div', {
          style: {
            flex: 1,
            minWidth: '300px'
          }
        }, h('div', {
          style: {
            position: 'relative',
            width: '100%',
            marginBottom: '20px'
          }
        }, [
          images.length > 0 ? [
            h('div', {
              key: 'main',
              style: {
                border: '1px solid #C6600D',
                borderRadius: '5px',
                padding: '10px',
                marginBottom: '10px'
              }
            }, h('img', {
              src: getImageUrl(images[0].image),
              alt: title,
              style: {
                width: '100%',
                height: 'auto',
                display: 'block'
              }
            })),
            images.length > 1 ? h('div', {
              key: 'thumbs',
              style: {
                display: 'flex',
                gap: '10px',
                flexWrap: 'wrap'
              }
            }, images.slice(1).map((img, idx) => h('div', {
              key: idx,
              style: {
                border: '1px solid #C6600D',
                borderRadius: '5px',
                padding: '5px',
                flex: 1,
                minWidth: '80px'
              }
            }, h('img', {
              src: getImageUrl(img.image),
              alt: title,
              style: {
                width: '100%',
                height: 'auto',
                display: 'block'
              }
            })))) : null
          ] : h('div', {
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
          }, 'No images'),
          showSoldOutSticker ? h('div', {
            style: {
              position: 'absolute',
              top: '10px',
              left: '10px',
              zIndex: 5,
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
              pointerEvents: 'none'
            }
          }, h('div', {
            style: {
              background: '#ff0000',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '5px',
              fontWeight: 'bold',
              fontSize: '14px'
            }
          }, 'SOLD OUT')) : null
        ])),
        h('div', {
          style: {
            flex: 1,
            minWidth: '300px'
          }
        }, [
          h('h2', {
            style: {
              fontSize: '2rem',
              margin: '0 0 15px 0',
              color: '#333',
              fontWeight: 500
            }
          }, title),
          description ? h('h4', {
            style: {
              margin: '0 0 20px 0',
              fontSize: '1.3rem',
              color: '#666',
              fontWeight: 400
            }
          }, h('span', { dangerouslySetInnerHTML: { __html: renderMarkdown(description) } })) : null,
          h('div', {
            style: {
              margin: '20px 0'
            }
          }, h('span', {
            style: {
              fontSize: '1.5rem',
              color: '#C6600D',
              fontWeight: 500
            }
          }, '$' + price)),
          ingredients ? h('div', {
            style: {
              margin: '20px 0'
            }
          }, [
            h('h5', {
              style: {
                fontSize: '1.1rem',
                margin: '0 0 10px 0',
                color: '#333'
              }
            }, 'Ingredients'),
            h('div', {
              style: {
                color: '#666',
                lineHeight: 1.6
              },
              dangerouslySetInnerHTML: { __html: renderMarkdown(ingredients) }
            })
          ]) : null,
          content ? h('div', {
            style: {
              margin: '20px 0'
            }
          }, [
            h('h5', {
              style: {
                fontSize: '1.1rem',
                margin: '0 0 10px 0',
                color: '#333'
              }
            }, 'Description'),
            h('div', {
              style: {
                color: '#666',
                lineHeight: 1.6
              }
            }, content)
          ]) : null
        ])
      ]));
    }

    // Combined preview showing both card and page views
    function PieCombinedPreview({ entry, widgetFor }) {
      return h('div', {
        style: {
          padding: '20px',
          background: '#f9f9f9',
          minHeight: '100vh'
        }
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
          h(PieCardPreview, { entry, widgetFor })
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
          h(PiePagePreview, { entry, widgetFor })
        ])
      ]);
    }

    // Register preview templates
    try {
      // Try the standard registration method
      if (CMS.registerPreviewTemplate) {
        CMS.registerPreviewTemplate('fruit_pies', PieCombinedPreview);
        CMS.registerPreviewTemplate('cream_pies', PieCombinedPreview);
        CMS.registerPreviewTemplate('special_pies', PieCombinedPreview);
        CMS.registerPreviewTemplate('dinner_pies', PieCombinedPreview);
        CMS.registerPreviewTemplate('hand_pies', PieCombinedPreview);
        console.log('✅ Preview templates registered successfully');
      } else if (CMS.registerPreviewStyle) {
        // Alternative registration method
        console.warn('Using alternative registration method');
      } else {
        console.error('CMS.registerPreviewTemplate not available');
      }
    } catch (e) {
      console.error('Error registering preview templates:', e);
    }
  } else {
    // Wait for CMS to load
    function waitForCMS() {
      if (typeof window !== 'undefined' && (window.CMS || window.DecapCMS)) {
        // Reload the script to reinitialize
        const script = document.createElement('script');
        script.src = '/admin/preview-templates.js';
        document.body.appendChild(script);
      } else {
        setTimeout(waitForCMS, 100);
      }
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', waitForCMS);
    } else {
      waitForCMS();
    }
  }
})();
