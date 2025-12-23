// Backend hook for updating config.toml when banner event changes
// This script should be loaded after Decap CMS initializes

(function() {
  'use strict';

  // Gradient mappings
  const gradientMap = {
    'newyear': '27deg, rgb(191,25,141) 0%, rgb(91,8,66) 100%',
    'valentine': '27deg, rgb(243,49,236) 0%, rgb(108,21,105) 100%',
    'patrick': '27deg, rgb(156,203,59) 0%, rgb(77,184,72) 100%',
    'easter': '27deg, rgb(209,197,41) 0%, rgb(220,205,5) 100%',
    'spring': '27deg, rgb(59,170,223) 0%, rgb(247,248,249) 120%',
    'summer': '27deg, rgb(135,206,235) 0%, rgb(248,255,52) 100%',
    'fall': '27deg, rgb(99,49,4) 0%, rgb(255,209,3) 100%',
    'thxgiving': '27deg, rgb(166,98,5) 0%, rgb(214,148,58) 100%',
    'xmas': '27deg, rgb(194,31,31) 0%, rgb(110,4,7) 100%',
    'winter': '20deg, rgb(72,178,199) 0%, rgb(37,92,102) 100%'
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
    'winter': 'Winter'
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
    
    // Monitor for changes to homepage.yml via postSave hook (more reliable)
    if (CMS.registerEventListener) {
      CMS.registerEventListener({
        name: 'postSave',
        handler: async ({ entry }) => {
          // Check if this is the banner config entry
          const collection = entry.get('collection');
          const collectionName = collection && typeof collection.get === 'function' 
            ? collection.get('name') 
            : (typeof collection === 'string' ? collection : null);
          
          if (collectionName === 'banner_config') {
            console.log('Banner config saved, checking for event change...');
            const data = entry.get('data');
            const eventValue = data.getIn(['seasonal', 'event']);
            if (eventValue && eventValue !== lastSavedEvent) {
              lastSavedEvent = eventValue;
              console.log('Banner event changed on save:', eventValue);
              
              // Try multiple ways to get the backend, with retries
              const tryUpdateConfig = async (attempt = 1, maxAttempts = 5) => {
                let backend = null;
                
                // Method 1: CMS.getBackend()
                try {
                  backend = CMS.getBackend();
                } catch (e) {
                  console.log('Method 1 (getBackend) failed:', e.message);
                }
                
                // Method 2: Try from CMS store
                if (!backend && CMS.store) {
                  try {
                    const state = CMS.store.getState();
                    if (state && state.config) {
                      backend = state.config.get('backend');
                    }
                  } catch (e) {
                    console.log('Method 2 (store) failed:', e.message);
                  }
                }
                
                // Method 3: Try from window object
                if (!backend && window.CMS && window.CMS.getBackend) {
                  try {
                    backend = window.CMS.getBackend();
                  } catch (e) {
                    console.log('Method 3 (window.CMS) failed:', e.message);
                  }
                }
                
                if (backend) {
                  console.log('Backend found, updating config.toml...');
                  try {
                    await updateConfigTomlFile(backend, eventValue);
                    return; // Success
                  } catch (error) {
                    console.warn('Error updating config.toml:', error);
                    if (attempt < maxAttempts) {
                      console.log(`Retrying... (attempt ${attempt + 1}/${maxAttempts})`);
                      setTimeout(() => tryUpdateConfig(attempt + 1, maxAttempts), 1000 * attempt);
                    }
                  }
                } else {
                  console.warn(`Backend not available (attempt ${attempt}/${maxAttempts})`);
                  if (attempt < maxAttempts) {
                    setTimeout(() => tryUpdateConfig(attempt + 1, maxAttempts), 1000 * attempt);
                  } else {
                    console.error('Failed to get backend after all attempts');
                    console.warn('Note: If you are using local_backend, updating config.toml may not be supported.');
                    console.warn('This feature should work in production with the GitHub backend.');
                  }
                }
              };
              
              // Start trying after a short delay
              setTimeout(() => {
                tryUpdateConfig();
              }, 1000);
            }
          }
        }
      });
    }
    
    // Also monitor for changes to homepage.yml via MutationObserver (fallback)
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
                  console.log('Banner event detected via MutationObserver:', eventValue);
                  
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

    // Store pending event updates that need to be processed when backend is ready
    let pendingEventUpdates = [];
    
    // Function to process pending updates
    async function processPendingUpdates() {
      if (pendingEventUpdates.length === 0) return;
      
      const backend = CMS.getBackend();
      if (!backend) {
        // Backend still not ready, will retry later
        return;
      }
      
      // Process all pending updates
      const updates = [...pendingEventUpdates];
      pendingEventUpdates = [];
      
      for (const eventValue of updates) {
        console.log('Processing pending event update:', eventValue);
        await updateConfigTomlFile(backend, eventValue);
      }
    }
    
    // Also listen for custom events from the widget
    window.addEventListener('bannerEventChanged', async (event) => {
      const eventValue = event.detail.eventValue;
      console.log('bannerEventChanged event received:', eventValue);
      if (eventValue) {
        const backend = CMS.getBackend();
        if (backend) {
          console.log('Backend available, updating config.toml...');
          await updateConfigTomlFile(backend, eventValue);
        } else {
          console.log('Backend not ready yet, storing event for later processing');
          // Store for later processing (deduplicate - only keep latest)
          pendingEventUpdates = [eventValue];
          // Retry after a delay
          setTimeout(processPendingUpdates, 1000);
          setTimeout(processPendingUpdates, 3000);
        }
      }
    });
    
    // Also try to process pending updates periodically
    setInterval(processPendingUpdates, 5000);

    console.log('Backend hook registered for banner config updates');
  }

  async function updateConfigTomlFile(backend, eventValue) {
    try {
      console.log('Attempting to update config.toml for event:', eventValue);
      
      // Try different methods to read config.toml depending on backend type
      let configContent = '';
      
      // Method 1: Try to get it as a file entry
      try {
        const configEntry = await backend.getEntry(null, 'config.toml');
        if (configEntry) {
          configContent = configEntry.get('content') || configEntry.get('raw') || '';
          if (configContent) {
            console.log('Successfully read config.toml via getEntry');
          }
        }
      } catch (e) {
        console.log('getEntry method failed, trying alternative:', e.message);
      }
      
      // Method 2: If that didn't work, try reading via API (for GitHub backend)
      if (!configContent && backend.readFile) {
        try {
          const file = await backend.readFile('config.toml', null, null);
          configContent = file || '';
          if (configContent) {
            console.log('Successfully read config.toml via readFile');
          }
        } catch (e) {
          console.log('readFile method failed:', e.message);
        }
      }
      
      if (!configContent) {
        console.warn('Could not read config.toml - backend may not support direct file access');
        return;
      }

      // Update the content
      const updatedContent = updateConfigTomlContent(configContent, eventValue);
      
      if (updatedContent === configContent) {
        console.log('No changes needed to config.toml');
        return;
      }
      
      // Save the updated config.toml
      // Try persistEntry first
      try {
        await backend.persistEntry({
          path: 'config.toml',
          slug: 'config',
          collection: 'config',
          dataFiles: [{
            path: 'config.toml',
            content: updatedContent
          }]
        });
        console.log('Successfully updated config.toml with gradient for', eventValue);
      } catch (persistError) {
        // If persistEntry fails, try writeFile (for local backend)
        console.log('persistEntry failed, trying writeFile:', persistError.message);
        if (backend.writeFile) {
          try {
            await backend.writeFile('config.toml', updatedContent, null, null);
            console.log('Successfully updated config.toml via writeFile');
          } catch (writeError) {
            console.error('writeFile also failed:', writeError);
            throw writeError;
          }
        } else {
          throw persistError;
        }
      }
    } catch (error) {
      console.error('Error updating config.toml:', error);
      console.error('Full error details:', error.stack);
    }
  }

  setupBackendHook();
})();
