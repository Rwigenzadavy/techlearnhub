// ========================================
// COURSES MANAGEMENT
// ========================================

// Store all courses
var allCourses = [];
var selectedCourse = null;
var currentFilter = 'all';

// ========================================
// LOAD COURSES FROM SUPABASE
// ========================================
async function loadCoursesFromSupabase() {
    try {
        const { data, error } = await supabase
            .from('courses')
            .select('*')
            .order('id', { ascending: true });
        
        if (error) {
            console.error('Error loading courses:', error);
            return;
        }
        
        allCourses = data.map(course => ({
            id: course.id,
            name: course.name,
            info: course.description,
            difficulty: course.difficulty,
            color: course.color,
            totalLessons: course.total_lessons,
            lessons: []
        }));
        
        console.log('Loaded courses from Supabase:', allCourses);
    } catch (err) {
        console.error('Error:', err);
    }
}

// ========================================
// SHOW ALL COURSES ON THE PAGE
// ========================================
function showAllCourses() {
    var container = document.getElementById('courses-container');
    var html = '';
    
    for (var i = 0; i < allCourses.length; i++) {
        var course = allCourses[i];
        
        html += '<div class="course-box" onclick="clickCourse(' + course.id + ')">';
        html += '  <h3>' + course.name + '</h3>';
        html += '  <p>' + course.info + '</p>';
        html += '  <div class="course-details">';
        html += '    <span class="level-' + course.color + '">' + course.difficulty + '</span>';
        html += '    <span class="lessons">' + course.totalLessons + ' Lessons</span>';
        html += '  </div>';
        html += '</div>';
    }
    
    container.innerHTML = html;
}

// ========================================
// SEARCH FOR COURSES
// ========================================
function searchCourses() {
    var searchBox = document.getElementById('search-input');
    var searchText = searchBox.value.toLowerCase();
    var container = document.getElementById('courses-container');
    var html = '';
    var foundCourses = 0;
    
    for (var i = 0; i < allCourses.length; i++) {
        var course = allCourses[i];
        var courseName = course.name.toLowerCase();
        var courseInfo = course.info.toLowerCase();
        
        if (courseName.includes(searchText) || courseInfo.includes(searchText)) {
            foundCourses++;
            html += '<div class="course-box" onclick="clickCourse(' + course.id + ')">';
            html += '  <h3>' + course.name + '</h3>';
            html += '  <p>' + course.info + '</p>';
            html += '  <div class="course-details">';
            html += '    <span class="level-' + course.color + '">' + course.difficulty + '</span>';
            html += '    <span class="lessons">' + course.totalLessons + ' Lessons</span>';
            html += '  </div>';
            html += '</div>';
        }
    }
    
    if (foundCourses === 0) {
        html = '<p class="no-results">No courses found</p>';
    }
    
    container.innerHTML = html;
}

// ========================================
// FILTER COURSES
// ========================================
function filterCourses(difficulty) {
    currentFilter = difficulty;
    var container = document.getElementById('courses-container');
    var html = '';
    var foundCourses = 0;
    
    for (var i = 0; i < allCourses.length; i++) {
        var course = allCourses[i];
        
        if (difficulty === 'all' || course.difficulty === difficulty) {
            foundCourses++;
            
            html += '<div class="course-box" onclick="clickCourse(' + course.id + ')">';
            html += '  <h3>' + course.name + '</h3>';
            html += '  <p>' + course.info + '</p>';
            html += '  <div class="course-details">';
            html += '    <span class="level-' + course.color + '">' + course.difficulty + '</span>';
            html += '    <span class="lessons">' + course.totalLessons + ' Lessons</span>';
            html += '  </div>';
            html += '</div>';
        }
    }
    
    if (foundCourses === 0) {
        html = '<p class="no-results">No courses found in this category</p>';
    }
    
    container.innerHTML = html;
    updateFilterButtons(difficulty);
}

function updateFilterButtons(activeFilter) {
    var buttons = document.querySelectorAll('.filter-btn');
    for (var i = 0; i < buttons.length; i++) {
        buttons[i].classList.remove('active');
        if (buttons[i].getAttribute('data-filter') === activeFilter) {
            buttons[i].classList.add('active');
        }
    }
}

// ========================================
// CLICK ON A COURSE
// ========================================
function clickCourse(courseId) {
    selectedCourse = null;
    for (var i = 0; i < allCourses.length; i++) {
        if (allCourses[i].id === courseId) {
            selectedCourse = allCourses[i];
            break;
        }
    }
    
    showCourseDetail();
}

// ========================================
// SHOW COURSE DETAIL PAGE
// ========================================
async function showCourseDetail() {
    if (!selectedCourse) return;
    
    document.getElementById('course-title').textContent = selectedCourse.name;
    document.getElementById('course-description').textContent = selectedCourse.info;
    document.getElementById('course-level').textContent = selectedCourse.difficulty;
    document.getElementById('course-level').className = 'px-4 py-2 bg-' + selectedCourse.color + '-100 text-' + selectedCourse.color + '-700 rounded-lg font-semibold';
    document.getElementById('course-lessons').textContent = selectedCourse.totalLessons + ' Lessons';
    
    // Load lessons from Supabase
    var lessons = await loadCourseLessons(selectedCourse.id);
    selectedCourse.lessons = lessons;
    
    var lessonsList = document.getElementById('lessons-list');
    var html = '';
    
    if (lessons && lessons.length > 0) {
        for (var i = 0; i < lessons.length; i++) {
            var lesson = lessons[i];
            html += '<div class="lesson-item" onclick="openVideoPlayer(' + selectedCourse.id + ', ' + lesson.id + ')">';
            html += '  <div class="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-blue-400 cursor-pointer">';
            html += '    <div class="flex items-center gap-4">';
            html += '      <div class="bg-blue-100 text-blue-600 w-10 h-10 rounded-full flex items-center justify-center font-bold">' + lesson.id + '</div>';
            html += '      <div>';
            html += '        <h3 class="font-semibold text-gray-900">' + lesson.title + '</h3>';
            html += '        <p class="text-sm text-gray-500">Duration: ' + lesson.duration + '</p>';
            html += '      </div>';
            html += '    </div>';
            html += '    <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">';
            html += '      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>';
            html += '      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>';
            html += '    </svg>';
            html += '  </div>';
            html += '</div>';
        }
    } else {
        html = '<p class="text-gray-500 text-center py-8">No lessons available yet</p>';
    }
    
    lessonsList.innerHTML = html;
    
    loadReviewsFromSupabase().then(() => {
        displayReviews();
    });
    
    goToPage('course-detail');
}

// ========================================
// OPEN VIDEO PLAYER PAGE
// ========================================
function openVideoPlayer(courseId, lessonId) {
    if (!loggedInUser) {
        alert('Please sign in to watch lessons');
        goToPage('auth');
        return;
    }
    
    var isEnrolled = false;
    for (var i = 0; i < loggedInUser.courses.length; i++) {
        if (loggedInUser.courses[i] === courseId) {
            isEnrolled = true;
            break;
        }
    }
    
    if (!isEnrolled) {
        alert('Please enroll in this course first');
        return;
    }
    
    window.location.href = 'video-player.html?courseId=' + courseId + '&lessonId=' + lessonId;
}
