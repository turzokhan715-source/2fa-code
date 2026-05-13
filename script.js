// Switch between pages
function switchPage(page) {
    // Hide all pages
    document.querySelectorAll('.page-content').forEach(p => {
        p.classList.remove('active');
    });
    
    // Show selected page
    document.getElementById(`page-${page}`).classList.add('active');
    
    // Update active tab
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    document.querySelector(`[data-page="${page}"]`).classList.add('active');
    
    // Stop email monitoring when switching away from email page
    if (page !== 'email' && typeof stopEmailMonitoring === 'function') {
        stopEmailMonitoring();
    }
