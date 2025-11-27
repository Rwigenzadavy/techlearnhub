// ========================================
// DASHBOARD FUNCTIONALITY
// ========================================

async function updateDashboard() {
    if (!loggedInUser) {
        goToPage('auth');
        return;
    }
    
    // Load fresh progress from Supabase
    await loadUserProgress();
    
    var enrolledCount = loggedInUser.courses ? loggedInUser.courses.length : 0;
    var completedCount = 0;
    var certificatesCount = 0;
    
    if (userProgress[loggedInUser.email]) {
        for (var courseId in userProgress[loggedInUser.email]) {
            if (userProgress[loggedInUser.email][courseId].completed) {
                completedCount++;
                certificatesCount++;
            }
        }
    }
    
    document.getElementById('stat-enrolled').textContent = enrolledCount;
    document.getElementById('stat-completed').textContent = completedCount;
    document.getElementById('stat-certificates').textContent = certificatesCount;
    
    var coursesList = document.getElementById('my-courses-list');
    var html = '';
    
    if (enrolledCount === 0) {
        html = '<div class="empty-state"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg><h3>No Enrolled Courses</h3><p>Start learning by enrolling in a course</p></div>';
    } else {
        for (var i = 0; i < loggedInUser.courses.length; i++) {
            var courseId = loggedInUser.courses[i];
            var course = null;
            
            for (var j = 0; j < allCourses.length; j++) {
                if (allCourses[j].id === courseId) {
                    course = allCourses[j];
                    break;
                }
            }
            
            if (course) {
                var progress = 0;
                if (userProgress[loggedInUser.email] && userProgress[loggedInUser.email][courseId]) {
                    progress = userProgress[loggedInUser.email][courseId].progress || 0;
                }
                
                html += '<div class="border-2 border-gray-200 rounded-lg p-6 hover:border-blue-400 cursor-pointer" onclick="clickCourse(' + courseId + ')">';
                html += '  <h3 class="text-xl font-bold text-gray-900 mb-2">' + course.name + '</h3>';
                html += '  <p class="text-gray-600 mb-4">' + course.info + '</p>';
                html += '  <div class="mb-2">';
                html += '    <div class="flex justify-between text-sm text-gray-600 mb-1">';
                html += '      <span>Progress</span>';
                html += '      <span>' + progress + '%</span>';
                html += '    </div>';
                html += '    <div class="progress-bar">';
                html += '      <div class="progress-fill" style="width: ' + progress + '%"></div>';
                html += '    </div>';
                html += '  </div>';
                html += '</div>';
            }
        }
    }
    
    coursesList.innerHTML = html;
    
    var certsList = document.getElementById('certificates-list');
    html = '';
    
    if (certificatesCount === 0) {
        html = '<div class="empty-state" style="grid-column: 1 / -1;"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path></svg><h3>No Certificates Yet</h3><p>Complete courses to earn certificates</p></div>';
    } else {
        if (userProgress[loggedInUser.email]) {
            for (var courseId in userProgress[loggedInUser.email]) {
                if (userProgress[loggedInUser.email][courseId].completed) {
                    var course = null;
                    for (var j = 0; j < allCourses.length; j++) {
                        if (allCourses[j].id === parseInt(courseId)) {
                            course = allCourses[j];
                            break;
                        }
                    }
                    
                    if (course) {
                        var completionDate = userProgress[loggedInUser.email][courseId].completionDate || new Date().toLocaleDateString();
                        html += '<div class="certificate-card">';
                        html += '  <h3>' + course.name + '</h3>';
                        html += '  <p>Completed on ' + completionDate + '</p>';
                        html += '  <button onclick="downloadCertificate(' + courseId + ')">Download Certificate</button>';
                        html += '</div>';
                    }
                }
            }
        }
    }
    
    certsList.innerHTML = html;
}

function downloadCertificate(courseId) {
    var course = null;
    for (var i = 0; i < allCourses.length; i++) {
        if (allCourses[i].id === courseId) {
            course = allCourses[i];
            break;
        }
    }
    
    if (course && loggedInUser) {
        alert('Certificate for "' + course.name + '" would be downloaded here.\n\nCertificate awarded to: ' + loggedInUser.name);
    }
}
