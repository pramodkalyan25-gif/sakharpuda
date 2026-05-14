import { supabase } from './src/config/supabaseClient.js';
async function test() {
  const { data, error } = await supabase.from('contact_details').select('*').limit(1);
  console.log('Data:', data, 'Error:', error);
}
test();
