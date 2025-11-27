// ========================================
// REVIEWS MANAGEMENT
// ========================================

var courseReviews = {};
var selectedRating = 0;

// ========================================
// LOAD REVIEWS FROM SUPABASE
// ========================================
async function loadReviewsFromSupabase() {
    if (!selectedCourse) return;
    
    try {
        const { data, error } = await supabase
            .from('reviews')
            .select('*')
            .eq('course_id', selectedCourse.id)
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('Error loading reviews:', error);
            return;
        }
        
        courseReviews[selectedCourse.id] = data.map(review => ({
            userName: review.user_name,
            rating: review.rating,
            text: review.review_text,
            date: new Date(review.created_at).toLocaleDateString()
        }));
    } catch (err) {
        console.error('Error:', err);
    }
}

// ========================================
// SET RATING
// ========================================
function setRating(rating) {
    selectedRating = rating;
    var stars = document.querySelectorAll('.rating-star');
    for (var i = 0; i < stars.length; i++) {
        if (i < rating) {
            stars[i].classList.add('filled');
        } else {
            stars[i].classList.remove('filled');
        }
    }
}

// ========================================
// SUBMIT REVIEW
// ========================================
async function submitReview() {
    if (!loggedInUser) {
        alert('Please sign in to submit a review');
        return;
    }
    
    if (selectedRating === 0) {
        alert('Please select a rating');
        return;
    }
    
    var reviewText = document.getElementById('review-text').value;
    if (reviewText.trim() === '') {
        alert('Please write a review');
        return;
    }
    
    try {
        const { error } = await supabase
            .from('reviews')
            .insert([
                {
                    user_id: loggedInUser.id,
                    course_id: selectedCourse.id,
                    user_name: loggedInUser.name,
                    rating: selectedRating,
                    review_text: reviewText
                }
            ]);
        
        if (error) {
            alert('Error submitting review: ' + error.message);
            return;
        }
        
        selectedRating = 0;
        document.getElementById('review-text').value = '';
        var stars = document.querySelectorAll('.rating-star');
        for (var i = 0; i < stars.length; i++) {
            stars[i].classList.remove('filled');
        }
        
        await loadReviewsFromSupabase();
        displayReviews();
        alert('Review submitted successfully!');
    } catch (err) {
        alert('Error: ' + err.message);
    }
}

// ========================================
// DISPLAY REVIEWS
// ========================================
function displayReviews() {
    var reviewsList = document.getElementById('reviews-list');
    var reviews = courseReviews[selectedCourse.id] || [];
    
    var totalRating = 0;
    for (var i = 0; i < reviews.length; i++) {
        totalRating += reviews[i].rating;
    }
    var avgRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 0;
    
    document.getElementById('avg-rating').textContent = avgRating;
    document.getElementById('review-count').textContent = reviews.length + ' review' + (reviews.length !== 1 ? 's' : '');
    
    var starsHtml = '';
    for (var i = 1; i <= 5; i++) {
        var color = i <= Math.round(avgRating) ? '#fbbf24' : '#d1d5db';
        starsHtml += '<span style="color: ' + color + '; font-size: 18px;">★</span>';
    }
    document.getElementById('rating-stars').innerHTML = starsHtml;
    
    var html = '';
    if (reviews.length === 0) {
        html = '<p class="text-gray-500 text-center py-4 text-sm">No reviews yet. Be the first to review!</p>';
    } else {
        for (var i = reviews.length - 1; i >= 0; i--) {
            var review = reviews[i];
            html += '<div class="border border-gray-200 rounded-lg p-3">';
            html += '  <div class="flex items-center justify-between mb-1">';
            html += '    <h4 class="font-semibold text-sm text-gray-900">' + review.userName + '</h4>';
            html += '    <span class="text-xs text-gray-500">' + review.date + '</span>';
            html += '  </div>';
            html += '  <div class="flex gap-1 mb-1">';
            for (var j = 1; j <= 5; j++) {
                var color = j <= review.rating ? '#fbbf24' : '#d1d5db';
                html += '<span style="color: ' + color + '; font-size: 14px;">★</span>';
            }
            html += '  </div>';
            html += '  <p class="text-gray-600 text-sm">' + review.text + '</p>';
            html += '</div>';
        }
    }
    
    reviewsList.innerHTML = html;
    
    if (loggedInUser) {
        document.getElementById('review-form').classList.remove('hidden');
    }
}
