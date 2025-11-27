// ========================================
// ENROLLMENT MANAGEMENT
// ========================================

var userProgress = {};

// ========================================
// LOAD USER ENROLLMENTS FROM SUPABASE
// ========================================
async function loadUserEnrollments() {
    if (!loggedInUser) return;
    
    try {
        const { data, error } = await supabase
            .from('enrollments')
            .select('course_id')
            .eq('user_id', loggedInUser.id);
        
        if (error) {
            console.error('Error loading enrollments:', error);
            return;
        }
        
        loggedInUser.courses = data.map(enrollment => enrollment.course_id);
    } catch (err) {
        console.error('Error:', err);
    }
}

// ========================================
// ENROLL IN COURSE FROM DETAIL PAGE
// ========================================
async function enrollInCourseDetail() {
    if (!selectedCourse) return;
    
    if (!loggedInUser) {
        alert('Please sign in to enroll in courses');
        goToPage('auth');
        return;
    }
    
    var alreadyEnrolled = false;
    for (var i = 0; i < loggedInUser.courses.length; i++) {
        if (loggedInUser.courses[i] === selectedCourse.id) {
            alreadyEnrolled = true;
            break;
        }
    }
    
    if (alreadyEnrolled) {
        alert('You are already enrolled in ' + selectedCourse.name);
    } else {
        try {
            const { error } = await supabase
                .from('enrollments')
                .insert([
                    {
                        user_id: loggedInUser.id,
                        course_id: selectedCourse.id,
                        progress: 0,
                        completed: false
                    }
                ]);
            
            if (error) {
                alert('Error enrolling: ' + error.message);
                return;
            }
            
            loggedInUser.courses.push(selectedCourse.id);
            
            // Load updated progress from Supabase
            await loadUserProgress();
            
            saveToLocalStorage();
            alert('Successfully enrolled in ' + selectedCourse.name + '!');
        } catch (err) {
            alert('Error: ' + err.message);
        }
    }
}
