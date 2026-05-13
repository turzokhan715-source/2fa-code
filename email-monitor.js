// Email monitoring variables
let emailCheckInterval = null;
let lastCheckedCode = null;
let currentEmailCode = null;
let currentExtractedEmail = null;

// Initialize email monitoring on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('Email monitor loaded successfully');
    
    // Reset monitoring state
    localStorage.removeItem('emailMonitorStart');
    
    // Update email history display
    updateEmailHistoryDisplay();
    
    // Email input listener - AUTO START
    const emailInput = document.getElementById('emailInput');
    if (emailInput) {
        emailInput.addEventListener('input', function(e) {
            const email = e.target.value.trim();
            
            if (email && isValidEmail(email)) {
                startEmailMonitoring(email);
            } else {
                stopEmailMonitoring();
            }
        });
    }
});

// Clear email function
function clearEmail() {
    const emailInput = document.getElementById('emailInput');
    if (emailInput) {
        emailInput.value = '';
    }
    stopEmailMonitoring();
}

// Copy extracted email
function copyExtractedEmail() {
    if (currentExtractedEmail) {
        copyToClipboard(currentExtractedEmail);
        
        const btn = document.querySelector('.copy-email-btn');
        if (btn) {
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
}

// Copy email code function
function copyEmailCode() {
    if (currentEmailCode) {
        copyToClipboard(currentEmailCode);
        
        const btn = document.querySelector('.copy-code-btn');
        if (btn) {
            const originalText = btn.innerHTML;
            btn.innerHTML = '✓ Copied!';
            
            setTimeout(() => {
                btn.innerHTML = originalText;
            }, 2000);
        }
    }
}

// Cancel monitoring
function cancelMonitoring() {
    stopEmailMonitoring();
    const emailInput = document.getElementById('emailInput');
    if (emailInput) {
        emailInput.value = '';
    }
}

// Validate email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Start monitoring
function startEmailMonitoring(email) {
    stopEmailMonitoring();
    
    // Show extracted email
    currentExtractedEmail = email;
    const extractedEmailEl = document.getElementById('extractedEmail');
    const emailDisplayBox = document.getElementById('emailDisplayBox');
    const cancelBtn = document.getElementById('cancelMonitorBtn');
    
    if (extractedEmailEl) {
        extractedEmailEl.textContent = email;
    }
    
    if (emailDisplayBox) {
        emailDisplayBox.style.display = 'block';
    }
    
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
    
    const emailDisplayBox = document.getElementById('emailDisplayBox');
    const emailCodeDisplay = document.getElementById('emailCodeDisplay');
    
    if (emailDisplayBox) {
        emailDisplayBox.style.display = 'none';
    }
    
    if (emailCodeDisplay) {
        emailCodeDisplay.style.display = 'none';
    }
    
    localStorage.removeItem('emailMonitorStart');
    currentEmailCode = null;
    currentExtractedEmail = null;
    lastCheckedCode = null;
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
            
            // Save to email history
            saveToEmailHistory(email, code);
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
    const emailCodeEl = document.getElementById('emailCode');
    const codeTimeEl = document.getElementById('codeTime');
    const emailCodeDisplay = document.getElementById('emailCodeDisplay');
    
    if (emailCodeEl) {
        emailCodeEl.textContent = code;
    }
    
    if (codeTimeEl) {
        codeTimeEl.textContent = `Received at ${new Date().toLocaleTimeString()}`;
    }
    
    if (emailCodeDisplay) {
        emailCodeDisplay.style.display = 'block';
    }
}

// Update status
function updateEmailStatus(type, text) {
    const statusEl = document.getElementById('emailStatus');
    const statusText = document.getElementById('statusText');
    
    if (!statusEl || !statusText) return;
    
    statusEl.className = 'email-status';
    
    const statusIcon = statusEl.querySelector('.status-icon');
    
    if (type === 'monitoring') {
        statusEl.classList.add('monitoring');
        if (statusIcon) {
            statusIcon.textContent = '🔄';
        }
    } else if (type === 'found') {
        statusEl.classList.add('found');
        if (statusIcon) {
            statusIcon.textContent = '✓';
        }
    } else {
        if (statusIcon) {
            statusIcon.textContent = '⏳';
        }
    }
    
    statusText.textContent = text;
}

// Email History Management
function saveToEmailHistory(email, code) {
    const history = getEmailHistory();
    
    const entry = {
        email: email,
        code: code,
        timestamp: new Date().toISOString()
    };
    
    // Add to beginning of array
    history.unshift(entry);
    
    // Keep only last 10 entries
    if (history.length > 10) {
        history.pop();
    }
    
    localStorage.setItem('emailHistory', JSON.stringify(history));
    updateEmailHistoryDisplay();
}

function getEmailHistory() {
    const stored = localStorage.getItem('emailHistory');
    return stored ? JSON.parse(stored) : [];
}

function updateEmailHistoryDisplay() {
    const history = getEmailHistory();
    const historyList = document.getElementById('emailHistoryList');
    const historyCount = document.getElementById('emailHistoryCount');
    
    if (!historyList || !historyCount) return;
    
    historyCount.textContent = `${history.length} codes`;
    
    if (history.length === 0) {
        historyList.innerHTML = '<div class="empty-state">No email codes received yet</div>';
        return;
    }
    
    historyList.innerHTML = history.map(entry => {
        const date = new Date(entry.timestamp);
        const timeStr = date.toLocaleTimeString();
        const emailPreview = entry.email.length > 25 ? entry.email.substring(0, 25) + '...' : entry.email;
        
        return `
            <div class="history-item">
                <div class="history-code">${entry.code}</div>
                <div class="history-details">
                    <div class="history-key">${emailPreview}</div>
                    <div class="history-time">${timeStr}</div>
                </div>
            </div>
        `;
    }).join('');
}

// Copy to clipboard helper
function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            console.log('Copied to clipboard:', text);
        }).catch(err => {
            console.error('Failed to copy:', err);
            fallbackCopy(text);
        });
    } else {
        fallbackCopy(text);
    }
}

function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
        document.execCommand('copy');
        console.log('Copied using fallback method');
    } catch (err) {
        console.error('Fallback copy failed:', err);
    }
    document.body.removeChild(textarea);
}

// Clean up on page unload
window.addEventListener('beforeunload', function() {
    if (emailCheckInterval) {
        clearInterval(emailCheckInterval);
    }
});
