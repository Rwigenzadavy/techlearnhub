// ========================================
// SUPABASE CONFIGURATION
// ========================================
const SUPABASE_URL = 'https://utbrlkpjaqjbjbxqcutd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0YnJsa3BqYXFqYmpieHFjdXRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNjkzNjEsImV4cCI6MjA3OTc0NTM2MX0.iyQ7QYwRxnJ4QX0sS3__QqGGh6m1V6qdsz4BEUxJW1I';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
