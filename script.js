// GrokMarkets Bitcoin Cash Flipstarter Campaign Script

// BCH Address (replace with actual address)
const BCH_ADDRESS = 'bitcoincash:qpn23g0mmsc7c5fl6lvcu4nu4nxz34xkqvm987dpxd';

// API base URL
const API_BASE = 'https://grokmarkets.com/api';

// Campaign data
const CAMPAIGN_DATA = {
    goal: 9,
    raised: 0,
    contributors: 0,
    startDate: new Date('2025-10-17'),
    endDate: new Date('2025-11-16'),
    duration: 30
};

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    initializeCampaign();
    updateProgress();
    updateCountdown();
    
    // Update progress every 5 minutes
    setInterval(updateProgress, 5 * 60 * 1000);
    setInterval(updateCountdown, 1000);
});

// Initialize campaign
function initializeCampaign() {
    console.log('GrokMarkets BCH Campaign initialized');
    
    // Set up event listeners
    setupEventListeners();
    
    // Load any saved progress
    loadCampaignProgress();
}

// Set up event listeners
function setupEventListeners() {
    // Copy address button
    const copyButton = document.querySelector('.address-container button');
    if (copyButton) {
        copyButton.addEventListener('click', copyAddress);
    }
    
    // Amount buttons
    const amountButtons = document.querySelectorAll('.amount-buttons button');
    amountButtons.forEach(button => {
        button.addEventListener('click', function() {
            const amount = parseFloat(this.textContent);
            setAmount(amount);
        });
    });
    
    // Custom amount input
    const customInput = document.getElementById('customAmount');
    if (customInput) {
        customInput.addEventListener('input', function() {
            const amount = parseFloat(this.value);
            if (amount > 0) {
                highlightAmount(amount);
            }
        });
    }
}

// Copy BCH address to clipboard
function copyAddress() {
    const addressInput = document.getElementById('bchAddress');
    addressInput.select();
    addressInput.setSelectionRange(0, 99999); // For mobile devices
    
    navigator.clipboard.writeText(BCH_ADDRESS).then(function() {
        showNotification('BCH address copied to clipboard!', 'success');
        
        // Change button text temporarily
        const button = document.querySelector('.address-container button');
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        button.style.background = '#00b894';
        
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = '#00d4aa';
        }, 2000);
    }).catch(function(err) {
        console.error('Failed to copy address: ', err);
        showNotification('Failed to copy address. Please copy manually.', 'error');
    });
}

// Set contribution amount
function setAmount(amount) {
    const customInput = document.getElementById('customAmount');
    if (customInput) {
        customInput.value = amount;
        highlightAmount(amount);
    }
    
    // Show contribution instructions
    showContributionInstructions(amount);
}

// Highlight amount button
function highlightAmount(amount) {
    const buttons = document.querySelectorAll('.amount-buttons button');
    buttons.forEach(button => {
        button.classList.remove('selected');
        if (parseFloat(button.textContent) === amount) {
            button.classList.add('selected');
        }
    });
}

// Show contribution instructions
function showContributionInstructions(amount) {
    const instructions = `
        <div class="contribution-modal">
            <h3>🎯 Contribute ${amount} BCH</h3>
            <div class="instructions">
                <p><strong>Step 1:</strong> Copy the BCH address above</p>
                <p><strong>Step 2:</strong> Send exactly ${amount} BCH to that address</p>
                <p><strong>Step 3:</strong> Your contribution will be tracked automatically</p>
            </div>
            <div class="bch-qr">
                <p><em>QR code coming soon for mobile users!</em></p>
            </div>
            <button onclick="closeInstructions()">Got it!</button>
        </div>
    `;
    
    // Remove existing modal
    const existingModal = document.querySelector('.contribution-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Add new modal
    document.body.insertAdjacentHTML('beforeend', instructions);
    
    // Add modal styles
    const modal = document.querySelector('.contribution-modal');
    modal.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 30px;
        border-radius: 15px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        z-index: 1000;
        max-width: 400px;
        text-align: center;
    `;
    
    // Add overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 999;
    `;
    overlay.onclick = closeInstructions;
    document.body.appendChild(overlay);
}

// Close contribution instructions
function closeInstructions() {
    const modal = document.querySelector('.contribution-modal');
    const overlay = document.querySelector('.overlay');
    
    if (modal) modal.remove();
    if (overlay) overlay.remove();
}

// Update campaign progress from API
async function updateProgress() {
    try {
        const response = await fetch(`${API_BASE}/bch-campaign/progress`);
        const data = await response.json();
        
        if (data.success) {
            const campaign = data.data;
            
            // Update CAMPAIGN_DATA with real data
            CAMPAIGN_DATA.raised = campaign.progress.raised_bch;
            CAMPAIGN_DATA.contributors = campaign.progress.contributor_count;
            
            // Update progress bar
            const progress = (CAMPAIGN_DATA.raised / CAMPAIGN_DATA.goal) * 100;
            const progressFill = document.querySelector('.progress-fill');
            const raisedAmount = document.querySelector('.raised');
            const contributorsCount = document.querySelector('.contributors span');
            
            if (progressFill) {
                progressFill.style.width = `${Math.min(progress, 100)}%`;
            }
            
            if (raisedAmount) {
                raisedAmount.textContent = `${CAMPAIGN_DATA.raised.toFixed(2)} BCH raised`;
            }
            
            if (contributorsCount) {
                contributorsCount.textContent = `${CAMPAIGN_DATA.contributors} contributors`;
            }
            
            // Update campaign status
            updateCampaignStatus();
            
            // Update time remaining
            updateTimeRemaining(campaign.timeRemaining);
            
            // Show success/failure messages
            if (campaign.isSuccessful) {
                showNotification('🎉 Campaign goal reached! Thank you for your support!', 'success');
            } else if (campaign.needsRefunds) {
                showNotification('⏰ Campaign ended. Refunds will be processed automatically.', 'info');
            }
            
            console.log('✅ Campaign progress updated from API');
        } else {
            console.error('❌ Failed to fetch campaign progress:', data.error);
            // Fallback to cached data
            loadCampaignProgress();
        }
    } catch (error) {
        console.error('❌ Error fetching campaign progress:', error);
        // Fallback to cached data
        loadCampaignProgress();
    }
}

// Update campaign status
function updateCampaignStatus() {
    const now = new Date();
    const timeLeft = CAMPAIGN_DATA.endDate - now;
    const isActive = timeLeft > 0 && CAMPAIGN_DATA.raised < CAMPAIGN_DATA.goal;
    const isSuccessful = CAMPAIGN_DATA.raised >= CAMPAIGN_DATA.goal;
    const isExpired = timeLeft <= 0 && CAMPAIGN_DATA.raised < CAMPAIGN_DATA.goal;
    
    let statusText = '';
    let statusColor = '';
    
    if (isSuccessful) {
        statusText = '🎉 Campaign Successful!';
        statusColor = '#00d4aa';
    } else if (isExpired) {
        statusText = '⏰ Campaign Expired';
        statusColor = '#e74c3c';
    } else if (isActive) {
        statusText = '🚀 Campaign Active';
        statusColor = '#00d4aa';
    }
    
    // Update status display
    const statusElement = document.querySelector('.campaign-status');
    if (statusElement) {
        statusElement.textContent = statusText;
        statusElement.style.color = statusColor;
    }
}

// Update countdown timer
function updateCountdown() {
    const now = new Date();
    const timeLeft = CAMPAIGN_DATA.endDate - now;
    
    if (timeLeft <= 0) {
        return;
    }
    
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    
    const countdownElement = document.querySelector('.countdown');
    if (countdownElement) {
        countdownElement.innerHTML = `
            <div class="time-unit">
                <span class="time-value">${days}</span>
                <span class="time-label">Days</span>
            </div>
            <div class="time-unit">
                <span class="time-value">${hours}</span>
                <span class="time-label">Hours</span>
            </div>
            <div class="time-unit">
                <span class="time-value">${minutes}</span>
                <span class="time-label">Minutes</span>
            </div>
            <div class="time-unit">
                <span class="time-value">${seconds}</span>
                <span class="time-label">Seconds</span>
            </div>
        `;
    }
}

// Update time remaining from API data
function updateTimeRemaining(timeData) {
    if (!timeData) return;
    
    const countdownElement = document.querySelector('.countdown');
    if (countdownElement && !timeData.isExpired) {
        const days = timeData.days;
        const hours = 0; // We'll calculate this from the remaining time
        const minutes = 0;
        const seconds = 0;
        
        countdownElement.innerHTML = `
            <div class="time-unit">
                <span class="time-value">${days}</span>
                <span class="time-label">Days</span>
            </div>
            <div class="time-unit">
                <span class="time-value">${hours}</span>
                <span class="time-label">Hours</span>
            </div>
            <div class="time-unit">
                <span class="time-value">${minutes}</span>
                <span class="time-label">Minutes</span>
            </div>
            <div class="time-unit">
                <span class="time-value">${seconds}</span>
                <span class="time-label">Seconds</span>
            </div>
        `;
    }
}

// Load campaign progress from localStorage
function loadCampaignProgress() {
    const saved = localStorage.getItem('grokmarkets-bch-campaign');
    if (saved) {
        const data = JSON.parse(saved);
        CAMPAIGN_DATA.raised = data.raised || 0;
        CAMPAIGN_DATA.contributors = data.contributors || 0;
    }
}

// Save campaign progress to localStorage
function saveCampaignProgress() {
    localStorage.setItem('grokmarkets-bch-campaign', JSON.stringify({
        raised: CAMPAIGN_DATA.raised,
        contributors: CAMPAIGN_DATA.contributors,
        lastUpdate: new Date().toISOString()
    }));
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#00d4aa' : type === 'error' ? '#e74c3c' : '#00a8ff'};
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 1001;
        font-weight: 600;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .amount-buttons button.selected {
        background: #00d4aa !important;
        color: white !important;
    }
    
    .countdown {
        display: flex;
        justify-content: center;
        gap: 20px;
        margin: 20px 0;
    }
    
    .time-unit {
        text-align: center;
        background: rgba(255,255,255,0.1);
        padding: 15px;
        border-radius: 10px;
        min-width: 80px;
    }
    
    .time-value {
        display: block;
        font-size: 2rem;
        font-weight: 700;
        color: #00d4aa;
    }
    
    .time-label {
        font-size: 0.9rem;
        opacity: 0.8;
        text-transform: uppercase;
        letter-spacing: 1px;
    }
`;
document.head.appendChild(style);

// Blockchain integration functions (for future implementation)
function trackBCHTransactions() {
    // This would integrate with BCH blockchain to track contributions
    // Implementation would use BCH APIs to monitor the campaign address
    console.log('BCH transaction tracking would be implemented here');
}

function validateBCHAddress(address) {
    // Validate BCH address format
    const bchRegex = /^(bitcoincash:|bchtest:)?[qpzry9x8gf2tvdw0s3jn54khce6mua7l]{42}$/;
    return bchRegex.test(address);
}

// Export functions for external use
window.GrokMarketsBCH = {
    copyAddress,
    setAmount,
    updateProgress,
    CAMPAIGN_DATA
};
