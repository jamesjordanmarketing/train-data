const fs = require('fs');
const path = require('path');

// Configuration
const USER_JOURNEY_PATH = '../03.5-bmo-user-journey.md';
const OUTPUT_PATH = '../_mapping/extracted-journey-data.json';

// Extract all UJ elements and their acceptance criteria
function extractUserJourneyData() {
  const content = fs.readFileSync(path.join(__dirname, USER_JOURNEY_PATH), 'utf8');
  
  const extractedData = {
    stages: [],
    personas: [],
    ujElements: [],
    acceptanceCriteria: []
  };
  
  // Extract stages (Stage 1-6)
  const stageRegex = /\*\*STAGE (\d+): ([^*]+)\*\*/g;
  let match;
  while ((match = stageRegex.exec(content)) !== null) {
    extractedData.stages.push({
      number: match[1],
      name: match[2].trim(),
      startLine: match.index
    });
  }
  
  // Extract UJ elements
  const ujRegex = /- \*\*UJ(\d+\.\d+\.\d+): ([^*]+)\*\*/g;
  while ((match = ujRegex.exec(content)) !== null) {
    const ujNumber = match[1];
    const ujName = match[2].trim();
    
    // Extract acceptance criteria for this UJ
    const ujSection = content.substring(match.index, match.index + 2000);
    const criteriaMatch = ujSection.match(/User Journey Acceptance Criteria:([\s\S]*?)(?=\* User Story|Technical Notes)/);
    
    extractedData.ujElements.push({
      id: `UJ${ujNumber}`,
      name: ujName,
      criteria: criteriaMatch ? criteriaMatch[1].trim() : '',
      stage: Math.floor(parseFloat(ujNumber))
    });
  }
  
  // Extract personas
  const personaRegex = /### ([^(]+) \(([^)]+)\)/g;
  while ((match = personaRegex.exec(content)) !== null) {
    extractedData.personas.push({
      name: match[1].trim(),
      type: match[2].trim()
    });
  }
  
  // Save extracted data
  fs.writeFileSync(
    path.join(__dirname, OUTPUT_PATH),
    JSON.stringify(extractedData, null, 2)
  );
  
  console.log(`Extracted ${extractedData.ujElements.length} UJ elements`);
  console.log(`Extracted ${extractedData.personas.length} personas`);
  console.log(`Data saved to ${OUTPUT_PATH}`);
}

// Run extraction
extractUserJourneyData();
