import { createClient } from '@supabase/supabase-js';

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // Find the existing user
  const { data: list, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) { console.error(listError.message); process.exit(1); }

  const existing = list.users.find(u => u.email === 'knallandighal@gmail.com');
  if (!existing) { console.error('User not found'); process.exit(1); }

  const { data, error } = await supabase.auth.admin.updateUserById(existing.id, {
    password: 'Testpassword123#',
    email_confirm: true,
  });

  if (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } else {
    console.log('Password set for:', data.user.email);
  }
}

main();
