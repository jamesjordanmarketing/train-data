/**
 * Investigation Script: Training File Metadata Defects
 * 
 * Purpose: Query database to understand why scaffolding keys, quality scores,
 * and scaffolding distribution are not being populated in full training files.
 * 
 * Investigating Critical Defects 1-4 from iteration-2-bug-fixing-step-2-full-file-review_v4.md
 */

require('dotenv').config({ path: '../.env.local' });
const saol = require('./dist/index.js');

async function investigateMetadataDefects() {
    console.log('=== Training File Metadata Investigation ===\n');

    try {
        // 1. Check conversations table schema
        console.log('1. Checking conversations table schema...\n');
        
        const schemaResult = await saol.agentQuery({
            rawSql: `
                SELECT column_name, data_type, is_nullable
                FROM information_schema.columns
                WHERE table_name = 'conversations'
                ORDER BY ordinal_position;
            `
        });

        if (schemaResult.success) {
            console.log('Conversations table columns:');
            schemaResult.data.forEach(col => {
                console.log(`  - ${col.column_name} (${col.data_type}, nullable: ${col.is_nullable})`);
            });
        } else {
            console.error('Schema query failed:', schemaResult.summary);
        }

        // 2. Check specific scaffolding columns for the 3 test conversations
        console.log('\n\n2. Checking scaffolding columns for test conversations...\n');
        
        const testConvIds = [
            '330dc058-6d75-4609-96f7-b6e87b39f536',
            '14009fa0-9609-4142-9002-6bd77a43beb6',
            '18dc6347-db6f-44f2-8728-0538236d3c0b'
        ];

        const scaffoldingResult = await saol.agentQuery({
            rawSql: `
                SELECT 
                    conversation_id,
                    persona_key,
                    emotional_arc_key,
                    topic_key,
                    quality_score,
                    empathy_score,
                    clarity_score,
                    appropriateness_score,
                    brand_voice_alignment,
                    tier,
                    enrichment_status
                FROM conversations
                WHERE conversation_id IN ('${testConvIds.join("','")}');
            `
        });

        if (scaffoldingResult.success) {
            console.log('Scaffolding data for test conversations:');
            scaffoldingResult.data.forEach(conv => {
                console.log(`\n  Conversation: ${conv.conversation_id}`);
                console.log(`    persona_key: ${conv.persona_key || '(null)'}`);
                console.log(`    emotional_arc_key: ${conv.emotional_arc_key || '(null)'}`);
                console.log(`    topic_key: ${conv.topic_key || '(null)'}`);
                console.log(`    quality_score: ${conv.quality_score || '(null)'}`);
                console.log(`    tier: ${conv.tier || '(null)'}`);
                console.log(`    enrichment_status: ${conv.enrichment_status || '(null)'}`);
            });
        } else {
            console.error('Scaffolding query failed:', scaffoldingResult.summary);
        }

        // 3. Check input_parameters JSONB column
        console.log('\n\n3. Checking input_parameters JSONB column...\n');
        
        const inputParamsResult = await saol.agentQuery({
            rawSql: `
                SELECT 
                    conversation_id,
                    jsonb_pretty(input_parameters) as input_params
                FROM conversations
                WHERE conversation_id IN ('${testConvIds.join("','")}')
                LIMIT 1;
            `
        });

        if (inputParamsResult.success && inputParamsResult.data.length > 0) {
            console.log('Sample input_parameters (first conversation):');
            console.log(inputParamsResult.data[0].input_params || '(null)');
        } else {
            console.error('input_parameters query failed or no data');
        }

        // 4. Check if input_parameters has scaffolding keys
        console.log('\n\n4. Extracting scaffolding keys from input_parameters JSONB...\n');
        
        const jsonbKeysResult = await saol.agentQuery({
            rawSql: `
                SELECT 
                    conversation_id,
                    input_parameters->>'persona_key' as ip_persona_key,
                    input_parameters->>'emotional_arc_key' as ip_arc_key,
                    input_parameters->>'training_topic_key' as ip_topic_key,
                    input_parameters->>'persona_name' as ip_persona_name,
                    input_parameters->>'emotional_arc_name' as ip_arc_name,
                    input_parameters->>'training_topic_name' as ip_topic_name
                FROM conversations
                WHERE conversation_id IN ('${testConvIds.join("','")}');
            `
        });

        if (jsonbKeysResult.success) {
            console.log('Scaffolding keys from input_parameters JSONB:');
            jsonbKeysResult.data.forEach(conv => {
                console.log(`\n  Conversation: ${conv.conversation_id}`);
                console.log(`    ip_persona_key: ${conv.ip_persona_key || '(null)'}`);
                console.log(`    ip_arc_key: ${conv.ip_arc_key || '(null)'}`);
                console.log(`    ip_topic_key: ${conv.ip_topic_key || '(null)'}`);
                console.log(`    ip_persona_name: ${conv.ip_persona_name || '(null)'}`);
                console.log(`    ip_arc_name: ${conv.ip_arc_name || '(null)'}`);
                console.log(`    ip_topic_name: ${conv.ip_topic_name || '(null)'}`);
            });
        } else {
            console.error('JSONB keys query failed:', jsonbKeysResult.summary);
        }

        // 5. Check training_files table schema
        console.log('\n\n5. Checking training_files table schema...\n');
        
        const tfSchemaResult = await saol.agentQuery({
            rawSql: `
                SELECT column_name, data_type, is_nullable
                FROM information_schema.columns
                WHERE table_name = 'training_files'
                ORDER BY ordinal_position;
            `
        });

        if (tfSchemaResult.success) {
            console.log('Training_files table columns:');
            tfSchemaResult.data.forEach(col => {
                console.log(`  - ${col.column_name} (${col.data_type}, nullable: ${col.is_nullable})`);
            });
        }

        console.log('\n\n=== Investigation Complete ===');

    } catch (error) {
        console.error('Unexpected error:', error);
    }
}

investigateMetadataDefects();
