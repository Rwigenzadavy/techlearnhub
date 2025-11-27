// ========================================
// PROGRESS TRACKING WITH SUPABASE
// ========================================

// ========================================
// UPDATE COURSE PROGRESS IN SUPABASE
// ========================================
async function updateCourseProgress(courseId, progress, completed) {
    if (!loggedInUser) return;
    
    try {
        const updateData = { 
            progress: progress,
            completed: completed
        };
        
        // Add completion date if course is completed
        if (completed) {
            updateData.completion_date = new Date().toISOString();
        }
        
        const { error } = await supabase
            .from('enrollments')
            .update(updateData)
            .eq('user_id', loggedInUser.id)
            .eq('course_id', courseId);
        
        if (error) {
            console.error('Error updating progress:', error);
            return false;
        }
        
        console.log('Progress updated successfully:', courseId, progress + '%');
        return true;
    } catch (err) {
        console.error('Error:', err);
        return false;
    }
}

// ========================================
// LOAD USER PROGRESS FROM SUPABASE
// ========================================
async function loadUserProgress() {
    if (!loggedInUser) return;
    
    try {
        const { data, error } = await supabase
            .from('enrollments')
            .select('*')
            .eq('user_id', loggedInUser.id);
        
        if (error) {
            console.error('Error loading progress:', error);
            return;
        }
        
        // Initialize progress object for this user
        if (!userProgress[loggedInUser.email]) {
            userProgress[loggedInUser.email] = {};
        }
        
        // Convert Supabase data to our format
        data.forEach(enrollment => {
            userProgress[loggedInUser.email][enrollment.course_id] = {
                progress: enrollment.progress || 0,
                completed: enrollment.completed || false,
                completionDate: enrollment.completion_date ? 
                    new Date(enrollment.completion_date).toLocaleDateString() : null,
                enrolledAt: enrollment.enrolled_at ? 
                    new Date(enrollment.enrolled_at).toLocaleDateString() : null
            };
        });
        
        console.log('User progress loaded from Supabase:', userProgress[loggedInUser.email]);
    } catch (err) {
        console.error('Error:', err);
    }
}

// ========================================
// GET PROGRESS FOR SPECIFIC COURSE
// ========================================
function getCourseProgress(courseId) {
    if (!loggedInUser || !userProgress[loggedInUser.email]) {
        return { progress: 0, completed: false };
    }
    
    return userProgress[loggedInUser.email][courseId] || { progress: 0, completed: false };
}
