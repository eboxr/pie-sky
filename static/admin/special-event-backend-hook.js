// Backend hook to transform special_event data structure
// 1. On load: Transform nested structure to flat keys for form fields
// 2. On save: Transform flat keys back to nested structure for Hugo

(function() {
  'use strict';

  function setupBackendHook() {
    if (typeof window === 'undefined' || !window.CMS) {
      setTimeout(setupBackendHook, 200);
      return;
    }

    const CMS = window.CMS;
    
    // Register preSave hook to transform flat keys to nested structure when saving
    if (typeof CMS.registerEventListener === 'function') {
      CMS.registerEventListener({
        name: 'preSave',
        handler: ({ entry, collection }) => {
          // Only process special_event_config collection
          if (collection && collection.get('name') === 'special_event_config') {
            try {
              const data = entry.get('data');
              if (!data) return entry;
              
              // Check if we have flat keys (special_event.enable, special_event.content)
              const hasFlatKeys = data.has('special_event.enable') || data.has('special_event.content');
              
              if (hasFlatKeys) {
                // Transform flat keys to nested structure for Hugo
                let newData = data;
                
                // Extract values from flat keys
                const enable = data.get('special_event.enable');
                const content = data.get('special_event.content');
                const image = data.get('special_event.image');
                const imageAlt = data.get('special_event.imageAlt');
                
                // Remove flat keys
                newData = newData.delete('special_event.enable');
                newData = newData.delete('special_event.content');
                newData = newData.delete('special_event.image');
                newData = newData.delete('special_event.imageAlt');
                
                // Create nested structure
                const specialEventData = {};
                if (enable !== undefined) specialEventData.enable = enable;
                if (content !== undefined) specialEventData.content = content;
                if (image !== undefined) specialEventData.image = image;
                if (imageAlt !== undefined) specialEventData.imageAlt = imageAlt;
                
                // Set nested structure
                newData = newData.set('special_event', specialEventData);
                
                // Update entry with transformed data
                entry = entry.set('data', newData);
                
                console.log('✅ Transformed special_event flat keys to nested structure for save');
              }
            } catch (e) {
              console.error('Error transforming special_event data on save:', e);
            }
          }
          
          return entry;
        }
      });
      
      // Also hook into the backend to transform data when loading
      setTimeout(function() {
        if (CMS.store && CMS.store.subscribe) {
          let lastEntry = null;
          
          CMS.store.subscribe(function() {
            try {
              const state = CMS.store.getState();
              if (state && state.editor) {
                const entry = state.editor.get('entry');
                const collection = state.editor.get('collection');
                
                if (entry && collection && collection.get('name') === 'special_event_config' && entry !== lastEntry) {
                  lastEntry = entry;
                  
                  const data = entry.get('data');
                  if (data) {
                    // Check if we have nested structure (special_event object)
                    const specialEvent = data.get('special_event');
                    
                    if (specialEvent && typeof specialEvent.toJS === 'function') {
                      const specialEventObj = specialEvent.toJS();
                      
                      // Transform nested structure to flat keys for form fields
                      let newData = data;
                      
                      // Remove nested structure
                      newData = newData.delete('special_event');
                      
                      // Add flat keys
                      if (specialEventObj.enable !== undefined) {
                        newData = newData.set('special_event.enable', specialEventObj.enable);
                      }
                      if (specialEventObj.content !== undefined) {
                        newData = newData.set('special_event.content', specialEventObj.content);
                      }
                      if (specialEventObj.image !== undefined) {
                        newData = newData.set('special_event.image', specialEventObj.image);
                      }
                      if (specialEventObj.imageAlt !== undefined) {
                        newData = newData.set('special_event.imageAlt', specialEventObj.imageAlt);
                      }
                      
                      // Update entry in store
                      const newEntry = entry.set('data', newData);
                      CMS.store.dispatch({
                        type: 'ENTRY_LOAD',
                        payload: newEntry
                      });
                      
                      console.log('✅ Transformed special_event nested structure to flat keys for form');
                    }
                  }
                }
              }
            } catch (e) {
              // Silently handle errors
            }
          });
        }
      }, 1000);
      
      console.log('✅ Special event backend hook registered');
    }
  }

  setupBackendHook();
})();

