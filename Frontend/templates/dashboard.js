let currentDate = new Date();

function getUserData() {
    const urlParams = new URLSearchParams(window.location.search);
    const name = urlParams.get('name');
    const email = urlParams.get('email');
    
    if (!name) {
        return { name: 'User', email: '' };
    }
    
    return { name, email };
}

function updateDashboard() {
    const userData = getUserData();
    
    document.getElementById('userName').textContent = userData.name;
    document.getElementById('welcomeName').textContent = userData.name;
    
    const avatar = document.getElementById('userAvatar');
    avatar.textContent = userData.name.charAt(0).toUpperCase();
    
    window.userData = userData;
    
    renderCalendar();
    renderChart();
    animateMetrics();
}

function renderCalendar() {
    const grid = document.getElementById('calendarGrid');
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];
    
    document.getElementById('calendarMonth').textContent = 
        `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    
    grid.innerHTML = '';
    
    const dayHeaders = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    dayHeaders.forEach(day => {
        const header = document.createElement('div');
        header.className = 'calendar-day header';
        header.textContent = day;
        grid.appendChild(header);
    });
    
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const prevLastDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
    
    const startDay = firstDay.getDay();
    const totalDays = lastDay.getDate();
    
    // Get tracking data to mark days with entries
    const trackingData = JSON.parse(localStorage.getItem('trackingData') || '[]');
    const trackedDates = new Set(trackingData.map(entry => entry.date));
    
    for (let i = startDay - 1; i >= 0; i--) {
        const day = document.createElement('div');
        day.className = 'calendar-day other-month';
        day.textContent = prevLastDay.getDate() - i;
        grid.appendChild(day);
    }
    
    const today = new Date();
    const isCurrentMonth = today.getMonth() === currentDate.getMonth() && 
                          today.getFullYear() === currentDate.getFullYear();
    
    for (let i = 1; i <= totalDays; i++) {
        const day = document.createElement('div');
        day.className = 'calendar-day';
        day.textContent = i;
        
        // Check if this date has tracking data
        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        if (trackedDates.has(dateStr)) {
            day.style.backgroundColor = '#e3f2fd';
            day.style.fontWeight = 'bold';
        }
        
        if (isCurrentMonth && i === today.getDate()) {
            day.classList.add('today');
        }
        
        grid.appendChild(day);
    }
    
    const remainingDays = 42 - (startDay + totalDays);
    for (let i = 1; i <= remainingDays; i++) {
        const day = document.createElement('div');
        day.className = 'calendar-day other-month';
        day.textContent = i;
        grid.appendChild(day);
    }
}

function changeMonth(direction) {
    currentDate.setMonth(currentDate.getMonth() + direction);
    renderCalendar();
}

function renderChart() {
    const container = document.getElementById('chartContainer');
    container.innerHTML = ''; // Clear existing chart
    
    // Get tracking data from localStorage
    const trackingData = JSON.parse(localStorage.getItem('trackingData') || '[]');
    
    console.log('=== DASHBOARD DEBUG ===');
    console.log('Loading tracking data:', trackingData.length, 'entries');
    console.log('Raw data:', localStorage.getItem('trackingData'));
    
    if (trackingData.length === 0) {
        // Show default/placeholder chart if no data
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const values = [65, 45, 78, 52, 88, 42, 70];
        
        days.forEach((day, index) => {
            const group = document.createElement('div');
            group.className = 'bar-group';
            
            const bar = document.createElement('div');
            bar.className = 'bar';
            bar.style.height = '0%';
            bar.style.backgroundColor = '#ccc';
            
            const label = document.createElement('div');
            label.className = 'bar-label';
            label.textContent = day;
            
            group.appendChild(bar);
            group.appendChild(label);
            container.appendChild(group);
            
            setTimeout(() => {
                bar.style.height = `${values[index]}%`;
            }, index * 100);
        });
        return;
    }
    
    // Get last 7 days of data or fill with available data
    const last7Days = trackingData.slice(0, 7).reverse();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    console.log('Rendering chart with', last7Days.length, 'entries');
    
    // If we have less than 7 days, fill remaining with empty bars
    const chartData = [];
    
    // Add actual data
    last7Days.forEach(entry => {
        const date = new Date(entry.date);
        chartData.push({
            day: dayNames[date.getDay()],
            painLevel: parseInt(entry.painLevel || 0),
            hasData: true
        });
    });
    
    // Fill remaining days with placeholder data
    while (chartData.length < 7) {
        chartData.push({
            day: dayNames[chartData.length],
            painLevel: 0,
            hasData: false
        });
    }
    
    console.log('Chart data:', chartData);
    
    // Create chart with actual pain level data
    chartData.forEach((data, index) => {
        const painLevel = data.painLevel;
        const percentage = (painLevel / 10) * 100;
        
        const group = document.createElement('div');
        group.className = 'bar-group';
        group.title = data.hasData ? `Pain Level: ${painLevel}/10` : 'No data';
        
        const bar = document.createElement('div');
        bar.className = 'bar';
        bar.style.height = '0%';
        
        // Color based on pain level
        if (!data.hasData) {
            bar.style.backgroundColor = '#e0e0e0'; // Gray - no data
        } else if (painLevel <= 3) {
            bar.style.backgroundColor = '#4caf50'; // Green - low pain
        } else if (painLevel <= 6) {
            bar.style.backgroundColor = '#ff9800'; // Orange - medium pain
        } else {
            bar.style.backgroundColor = '#f44336'; // Red - high pain
        }
        
        const label = document.createElement('div');
        label.className = 'bar-label';
        label.textContent = data.day;
        
        group.appendChild(bar);
        group.appendChild(label);
        container.appendChild(group);
        
        setTimeout(() => {
            bar.style.height = `${percentage}%`;
        }, index * 100);
    });
}

function animateMetrics() {
    // Get metrics from localStorage (updated by tracker)
    const metrics = JSON.parse(localStorage.getItem('dashboardMetrics') || '{}');
    
    // Use tracker data if available, otherwise use defaults
    const heartRate = metrics.heartRate || 72;
    const hemoglobin = metrics.hemoglobin || 12.5;
    
    animateValue('heartRate', 0, heartRate, 1500);
    animateValue('hemoglobin', 0, hemoglobin, 1500, true);
    
    // Update additional metrics if they exist
    const trackingData = JSON.parse(localStorage.getItem('trackingData') || '[]');
    if (trackingData.length > 0) {
        const latestEntry = trackingData[0];
        
        // Display recent tracking info in a summary section (if you have one)
        updateHealthSummary(latestEntry);
    }
}

function updateHealthSummary(latestEntry) {
    // This function can update additional dashboard elements with tracker data
    console.log('Updating health summary with:', latestEntry);
    
    // Update the "Good" health status badge based on pain level
    const statusBadge = document.querySelector('.badge-success, .badge-warning, .badge-danger');
    if (statusBadge) {
        const painLevel = parseInt(latestEntry.painLevel || 0);
        statusBadge.className = 'badge';
        if (painLevel <= 3) {
            statusBadge.className += ' badge-success';
            statusBadge.textContent = 'Good';
        } else if (painLevel <= 6) {
            statusBadge.className += ' badge-warning';
            statusBadge.textContent = 'Moderate';
        } else {
            statusBadge.className += ' badge-danger';
            statusBadge.textContent = 'High Alert';
        }
    }
    
    // Example: Update a summary card if it exists
    const summaryElement = document.getElementById('healthSummary');
    if (summaryElement) {
        const moodEmoji = {
            'terrible': '😢',
            'bad': '😞',
            'okay': '😐',
            'good': '😊',
            'great': '😄'
        }[latestEntry.mood] || '—';
        
        summaryElement.innerHTML = `
            <div>
                <h4>📊 Latest Health Status</h4>
                <div>
                    <p><strong>Pain Level</strong>${latestEntry.painLevel}/10</p>
                    <p><strong>Mood</strong>${moodEmoji} ${latestEntry.mood || 'Not set'}</p>
                    <p><strong>Sleep</strong>${latestEntry.sleepHours || 'Not tracked'} hrs</p>
                    <p><strong>Energy</strong>${latestEntry.energyLevel}/10</p>
                    <p><strong>Bleeding</strong>${latestEntry.bleeding || 'None'}</p>
                    <p><strong>Cycle Day</strong>${latestEntry.cycleDay || '—'}</p>
                </div>
                ${latestEntry.notes ? `<p><strong>Notes:</strong> ${latestEntry.notes}</p>` : ''}
                <p><strong>Last Updated:</strong> ${new Date(latestEntry.timestamp).toLocaleString()}</p>
            </div>
        `;
    }
}

function animateValue(id, start, end, duration, isDecimal = false) {
    const element = document.getElementById(id);
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const current = start + (end - start) * progress;
        element.textContent = isDecimal ? current.toFixed(1) : Math.floor(current);
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

function handleLogout() {
    window.userData = null;
    window.location.href = '../index.html';
}

// Refresh dashboard data every 30 seconds to catch new tracker entries
function startAutoRefresh() {
    setInterval(() => {
        renderCalendar();
        renderChart();
        animateMetrics();
    }, 30000); // Refresh every 30 seconds
}

document.addEventListener('DOMContentLoaded', function() {
    updateDashboard();
    startAutoRefresh();
});
// Refresh dashboard data every 30 seconds to catch new tracker entries
function startAutoRefresh() {
    setInterval(() => {
        renderCalendar();
        renderChart();
        animateMetrics();
    }, 30000); // Refresh every 30 seconds
}

// FAQ Toggle Function
function toggleFaq(element) {
    const faqItem = element.parentElement;
    const wasActive = faqItem.classList.contains('active');
    
    // Close all FAQ items
    document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Open clicked item if it wasn't active
    if (!wasActive) {
        faqItem.classList.add('active');
    }
}

// Resource Modal Toggle Function
function toggleResourceModal(type) {
    const content = {
        pcos: {
            title: '🩺 Understanding PCOS',
            content: `
                <h3>What is PCOS?</h3>
                <p>Polycystic Ovary Syndrome (PCOS) is a hormonal disorder common among women of reproductive age. It affects approximately 1 in 10 women worldwide.</p>
                
                <h4>Key Characteristics:</h4>
                <ul>
                    <li><strong>Irregular Menstrual Cycles:</strong> Infrequent, irregular, or prolonged periods</li>
                    <li><strong>Excess Androgen:</strong> Elevated male hormone levels causing acne, hirsutism</li>
                    <li><strong>Polycystic Ovaries:</strong> Enlarged ovaries with multiple small cysts</li>
                </ul>
                
                <h4>Common Symptoms:</h4>
                <ul>
                    <li>Irregular periods or no periods</li>
                    <li>Excessive hair growth on face, chest, and back</li>
                    <li>Weight gain and difficulty losing weight</li>
                    <li>Acne and oily skin</li>
                    <li>Thinning hair or hair loss</li>
                    <li>Dark patches of skin</li>
                    <li>Fertility issues</li>
                </ul>
                
                <h4>Long-term Health Concerns:</h4>
                <p>Women with PCOS have increased risk of developing type 2 diabetes, high blood pressure, heart disease, and endometrial cancer. Regular monitoring and early intervention are crucial.</p>
            `
        },
        diet: {
            title: '🥗 PCOS-Friendly Diet & Nutrition',
            content: `
                <h3>Nutrition Guidelines for PCOS</h3>
                <p>A balanced diet can significantly improve PCOS symptoms and overall health.</p>
                
                <h4>Foods to Include:</h4>
                <ul>
                    <li><strong>High-Fiber Foods:</strong> Whole grains, legumes, vegetables</li>
                    <li><strong>Lean Proteins:</strong> Chicken, fish, tofu, eggs</li>
                    <li><strong>Healthy Fats:</strong> Avocado, nuts, olive oil, fatty fish</li>
                    <li><strong>Anti-inflammatory Foods:</strong> Berries, leafy greens, turmeric</li>
                    <li><strong>Low-GI Carbs:</strong> Sweet potatoes, quinoa, oats</li>
                </ul>
                
                <h4>Foods to Limit:</h4>
                <ul>
                    <li>Refined carbohydrates (white bread, pastries)</li>
                    <li>Sugary drinks and desserts</li>
                    <li>Processed and fried foods</li>
                    <li>Red and processed meats</li>
                    <li>Excessive dairy (if sensitive)</li>
                </ul>
                
                <h4>Meal Planning Tips:</h4>
                <ul>
                    <li>Eat regular meals to maintain stable blood sugar</li>
                    <li>Include protein with every meal</li>
                    <li>Practice portion control</li>
                    <li>Stay hydrated (8-10 glasses of water daily)</li>
                    <li>Consider supplements: Inositol, Vitamin D, Omega-3</li>
                </ul>
            `
        },
        exercise: {
            title: '🏃‍♀️ Exercise Guide for PCOS',
            content: `
                <h3>Physical Activity for PCOS Management</h3>
                <p>Regular exercise improves insulin sensitivity, helps with weight management, and reduces PCOS symptoms.</p>
                
                <h4>Recommended Exercise Types:</h4>
                <ul>
                    <li><strong>Cardio Exercise:</strong> 150 minutes/week of moderate activity
                        <ul>
                            <li>Brisk walking</li>
                            <li>Swimming</li>
                            <li>Cycling</li>
                            <li>Dancing</li>
                        </ul>
                    </li>
                    <li><strong>Strength Training:</strong> 2-3 times per week
                        <ul>
                            <li>Weight lifting</li>
                            <li>Resistance bands</li>
                            <li>Bodyweight exercises</li>
                        </ul>
                    </li>
                    <li><strong>Mind-Body Exercises:</strong> Reduce stress
                        <ul>
                            <li>Yoga</li>
                            <li>Pilates</li>
                            <li>Tai Chi</li>
                        </ul>
                    </li>
                </ul>
                
                <h4>Weekly Exercise Plan:</h4>
                <ul>
                    <li><strong>Monday:</strong> 30 min cardio + 15 min core</li>
                    <li><strong>Tuesday:</strong> 45 min strength training</li>
                    <li><strong>Wednesday:</strong> 30 min yoga/stretching</li>
                    <li><strong>Thursday:</strong> 30 min cardio</li>
                    <li><strong>Friday:</strong> 45 min strength training</li>
                    <li><strong>Weekend:</strong> Active recreation (hiking, sports)</li>
                </ul>
                
                <h4>Important Tips:</h4>
                <ul>
                    <li>Start slowly and gradually increase intensity</li>
                    <li>Listen to your body and rest when needed</li>
                    <li>Find activities you enjoy for long-term adherence</li>
                    <li>Combine different types of exercise for best results</li>
                </ul>
            `
        },
        treatment: {
            title: '💊 Treatment Options for PCOS',
            content: `
                <h3>Medical and Lifestyle Treatments</h3>
                <p>PCOS management involves a combination of lifestyle changes and medical treatments tailored to individual symptoms.</p>
                
                <h4>Lifestyle Interventions:</h4>
                <ul>
                    <li><strong>Weight Management:</strong> 5-10% weight loss can significantly improve symptoms</li>
                    <li><strong>Diet Modification:</strong> Low-GI, anti-inflammatory diet</li>
                    <li><strong>Regular Exercise:</strong> Improves insulin sensitivity</li>
                    <li><strong>Stress Management:</strong> Meditation, yoga, adequate sleep</li>
                </ul>
                
                <h4>Medical Treatments:</h4>
                <ul>
                    <li><strong>Birth Control Pills:</strong> Regulate periods, reduce androgens</li>
                    <li><strong>Metformin:</strong> Improves insulin resistance</li>
                    <li><strong>Anti-androgens:</strong> Reduce hair growth and acne</li>
                    <li><strong>Fertility Medications:</strong> For women trying to conceive</li>
                    <li><strong>Hair Removal Treatments:</strong> Laser, electrolysis</li>
                </ul>
                
                <h4>Supplements That May Help:</h4>
                <ul>
                    <li><strong>Inositol:</strong> Improves insulin sensitivity and ovulation</li>
                    <li><strong>Vitamin D:</strong> Many PCOS patients are deficient</li>
                    <li><strong>Omega-3:</strong> Reduces inflammation</li>
                    <li><strong>NAC:</strong> Antioxidant support</li>
                    <li><strong>Chromium:</strong> Blood sugar regulation</li>
                </ul>
                
                <h4>Alternative Therapies:</h4>
                <ul>
                    <li>Acupuncture for hormone balance</li>
                    <li>Herbal remedies (spearmint tea, cinnamon)</li>
                    <li>Cognitive behavioral therapy for mental health</li>
                </ul>
                
                <p><strong>Important:</strong> Always consult with your healthcare provider before starting any new treatment or supplement regimen.</p>
            `
        }
    };
    
    const data = content[type];
    if (!data) return;
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'resource-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>${data.title}</h2>
                <button class="modal-close" onclick="this.closest('.resource-modal').remove()">✕</button>
            </div>
            <div class="modal-body">
                ${data.content}
            </div>
        </div>
    `;
    
    // Add modal styles if not already added
    if (!document.getElementById('modalStyles')) {
        const style = document.createElement('style');
        style.id = 'modalStyles';
        style.textContent = `
            .resource-modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(117, 13, 55, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
                animation: fadeIn 0.3s ease;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            .modal-content {
                background: white;
                border-radius: 20px;
                max-width: 800px;
                max-height: 90vh;
                overflow-y: auto;
                margin: 20px;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
                animation: slideUp 0.3s ease;
            }
            
            @keyframes slideUp {
                from { transform: translateY(50px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 2rem;
                border-bottom: 2px solid #FFF0F5;
                position: sticky;
                top: 0;
                background: white;
                z-index: 10;
            }
            
            .modal-header h2 {
                color: #750D37;
                margin: 0;
                font-size: 1.5rem;
            }
            
            .modal-close {
                background: #FFF0F5;
                border: none;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                cursor: pointer;
                font-size: 1.5rem;
                color: #750D37;
                transition: all 0.3s ease;
            }
            
            .modal-close:hover {
                background: #750D37;
                color: white;
                transform: rotate(90deg);
            }
            
            .modal-body {
                padding: 2rem;
                color: #750D37;
            }
            
            .modal-body h3 {
                color: #750D37;
                margin-top: 0;
                margin-bottom: 1rem;
            }
            
            .modal-body h4 {
                color: #a91b5a;
                margin-top: 1.5rem;
                margin-bottom: 0.8rem;
            }
            
            .modal-body p {
                line-height: 1.7;
                margin-bottom: 1rem;
            }
            
            .modal-body ul {
                margin-left: 1.5rem;
                margin-bottom: 1rem;
            }
            
            .modal-body li {
                margin-bottom: 0.5rem;
                line-height: 1.6;
            }
            
            .modal-body strong {
                color: #750D37;
                font-weight: 600;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Add modal to page
    document.body.appendChild(modal);
    
    // Close on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    updateDashboard();
    startAutoRefresh();
});