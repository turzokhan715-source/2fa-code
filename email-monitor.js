let emailCheckInterval = null;
let lastCheckedCode = null;

// Email input listener
document.getElementById('emailInput').addEventListener('input', function(e) {
    const email = e.target.value.trim();
    
    if (email && isValidEmail(email)) {
        startEmailMonitoring(email);
    } else {
        stopEmailMonitoring();
    }
});

// Validate email
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Start monitoring
function startEmailMonitoring(email) {
    // Stop previous monitoring
    stopEmailMonitoring();
    
    // Update status
    updateEmailStatus('monitoring', `Monitoring ${email}...`);
    
    // Start checking every 3 seconds
    emailCheckInterval = setInterval(() => {
        checkEmailForCode(email);
    }, 3000);
    
    // Check immediately
    checkEmailForCode(email);
}

// Stop monitoring
function stopEmailMonitoring() {
    if (emailCheckInterval) {
        clearInterval(emailCheckInterval);
        emailCheckInterval = null;
    }
    
    updateEmailStatus('idle', 'Enter email to start monitoring');
    document.getElementById('emailCodeDisplay').style.display = 'none';
}

// Check email for verification code (DEMO - uses random code)
function checkEmailForCode(email) {
    // DEMO: Simulate finding a code after 10 seconds
    // In real implementation, this would call an API
    
    const now = Date.now();
    const startTime = parseInt(localStorage.getItem('emailMonitorStart') || now);
    
    if (!localStorage.getItem('emailMonitorStart')) {
        localStorage.setItem('emailMonitorStart', now);
    }
    
    const elapsed = now - startTime;
    
    if (elapsed > 10000) { // After 10 seconds, show a code
        const code = generateRandomCode();
        
        if (code !== lastCheckedCode) {
            lastCheckedCode = code;
            displayEmailCode(code);
            updateEmailStatus('found', '✓ Code found!');
        }
    } else {
        updateEmailStatus('monitoring', `Checking... (${Math.ceil((10000 - elapsed) / 1000)}s)`);
    }
}

// Generate random 6-digit code (DEMO)
function generateRandomCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Display email code
function displayEmailCode(code) {
    document.getElementById('emailCode').textContent = code;
    document.getElementById('codeTime').textContent = `Received at ${new Date().toLocaleTimeString()}`;
    document.getElementById('emailCodeDisplay').style.display = 'block';
    
    // Auto-copy
    copyToClipboard(code);
}

// Update email status
function updateEmailStatus(type, text) {
    const statusEl = document.getElementById('emailStatus');
    const statusText = document.getElementById('statusText');
    
    statusEl.className = 'email-status';
    
    if (type === 'monitoring') {
        statusEl.classList.add('monitoring');
        statusEl.querySelector('.status-icon').textContent = '🔄';
    } else if (type === 'found') {
        statusEl.classList.add('found');
        statusEl.querySelector('.status-icon').textContent = '✓';
    } else {
        statusEl.querySelector('.status-icon').textContent = '⏳';
    }
    
    statusText.textContent = text;
}

// Reset on page load
document.addEventListener('DOMContentLoaded', function() {
    localStorage.removeItem('emailMonitorStart');
});
