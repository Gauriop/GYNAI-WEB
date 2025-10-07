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
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const values = [65, 45, 78, 52, 88, 42, 70];
    
    days.forEach((day, index) => {
        const group = document.createElement('div');
        group.className = 'bar-group';
        
        const bar = document.createElement('div');
        bar.className = 'bar';
        bar.style.height = '0%';
        
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
}

function animateMetrics() {
    animateValue('heartRate', 0, 72, 1500);
    animateValue('hemoglobin', 0, 12.5, 1500, true);
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
    window.location.href = 'home.html';
}

document.addEventListener('DOMContentLoaded', updateDashboard);