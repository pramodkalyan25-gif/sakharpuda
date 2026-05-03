import { supabase } from '../src/config/supabaseClient.js';

async function testSchema() {
  console.log('Testing Profiles Schema...');
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error fetching profiles:', error.message);
    console.error('Error Details:', JSON.stringify(error, null, 2));
  } else {
    console.log('Successfully fetched 1 profile.');
    if (data && data.length > 0) {
      console.log('Available Columns:', Object.keys(data[0]));
    } else {
      console.log('No profiles found in the table.');
    }
  }
}

testSchema();
