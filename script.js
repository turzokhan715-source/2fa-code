// Tab Navigation
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
    document.getElementById('codeDisplay').style.display = 'block';
    
    // Generate and display code
    updateTOTPCode();
    
    // Update every second
    if (totpInterval) {
        clearInterval(totpInterval);
    }
    
    totpInterval = setInterval(updateTOTPCode, 1000);
    
    // Save to history
    saveToHistory(secret);
}

function updateTOTPCode() {
    if (!currentSecret) return;
    
    try {
        const code = generateTOTPCode(currentSecret);
        const remaining = 30 - (Math.floor(Date.now() / 1000) % 30);
        
        document.getElementById('totpCode').textContent = code;
        document.getElementById('timeRemaining').textContent = `Valid for ${remaining}s`;
        
        // Show copy hint briefly when code changes
        if (remaining === 30) {
            showCopyHint();
        }
    } catch (error) {
        console.error('Error generating TOTP:', error);
        document.getElementById('totpCode').textContent = 'ERROR';
        document.getElementById('timeRemaining').textContent = 'Invalid secret key';
    }
}

function generateTOTPCode(secret) {
    // Simple TOTP implementation (demo - use proper library in production)
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

function showCopyHint() {
    const hint = document.getElementById('copyHint');
    hint.classList.add('show');
    setTimeout(() => {
        hint.classList.remove('show');
    }, 2000);
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

// Initialize on load
document.addEventListener('DOMContentLoaded', function() {
    updateHistoryDisplay();
    
    // Auto-focus on secret key input
    document.getElementById('secretKey').focus();
    
    // Enter key to generate
    document.getElementById('secretKey').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            generateTOTP();
        }
    });
});

// Copy to clipboard helper
function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text);
    } else {
        // Fallback for older browsers
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
