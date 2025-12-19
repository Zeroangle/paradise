document.addEventListener('DOMContentLoaded', () => {
    const totalAmountInput = document.getElementById('totalAmount');
    const amountPaidInput = document.getElementById('amountPaid');
    const calculateBtn = document.getElementById('calculateBtn');
    const resultDiv = document.getElementById('result');
    const cashButtons = document.querySelectorAll('.cash-btn');
    
    // Get total amount from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const totalFromPOS = urlParams.get('total');
    if (totalFromPOS) {
        totalAmountInput.value = totalFromPOS;
        totalAmountInput.style.animation = 'fadeInUp 0.5s ease-out';
    }
    
    // Add input formatting and validation
    [totalAmountInput, amountPaidInput].forEach(input => {
        input.addEventListener('input', formatNumber);
        input.addEventListener('focus', (e) => {
            e.target.parentElement.querySelector('label').style.color = '#667eea';
            e.target.style.borderColor = '#667eea';
            e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
        });
        input.addEventListener('blur', (e) => {
            e.target.parentElement.querySelector('label').style.color = '#4a5568';
            e.target.style.borderColor = '#e2e8f0';
            e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
        });
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                calculateChange();
            }
        });
    });
    
    function formatNumber(e) {
        let value = e.target.value.replace(/[^0-9]/g, '');
        if (value) {
            e.target.value = parseInt(value).toLocaleString();
        }
    }
    
    function getNumericValue(input) {
        return parseFloat(input.value.replace(/,/g, '')) || 0;
    }

    cashButtons.forEach(button => {
        button.addEventListener('click', () => {
            const value = parseFloat(button.dataset.value);
            const currentAmount = getNumericValue(amountPaidInput);
            const newAmount = currentAmount + value;
            
            // Add click animation
            button.style.transform = 'scale(0.9)';
            button.style.borderColor = '#667eea';
            setTimeout(() => {
                button.style.transform = '';
                button.style.borderColor = '';
            }, 200);
            
            // Update input with animation
            amountPaidInput.style.transform = 'scale(1.05)';
            amountPaidInput.style.borderColor = '#48bb78';
            amountPaidInput.value = newAmount.toLocaleString();
            
            setTimeout(() => {
                amountPaidInput.style.transform = '';
                amountPaidInput.style.borderColor = '#e2e8f0';
            }, 300);
            
            // Auto-calculate if both fields have values
            if (getNumericValue(totalAmountInput) > 0 && newAmount > 0) {
                setTimeout(calculateChange, 500);
            }
        });
    });

    calculateBtn.addEventListener('click', calculateChange);
    
    function calculateChange() {
        const totalAmount = getNumericValue(totalAmountInput);
        const amountPaid = getNumericValue(amountPaidInput);

        // Add loading state
        calculateBtn.innerHTML = 'ژماردن...';
        calculateBtn.disabled = true;
        resultDiv.style.opacity = '0.5';
        
        setTimeout(() => {
            resultDiv.innerHTML = '';

            if (totalAmount === 0 || amountPaid === 0) {
                showError('تکایە هەردوو خانەکە بە ژمارە پڕ بکەرەوە.');
                return;
            }

            if (amountPaid < totalAmount) {
                const shortage = totalAmount - amountPaid;
                showError(`بری پارەی دراو کەمترە لە کۆی گشتی! پێویستە ${shortage.toLocaleString()} دیناری تر وەربگریت.`);
                return;
            }

            let changeDue = amountPaid - totalAmount;
            const denominations = [50000, 25000, 10000, 5000, 1000, 500, 250];
            
            let resultHTML = `<h3>کۆی باقی: ${changeDue.toLocaleString()} دینار</h3>`;
            
            if (changeDue === 0) {
                resultHTML += '<p style="color: #48bb78; font-weight: 600;">✅ هیچ باقییەک نامێنێتەوە - وەصڵی تەواو!</p>';
            } else {
                resultHTML += '<p><strong>شیکردنەوەی باقی:</strong></p>';
                
                for (const denom of denominations) {
                    const count = Math.floor(changeDue / denom);
                    if (count > 0) {
                        resultHTML += `<p style="animation: slideInRight 0.3s ease-out ${denominations.indexOf(denom) * 0.1}s both;">${count} x ${denom.toLocaleString()} دیناری</p>`;
                        changeDue = changeDue % denom;
                    }
                }
            }

            resultDiv.innerHTML = resultHTML;
            resultDiv.style.opacity = '1';
            
            // Reset button
            calculateBtn.innerHTML = 'ژماردنی باقی';
            calculateBtn.disabled = false;
            
        }, 500);
    }
    
    function showError(message) {
        resultDiv.innerHTML = `<p class="error">${message}</p>`;
        resultDiv.style.opacity = '1';
        calculateBtn.innerHTML = 'ژماردنی باقی';
        calculateBtn.disabled = false;
    }
    
    // Add CSS animations dynamically
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                opacity: 0;
                transform: translateX(30px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        @keyframes slideInDown {
            from {
                opacity: 0;
                transform: translateY(-30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes fadeOut {
            to {
                opacity: 0;
                transform: translateY(-20px);
            }
        }
    `;
    document.head.appendChild(style);
    
    // Add welcome message if coming from POS
    if (totalFromPOS) {
        setTimeout(() => {
            const welcomeMsg = document.createElement('div');
            welcomeMsg.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, #48bb78, #38a169);
                color: white;
                padding: 15px 20px;
                border-radius: 10px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 1000;
                animation: slideInDown 0.5s ease-out;
            `;
            welcomeMsg.innerHTML = '✅ کۆی گشتی لە سیستەمی فرۆشتنەوە هاتووە';
            document.body.appendChild(welcomeMsg);
            
            setTimeout(() => {
                welcomeMsg.style.animation = 'fadeOut 0.5s ease-out forwards';
                setTimeout(() => welcomeMsg.remove(), 500);
            }, 3000);
        }, 1000);
    }
});

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Only trigger shortcuts when not typing in input fields
    if (e.target.tagName === 'INPUT') return;
    
    const cashValues = {
        '1': 1000,
        '2': 5000,
        '3': 10000,
        '4': 25000,
        '5': 50000
    };
    
    if (cashValues[e.key]) {
        e.preventDefault();
        const button = document.querySelector(`[data-value="${cashValues[e.key]}"]`);
        if (button) {
            button.click();
            // Visual feedback
            button.style.transform = 'scale(0.9)';
            button.style.borderColor = '#667eea';
            setTimeout(() => {
                button.style.transform = '';
                button.style.borderColor = '';
            }, 200);
        }
    }
    
    // Clear with Escape
    if (e.key === 'Escape') {
        document.getElementById('amountPaid').value = '';
        document.getElementById('result').innerHTML = '';
        document.getElementById('amountPaid').focus();
    }
});