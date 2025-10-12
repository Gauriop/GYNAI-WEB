// Initialize date to today
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing...');
    document.getElementById('trackingDate').valueAsDate = new Date();
    
    // Initialize all range sliders
    initializeRangeSliders();
    
    // Load history
    displayHistory();
});

// Store selected mood
let selectedMood = null;

// Initialize range sliders with proper event listeners
function initializeRangeSliders() {
    const rangeInputs = document.querySelectorAll('.range-input');
    console.log('Found range inputs:', rangeInputs.length);
    
    rangeInputs.forEach(input => {
        const valueDisplay = document.getElementById(input.id + 'Value');
        console.log('Setting up slider:', input.id, 'Display:', valueDisplay);
        
        if (valueDisplay) {
            // Update display on input (real-time as you slide)
            input.addEventListener('input', function() {
                console.log('Input event:', input.id, this.value);
                valueDisplay.textContent = this.value;
            });
            
            // Also update on change (when you release)
            input.addEventListener('change', function() {
                console.log('Change event:', input.id, this.value);
                valueDisplay.textContent = this.value;
            });
            
            // Also try mousemove for better compatibility
            input.addEventListener('mousemove', function() {
                if (this === document.activeElement) {
                    valueDisplay.textContent = this.value;
                }
            });
            
            // Touch events for mobile
            input.addEventListener('touchmove', function() {
                valueDisplay.textContent = this.value;
            });
            
            // Set initial value
            valueDisplay.textContent = input.value;
            console.log('Initial value set:', input.id, input.value);
        } else {
            console.error('Value display not found for:', input.id);
        }
    });
}

// Mood selector
const moodOptions = document.querySelectorAll('.mood-option');
moodOptions.forEach(option => {
    option.addEventListener('click', () => {
        moodOptions.forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');
        selectedMood = option.dataset.mood;
    });
});

// Form submission
document.getElementById('trackingForm').addEventListener('submit', (e) => {
    e.preventDefault();

    // Collect form data
    const formData = {
        date: document.getElementById('trackingDate').value,
        painLevel: document.getElementById('painLevel').value,
        pelvicPain: document.getElementById('pelvicPain').value,
        backPain: document.getElementById('backPain').value,
        headacheLevel: document.getElementById('headacheLevel').value,
        bleeding: document.getElementById('bleeding').value,
        cycleDay: document.getElementById('cycleDay').value,
        cervicalMucus: document.getElementById('cervicalMucus').value,
        cramps: document.getElementById('cramps').value,
        symptoms: Array.from(document.querySelectorAll('input[name="symptoms"]:checked')).map(cb => cb.value),
        mood: selectedMood,
        anxietyLevel: document.getElementById('anxietyLevel').value,
        stressLevel: document.getElementById('stressLevel').value,
        sleepHours: document.getElementById('sleepHours').value,
        sleepQuality: document.getElementById('sleepQuality').value,
        energyLevel: document.getElementById('energyLevel').value,
        fatigueLevel: document.getElementById('fatigueLevel').value,
        notes: document.getElementById('notes').value,
        medications: document.getElementById('medications').value,
        timestamp: new Date().toISOString()
    };

    // Get existing data
    let trackingData = JSON.parse(window.trackingData || '[]');
    
    // Check if entry for this date exists
    const existingIndex = trackingData.findIndex(entry => entry.date === formData.date);
    if (existingIndex !== -1) {
        trackingData[existingIndex] = formData;
    } else {
        trackingData.push(formData);
    }

    // Sort by date (newest first)
    trackingData.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Store data
    window.trackingData = JSON.stringify(trackingData);

    // Show success message
    const successMessage = document.getElementById('successMessage');
    successMessage.classList.add('show');
    setTimeout(() => {
        successMessage.classList.remove('show');
    }, 3000);

    // Update history display
    displayHistory();

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Display history
function displayHistory() {
    const historyContainer = document.getElementById('historyContainer');
    const trackingData = JSON.parse(window.trackingData || '[]');

    if (trackingData.length === 0) {
        historyContainer.innerHTML = '<div style="text-align: center; padding: 40px; color: #999;"><i class="fas fa-inbox" style="font-size: 3rem; display: block; margin-bottom: 15px;"></i><p>No entries yet. Start tracking your symptoms!</p></div>';
        return;
    }

    historyContainer.innerHTML = trackingData.slice(0, 5).map(entry => {
        const date = new Date(entry.date);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        let dateLabel;
        if (date.toDateString() === today.toDateString()) {
            dateLabel = 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            dateLabel = 'Yesterday';
        } else {
            dateLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }

        const symptoms = entry.symptoms.length > 0 ? entry.symptoms.join(', ') : 'None';
        const moodEmoji = {
            'terrible': '😢',
            'bad': '😞',
            'okay': '😐',
            'good': '😊',
            'great': '😄'
        }[entry.mood] || '—';

        return `
            <div class="history-item">
                <div>
                    <div class="history-date">${dateLabel}</div>
                    <div class="history-summary">
                        Pain: ${entry.painLevel}/10 • 
                        Mood: ${moodEmoji} ${entry.mood || 'Not set'} • 
                        Bleeding: ${entry.bleeding} • 
                        Sleep: ${entry.sleepHours || '—'} hrs
                    </div>
                    ${entry.notes ? `<div style="margin-top: 8px; color: #888; font-size: 13px;">${entry.notes}</div>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

// Export data function
function exportData() {
    const trackingData = JSON.parse(window.trackingData || '[]');
    
    if (trackingData.length === 0) {
        alert('No data to export yet!');
        return;
    }

    // Create CSV content
    const headers = ['Date', 'Pain Level', 'Pelvic Pain', 'Back Pain', 'Headache', 'Bleeding', 'Cycle Day', 'Cervical Mucus', 'Cramps', 'Physical Symptoms', 'Mood', 'Anxiety', 'Stress', 'Sleep Hours', 'Sleep Quality', 'Energy Level', 'Fatigue', 'Notes', 'Medications'];
    
    const csvContent = [
        headers.join(','),
        ...trackingData.map(entry => [
            entry.date,
            entry.painLevel,
            entry.pelvicPain,
            entry.backPain,
            entry.headacheLevel,
            entry.bleeding,
            entry.cycleDay || '',
            entry.cervicalMucus,
            entry.cramps,
            `"${entry.symptoms.join('; ')}"`,
            entry.mood || '',
            entry.anxietyLevel,
            entry.stressLevel,
            entry.sleepHours || '',
            entry.sleepQuality,
            entry.energyLevel,
            entry.fatigueLevel,
            `"${entry.notes || ''}"`,
            `"${entry.medications || ''}"`
        ].join(','))
    ].join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gynai-symptom-tracker-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    alert('Your symptom data has been exported successfully!');
}

// Load data for selected date if it exists
document.getElementById('trackingDate').addEventListener('change', function() {
    const selectedDate = this.value;
    const trackingData = JSON.parse(window.trackingData || '[]');
    const existingEntry = trackingData.find(entry => entry.date === selectedDate);

    if (existingEntry) {
        // Populate form with existing data
        document.getElementById('painLevel').value = existingEntry.painLevel;
        document.getElementById('painLevelValue').textContent = existingEntry.painLevel;
        document.getElementById('pelvicPain').value = existingEntry.pelvicPain;
        document.getElementById('pelvicPainValue').textContent = existingEntry.pelvicPain;
        document.getElementById('backPain').value = existingEntry.backPain;
        document.getElementById('backPainValue').textContent = existingEntry.backPain;
        document.getElementById('headacheLevel').value = existingEntry.headacheLevel;
        document.getElementById('headacheLevelValue').textContent = existingEntry.headacheLevel;
        document.getElementById('bleeding').value = existingEntry.bleeding;
        document.getElementById('cycleDay').value = existingEntry.cycleDay;
        document.getElementById('cervicalMucus').value = existingEntry.cervicalMucus;
        document.getElementById('cramps').value = existingEntry.cramps;
        document.getElementById('crampsValue').textContent = existingEntry.cramps;
        document.getElementById('anxietyLevel').value = existingEntry.anxietyLevel;
        document.getElementById('anxietyLevelValue').textContent = existingEntry.anxietyLevel;
        document.getElementById('stressLevel').value = existingEntry.stressLevel;
        document.getElementById('stressLevelValue').textContent = existingEntry.stressLevel;
        document.getElementById('sleepHours').value = existingEntry.sleepHours;
        document.getElementById('sleepQuality').value = existingEntry.sleepQuality;
        document.getElementById('sleepQualityValue').textContent = existingEntry.sleepQuality;
        document.getElementById('energyLevel').value = existingEntry.energyLevel;
        document.getElementById('energyLevelValue').textContent = existingEntry.energyLevel;
        document.getElementById('fatigueLevel').value = existingEntry.fatigueLevel;
        document.getElementById('fatigueLevelValue').textContent = existingEntry.fatigueLevel;
        document.getElementById('notes').value = existingEntry.notes;
        document.getElementById('medications').value = existingEntry.medications;

        // Set checkboxes
        document.querySelectorAll('input[name="symptoms"]').forEach(cb => {
            cb.checked = existingEntry.symptoms.includes(cb.value);
        });

        // Set mood
        if (existingEntry.mood) {
            moodOptions.forEach(opt => opt.classList.remove('selected'));
            const moodOption = document.querySelector(`[data-mood="${existingEntry.mood}"]`);
            if (moodOption) {
                moodOption.classList.add('selected');
                selectedMood = existingEntry.mood;
            }
        }
    } else {
        // Reset form for new date
        document.getElementById('trackingForm').reset();
        initializeRangeSliders();
        moodOptions.forEach(opt => opt.classList.remove('selected'));
        selectedMood = null;
    }
});