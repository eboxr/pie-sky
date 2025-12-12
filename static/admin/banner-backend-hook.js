// Backend hook for updating config.toml when banner event changes
// This script should be loaded after Decap CMS initializes

(function() {
  'use strict';

  // Gradient mappings
  const gradientMap = {
    'regular': null,
    'newyear': '27deg, rgb(191,25,141) 0%, rgb(91,8,66) 100%',
    'valentine': '27deg, rgb(243,49,236) 0%, rgb(108,21,105) 100%',
    'patrick': '27deg, rgb(156,203,59) 0%, rgb(77,184,72) 100%',
    'easter': '27deg, rgb(209,197,41) 0%, rgb(220,205,5) 100%',
    'spring': '27deg, rgb(59,170,223) 0%, rgb(247,248,249) 100%',
    'national': '20deg, rgb(72,178,199) 0%, rgb(37,92,102) 100%',
    'summer': '27deg, rgb(135,206,235) 0%, rgb(248,255,52) 100%',
    'fall': '27deg, rgb(99,49,4) 0%, rgb(255,209,3) 100%',
    'thxgiving': '27deg, rgb(166,98,5) 0%, rgb(214,148,58) 100%',
    'xmas': '27deg, rgb(194,31,31) 0%, rgb(110,4,7) 100%'
  };

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

  function updateConfigTomlContent(content, eventValue) {
    const gradient = gradientMap[eventValue];
    const commentText = eventCommentMap[eventValue];
    
    if (!gradient || !commentText) {
      return content; // No change needed
    }

    // Comment out all existing active gradient lines
    content = content.replace(/^gradient\s*=\s*"[^"]*"/gm, (match) => {
      return '# ' + match;
    });
    
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
      const styleSectionEnd = content.indexOf('# ThanksGiving');
      if (styleSectionEnd !== -1) {
        const before = content.substring(0, styleSectionEnd);
        const after = content.substring(styleSectionEnd);
        content = before + `# ${commentText}\ngradient = "${gradient}"\n` + after;
      }
    }
    
    return content;
  }

  // Store the last saved event value
  let lastSavedEvent = null;

  // Wait for CMS to initialize
  function setupBackendHook() {
    if (typeof window === 'undefined' || !window.CMS) {
      setTimeout(setupBackendHook, 200);
      return;
    }

    const CMS = window.CMS;
    
    // Monitor for changes to homepage.yml
    // Use a MutationObserver to watch for save events
    const observer = new MutationObserver(() => {
      // Check if a save just completed by looking for success messages
      const successMessages = document.querySelectorAll('[class*="success"], [class*="Saved"]');
      if (successMessages.length > 0) {
        // A save just completed, check if it was homepage.yml
        setTimeout(async () => {
          try {
            const backend = CMS.getBackend();
            if (!backend) return;

            // Read homepage.yml to get current event
            const homepageEntry = await backend.getEntry(null, 'data/homepage.yml');
            if (homepageEntry) {
              const content = homepageEntry.get('content') || homepageEntry.get('raw') || '';
              const eventMatch = content.match(/event:\s*(\w+)/);
              if (eventMatch) {
                const eventValue = eventMatch[1].trim();
                if (eventValue !== lastSavedEvent) {
                  lastSavedEvent = eventValue;
                  console.log('Banner event detected:', eventValue);
                  
                  // Update config.toml
                  await updateConfigTomlFile(backend, eventValue);
                }
              }
            }
          } catch (error) {
            console.error('Error in backend hook:', error);
          }
        }, 1000);
      }
    });

    // Observe the document for changes
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Also listen for custom events from the widget
    window.addEventListener('bannerEventChanged', async (event) => {
      const eventValue = event.detail.eventValue;
      if (eventValue) {
        const backend = CMS.getBackend();
        if (backend) {
          await updateConfigTomlFile(backend, eventValue);
        }
      }
    });

    console.log('Backend hook registered for banner config updates');
  }

  async function updateConfigTomlFile(backend, eventValue) {
    try {
      // Read config.toml
      const configEntry = await backend.getEntry(null, 'config.toml');
      if (!configEntry) {
        console.warn('Could not read config.toml');
        return;
      }

      let configContent = configEntry.get('content') || configEntry.get('raw') || '';
      if (!configContent) {
        console.warn('Config.toml content is empty');
        return;
      }

      // Update the content
      configContent = updateConfigTomlContent(configContent, eventValue);
      
      // Save the updated config.toml
      await backend.persistEntry({
        path: 'config.toml',
        slug: 'config',
        collection: 'config',
        dataFiles: [{
          path: 'config.toml',
          content: configContent
        }]
      });
      
      console.log('Successfully updated config.toml with gradient for', eventValue);
    } catch (error) {
      console.error('Error updating config.toml:', error);
    }
  }

  setupBackendHook();
})();
