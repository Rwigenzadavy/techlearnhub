// ========================================
// LOCAL STORAGE FUNCTIONS
// ========================================

function saveToLocalStorage() {
    localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
    localStorage.setItem('courseReviews', JSON.stringify(courseReviews));
    localStorage.setItem('userProgress', JSON.stringify(userProgress));
    if (loggedInUser) {
        localStorage.setItem('loggedInUser', JSON.stringify(loggedInUser));
    }
}

function loadFromLocalStorage() {
    var savedUsers = localStorage.getItem('registeredUsers');
    if (savedUsers) {
        registeredUsers = JSON.parse(savedUsers);
    }
    
    var savedReviews = localStorage.getItem('courseReviews');
    if (savedReviews) {
        courseReviews = JSON.parse(savedReviews);
    }
    
    var savedProgress = localStorage.getItem('userProgress');
    if (savedProgress) {
        userProgress = JSON.parse(savedProgress);
    }
    
    var savedUser = localStorage.getItem('loggedInUser');
    if (savedUser) {
        loggedInUser = JSON.parse(savedUser);
        updateNavigationBar();
    }
}
