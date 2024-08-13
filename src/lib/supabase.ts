import { createClient } from '@supabase/supabase-js';
export const supabase = createClient(
  'https://pvknicbdzbbdzzeqvsry.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2a25pY2JkemJiZHp6ZXF2c3J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjI5Mjc2OTIsImV4cCI6MjAzODUwMzY5Mn0.vMCK44FJ-CgofPA5hfOOJ6xXc1Ol3oKqf9Yi-6WAh-c'
);
