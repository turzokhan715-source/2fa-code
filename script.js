let history = [];
let autoHideTimeout = null;

// Load history
function loadHistory() {
    const saved = localStorage.getItem('totpHistory');
    if (saved) {
        try {
            history = JSON.parse(saved);
            updateHistoryDisplay();
        } catch (e) {
            console.error('Failed to load history:', e);
            history = [];
        }
    }
}

// Save history
function saveHistory() {
    try {
        localStorage.setItem('totpHistory', JSON.stringify(history));
    } catch (e) {
        console.error('Failed to save history:', e);
    }
}

// Generate TOTP code
function generateCode() {
    const secretInput = document.getElementById('secretKey');
    const secret = secretInput.value.trim().toUpperCase().replace(/\s/g, '');
    
    if (!secret) {
        alert('⚠️ Please enter a secret key!');
        return;
    }
    
    try {
        const code = generateTOTP(secret);
        
        document.getElementById('totpCode').textContent = code;
        document.getElementById('codeDisplay').style.display = 'block';
        
        copyToClipboard(code);
        secretInput.value = '';
        
        if (autoHideTimeout) {
            clearTimeout(autoHideTimeout);
        }
        
        autoHideTimeout = setTimeout(() => {
            addToHistory(secret, code);
            document.getElementById('codeDisplay').style.display = 'none';
            document.getElementById('totpCode').textContent = '------';
        }, 30000);
        
    } catch (error) {
        alert('❌ Invalid secret key! Please check and try again.');
        console.error('Generation error:', error);
    }
}

// Copy to clipboard
function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            showCopyHint();
        }).catch(err => {
            console.error('Failed to copy:', err);
            fallbackCopy(text);
        });
    } else {
        fallbackCopy(text);
    }
}

// Fallback copy
function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
        document.execCommand('copy');
        showCopyHint();
    } catch (err) {
        console.error('Fallback copy failed:', err);
    }
    document.body.removeChild(textarea);
}

// Show copy hint
function showCopyHint() {
    const hint = document.getElementById('copyHint');
    hint.classList.add('show');
    setTimeout(() => {
        hint.classList.remove('show');
    }, 2000);
}

// Add to history
function addToHistory(secret, code) {
    const now = new Date();
    const timestamp = now.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
    
    history.unshift({
        secret: secret,
        code: code,
        time: timestamp
    });
    
    if (history.length > 50) {
        history = history.slice(0, 50);
    }
    
    saveHistory();
    updateHistoryDisplay();
}

// Update history display
function updateHistoryDisplay() {
    const historyList = document.getElementById('historyList');
    const historyCount = document.getElementById('historyCount');
    
    historyCount.textContent = `${history.length} saved`;
    
    if (history.length === 0) {
        historyList.innerHTML = '<p class="empty-state">No codes generated yet</p>';
        return;
    }
    
    historyList.innerHTML = history.map(item => `
        <div class="history-item">
            <div class="history-code">${item.code}</div>
            <div class="history-details">
                <div class="history-key">Key: ${item.secret}</div>
                <div class="history-time">${item.time}</div>
            </div>
        </div>
    `).join('');
}

// Enter key
document.getElementById('secretKey').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        generateCode();
    }
});

// Load on page load
document.addEventListener('DOMContentLoaded', function() {
    loadHistory();
});
