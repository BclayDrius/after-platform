# Migration from Mock to Real Backend

## Step 1: Choose Your Backend Stack

### Option A: Supabase (Recommended for speed)

1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Run the SQL schema in the SQL editor
4. Install Supabase client:

```bash
npm install @supabase/supabase-js
```

### Option B: Custom Backend

1. Set up PostgreSQL database
2. Create backend API (Node.js/Express or Python/FastAPI)
3. Implement authentication with JWT
4. Create all the endpoints listed in apiService.ts

## Step 2: Replace Mock Services

### Update imports across the app:

```typescript
// Replace this:
import { mockAuthService } from "@/utils/mockAuth";

// With this:
import { apiService } from "@/services/apiService";
```

### Update method calls:

```typescript
// Replace:
await mockAuthService.login(email, password);

// With:
await apiService.login(email, password);
```

## Step 3: Environment Setup

1. Copy `.env.example` to `.env.local`
2. Fill in your actual API URL and secrets
3. Update `next.config.ts` if needed

## Step 4: Authentication Flow

### Update AuthGuard component:

```typescript
// Replace localStorage checks with API calls
const checkAuth = async () => {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) throw new Error("No token");

    // Verify token with backend
    await apiService.getUserProfile(userId);
    setIsAuthenticated(true);
  } catch (error) {
    setIsAuthenticated(false);
  }
};
```

## Step 5: Data Migration

### Seed the database with initial data:

```sql
-- Insert sample courses
INSERT INTO courses (title, description, level, duration_weeks) VALUES
('JavaScript Fundamentals', 'Learn JavaScript from scratch', 'Beginner', 12),
('React Development', 'Build modern web apps with React', 'Intermediate', 12);

-- Insert course weeks and lessons
-- (Use the data from mockCourseData.ts)
```

## Step 6: File Uploads (if needed)

For user avatars, assignment submissions, etc.:

### Option A: Supabase Storage

```typescript
import { supabase } from "@/lib/supabase";

const uploadFile = async (file: File, bucket: string, path: string) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file);

  if (error) throw error;
  return data;
};
```

### Option B: AWS S3 or Cloudinary

```bash
npm install aws-sdk
# or
npm install cloudinary
```

## Step 7: Real-time Features (Optional)

For live rankings, notifications, etc.:

### With Supabase:

```typescript
const subscription = supabase
  .channel("rankings")
  .on(
    "postgres_changes",
    { event: "*", schema: "public", table: "users" },
    (payload) => {
      // Update rankings in real-time
    }
  )
  .subscribe();
```

### With Socket.io:

```bash
npm install socket.io-client
```

## Step 8: Testing

1. Test all authentication flows
2. Test course enrollment and progress
3. Test ranking system
4. Test assignment submissions
5. Test contact form

## Step 9: Deployment

### Frontend (Vercel/Netlify):

```bash
npm run build
# Deploy to your preferred platform
```

### Backend Options:

- **Supabase**: Already hosted
- **Railway**: `railway deploy`
- **Heroku**: `git push heroku main`
- **DigitalOcean**: Use App Platform
- **AWS**: Use Elastic Beanstalk or ECS

## Step 10: Monitoring & Analytics

Add error tracking and analytics:

```bash
npm install @sentry/nextjs
npm install @vercel/analytics
```

## Common Issues & Solutions

### CORS Issues:

```typescript
// In your backend
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
```

### Token Refresh:

```typescript
// Implement automatic token refresh
const refreshToken = async () => {
  const refresh = localStorage.getItem("refreshToken");
  const response = await fetch("/api/auth/refresh", {
    method: "POST",
    headers: { Authorization: `Bearer ${refresh}` },
  });
  // Update tokens
};
```

### Database Performance:

- Add proper indexes (already in schema)
- Use connection pooling
- Implement caching for frequently accessed data

## Security Checklist

- [ ] Use HTTPS in production
- [ ] Validate all inputs on backend
- [ ] Implement rate limiting
- [ ] Use parameterized queries
- [ ] Hash passwords with bcrypt
- [ ] Validate JWT tokens properly
- [ ] Implement CSRF protection
- [ ] Use environment variables for secrets
