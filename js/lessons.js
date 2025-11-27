// ========================================
// LESSONS MANAGEMENT
// ========================================

// ========================================
// LOAD LESSONS FOR A COURSE
// ========================================
async function loadCourseLessons(courseId) {
    try {
        const { data, error } = await supabase
            .from('lessons')
            .select('*')
            .eq('course_id', courseId)
            .order('lesson_order', { ascending: true });
        
        if (error) {
            console.error('Error loading lessons:', error);
            return [];
        }
        
        console.log('Loaded lessons for course', courseId, ':', data);
        return data;
    } catch (err) {
        console.error('Error:', err);
        return [];
    }
}
