import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ruiewjgjlbnbweycydet.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1aWV3amdqbGJuYndleWN5ZGV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1MDkzMzMsImV4cCI6MjA5MjA4NTMzM30.rEdKXijwlntxr4MIIMZsyVaPMbgdf44uMfnM3cpQ58w';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAdminStatus() {
  const email = 'pramod.gogadare@zohomail.in';

  const { data, error } = await supabase
    .from('profiles')
    .select('user_id, name, is_admin')
    .eq('name', 'Pramod Gogadare'); // Assuming this is the name

  if (error) {
    console.error('Error fetching profile :', error);
    return;
  }

  if (!data || data.length === 0) {
    // Try searching by ID if we can find it
    console.log('No profile found with that name. Trying to list first 5 users...');
    const { data: users } = await supabase.from('profiles').select('user_id, name, is_admin').limit(5);
    console.log('Sample Users:', users);
  } else {
    console.log('Matching Profile:', data[0]);
  }
}

checkAdminStatus();
