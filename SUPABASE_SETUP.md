# Supabase Setup Guide

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up/Login with GitHub
4. Click "New Project"
5. Choose your organization
6. Fill in:
   - Name: `after-platform`
   - Database Password: (generate a strong password)
   - Region: Choose closest to you
7. Click "Create new project"

## Step 2: Get Your Keys

1. In your Supabase dashboard, go to Settings > API
2. Copy the following values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9`)

## Step 3: Update Environment Variables

1. Open `.env.local` in your project
2. Replace the placeholder values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 4: Create Database Tables

1. In Supabase dashboard, go to SQL Editor
2. Click "New Query"
3. Copy and paste this SQL:

```sql
-- Create users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'admin')),
    specialty VARCHAR(100),
    aura INTEGER DEFAULT 0,
    courses_completed INTEGER DEFAULT 0,
    hours_studied INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policy for users to read their own data
CREATE POLICY "Users can read own data" ON public.users
    FOR SELECT USING (auth.uid() = id);

-- Create policy for users to update their own data
CREATE POLICY "Users can update own data" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Create policy for users to insert their own data
CREATE POLICY "Users can insert own data" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, first_name, last_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'first_name', 'User'),
        COALESCE(NEW.raw_user_meta_data->>'last_name', 'Name')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create user profile
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

4. Click "Run" to execute the SQL

## Step 5: Test the Setup

1. Start your development server: `npm run dev`
2. Go to `http://localhost:3000/register`
3. Try creating a new account
4. Check your Supabase dashboard > Authentication > Users to see if the user was created
5. Try logging in with the new account

## Step 6: Configure Email (Optional)

For email confirmation and password reset:

1. Go to Authentication > Settings in Supabase
2. Configure your email provider (or use Supabase's built-in email for testing)
3. Update email templates if needed

## Troubleshooting

### Common Issues:

1. **"Invalid API key"**: Check your environment variables are correct
2. **"User not found"**: Make sure the users table was created properly
3. **"Row Level Security"**: Ensure RLS policies are set up correctly

### Test Connection:

Add this to any page to test your Supabase connection:

```typescript
import { supabase } from "@/lib/supabase";

// Test connection
const testConnection = async () => {
  const { data, error } = await supabase.from("users").select("count");
  console.log("Supabase connection:", { data, error });
};
```

## Next Steps

Once login is working:

1. Add course tables
2. Implement course enrollment
3. Add progress tracking
4. Set up real-time features

## Security Notes

- Never commit your `.env.local` file
- The anon key is safe to use in frontend (it's public)
- Row Level Security (RLS) protects your data
- Always validate data on the server side
