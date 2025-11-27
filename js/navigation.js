// ========================================
// NAVIGATION AND UI FUNCTIONS
// ========================================

// ========================================
// NAVIGATE BETWEEN PAGES
// ========================================
function goToPage(pageName) {
    var allPages = document.getElementsByClassName('page');
    for (var i = 0; i < allPages.length; i++) {
        allPages[i].classList.remove('active');
    }
    
    var selectedPage = document.getElementById(pageName);
    selectedPage.classList.add('active');
    
    if (pageName === 'dashboard') {
        updateDashboard();
    }
    
    window.scrollTo(0, 0);
}

// ========================================
// TOGGLE MOBILE MENU
// ========================================
function openMobileMenu() {
    var menu = document.getElementById('mobile-menu');
    var isHidden = menu.classList.contains('hidden');
    
    if (isHidden) {
        menu.classList.remove('hidden');
    } else {
        menu.classList.add('hidden');
    }
}

// ========================================
// UPDATE NAVIGATION BAR
// ========================================
function updateNavigationBar() {
    var desktopButton = document.getElementById('desktop-auth-btn');
    var mobileButton = document.getElementById('mobile-auth-btn');
    var dashboardLink = document.getElementById('dashboard-link');
    var dashboardLinkMobile = document.getElementById('dashboard-link-mobile');
    
    if (loggedInUser) {
        var desktopHTML = '<div class="user-info">';
        desktopHTML += '<span>Hi, ' + loggedInUser.name + '</span>';
        desktopHTML += '<button onclick="logOutUser()" class="logout-btn">Logout</button>';
        desktopHTML += '</div>';
        
        var mobileHTML = '<div>';
        mobileHTML += '<div class="user-name">Hi, ' + loggedInUser.name + '</div>';
        mobileHTML += '<button onclick="logOutUser(); openMobileMenu()" class="logout-btn-mobile">Logout</button>';
        mobileHTML += '</div>';
        
        desktopButton.outerHTML = desktopHTML;
        mobileButton.outerHTML = mobileHTML;
        
        if (dashboardLink) dashboardLink.classList.remove('hidden');
        if (dashboardLinkMobile) dashboardLinkMobile.classList.remove('hidden');
    }
}
