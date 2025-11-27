// ========================================
// MAIN APPLICATION INITIALIZATION
// ========================================

// Global variables
var registeredUsers = [];
var loggedInUser = null;

// ========================================
// WHEN PAGE LOADS
// ========================================
window.onload = async function() {
    await loadCoursesFromSupabase();
    loadFromLocalStorage();
    showAllCourses();
};
