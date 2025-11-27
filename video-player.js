// ========================================
// VIDEO PLAYER PAGE JAVASCRIPT
// This file handles the video player functionality
// ========================================

// Get data from URL parameters
var urlParams = new URLSearchParams(window.location.search);
var courseId = parseInt(urlParams.get('courseId'));
var lessonId = parseInt(urlParams.get('lessonId'));

// Store course and lessons data
var currentCourse = null;
var currentLesson = null;
var allLessons = [];
var completedLessons = [];

// ========================================
// WHEN PAGE LOADS
// ========================================
window.onload = async function() {
    await loadCourseData();
    loadCurrentLesson();
    displayLessonsSidebar();
    loadCompletedLessons();
};

// ========================================
// LOAD COURSE DATA FROM SUPABASE
// ========================================
async function loadCourseData() {
    console.log('Loading course data for course ID:', courseId);
    
    if (typeof supabase === 'undefined') {
        console.error('Supabase client not loaded!');
        alert('Error: Database connection not available');
        return;
    }
    
    try {
        // Load lessons from Supabase
        const { data, error } = await supabase
            .from('lessons')
            .select('*')
            .eq('course_id', courseId)
            .order('lesson_order', { ascending: true });
        
        if (error) {
            console.error('Error loading lessons:', error);
            alert('Error loading lessons: ' + error.message);
            return;
        }
        
        console.log('Raw data from Supabase:', data);
        
        // Transform to match our format
        allLessons = data.map(lesson => ({
            id: lesson.id,
            title: lesson.title,
            duration: lesson.duration,
            videoUrl: lesson.video_url,
            description: lesson.description
        }));
        
        console.log('Loaded lessons:', allLessons);
        
        if (allLessons.length === 0) {
            alert('No lessons found for this course');
        }
    } catch (err) {
        console.error('Error:', err);
        alert('Error: ' + err.message);
    }
}

// ========================================
// LOAD CURRENT LESSON
// ========================================
function loadCurrentLesson() {
    console.log('All lessons:', allLessons);
    console.log('Looking for lesson ID:', lessonId);
    
    if (!allLessons || allLessons.length === 0) {
        alert('No lessons found');
        return;
    }

    // Find the current lesson
    for (var i = 0; i < allLessons.length; i++) {
        if (allLessons[i].id === lessonId) {
            currentLesson = allLessons[i];
            break;
        }
    }

    if (!currentLesson) {
        console.log('Lesson not found, using first lesson');
        currentLesson = allLessons[0];
        lessonId = currentLesson.id;
    }

    console.log('Current lesson:', currentLesson);

    // Display lesson info
    document.getElementById('lesson-title').textContent = currentLesson.title;
    document.getElementById('lesson-description').textContent = currentLesson.description || 'No description available';
    document.getElementById('lesson-duration').textContent = 'Duration: ' + currentLesson.duration;
    document.getElementById('lesson-number').textContent = 'Lesson ' + currentLesson.id;

    // Load video
    console.log('Loading video URL:', currentLesson.videoUrl);
    
    if (!currentLesson.videoUrl) {
        alert('No video URL found for this lesson');
        return;
    }
    
    // Detect if it's a YouTube video or direct video file
    var isYouTube = currentLesson.videoUrl.includes('youtube.com') || currentLesson.videoUrl.includes('youtu.be');
    
    if (isYouTube) {
        // Show YouTube iframe, hide HTML5 player
        document.getElementById('video-frame').style.display = 'block';
        document.getElementById('video-player').style.display = 'none';
        document.getElementById('video-frame').src = currentLesson.videoUrl;
    } else {
        // Show HTML5 player, hide YouTube iframe
        document.getElementById('video-frame').style.display = 'none';
        document.getElementById('video-player').style.display = 'block';
        document.getElementById('video-source').src = currentLesson.videoUrl;
        document.getElementById('video-player').load();
    }

    // Update navigation buttons
    updateNavigationButtons();
}

// ========================================
// DISPLAY LESSONS IN SIDEBAR
// ========================================
function displayLessonsSidebar() {
    var sidebar = document.getElementById('lessons-sidebar');
    var html = '';

    for (var i = 0; i < allLessons.length; i++) {
        var lesson = allLessons[i];
        var isActive = lesson.id === currentLesson.id;
        var isCompleted = completedLessons.includes(lesson.id);

        var activeClass = isActive ? 'active' : '';
        var completedClass = isCompleted ? 'completed' : '';

        html += '<div class="sidebar-lesson ' + activeClass + ' ' + completedClass + '" onclick="playLesson(' + lesson.id + ')">';
        html += '  <div class="lesson-number">' + lesson.id + '</div>';
        html += '  <div class="lesson-info">';
        html += '    <h3>' + lesson.title + '</h3>';
        html += '    <p>' + lesson.duration + '</p>';
        html += '  </div>';
        
        if (isCompleted) {
            html += '  <svg class="checkmark" fill="none" stroke="currentColor" viewBox="0 0 24 24">';
            html += '    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>';
            html += '  </svg>';
        }
        
        html += '</div>';
    }

    sidebar.innerHTML = html;
}

// ========================================
// PLAY A SPECIFIC LESSON
// ========================================
function playLesson(newLessonId) {
    // Update URL without reloading page
    var newUrl = 'video-player.html?courseId=' + courseId + '&lessonId=' + newLessonId;
    window.history.pushState({}, '', newUrl);
    
    lessonId = newLessonId;
    loadCurrentLesson();
    displayLessonsSidebar();
}

// ========================================
// MARK LESSON AS COMPLETE
// ========================================
async function markLessonComplete() {
    if (!completedLessons.includes(currentLesson.id)) {
        completedLessons.push(currentLesson.id);
        saveCompletedLessons();
        displayLessonsSidebar();
        
        // Change button text
        document.getElementById('complete-btn').textContent = '✓ Completed';
        document.getElementById('complete-btn').classList.remove('bg-green-600', 'hover:bg-green-700');
        document.getElementById('complete-btn').classList.add('bg-gray-400');
        
        // Update progress in Supabase
        await updateCourseProgressInDB();
        
        alert('Lesson marked as complete!');
    }
}

// ========================================
// UPDATE COURSE PROGRESS
// ========================================
async function updateCourseProgressInDB() {
    // Get logged in user from localStorage
    var savedUser = localStorage.getItem('loggedInUser');
    if (!savedUser) return;
    
    var loggedInUser = JSON.parse(savedUser);
    
    // Calculate progress
    var totalLessons = allLessons.length;
    var completedCount = completedLessons.length;
    var progress = Math.round((completedCount / totalLessons) * 100);
    var isCompleted = progress === 100;
    
    // Save to Supabase
    try {
        const updateData = { 
            progress: progress,
            completed: isCompleted
        };
        
        if (isCompleted) {
            updateData.completion_date = new Date().toISOString();
        }
        
        const { error } = await supabase
            .from('enrollments')
            .update(updateData)
            .eq('user_id', loggedInUser.id)
            .eq('course_id', courseId);
        
        if (error) {
            console.error('Error updating progress:', error);
        } else {
            console.log('Progress saved to Supabase:', progress + '%');
        }
        
        // Check if course is completed
        if (isCompleted) {
            setTimeout(function() {
                if (confirm('Congratulations! You have completed this course!\n\nWould you like to view your certificate?')) {
                    window.location.href = 'index.html';
                }
            }, 500);
        }
    } catch (err) {
        console.error('Error:', err);
    }
}

// ========================================
// SAVE COMPLETED LESSONS TO LOCAL STORAGE
// ========================================
function saveCompletedLessons() {
    var key = 'completed_course_' + courseId;
    localStorage.setItem(key, JSON.stringify(completedLessons));
}

// ========================================
// LOAD COMPLETED LESSONS FROM LOCAL STORAGE
// ========================================
function loadCompletedLessons() {
    var key = 'completed_course_' + courseId;
    var saved = localStorage.getItem(key);
    
    if (saved) {
        completedLessons = JSON.parse(saved);
    }
    
    // Update complete button if already completed
    if (completedLessons.includes(currentLesson.id)) {
        document.getElementById('complete-btn').textContent = '✓ Completed';
        document.getElementById('complete-btn').classList.remove('bg-green-600', 'hover:bg-green-700');
        document.getElementById('complete-btn').classList.add('bg-gray-400');
    }
}

// ========================================
// GO TO NEXT LESSON
// ========================================
function goToNextLesson() {
    var currentIndex = -1;
    
    // Find current lesson index
    for (var i = 0; i < allLessons.length; i++) {
        if (allLessons[i].id === currentLesson.id) {
            currentIndex = i;
            break;
        }
    }
    
    // Check if there's a next lesson
    if (currentIndex < allLessons.length - 1) {
        var nextLesson = allLessons[currentIndex + 1];
        playLesson(nextLesson.id);
    } else {
        alert('This is the last lesson!');
    }
}

// ========================================
// GO TO PREVIOUS LESSON
// ========================================
function goToPreviousLesson() {
    var currentIndex = -1;
    
    // Find current lesson index
    for (var i = 0; i < allLessons.length; i++) {
        if (allLessons[i].id === currentLesson.id) {
            currentIndex = i;
            break;
        }
    }
    
    // Check if there's a previous lesson
    if (currentIndex > 0) {
        var prevLesson = allLessons[currentIndex - 1];
        playLesson(prevLesson.id);
    } else {
        alert('This is the first lesson!');
    }
}

// ========================================
// UPDATE NAVIGATION BUTTONS
// ========================================
function updateNavigationButtons() {
    var currentIndex = -1;
    
    // Find current lesson index
    for (var i = 0; i < allLessons.length; i++) {
        if (allLessons[i].id === currentLesson.id) {
            currentIndex = i;
            break;
        }
    }
    
    // Disable previous button if first lesson
    var prevBtn = document.getElementById('prev-btn');
    if (currentIndex === 0) {
        prevBtn.disabled = true;
    } else {
        prevBtn.disabled = false;
    }
    
    // Disable next button if last lesson
    var nextBtn = document.getElementById('next-btn');
    if (currentIndex === allLessons.length - 1) {
        nextBtn.disabled = true;
    } else {
        nextBtn.disabled = false;
    }
}

// ========================================
// GO BACK TO COURSE DETAIL PAGE
// ========================================
function goBackToCourse() {
    window.location.href = 'index.html';
}


// ========================================
// QUIZ FUNCTIONALITY
// ========================================
var quizQuestions = [
    {
        question: "What is the main topic of this lesson?",
        options: ["Computer Basics", "Programming", "Web Design", "Data Science"],
        correct: 0
    },
    {
        question: "Which of the following is a key concept covered?",
        options: ["Variables", "Functions", "Loops", "All of the above"],
        correct: 3
    },
    {
        question: "What should you practice after this lesson?",
        options: ["Nothing", "The examples shown", "Advanced topics", "Unrelated skills"],
        correct: 1
    }
];

var currentQuizQuestion = 0;
var quizScore = 0;
var selectedAnswer = -1;

function startQuiz() {
    currentQuizQuestion = 0;
    quizScore = 0;
    selectedAnswer = -1;
    
    document.getElementById('quiz-modal').style.display = 'flex';
    document.getElementById('quiz-question-container').classList.remove('hidden');
    document.getElementById('quiz-result').classList.add('hidden');
    document.getElementById('quiz-navigation').classList.remove('hidden');
    
    showQuizQuestion();
}

function showQuizQuestion() {
    if (currentQuizQuestion >= quizQuestions.length) {
        showQuizResult();
        return;
    }
    
    var question = quizQuestions[currentQuizQuestion];
    document.getElementById('quiz-question').textContent = (currentQuizQuestion + 1) + ". " + question.question;
    
    var optionsHtml = '';
    for (var i = 0; i < question.options.length; i++) {
        optionsHtml += '<div class="quiz-option" onclick="selectQuizOption(' + i + ')">';
        optionsHtml += '  <span>' + question.options[i] + '</span>';
        optionsHtml += '</div>';
    }
    
    document.getElementById('quiz-options').innerHTML = optionsHtml;
    selectedAnswer = -1;
}

function selectQuizOption(index) {
    selectedAnswer = index;
    
    var options = document.querySelectorAll('.quiz-option');
    for (var i = 0; i < options.length; i++) {
        options[i].classList.remove('selected');
    }
    options[index].classList.add('selected');
}

function submitQuizAnswer() {
    if (selectedAnswer === -1) {
        alert('Please select an answer');
        return;
    }
    
    var question = quizQuestions[currentQuizQuestion];
    var options = document.querySelectorAll('.quiz-option');
    
    if (selectedAnswer === question.correct) {
        quizScore++;
        options[selectedAnswer].classList.add('correct');
    } else {
        options[selectedAnswer].classList.add('incorrect');
        options[question.correct].classList.add('correct');
    }
    
    // Disable clicking
    for (var i = 0; i < options.length; i++) {
        options[i].style.pointerEvents = 'none';
    }
    
    // Move to next question after delay
    setTimeout(function() {
        currentQuizQuestion++;
        showQuizQuestion();
    }, 1500);
}

function showQuizResult() {
    document.getElementById('quiz-question-container').classList.add('hidden');
    document.getElementById('quiz-navigation').classList.add('hidden');
    document.getElementById('quiz-result').classList.remove('hidden');
    
    var percentage = Math.round((quizScore / quizQuestions.length) * 100);
    var scoreText = quizScore + ' / ' + quizQuestions.length;
    var message = '';
    var scoreColor = '';
    
    if (percentage >= 80) {
        message = 'Excellent work! You really understood this lesson!';
        scoreColor = 'text-green-600';
    } else if (percentage >= 60) {
        message = 'Good job! You got most of it right!';
        scoreColor = 'text-blue-600';
    } else {
        message = 'Keep practicing! Review the lesson and try again.';
        scoreColor = 'text-orange-600';
    }
    
    document.getElementById('quiz-score').textContent = scoreText;
    document.getElementById('quiz-score').className = 'text-5xl font-bold mb-4 ' + scoreColor;
    document.getElementById('quiz-message').textContent = message;
}

function closeQuiz() {
    document.getElementById('quiz-modal').style.display = 'none';
}

// Add quiz button after marking complete
var originalMarkComplete = markLessonComplete;
markLessonComplete = function() {
    originalMarkComplete();
    
    // Show quiz option
    setTimeout(function() {
        if (confirm('Would you like to take a quick quiz to test your understanding?')) {
            startQuiz();
        }
    }, 1000);
};
