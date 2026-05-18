import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ruiewjgjlbnbweycydet.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1aWV3amdqbGJuYndleWN5ZGV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1MDkzMzMsImV4cCI6MjA5MjA4NTMzM30.rEdKXijwlntxr4MIIMZsyVaPMbgdf44uMfnM3cpQ58w';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const email = 'pramodkalyan25@gmail.com';
  console.log('Testing RPC check_email_exists for:', email);
  
  const { data: emailData, error: emailError } = await supabase.rpc('check_email_exists', { p_email: email });
  if (emailError) {
    console.error('RPC check_email_exists failed:', emailError);
  } else {
    console.log('RPC check_email_exists returned:', emailData, typeof emailData);
  }
  
  // Also query the profiles table directly to see if any completed profiles exist
  console.log('\nChecking all public.profiles entries in database:');
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('user_id, name');
    
  if (profileError) {
    console.error('Direct query to public.profiles failed:', profileError.message);
  } else {
    console.log('Completed Profiles found:', profileData?.length, 'rows.');
    profileData?.forEach(p => {
      console.log(`- Profile Owner: ${p.name} (UUID: ${p.user_id})`);
    });
  }
}

test();
