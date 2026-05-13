let emailCheckInterval = null;
let lastCheckedCode = null;
let currentEmailProvider = 'gmail'; // Default

// Switch email tab
function switchEmailTab(provider) {
    currentEmailProvider = provider;
    
    // Update active tab
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.closest('.tab-btn').classList.add('active');
    
    // Update placeholder
    const emailInput = document.getElementById('emailInput');
    if (provider === 'gmail') {
        emailInput.placeholder = 'your.email@gmail.com';
    } else {
        emailInput.placeholder = 'your.email@hotmail.com';
    }
    
    // Restart monitoring if email exists
    const email = emailInput.value.trim();
    if (email && isValidEmail(email)) {
        startEmailMonitoring(email);
    }
}

// Email input listener - AUTO START (no button)
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
    const providerName = currentEmailProvider === 'gmail' ? 'Gmail' : 'Hotmail/Outlook';
    updateEmailStatus('monitoring', `Monitoring ${providerName}...`);
    
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
    localStorage.removeItem('emailMonitorStart');
}

// Check email for verification code (DEMO)
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
            displayEmailCode(code);
            const providerName = currentEmailProvider === 'gmail' ? 'Gmail' : 'Hotmail/Outlook';
            updateEmailStatus('found', `✓ Code found in ${providerName}!`);
        }
    } else {
        const remaining = Math.ceil((10000 - elapsed) / 1000);
        const providerName = currentEmailProvider === 'gmail' ? 'Gmail' : 'Hotmail/Outlook';
        updateEmailStatus('monitoring', `Checking ${providerName}... (${remaining}s)`);
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
