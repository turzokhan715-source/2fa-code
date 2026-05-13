let emailCheckInterval = null;
let lastCheckedCode = null;
let currentEmailCode = null;

// Email input listener - AUTO START
document.getElementById('emailInput').addEventListener('input', function(e) {
    const email = e.target.value.trim();
    
    if (email && isValidEmail(email)) {
        startEmailMonitoring(email);
    } else {
        stopEmailMonitoring();
    }
});

// Clear email function
function clearEmail() {
    document.getElementById('emailInput').value = '';
    stopEmailMonitoring();
}

// Copy email code function
function copyEmailCode() {
    if (currentEmailCode) {
        copyToClipboard(currentEmailCode);
        
        // Visual feedback
        const btn = document.querySelector('.copy-code-btn');
        const originalText = btn.innerHTML;
        btn.innerHTML = '✓ Copied!';
        btn.style.background = '
';
        
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = '
';
        }, 2000);
    }
}

// Validate email
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Start monitoring
function startEmailMonitoring(email) {
    // Stop previous monitoring
    stopEmailMonitoring();
    
    // Update status
    updateEmailStatus('monitoring', 'Monitoring Hotmail/Outlook...');
    
    // Start checking every 1 second (faster API check)
    emailCheckInterval = setInterval(() => {
        checkEmailForCode(email);
    }, 1000);
    
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
    localStorage.removeItem('emailMonitorStart');
    currentEmailCode = null;
}

// Check email for verification code (DEMO - every second)
function checkEmailForCode(email) {
    const now = Date.now();
    const startTime = parseInt(localStorage.getItem('emailMonitorStart') || now);
    
    if (!localStorage.getItem('emailMonitorStart')) {
        localStorage.setItem('emailMonitorStart', now);
    }
    
    const elapsed = now - startTime;
    
    // DEMO: Show code after 10 seconds
    if (elapsed > 10000) {
        const code = generateRandomCode();
        
        if (code !== lastCheckedCode) {
            lastCheckedCode = code;
            currentEmailCode = code;
            displayEmailCode(code);
            updateEmailStatus('found', '✓ Code found in Hotmail/Outlook!');
        }
    } else {
        const remaining = Math.ceil((10000 - elapsed) / 1000);
        updateEmailStatus('monitoring', `Checking Hotmail/Outlook... (${remaining}s)`);
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

