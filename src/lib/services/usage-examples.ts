/**
 * Template Management Services - Usage Examples
 * 
 * Demonstrates practical usage patterns for the Template, Scenario,
 * and Edge Case services with real-world scenarios.
 * 
 * @example
 * Run these examples in your application code after setting up services
 */

import { supabase } from '../supabase';
import {
  createTemplateService,
  createScenarioService,
  createEdgeCaseService,
} from './index';

// ============================================================================
// Initialize Services
// ============================================================================

const templateService = createTemplateService(supabase as any);
const scenarioService = createScenarioService(supabase as any);
const edgeCaseService = createEdgeCaseService(supabase as any);

// ============================================================================
// Example 1: Create Complete Template Hierarchy
// ============================================================================

export async function createTemplateHierarchy(userId: string) {
  console.log('📝 Creating template hierarchy...\n');

  // Step 1: Create template
  const template = await templateService.create({
    name: 'Financial Planning Discussion',
    description: 'Comprehensive financial planning conversation template',
    category: 'Financial Planning',
    structure: 'Discuss {{topic}} with {{client_name}}, focusing on {{timeframe}} goals. Address concerns about {{concern}}.',
    variables: [
      {
        name: 'topic',
        type: 'dropdown',
        defaultValue: 'retirement planning',
        helpText: 'Main financial planning topic',
        options: ['retirement planning', 'investment strategy', 'tax planning', 'estate planning']
      },
      {
        name: 'client_name',
        type: 'text',
        defaultValue: 'the client',
        helpText: 'Client name or reference'
      },
      {
        name: 'timeframe',
        type: 'dropdown',
        defaultValue: 'long-term',
        helpText: 'Planning timeframe',
        options: ['short-term', 'medium-term', 'long-term']
      },
      {
        name: 'concern',
        type: 'text',
        defaultValue: 'market volatility',
        helpText: 'Primary client concern'
      }
    ],
    tone: 'Professional, empathetic, and reassuring',
    complexityBaseline: 6,
    qualityThreshold: 0.75,
    requiredElements: ['goal_clarification', 'risk_assessment', 'action_plan', 'timeline'],
    applicablePersonas: ['Anxious Investor', 'Confident Planner', 'First-time Investor'],
    applicableEmotions: ['Anxious', 'Hopeful', 'Confused', 'Determined'],
    tier: 'template',
    isActive: true,
    createdBy: userId
  });

  console.log(`✅ Created template: ${template.name} (ID: ${template.id})\n`);

  // Step 2: Create scenarios from template
  const scenarios = await scenarioService.bulkCreate([
    {
      name: 'Pre-Retirement Market Concerns',
      description: 'Client approaching retirement worried about market downturn',
      parentTemplateId: template.id,
      context: 'Client is 5 years from retirement with $800K saved. Recent 15% market decline has caused anxiety about retirement timeline.',
      parameterValues: {
        topic: 'retirement planning',
        client_name: 'Sarah',
        timeframe: 'long-term',
        concern: 'market volatility'
      },
      topic: 'Retirement Planning',
      persona: 'Anxious Investor',
      emotionalArc: 'Anxiety → Understanding → Reassurance',
      status: 'active',
      createdBy: userId
    },
    {
      name: 'Young Professional Starting Investment',
      description: 'First-time investor wanting to start building wealth',
      parentTemplateId: template.id,
      context: 'Client is 28 years old with stable income, wants to start investing but unsure where to begin. Has $50K saved.',
      parameterValues: {
        topic: 'investment strategy',
        client_name: 'Michael',
        timeframe: 'long-term',
        concern: 'making wrong choices'
      },
      topic: 'Investment Strategy',
      persona: 'First-time Investor',
      emotionalArc: 'Confusion → Clarity → Confidence',
      status: 'active',
      createdBy: userId
    }
  ]);

  console.log(`✅ Created ${scenarios.length} scenarios\n`);

  // Step 3: Create edge cases for first scenario
  const edgeCases = await Promise.all([
    edgeCaseService.create({
      title: 'Negative Account Balance During Downturn',
      description: 'What happens if market crash causes account to go negative',
      parentScenarioId: scenarios[0].id,
      edgeCaseType: 'error_condition',
      complexity: 8,
      createdBy: userId
    }),
    edgeCaseService.create({
      title: 'Extreme Market Recovery',
      description: 'How to handle if market rebounds 50% in one year',
      parentScenarioId: scenarios[0].id,
      edgeCaseType: 'unusual_input',
      complexity: 6,
      createdBy: userId
    }),
    edgeCaseService.create({
      title: 'Multiple Simultaneous Crises',
      description: 'Market crash + health emergency + job loss all at once',
      parentScenarioId: scenarios[0].id,
      edgeCaseType: 'complex_combination',
      complexity: 9,
      createdBy: userId
    })
  ]);

  console.log(`✅ Created ${edgeCases.length} edge cases\n`);

  return { template, scenarios, edgeCases };
}

// ============================================================================
// Example 2: Query and Filter
// ============================================================================

export async function demonstrateFiltering() {
  console.log('🔍 Demonstrating filtering capabilities...\n');

  // Find high-quality active templates
  const premiumTemplates = await templateService.getAll({
    isActive: true,
    minRating: 4,
    category: 'Financial Planning'
  });
  console.log(`Found ${premiumTemplates.length} premium financial planning templates\n`);

  // Find scenarios needing conversation generation
  const pendingScenarios = await scenarioService.getAll({
    generationStatus: 'not_generated',
    status: 'active'
  });
  console.log(`Found ${pendingScenarios.length} scenarios pending generation\n`);

  // Find untested high-complexity edge cases
  const criticalEdgeCases = await edgeCaseService.getAll({
    testStatus: 'not_tested',
    minComplexity: 8
  });
  console.log(`Found ${criticalEdgeCases.length} critical untested edge cases\n`);

  return { premiumTemplates, pendingScenarios, criticalEdgeCases };
}

// ============================================================================
// Example 3: Conversation Generation Workflow
// ============================================================================

export async function conversationGenerationWorkflow(scenarioId: string) {
  console.log('🤖 Starting conversation generation workflow...\n');

  // Get scenario
  const scenario = await scenarioService.getById(scenarioId);
  if (!scenario) {
    throw new Error('Scenario not found');
  }

  console.log(`Generating conversation for: ${scenario.name}\n`);

  try {
    // Mark as generating
    await scenarioService.updateGenerationStatus(scenarioId, 'not_generated');

    // TODO: Call your AI generation service here
    // const conversation = await generateConversation(scenario);
    const mockConversationId = 'generated-conversation-id';

    // Mark as generated successfully
    await scenarioService.updateGenerationStatus(
      scenarioId,
      'generated',
      mockConversationId
    );

    console.log('✅ Conversation generated successfully\n');

    // Increment template usage count
    if (scenario.parentTemplateId) {
      await templateService.incrementUsageCount(scenario.parentTemplateId);
      console.log('📊 Incremented template usage count\n');
    }

    return mockConversationId;
  } catch (error) {
    // Mark as error
    await scenarioService.updateGenerationStatus(
      scenarioId,
      'error',
      undefined,
      error instanceof Error ? error.message : 'Unknown error'
    );

    console.error('❌ Generation failed:', error);
    throw error;
  }
}

// ============================================================================
// Example 4: Template Management Workflow
// ============================================================================

export async function templateManagementWorkflow(userId: string) {
  console.log('⚙️ Demonstrating template management...\n');

  // Create initial template
  const template = await templateService.create({
    name: 'Basic Investment Advice',
    description: 'Simple investment guidance template',
    category: 'Investment',
    structure: 'Provide investment advice for {{situation}}',
    variables: [
      {
        name: 'situation',
        type: 'text',
        defaultValue: 'general investing',
        helpText: 'Investment situation or context'
      }
    ],
    tone: 'Professional',
    complexityBaseline: 4,
    qualityThreshold: 0.7,
    requiredElements: ['risk_assessment', 'recommendations'],
    tier: 'template',
    isActive: true,
    createdBy: userId
  });
  console.log(`✅ Created template: ${template.id}\n`);

  // Update template after review
  const updated = await templateService.update(template.id, {
    description: 'Enhanced investment guidance with risk profiling',
    complexityBaseline: 5,
    qualityThreshold: 0.75,
    requiredElements: ['risk_assessment', 'portfolio_recommendations', 'timeline']
  });
  console.log('✅ Updated template with enhanced requirements\n');

  // Duplicate for variation
  const duplicate = await templateService.duplicate(
    template.id,
    'Basic Investment Advice (Aggressive Strategy)'
  );
  console.log(`✅ Created duplicate: ${duplicate.id}\n`);

  // Try to delete (will fail if scenarios exist)
  const deleteResult = await templateService.delete(template.id);
  if (deleteResult.success) {
    console.log('✅ Template deleted successfully\n');
  } else {
    console.log(`⚠️ Cannot delete: ${deleteResult.message}\n`);
  }

  return { template, updated, duplicate };
}

// ============================================================================
// Example 5: Edge Case Testing Workflow
// ============================================================================

export async function edgeCaseTestingWorkflow(scenarioId: string, userId: string) {
  console.log('🧪 Starting edge case testing workflow...\n');

  // Create edge case
  const edgeCase = await edgeCaseService.create({
    title: 'Invalid Investment Amount',
    description: 'User attempts to invest negative amount',
    parentScenarioId: scenarioId,
    edgeCaseType: 'error_condition',
    complexity: 5,
    createdBy: userId
  });
  console.log(`✅ Created edge case: ${edgeCase.title}\n`);

  // Simulate testing
  console.log('🔬 Running test...\n');

  // Test passed
  await edgeCaseService.updateTestStatus(edgeCase.id, 'passed', {
    expectedBehavior: 'System should reject negative investment and show error message',
    actualBehavior: 'System correctly rejected negative amount with message: "Investment amount must be positive"',
    passed: true,
    testDate: new Date().toISOString()
  });
  console.log('✅ Test passed!\n');

  // Get all untested edge cases for this scenario
  const untested = await edgeCaseService.getAll({
    parentScenarioId: scenarioId,
    testStatus: 'not_tested'
  });
  console.log(`📊 ${untested.length} edge cases remaining to test\n`);

  return edgeCase;
}

// ============================================================================
// Example 6: Reporting and Analytics
// ============================================================================

export async function generateAnalyticsReport() {
  console.log('📊 Generating analytics report...\n');

  // Get all templates
  const allTemplates = await templateService.getAll();
  
  // Calculate statistics
  const activeCount = allTemplates.filter(t => t.isActive).length;
  const avgRating = allTemplates.reduce((sum, t) => sum + t.rating, 0) / allTemplates.length;
  const totalUsage = allTemplates.reduce((sum, t) => sum + t.usageCount, 0);

  console.log('Template Statistics:');
  console.log(`  Total Templates: ${allTemplates.length}`);
  console.log(`  Active Templates: ${activeCount}`);
  console.log(`  Average Rating: ${avgRating.toFixed(2)}`);
  console.log(`  Total Usage: ${totalUsage}\n`);

  // Get scenario statistics
  const allScenarios = await scenarioService.getAll();
  const scenariosByStatus = {
    draft: allScenarios.filter(s => s.status === 'draft').length,
    active: allScenarios.filter(s => s.status === 'active').length,
    archived: allScenarios.filter(s => s.status === 'archived').length
  };
  const scenariosByGeneration = {
    not_generated: allScenarios.filter(s => s.generationStatus === 'not_generated').length,
    generated: allScenarios.filter(s => s.generationStatus === 'generated').length,
    error: allScenarios.filter(s => s.generationStatus === 'error').length
  };

  console.log('Scenario Statistics:');
  console.log(`  Total Scenarios: ${allScenarios.length}`);
  console.log(`  By Status: Draft=${scenariosByStatus.draft}, Active=${scenariosByStatus.active}, Archived=${scenariosByStatus.archived}`);
  console.log(`  By Generation: Not Generated=${scenariosByGeneration.not_generated}, Generated=${scenariosByGeneration.generated}, Error=${scenariosByGeneration.error}\n`);

  // Get edge case statistics
  const allEdgeCases = await edgeCaseService.getAll();
  const edgeCasesByStatus = {
    not_tested: allEdgeCases.filter(e => e.testStatus === 'not_tested').length,
    passed: allEdgeCases.filter(e => e.testStatus === 'passed').length,
    failed: allEdgeCases.filter(e => e.testStatus === 'failed').length
  };
  const avgComplexity = allEdgeCases.reduce((sum, e) => sum + e.complexity, 0) / allEdgeCases.length;

  console.log('Edge Case Statistics:');
  console.log(`  Total Edge Cases: ${allEdgeCases.length}`);
  console.log(`  By Test Status: Not Tested=${edgeCasesByStatus.not_tested}, Passed=${edgeCasesByStatus.passed}, Failed=${edgeCasesByStatus.failed}`);
  console.log(`  Average Complexity: ${avgComplexity.toFixed(2)}\n`);

  return {
    templates: { total: allTemplates.length, active: activeCount, avgRating, totalUsage },
    scenarios: { total: allScenarios.length, byStatus: scenariosByStatus, byGeneration: scenariosByGeneration },
    edgeCases: { total: allEdgeCases.length, byStatus: edgeCasesByStatus, avgComplexity }
  };
}

// ============================================================================
// Example 7: Error Handling Patterns
// ============================================================================

export async function demonstrateErrorHandling(templateId: string, scenarioId: string) {
  console.log('⚠️ Demonstrating error handling patterns...\n');

  // Pattern 1: Check existence before operations
  const template = await templateService.getById(templateId);
  if (!template) {
    console.log('❌ Template not found - handle gracefully\n');
    return;
  }

  // Pattern 2: Handle delete dependencies
  const deleteResult = await templateService.delete(templateId);
  if (!deleteResult.success) {
    console.log(`⚠️ Delete blocked: ${deleteResult.message}`);
    console.log('→ Suggestion: Archive template instead or delete dependent scenarios first\n');
  }

  // Pattern 3: Try-catch for unexpected errors
  try {
    await scenarioService.update('invalid-id', { name: 'New Name' });
  } catch (error) {
    if (error instanceof Error) {
      console.log(`❌ Update failed: ${error.message}\n`);
    }
  }

  // Pattern 4: Validation errors
  try {
    await edgeCaseService.create({
      title: '',  // Invalid - empty title
      description: 'Test',
      parentScenarioId: scenarioId,
      edgeCaseType: 'error_condition',
      complexity: 15,  // Invalid - out of range
      createdBy: 'test-user'
    });
  } catch (error) {
    if (error instanceof Error) {
      console.log(`❌ Validation failed: ${error.message}\n`);
    }
  }
}

// ============================================================================
// Run All Examples
// ============================================================================

export async function runAllExamples(userId: string) {
  console.log('🚀 Running all usage examples...\n');
  console.log('='.repeat(60) + '\n');

  try {
    // Example 1
    console.log('EXAMPLE 1: Create Template Hierarchy');
    console.log('-'.repeat(60));
    const hierarchy = await createTemplateHierarchy(userId);
    console.log('='.repeat(60) + '\n');

    // Example 2
    console.log('EXAMPLE 2: Query and Filter');
    console.log('-'.repeat(60));
    await demonstrateFiltering();
    console.log('='.repeat(60) + '\n');

    // Example 3
    console.log('EXAMPLE 3: Conversation Generation');
    console.log('-'.repeat(60));
    await conversationGenerationWorkflow(hierarchy.scenarios[0].id);
    console.log('='.repeat(60) + '\n');

    // Example 4
    console.log('EXAMPLE 4: Template Management');
    console.log('-'.repeat(60));
    await templateManagementWorkflow(userId);
    console.log('='.repeat(60) + '\n');

    // Example 5
    console.log('EXAMPLE 5: Edge Case Testing');
    console.log('-'.repeat(60));
    await edgeCaseTestingWorkflow(hierarchy.scenarios[0].id, userId);
    console.log('='.repeat(60) + '\n');

    // Example 6
    console.log('EXAMPLE 6: Analytics Report');
    console.log('-'.repeat(60));
    await generateAnalyticsReport();
    console.log('='.repeat(60) + '\n');

    // Example 7
    console.log('EXAMPLE 7: Error Handling');
    console.log('-'.repeat(60));
    await demonstrateErrorHandling(hierarchy.template.id, hierarchy.scenarios[0].id);
    console.log('='.repeat(60) + '\n');

    console.log('✅ All examples completed successfully!\n');
  } catch (error) {
    console.error('❌ Error running examples:', error);
    throw error;
  }
}

