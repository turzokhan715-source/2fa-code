// Show page function
function showPage(pageName) {
    // Hide all pages
    document.querySelectorAll('.page-content').forEach(page => {
        page.classList.remove('active');
    });
    
    // Remove active from all nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected page
    if (pageName === '2fa') {
        document.getElementById('page2fa').classList.add('active');
        document.querySelectorAll('.nav-btn')[0].classList.add('active');
    } else if (pageName === 'email') {
        document.getElementById('pageEmail').classList.add('active');
        document.querySelectorAll('.nav-btn')[1].classList.add('active');
    }
}

// Default: Show 2FA page on load
document.addEventListener('DOMContentLoaded', function() {
    showPage('2fa');
});
