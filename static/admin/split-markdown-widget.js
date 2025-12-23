// Custom split-view markdown widget for Special Event content
// Left panel: Markdown editor
// Right panel: Live preview

(function() {
  'use strict';

  // Enhanced markdown parser for preview
  function parseMarkdown(markdown) {
    if (!markdown || !markdown.trim()) {
      return '<p style="color: #999; padding: 1rem;">Preview will appear here...</p>';
    }
    
    // Escape HTML to prevent XSS
    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
    
    // Process line by line
    const lines = markdown.split('\n');
    const result = [];
    let inList = false;
    let currentParagraph = [];
    
    function flushParagraph() {
      if (currentParagraph.length > 0) {
        const paraText = currentParagraph.join(' ').trim();
        if (paraText) {
          // Process inline formatting
          let processed = escapeHtml(paraText);
          processed = processed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
          processed = processed.replace(/\*([^*]+?)\*/g, '<em>$1</em>');
          processed = processed.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
          result.push('<p>' + processed + '</p>');
        }
        currentParagraph = [];
      }
    }
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      
      // Headers
      if (trimmed.match(/^###\s+/)) {
        flushParagraph();
        if (inList) {
          result.push('</ul>');
          inList = false;
        }
        const text = trimmed.replace(/^###\s+/, '');
        let processed = escapeHtml(text);
        processed = processed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        result.push('<h3>' + processed + '</h3>');
        continue;
      }
      
      if (trimmed.match(/^##\s+/)) {
        flushParagraph();
        if (inList) {
          result.push('</ul>');
          inList = false;
        }
        const text = trimmed.replace(/^##\s+/, '');
        let processed = escapeHtml(text);
        processed = processed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        result.push('<h2>' + processed + '</h2>');
        continue;
      }
      
      if (trimmed.match(/^#\s+/)) {
        flushParagraph();
        if (inList) {
          result.push('</ul>');
          inList = false;
        }
        const text = trimmed.replace(/^#\s+/, '');
        let processed = escapeHtml(text);
        processed = processed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        result.push('<h1>' + processed + '</h1>');
        continue;
      }
      
      // List items
      const listMatch = trimmed.match(/^[\-\*\+]\s+(.+)$/);
      if (listMatch) {
        flushParagraph();
        if (!inList) {
          result.push('<ul>');
          inList = true;
        }
        let listContent = listMatch[1];
        let processed = escapeHtml(listContent);
        processed = processed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        processed = processed.replace(/\*([^*]+?)\*/g, '<em>$1</em>');
        processed = processed.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
        result.push('<li>' + processed + '</li>');
        continue;
      }
      
      // Empty line - flush paragraph
      if (!trimmed) {
        flushParagraph();
        if (inList) {
          result.push('</ul>');
          inList = false;
        }
        continue;
      }
      
      // Regular text line
      currentParagraph.push(trimmed);
    }
    
    // Flush any remaining content
    flushParagraph();
    if (inList) {
      result.push('</ul>');
    }
    
    return result.join('\n') || '<p style="color: #999; padding: 1rem;">Preview will appear here...</p>';
  }

  // Wait for CMS to be available
  function registerWidget() {
    if (typeof window === 'undefined' || !window.CMS) {
      setTimeout(registerWidget, 200);
      return;
    }

    const CMS = window.CMS;
    
    // Check for required functions
    if (typeof h === 'undefined' || typeof createClass === 'undefined') {
      setTimeout(registerWidget, 200);
      return;
    }

    // Create the split-view markdown widget
    const SplitMarkdownWidget = createClass({
      getInitialState() {
        return {
          value: this.props.value || '',
          preview: ''
        };
      },

      componentDidMount() {
        // Initial preview
        this.updatePreview(this.props.value || '');
      },

      componentDidUpdate(prevProps) {
        if (prevProps.value !== this.props.value) {
          this.updatePreview(this.props.value || '');
        }
      },

      updatePreview(markdown) {
        const preview = parseMarkdown(markdown);
        this.setState({ preview });
      },

      handleChange(event) {
        const value = event.target.value;
        this.setState({ value });
        this.updatePreview(value);
        
        // Call the original onChange to update the data
        this.props.onChange(value);
      },

      render() {
        const { forID, classNameWrapper, field } = this.props;
        const { value, preview } = this.state;
        
        return h('div', {
          className: classNameWrapper,
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }
        },
          h('label', {
            htmlFor: forID,
            style: {
              fontWeight: '500',
              marginBottom: '0.5rem'
            }
          }, field.get('label', 'Content')),
          
          // Split view container
          h('div', {
            style: {
              display: 'flex',
              gap: '1rem',
              minHeight: '400px',
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
              overflow: 'hidden'
            }
          },
            // Left panel - Editor
            h('div', {
              style: {
                flex: '1',
                display: 'flex',
                flexDirection: 'column',
                borderRight: '1px solid #e0e0e0',
                backgroundColor: '#fafafa'
              }
            },
              h('div', {
                style: {
                  padding: '0.5rem',
                  backgroundColor: '#f0f0f0',
                  borderBottom: '1px solid #e0e0e0',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#666'
                }
              }, 'Editor'),
              h('textarea', {
                id: forID,
                value: value,
                onChange: this.handleChange,
                style: {
                  flex: '1',
                  padding: '1rem',
                  border: 'none',
                  outline: 'none',
                  resize: 'none',
                  fontFamily: 'monospace',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  backgroundColor: '#fff'
                },
                placeholder: 'Enter markdown content here...'
              })
            ),
            
            // Right panel - Preview
            h('div', {
              style: {
                flex: '1',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#fff'
              }
            },
              h('div', {
                style: {
                  padding: '0.5rem',
                  backgroundColor: '#f0f0f0',
                  borderBottom: '1px solid #e0e0e0',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#666'
                }
              }, 'Preview'),
              h('div', {
                dangerouslySetInnerHTML: { __html: preview || '<p style="color: #999; padding: 1rem;">Preview will appear here...</p>' },
                className: 'special-event-content',
                style: {
                  flex: '1',
                  padding: '1rem',
                  overflowY: 'auto',
                  fontFamily: "'Quicksand', sans-serif",
                  fontSize: '15px',
                  lineHeight: '1.7',
                  color: '#333'
                }
              })
            )
          ),
          
          // Hint text
          field.get('hint') ? h('p', {
            className: 'hint',
            style: {
              fontSize: '0.875rem',
              color: '#666',
              marginTop: '0.5rem',
              marginBottom: 0
            }
          }, field.get('hint')) : null
        );
      }
    });

    // Add custom styles for the preview
    try {
      const styleSheet = document.createElement('style');
      styleSheet.type = 'text/css';
      styleSheet.innerText = `
        .special-event-content {
          font-family: 'Quicksand', sans-serif;
        }
        .special-event-content h1,
        .special-event-content h2,
        .special-event-content h3 {
          margin-top: 1rem;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #222222;
        }
        .special-event-content h1 {
          font-size: 2rem;
        }
        .special-event-content h2 {
          font-size: 1.5rem;
        }
        .special-event-content h3 {
          font-size: 1.25rem;
        }
        .special-event-content p {
          margin-bottom: 1rem;
          color: #333333;
        }
        .special-event-content ul {
          margin-bottom: 1rem;
          padding-left: 1.5rem;
        }
        .special-event-content li {
          margin-bottom: 0.5rem;
        }
        .special-event-content strong {
          font-weight: 600;
          color: #222222;
        }
        .special-event-content a {
          color: #C6600D;
          text-decoration: none;
        }
        .special-event-content a:hover {
          text-decoration: underline;
        }
      `;
      document.head.appendChild(styleSheet);
      console.log('Split markdown widget styles added');
    } catch (e) {
      console.warn('Could not add split markdown widget styles:', e);
    }

    // Register the widget
    CMS.registerWidget('split-markdown', SplitMarkdownWidget);
    console.log('Split markdown widget registered');
  }

  // Start registration
  registerWidget();
})();
