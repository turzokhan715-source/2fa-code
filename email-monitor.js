let emailCheckInterval = null;
let lastCheckedCode = null;
let currentEmailCode = null;
let currentExtractedEmail = null;

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

// Copy extracted email
function copyExtractedEmail() {
    if (currentExtractedEmail) {
        copyToClipboard(currentExtractedEmail);
        
        const btn = document.querySelector('.copy-email-btn');
        const originalText = btn.innerHTML;
        btn.innerHTML = '✓ Copied!';
        btn.style.background = 'linear-gradient(135deg, 
 0%, 
 100%)';
        
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = 'linear-gradient(135deg, 
 0%, 
 100%)';
        }, 2000);
    }
}

// Copy email code function
function copyEmailCode() {
    if (currentEmailCode) {
        copyToClipboard(currentEmailCode);
        
        const btn = document.querySelector('.copy-code-btn');
        const originalText = btn.innerHTML;
        btn.innerHTML = '✓ Copied!';
        
        setTimeout(() => {
            btn.innerHTML = originalText;
        }, 2000);
    }
}

// Cancel monitoring
function cancelMonitoring() {
    stopEmailMonitoring();
    document.getElementById('emailInput').value = '';
}

// Validate email
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Start monitoring
function startEmailMonitoring(email) {
    stopEmailMonitoring();
    
    // Show extracted email
    currentExtractedEmail = email;
    document.getElementById('extractedEmail').textContent = email;
    document.getElementById('emailDisplayBox').style.display = 'block';
    
    // Show cancel button
    document.getElementById('cancelMonitorBtn').style.display = 'flex';
    
    // Update status
    updateEmailStatus('monitoring', '🔄 Monitoring Hotmail/Outlook...');
    
    // Start checking
    emailCheckInterval = setInterval(() => {
        checkEmailForCode(email);
    }, 1000);
    
    checkEmailForCode(email);
}

// Stop monitoring
function stopEmailMonitoring() {
    if (emailCheckInterval) {
        clearInterval(emailCheckInterval);
        emailCheckInterval = null;
    }
    
    updateEmailStatus('idle', 'Enter email to start monitoring');
    document.getElementById('emailDisplayBox').style.display = 'none';
    document.getElementById('emailCodeDisplay').style.display = 'none';
    document.getElementById('cancelMonitorBtn').style.display = 'none';
    localStorage.removeItem('emailMonitorStart');
    currentEmailCode = null;
    currentExtractedEmail = null;
}

// Check email for code (DEMO)
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
        updateEmailStatus('monitoring', `🔄 Checking Hotmail/Outlook... (${remaining}s)`);
    }
}

// Generate random code
function generateRandomCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Display email code
function displayEmailCode(code) {
    document.getElementById('emailCode').textContent = code;
    document.getElementById('codeTime').textContent = `Received at ${new Date().toLocaleTimeString()}`;
    document.getElementById('emailCodeDisplay').style.display = 'block';
}

// Update status
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

// Copy to clipboard helper
function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text);
    } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    }
}

// Reset on load
document.addEventListener('DOMContentLoaded', function() {
    localStorage.removeItem('emailMonitorStart');
});

