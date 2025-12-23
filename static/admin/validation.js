// Custom validation for pie collections
// Note: The main fix is in config.yml where price fields are no longer required: true
// This allows saving pies when displayPrice is false, even without a price
// This file is kept for potential future enhancements but the config change is the primary solution

(function() {
  'use strict';
  console.log('✅ Price field validation: Price is now optional and can be saved when displayPrice is false');
})();
