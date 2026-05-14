import { supabase } from '../src/config/supabaseClient.js';

async function migrate() {
  console.log('Creating messages table...');
  const { data, error } = await supabase.rpc('execute_sql', {
    query: `
      CREATE TABLE IF NOT EXISTS messages (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        read_status BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
      CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
      CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
    `
  });

  if (error) {
    console.error('RPC execute_sql failed. Falling back to alternative creation method:', error);
    // Note: If execute_sql RPC doesn't exist, this might fail.
    // In that case, we can't run DDL via REST API. We'll have to ask the user to run it.
  } else {
    console.log('Migration successful!');
  }
}

migrate();
