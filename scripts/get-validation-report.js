require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function getValidationReport() {
  const { data, error } = await supabase
    .from('conversations')
    .select('conversation_id, enrichment_status, validation_report, enrichment_error')
    .eq('conversation_id', '22c81ac0-781f-4dcf-ad01-b69a95a24d60')
    .single();

  if (error) {
    console.error('Error:', error);
    process.exit(1);
  } else {
    console.log(JSON.stringify(data, null, 2));
    process.exit(0);
  }
}

getValidationReport();
