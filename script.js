/ Tab Navigation
function switchTab(tabName) {
    // Hide all pages
    document.querySelectorAll('.page-content').forEach(page => {
        page.classList.remove('active');
    });
    
    // Remove active from all nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected page
    document.getElementById('page' + tabName).classList.add('active');
    
    // Add active to clicked button
    event.currentTarget.classList.add('active');
}

// 2FA Code Generation
let totpInterval = null;
let currentSecret = '';

function generateTOTP() {
    const secretInput = document.getElementById('secretKey');
    const secret = secretInput.value.trim().replace(/\s/g, '');
    
    if (!secret) {
        alert('⚠️ Please enter a secret key!');
        return;
    }
    
    currentSecret = secret;
    
    // Show code display
    const codeDisplay = document.getElementById('codeDisplay');
    if (codeDisplay) {
        codeDisplay.style.display = 'block';
    }
    
    // Generate and display code immediately
    updateTOTPCode();
    
    // Clear any existing interval
    if (totpInterval) {
        clearInterval(totpInterval);
    }
    
    // Update every second
    totpInterval = setInterval(updateTOTPCode, 1000);
    
    // Save to history
    saveToHistory(secret);
}

function updateTOTPCode() {
    if (!currentSecret) return;
    
    try {
        const code = generateTOTPCode(currentSecret);
        const remaining = 30 - (Math.floor(Date.now() / 1000) % 30);
        
        const totpCodeEl = document.getElementById('totpCode');
        const timeRemainingEl = document.getElementById('timeRemaining');
        
        if (totpCodeEl) {
            totpCodeEl.textContent = code;
        }
        
        if (timeRemainingEl) {
            timeRemainingEl.textContent = `Valid for ${remaining}s`;
        }
    } catch (error) {
        console.error('Error generating TOTP:', error);
        const totpCodeEl = document.getElementById('totpCode');
        const timeRemainingEl = document.getElementById('timeRemaining');
        
        if (totpCodeEl) {
            totpCodeEl.textContent = 'ERROR';
        }
        if (timeRemainingEl) {
            timeRemainingEl.textContent = 'Invalid secret key';
        }
    }
}

function generateTOTPCode(secret) {
    // Simple TOTP implementation (demo version)
    const epoch = Math.floor(Date.now() / 1000);
    const timeStep = Math.floor(epoch / 30);
    
    // Generate 6-digit code based on secret and time
    const hash = simpleHash(secret + timeStep);
    const code = (hash % 1000000).toString().padStart(6, '0');
    
    return code;
}

function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash);
}

// History Management
function saveToHistory(secret) {
    const history = getHistory();
    const code = generateTOTPCode(secret);
    
    const entry = {
        secret: secret,
        code: code,
        timestamp: new Date().toISOString()
    };
    
    // Add to beginning of array
    history.unshift(entry);
    
    // Keep only last 10 entries
    if (history.length > 10) {
        history.pop();
    }
    
    localStorage.setItem('totpHistory', JSON.stringify(history));
    updateHistoryDisplay();
}

function getHistory() {
    const stored = localStorage.getItem('totpHistory');
    return stored ? JSON.parse(stored) : [];
}

function updateHistoryDisplay() {
    const history = getHistory();
    const historyList = document.getElementById('historyList');
    const historyCount = document.getElementById('historyCount');
    
    if (!historyList || !historyCount) return;
    
    historyCount.textContent = `${history.length} codes`;
    
    if (history.length === 0) {
        historyList.innerHTML = '<div class="empty-state">No codes generated yet</div>';
        return;
    }
    
    historyList.innerHTML = history.map(entry => {
        const date = new Date(entry.timestamp);
        const timeStr = date.toLocaleTimeString();
        const secretPreview = entry.secret.substring(0, 16) + '...';
        
        return `
            <div class="history-item">
                <div class="history-code">${entry.code}</div>
                <div class="history-details">
                    <div class="history-key">${secretPreview}</div>
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

// Initialize on load
document.addEventListener('DOMContentLoaded', function() {
    console.log('Script loaded successfully');
    
    // Update history display
    updateHistoryDisplay();
    
    // Auto-focus on secret key input
    const secretKeyInput = document.getElementById('secretKey');
    if (secretKeyInput) {
        secretKeyInput.focus();
        
        // Enter key to generate
        secretKeyInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                generateTOTP();
            }
        });
    }
    
    // Add click handler to generate button
    const generateBtn = document.querySelector('.generate-btn-blue');
    if (generateBtn) {
        generateBtn.addEventListener('click', function(e) {
            e.preventDefault();
            generateTOTP();
        });
    }
});

// Clean up interval on page unload
window.addEventListener('beforeunload', function() {
    if (totpInterval) {
        clearInterval(totpInterval);
    }
});
