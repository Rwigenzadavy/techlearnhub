# TechLearnHub - Online Learning Platform

TechLearnHub is an e-learning platform that will help people to be able to get digital skills online everywhere for free. This will help people to get skills from beginner level to advanced level. It’s easy to use and also user friendly.Students can browse courses, watch video lessons, track progress, and earn certificates.


## Features

- User Authentication (Sign up/Sign in)
- Course Management
- Video Lessons (Supabase Storage + YouTube support)
- Progress Tracking
- Course Reviews & Ratings
- Certificates on Course Completion
- Responsive Design
- Quiz System
- Student Dashboard

## Tech Stack

- **Frontend:** HTML, CSS, JavaScript
- **Styling:** Tailwind CSS
- **Backend:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Storage:** Supabase Storage
- **Deployment:** Vercel

---

## Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- A [Supabase](https://supabase.com) account (free tier works)
- A text editor (VS Code, Sublime Text, etc.)

---



## Testing the Application

### 1. Sign Up
- Click "Sign In" button
- Switch to "Sign Up" tab
- Enter your name, email, and password (min 6 characters)
- Click "Sign Up"

### 2. Browse Courses
- You should see 6 courses on the homepage
- Try filtering by difficulty (Beginner, Intermediate, Advanced)
- Use the search bar to find courses

### 3. Enroll in a Course
- Click on "Computer Literacy" course
- Click "Enroll Now"
- Check Supabase → Table Editor → enrollments (you should see a new row)

### 4. Watch a Lesson
- Click on a lesson
- Video should play in the video player
- Mark lesson as complete
- Take the quiz (optional)

### 5. Check Dashboard
- Click "Dashboard" in navigation
- See your enrolled courses
- View progress bars
- Check certificates (after completing a course)

### 6. Submit a Review
- Go to a course detail page
- Scroll down to reviews section
- Rate the course (1-5 stars)
- Write a review
- Submit

---

## Project Structure

```
techlearnhub/
├── index.html              # Main homepage
├── video-player.html       # Video player page
├── video-player.js         # Video player function
├── styles.css              # Main styles
├── video-player.css        # Video player styles
├── js/
│   ├── config.js          # Supabase configuration
│   ├── auth.js            # Authentication functions
│   ├── courses.js         # Course management
│   ├── lessons.js         # Lesson loading
│   ├── enrollments.js     # Enrollment handling
│   ├── reviews.js         # Review system
│   ├── progress.js        # Progress tracking
│   ├── dashboard.js       # Dashboard functions
│   ├── navigation.js      # Page navigation
│   ├── storage.js         # LocalStorage utilities
│   └── main.js            # App initialization
└── README.md              # This file
```

---

## Database Schema

### users
- `id` (UUID) - Primary key
- `email` (TEXT) - User email
- `name` (TEXT) - User name
- `created_at` (TIMESTAMP) - Account creation date

### courses
- `id` (SERIAL) - Primary key
- `name` (TEXT) - Course name
- `description` (TEXT) - Course description
- `difficulty` (TEXT) - Beginner/Intermediate/Advanced
- `color` (TEXT) - UI color (green/orange/red)
- `total_lessons` (INTEGER) - Number of lessons
- `created_at` (TIMESTAMP) - Course creation date

### lessons
- `id` (SERIAL) - Primary key
- `course_id` (INTEGER) - Foreign key to courses
- `title` (TEXT) - Lesson title
- `duration` (TEXT) - Lesson duration (e.g., "10:30")
- `video_url` (TEXT) - Video URL (Supabase Storage or YouTube)
- `description` (TEXT) - Lesson description
- `lesson_order` (INTEGER) - Order in course
- `created_at` (TIMESTAMP) - Lesson creation date

### enrollments
- `id` (UUID) - Primary key
- `user_id` (UUID) - Foreign key to users
- `course_id` (INTEGER) - Foreign key to courses
- `progress` (INTEGER) - Progress percentage (0-100)
- `completed` (BOOLEAN) - Course completion status
- `completion_date` (TIMESTAMP) - When course was completed
- `enrolled_at` (TIMESTAMP) - Enrollment date

### reviews
- `id` (UUID) - Primary key
- `user_id` (UUID) - Foreign key to users
- `course_id` (INTEGER) - Foreign key to courses
- `user_name` (TEXT) - Reviewer name
- `rating` (INTEGER) - Rating (1-5)
- `review_text` (TEXT) - Review content
- `created_at` (TIMESTAMP) - Review date

---

## Troubleshooting

### Issue: "Wrong email or password" when signing in
**Solution:** Make sure you disabled email confirmation in Supabase (Step 9)

### Issue: Courses not showing
**Solution:** 
1. Check browser console for errors (F12)
2. Verify Supabase credentials in `js/config.js`
3. Make sure courses are inserted in database

### Issue: Videos not playing
**Solution:**
1. Check if video URL is correct in lessons table
2. For Supabase videos: Make sure bucket is public
3. For YouTube: Use embed URL format (`/embed/VIDEO_ID`)

### Issue: "Error inserting user" on sign up
**Solution:** 
1. Check if RLS is disabled (Step 5)
2. Verify users table exists

### Issue: Progress not saving
**Solution:**
1. Check browser console for errors
2. Verify enrollments table exists
3. Make sure user is logged in

---

## Security Notes

⚠️ **IMPORTANT:** Before deploying to production:

1. **Enable Row Level Security (RLS)**
   ```sql
   ALTER TABLE users ENABLE ROW LEVEL SECURITY;
   ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
   ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
   ```

2. **Add RLS Policies**
   ```sql
   -- Users can only see their own data
   CREATE POLICY "Users can view own data" ON users
     FOR SELECT USING (auth.uid() = id);
   
   -- Users can only see their own enrollments
   CREATE POLICY "Users can view own enrollments" ON enrollments
     FOR SELECT USING (auth.uid() = user_id);
   ```

3. **Enable email confirmation** in Supabase Auth settings

4. **Use environment variables** for sensitive data (not hardcoded in config.js)

---

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Click "Deploy"

### Deploy to GitHub Pages

1. Push your code to GitHub
2. Go to repository Settings → Pages
3. Source: Deploy from a branch
4. Branch: main (or master)
5. Click "Save"

---

## Adding More Courses

To add more courses and lessons:

1. **Add a course:**
   ```sql
   INSERT INTO courses (name, description, difficulty, color, total_lessons) 
   VALUES ('Course Name', 'Description', 'Beginner', 'green', 10);
   ```

2. **Add lessons for that course:**
   ```sql
   INSERT INTO lessons (course_id, title, duration, video_url, description, lesson_order) 
   VALUES (7, 'Lesson Title', '15:00', 'VIDEO_URL', 'Description', 1);
   ```


## Support

If you encounter any issues:

1. Check the Troubleshooting section above
2. Open an issue on GitHub
3. Check Supabase documentation: [supabase.com/docs](https://supabase.com/docs)

---

## Credits

Built with ❤️ using:
- [Supabase](https://supabase.com)
- [Tailwind CSS](https://tailwindcss.com)

---

## Roadmap

Future features to add:
- [ ] User profile editing
- [ ] Course categories
- [ ] Search functionality enhancement
- [ ] Discussion forums
- [ ] Live classes
- [ ] Mobile app
- [ ] Payment integration
- [ ] Instructor dashboard
- [ ] Course creation interface
- [ ] Advanced analytics
