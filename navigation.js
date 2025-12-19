/**
 * Shared Navigation Script
 * Updates login button across all pages based on login status
 */

// Update login button based on login status
function updateLoginButton() {
    const loginBtn = document.querySelector('.nav-login-btn');
    if (!loginBtn) {
        console.log('[Navigation] Login button not found');
        return;
    }

    // Check if api-config functions are available
    if (typeof isLoggedIn === 'undefined') {
        console.log('[Navigation] isLoggedIn function not available yet');
        return;
    }
    
    if (typeof getCurrentUser === 'undefined') {
        console.log('[Navigation] getCurrentUser function not available yet');
        return;
    }

    const isLoggedInUser = isLoggedIn();
    const user = getCurrentUser();
    
    console.log('[Navigation] Updating button - Logged in:', isLoggedInUser, 'User:', user);

    if (isLoggedInUser && user && user.username) {
        // User is logged in - show username and logout option
        loginBtn.innerHTML = `<i class="fas fa-user"></i> ${user.username}`;
        loginBtn.href = '#';
        loginBtn.style.cursor = 'pointer';
        loginBtn.style.textDecoration = 'none';
        loginBtn.title = 'Click to logout';
        
        // Remove old click handler and add new one
        loginBtn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (confirm('Are you sure you want to logout?')) {
                if (typeof logout === 'function') {
                    logout();
                } else {
                    localStorage.removeItem('user');
                    localStorage.removeItem('user_id');
                    window.location.href = 'login.html';
                }
            }
            return false;
        };
        
        console.log('[Navigation] Button updated to show username:', user.username);
    } else {
        // User is not logged in - show login button
        loginBtn.innerHTML = 'Login';
        loginBtn.href = 'login.html';
        loginBtn.onclick = null;
        loginBtn.style.cursor = 'pointer';
        console.log('[Navigation] Button updated to show Login');
    }
}

// Wait for API config to load, then update
function waitForApiConfig() {
    if (typeof isLoggedIn !== 'undefined' && typeof getCurrentUser !== 'undefined') {
        updateLoginButton();
    } else {
        setTimeout(waitForApiConfig, 100);
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        waitForApiConfig();
        // Also update after a delay
        setTimeout(updateLoginButton, 500);
    });
} else {
    waitForApiConfig();
    setTimeout(updateLoginButton, 500);
}

// Update on window load
window.addEventListener('load', function() {
    setTimeout(updateLoginButton, 300);
});

// Update when page becomes visible (for multi-tab support)
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        setTimeout(updateLoginButton, 100);
    }
});

// Update on storage change (for multi-tab support)
window.addEventListener('storage', function(e) {
    if (e.key === 'user' || e.key === 'user_id') {
        setTimeout(updateLoginButton, 100);
    }
});

// Make function globally available for manual calls
window.updateLoginButton = updateLoginButton;
