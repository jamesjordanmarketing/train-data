const fs = require('fs');
const path = require('path');

// Load extracted journey data
const journeyData = require('../_mapping/extracted-journey-data.json');

function consolidatePersonaCriteria(ujElement) {
  const consolidated = {
    id: ujElement.id,
    name: ujElement.name,
    baseCriteria: [],
    progressiveFeatures: [],
    advancedOptions: []
  };
  
  // Parse criteria text to identify persona-specific requirements
  const criteriaLines = ujElement.criteria.split('\n').filter(line => line.trim());
  
  criteriaLines.forEach(line => {
    // Detect persona indicators
    if (line.includes('business owner') || line.includes('simple')) {
      consolidated.baseCriteria.push(line);
    } else if (line.includes('expert') || line.includes('advanced')) {
      consolidated.progressiveFeatures.push(line);
    } else if (line.includes('API') || line.includes('programmatic')) {
      consolidated.advancedOptions.push(line);
    } else {
      // Common to all personas
      consolidated.baseCriteria.push(line);
    }
  });
  
  // Generate unified criterion
  consolidated.unified = generateUnifiedCriterion(consolidated);
  
  return consolidated;
}

function generateUnifiedCriterion(consolidated) {
  return {
    description: `Unified requirement supporting all user types`,
    acceptanceCriteria: [
      ...consolidated.baseCriteria.map(c => `[BASE] ${c}`),
      ...consolidated.progressiveFeatures.map(c => `[PROGRESSIVE] ${c}`),
      ...consolidated.advancedOptions.map(c => `[ADVANCED] ${c}`)
    ],
    progressiveDisclosure: {
      level1: 'Basic features for new users',
      level2: 'Extended features for experienced users',
      level3: 'Advanced features for power users'
    }
  };
}

// Process all UJ elements
const consolidatedData = journeyData.ujElements.map(consolidatePersonaCriteria);

// Save consolidated data
fs.writeFileSync(
  path.join(__dirname, '../_mapping/consolidated-journey-criteria.json'),
  JSON.stringify(consolidatedData, null, 2)
);

console.log(`Consolidated ${consolidatedData.length} UJ elements`);
