// Custom widget for Banner Configuration that updates both homepage.yml and config.toml
// This widget stores the event value and updates config.toml on save

(function() {
  'use strict';

  // Gradient mappings for each event type
  const gradientMap = {
    'regular': null, // No gradient change needed for regular
    'newyear': '27deg, rgb(191,25,141) 0%, rgb(91,8,66) 100%',
    'valentine': '27deg, rgb(243,49,236) 0%, rgb(108,21,105) 100%',
    'patrick': '27deg, rgb(156,203,59) 0%, rgb(77,184,72) 100%',
    'easter': '27deg, rgb(209,197,41) 0%, rgb(220,205,5) 100%',
    'spring': '27deg, rgb(59,170,223) 0%, rgb(247,248,249) 100%',
    'national': '20deg, rgb(72,178,199) 0%, rgb(37,92,102) 100%', // Use Winter gradient
    'summer': '27deg, rgb(135,206,235) 0%, rgb(248,255,52) 100%',
    'fall': '27deg, rgb(99,49,4) 0%, rgb(255,209,3) 100%',
    'thxgiving': '27deg, rgb(166,98,5) 0%, rgb(214,148,58) 100%',
    'xmas': '27deg, rgb(194,31,31) 0%, rgb(110,4,7) 100%'
  };

  // Event to comment mapping
  const eventCommentMap = {
    'xmas': 'XMas',
    'thxgiving': 'ThanksGiving',
    'newyear': 'Newyear',
    'valentine': 'Valentine',
    'patrick': 'Patrick',
    'easter': 'Easter',
    'spring': 'Spring',
    'summer': 'Summer',
    'fall': 'Fall',
    'national': 'Winter',
    'regular': null
  };

  // Store pending updates
  let pendingEventUpdate = null;

  // Function to update config.toml with the new gradient
  async function updateConfigToml(eventValue) {
    if (!eventValue) {
      return;
    }

    const gradient = gradientMap[eventValue];
    const commentText = eventCommentMap[eventValue];
    
    // If no gradient mapping and not regular, don't update
    if (!gradient && eventValue !== 'regular') {
      return;
    }
    
    // For 'regular', we might want to keep current gradient or set a default
    if (eventValue === 'regular') {
      console.log('Regular event selected - no gradient change needed');
      return;
    }

    try {
      const CMS = window.CMS;
      if (!CMS) {
        console.warn('CMS not available');
        pendingEventUpdate = { eventValue, gradient, commentText };
        return;
      }

      // Get backend
      const backend = CMS.getBackend();
      if (!backend) {
        console.warn('Backend not available');
        pendingEventUpdate = { eventValue, gradient, commentText };
        return;
      }

      // Read config.toml
      let content = '';
      try {
        // Try to get the file through the backend
        const file = await backend.getEntry(null, 'config.toml');
        if (file) {
          content = file.get('content') || file.get('raw') || '';
        }
      } catch (e) {
        console.warn('Could not read config.toml via backend:', e);
        pendingEventUpdate = { eventValue, gradient, commentText };
        return;
      }

      if (!content) {
        console.warn('Config.toml content is empty');
        pendingEventUpdate = { eventValue, gradient, commentText };
        return;
      }
      
      // Comment out all existing active gradient lines
      content = content.replace(/^gradient\s*=\s*"[^"]*"/gm, (match) => {
        return '# ' + match;
      });
      
      if (commentText && gradient) {
        // Find the comment line for this event
        const commentPattern = new RegExp(`(^#\\s*${commentText}\\s*$)`, 'm');
        const commentMatch = content.match(commentPattern);
        
        if (commentMatch) {
          // Check if there's already a commented gradient after this comment
          const commentIndex = content.indexOf(commentMatch[0]);
          const afterComment = content.substring(commentIndex + commentMatch[0].length);
          const nextGradientMatch = afterComment.match(/^#\s*gradient\s*=\s*"[^"]*"/m);
          
          if (nextGradientMatch) {
            // Replace the commented gradient with active one
            const fullPattern = new RegExp(`(^#\\s*${commentText}\\s*$\\s*)#\\s*gradient\\s*=\\s*"[^"]*"`, 'm');
            content = content.replace(fullPattern, `$1gradient = "${gradient}"`);
          } else {
            // Add the gradient line after the comment
            content = content.replace(commentPattern, `$1\ngradient = "${gradient}"`);
          }
        } else {
          // Comment doesn't exist, add it with the gradient
          // Find the style section and add before the first commented gradient
          const styleSectionEnd = content.indexOf('# ThanksGiving');
          if (styleSectionEnd !== -1) {
            const before = content.substring(0, styleSectionEnd);
            const after = content.substring(styleSectionEnd);
            content = before + `# ${commentText}\ngradient = "${gradient}"\n` + after;
          }
        }
      }
      
      // Save the updated config.toml
      try {
        await backend.persistEntry({
          path: 'config.toml',
          slug: 'config',
          collection: 'config',
          dataFiles: [{
            path: 'config.toml',
            content: content
          }]
        });
        console.log('Successfully updated config.toml with gradient for', eventValue);
        pendingEventUpdate = null;
      } catch (saveError) {
        console.warn('Could not save config.toml directly:', saveError);
        pendingEventUpdate = { eventValue, gradient, commentText, content };
      }
    } catch (error) {
      console.error('Error updating config.toml:', error);
      pendingEventUpdate = { eventValue, gradient, commentText };
    }
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

    // Hook into save events to update config.toml after homepage.yml is saved
    if (CMS.registerEventListener) {
      CMS.registerEventListener({
        name: 'postSave',
        handler: ({ entry }) => {
          // Check if this is the banner config entry
          const collection = entry.get('collection');
          if (collection === 'banner_config') {
            const data = entry.get('data');
            const eventValue = data.getIn(['seasonal', 'event']);
            if (eventValue) {
              // Update config.toml after a short delay to ensure save is complete
              setTimeout(() => {
                updateConfigToml(eventValue);
              }, 1500);
            }
          }
        }
      });
    }

    // Create a custom select widget
    const BannerEventWidget = createClass({
      getInitialState() {
        return {
          value: this.props.value || 'regular'
        };
      },

      handleChange(event) {
        const value = event.target.value;
        this.setState({ value });
        
        // Call the original onChange to update homepage.yml
        this.props.onChange(value);
        
        // Dispatch custom event for backend hook
        if (window.dispatchEvent) {
          window.dispatchEvent(new CustomEvent('bannerEventChanged', {
            detail: { eventValue: value }
          }));
        }
        
        // Store for potential immediate update (may not work if backend not ready)
        pendingEventUpdate = { eventValue: value };
        
        // Try to update config.toml immediately (will retry on save if it fails)
        updateConfigToml(value);
      },

      render() {
        const { forID, classNameWrapper, field } = this.props;
        const { value } = this.state;
        
        return h('div', { className: classNameWrapper },
          h('label', { htmlFor: forID }, field.get('label', 'Seasonal Event')),
          h('select', {
            id: forID,
            value: value,
            onChange: this.handleChange,
            className: 'form-control'
          },
            field.get('options', []).map(option => 
              h('option', { key: option, value: option }, option)
            )
          ),
          field.get('hint') ? h('p', { 
            className: 'hint', 
            style: { fontSize: '0.875rem', color: '#666', marginTop: '0.5rem' } 
          }, field.get('hint')) : null
        );
      }
    });

    // Register the widget
    CMS.registerWidget('banner-event-select', BannerEventWidget);
    console.log('Banner event widget registered');
  }

  // Start registration
  registerWidget();
})();
