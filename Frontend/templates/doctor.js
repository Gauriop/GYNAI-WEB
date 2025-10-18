
        const API_BASE_URL = 'http://localhost:5001/api';
        let doctorsData = null;
        let filteredDoctors = [];
        let searchTerm = '';
        let selectedSpecialty = 'all';
        let selectedAvailability = 'all';
        let userLocation = null;
        let map = null;
        let googleMapsApiKey = '';
        let directionsService = null;
        let directionsRenderer = null;
        

        async function loadConfig() {
            try {
                const response = await fetch(`${API_BASE_URL}/config`);
                const config = await response.json();
                googleMapsApiKey = config.googleMapsApiKey;
                
                const script = document.createElement('script');
                script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&callback=initMap`;
                script.async = true;
                script.defer = true;
                document.head.appendChild(script);
            } catch (error) {
                console.error('Error loading config:', error);
            }
        }

        window.initMap = function() {
            console.log('Google Maps loaded successfully');
        };

        async function loadDoctorsData() {
            try {
                const response = await fetch('./database.json');
                doctorsData = await response.json();
                initializeApp();
            } catch (error) {
                console.error('Error loading doctors data:', error);
                showToast('Error loading doctor data', 'error');
            }
        }

        function initializeApp() {
            populateDropdowns();
            filteredDoctors = doctorsData.doctors;
            updateDisplay();
            setupEventListeners();
        }

        function populateDropdowns() {
            const specialtyContent = document.getElementById('specialtyContent');
            doctorsData.specialties.forEach(specialty => {
                const item = document.createElement('div');
                item.className = 'dropdown-item';
                item.innerHTML = `
                    <span>${specialty}</span>
                    <i class="fas fa-check" style="display: none;"></i>
                `;
                item.onclick = () => selectSpecialty(specialty);
                specialtyContent.appendChild(item);
            });

            const availabilityContent = document.getElementById('availabilityContent');
            doctorsData.availabilityOptions.forEach(option => {
                const item = document.createElement('div');
                item.className = 'dropdown-item';
                item.innerHTML = `
                    <span>${option}</span>
                    <i class="fas fa-check" style="display: none;"></i>
                `;
                item.onclick = () => selectAvailability(option);
                availabilityContent.appendChild(item);
            });
        }

        function setupEventListeners() {
            document.getElementById('searchInput').addEventListener('input', (e) => {
                searchTerm = e.target.value.toLowerCase();
                filterDoctors();
            });

            document.getElementById('specialtyDropdown').addEventListener('click', (e) => {
                e.stopPropagation();
                toggleDropdown('specialtyContent');
            });

            document.getElementById('availabilityDropdown').addEventListener('click', (e) => {
                e.stopPropagation();
                toggleDropdown('availabilityContent');
            });

            document.addEventListener('click', () => {
                document.querySelectorAll('.dropdown-content').forEach(dropdown => {
                    dropdown.classList.remove('show');
                });
            });
        }

        function toggleDropdown(contentId) {
            const content = document.getElementById(contentId);
            content.classList.toggle('show');
            
            document.querySelectorAll('.dropdown-content').forEach(dropdown => {
                if (dropdown.id !== contentId) {
                    dropdown.classList.remove('show');
                }
            });
        }

        function selectSpecialty(specialty) {
            selectedSpecialty = specialty === 'All Specialties' ? 'all' : specialty;
            document.getElementById('specialtyText').textContent = specialty;
            updateDropdownSelection('specialtyContent', specialty);
            toggleDropdown('specialtyContent');
            filterDoctors();
        }

        function selectAvailability(availability) {
            selectedAvailability = availability === 'All Availability' ? 'all' : availability;
            document.getElementById('availabilityText').textContent = availability;
            updateDropdownSelection('availabilityContent', availability);
            toggleDropdown('availabilityContent');
            filterDoctors();
        }

        function updateDropdownSelection(contentId, selectedValue) {
            const content = document.getElementById(contentId);
            content.querySelectorAll('.dropdown-item').forEach(item => {
                const checkIcon = item.querySelector('.fas.fa-check');
                const span = item.querySelector('span');
                if (span.textContent === selectedValue) {
                    checkIcon.style.display = 'inline';
                } else {
                    checkIcon.style.display = 'none';
                }
            });
        }

        function filterDoctors() {
            filteredDoctors = doctorsData.doctors.filter(doctor => {
                const matchesSearch = !searchTerm || 
                    doctor.name.toLowerCase().includes(searchTerm) ||
                    doctor.specialty.toLowerCase().includes(searchTerm) ||
                    doctor.clinic.toLowerCase().includes(searchTerm);
                
                const matchesSpecialty = selectedSpecialty === 'all' || 
                    doctor.specialty === selectedSpecialty;
                
                const matchesAvailability = selectedAvailability === 'all' ||
                    (selectedAvailability === 'Available Now' && doctor.availability === 'available') ||
                    (selectedAvailability === 'Available Today' && doctor.availability !== 'offline') ||
                    (selectedAvailability === 'Available Tomorrow' && doctor.availability !== 'offline') ||
                    (selectedAvailability === 'Available This Week' && doctor.availability !== 'offline');
                
                return matchesSearch && matchesSpecialty && matchesAvailability;
            });

            if (userLocation) {
                filteredDoctors = filteredDoctors.map(doctor => ({
                    ...doctor,
                    distance: calculateDistance(
                        userLocation.lat,
                        userLocation.lng,
                        doctor.location.latitude,
                        doctor.location.longitude
                    )
                })).sort((a, b) => a.distance - b.distance);
            }

            updateDisplay();
        }

        function calculateDistance(lat1, lon1, lat2, lon2) {
            const R = 6371;
            const dLat = (lat2 - lat1) * Math.PI / 180;
            const dLon = (lon2 - lon1) * Math.PI / 180;
            const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            return (R * c).toFixed(2);
        }

        function updateDisplay() {
            updateStatistics();
            updateResultsHeader();
            updateFilterTags();
            renderDoctors();
        }

        function updateStatistics() {
            const totalDoctors = filteredDoctors.length;
            const availableNow = filteredDoctors.filter(d => d.availability === 'available').length;
            const averageRating = filteredDoctors.length > 0 
                ? (filteredDoctors.reduce((sum, d) => sum + d.rating, 0) / filteredDoctors.length).toFixed(1)
                : '0.0';
            
            document.getElementById('totalDoctors').textContent = totalDoctors;
            document.getElementById('availableNow').textContent = availableNow;
            document.getElementById('averageRating').textContent = averageRating + '★';
        }

        function updateResultsHeader() {
            const count = filteredDoctors.length;
            document.getElementById('resultsTitle').textContent = 
                `${count} Doctor${count !== 1 ? 's' : ''} Found`;
        }

        function updateFilterTags() {
            const filterTags = document.getElementById('filterTags');
            filterTags.innerHTML = '';

            if (selectedSpecialty !== 'all') {
                addFilterTag(selectedSpecialty, () => selectSpecialty('All Specialties'));
            }

            if (selectedAvailability !== 'all') {
                addFilterTag(selectedAvailability, () => selectAvailability('All Availability'));
            }

            if (searchTerm) {
                addFilterTag(`"${searchTerm}"`, () => {
                    document.getElementById('searchInput').value = '';
                    searchTerm = '';
                    filterDoctors();
                });
            }

            if (userLocation) {
                addFilterTag('Near Me', () => {
                    userLocation = null;
                    filterDoctors();
                });
            }
        }

        function addFilterTag(text, onRemove) {
            const filterTags = document.getElementById('filterTags');
            const tag = document.createElement('div');
            tag.className = 'filter-tag';
            tag.innerHTML = `
                <span>${text}</span>
                <button onclick="event.preventDefault(); (${onRemove.toString()})()">×</button>
            `;
            filterTags.appendChild(tag);
        }

        function renderDoctors() {
            const grid = document.getElementById('doctorsGrid');
            const noResults = document.getElementById('noResults');

            if (filteredDoctors.length === 0) {
                grid.style.display = 'none';
                noResults.style.display = 'block';
                return;
            }

            grid.style.display = 'grid';
            noResults.style.display = 'none';
            
            grid.innerHTML = filteredDoctors.map(doctor => createDoctorCard(doctor)).join('');
        }

        function createDoctorCard(doctor) {
            const availabilityClass = doctor.availability;
            const stars = generateStars(doctor.rating);
            const initials = doctor.name.split(' ').map(n => n[0]).join('');
            const distanceText = doctor.distance ? `${doctor.distance} km away` : '';

            return `
                <div class="doctor-card">
                    <div class="doctor-header">
                        <div class="doctor-info">
                            <div class="doctor-avatar">${initials}</div>
                            <div class="doctor-details">
                                <h3>Dr. ${doctor.name}</h3>
                                <div class="doctor-specialty">${doctor.specialty}</div>
                            </div>
                        </div>
                        <div class="availability-badge ${availabilityClass}">${doctor.availability}</div>
                    </div>

                    <div class="doctor-meta">
                        <div class="meta-item">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>${doctor.clinic}</span>
                            ${distanceText ? `<span style="margin-left: auto; color: var(--medical-secondary); font-weight: 600;">${distanceText}</span>` : ''}
                        </div>
                        
                        <div class="meta-item rating">
                            <div class="stars">${stars}</div>
                            <span>${doctor.rating} (${doctor.reviews} reviews)</span>
                            <span style="margin-left: auto;">${doctor.experience} years exp.</span>
                        </div>

                        <div class="meta-item">
                            <span>Consultation Fee:</span>
                            <span class="fee">₹${doctor.consultationFee}</span>
                        </div>

                        <div class="meta-item">
                            <i class="fas fa-calendar"></i>
                            <span>Next available: ${doctor.nextAvailable}</span>
                        </div>
                    </div>

                    <div class="doctor-actions">
                        <button class="btn btn-primary" onclick="bookAppointment(${doctor.id})">
                            <i class="fas fa-calendar"></i>
                            Book Appointment
                        </button>
                        
                        <button class="btn btn-outline" onclick="callDoctor(${doctor.id})">
                            <i class="fas fa-phone"></i>
                        </button>
                        
                        <button class="btn btn-outline" onclick="viewLocation(${doctor.id})">
                            <i class="fas fa-map-marker-alt"></i>
                        </button>
                    </div>
                </div>
            `;
        }

        function generateStars(rating) {
            const fullStars = Math.floor(rating);
            let stars = '';
            
            for (let i = 0; i < 5; i++) {
                stars += i < fullStars ? '★' : '☆';
            }
            
            return stars;
        }

        function clearAllFilters() {
            document.getElementById('searchInput').value = '';
            searchTerm = '';
            userLocation = null;
            selectSpecialty('All Specialties');
            selectAvailability('All Availability');
        }

        function detectLocation() {
            if (!navigator.geolocation) {
                showToast('Geolocation is not supported by this browser', 'error');
                return;
            }

            showToast('Detecting your location...', 'info');
            
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    userLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    showToast('Location detected successfully!', 'success');
                    filterDoctors();
                },
                (error) => {
                    console.error('Geolocation error:', error);
                    showToast('Could not detect location. Please try again.', 'error');
                }
            );
        }

        function bookAppointment(doctorId) {
            const doctor = filteredDoctors.find(d => d.id === doctorId);
            showToast(`Booking appointment with Dr. ${doctor.name}...`, 'success');
        }

        function callDoctor(doctorId) {
            const doctor = filteredDoctors.find(d => d.id === doctorId);
            showToast(`Calling Dr. ${doctor.name} at ${doctor.phone}`, 'info');
            setTimeout(() => {
                if (navigator.userAgent.match(/Mobile|Android|iPhone|iPad/)) {
                    window.location.href = `tel:${doctor.phone}`;
                } else {
                    showToast('Please use your phone to call: ' + doctor.phone, 'info');
                }
            }, 1000);
        }

        function viewLocation(doctorId) {
            const doctor = filteredDoctors.find(d => d.id === doctorId);
            showMapModal(doctor);
        }

        function showMapModal(doctor) {
            const modal = document.getElementById('mapModal');
            const modalTitle = document.getElementById('mapModalTitle');
            
            modalTitle.textContent = `${doctor.clinic} - Dr. ${doctor.name}`;
            modal.classList.add('show');

            initializeMap(doctor);
        }

        function closeMapModal() {
            const modal = document.getElementById('mapModal');
            modal.classList.remove('show');
        }

        function initializeMap(doctor) {
            const doctorLocation = {
                lat: doctor.location.latitude,
                lng: doctor.location.longitude
            };

            map = new google.maps.Map(document.getElementById('map'), {
                zoom: 15,
                center: doctorLocation,
                mapTypeControl: true,
                streetViewControl: true,
                fullscreenControl: true
            });

            const marker = new google.maps.Marker({
                position: doctorLocation,
                map: map,
                title: doctor.clinic,
                animation: google.maps.Animation.DROP
            });

            const infoWindow = new google.maps.InfoWindow({
                content: `
                    <div style="padding: 10px;">
                        <h3 style="margin: 0 0 5px 0; color: var(--medical-primary);">Dr. ${doctor.name}</h3>
                        <p style="margin: 0 0 5px 0;"><strong>${doctor.specialty}</strong></p>
                        <p style="margin: 0 0 5px 0;">${doctor.clinic}</p>
                        <p style="margin: 0; color: #10b981;"><strong>₹${doctor.consultationFee}</strong> consultation fee</p>
                    </div>
                `
            });

            marker.addListener('click', () => {
                infoWindow.open(map, marker);
            });

            infoWindow.open(map, marker);

            if (userLocation) {
                const userMarker = new google.maps.Marker({
                    position: userLocation,
                    map: map,
                    title: 'Your Location',
                    icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
                });

                if (!directionsService) {
                    directionsService = new google.maps.DirectionsService();
                    directionsRenderer = new google.maps.DirectionsRenderer({
                        map: map,
                        suppressMarkers: false
                    });
                }

                const request = {
                    origin: userLocation,
                    destination: doctorLocation,
                    travelMode: google.maps.TravelMode.DRIVING
                };

                directionsService.route(request, (result, status) => {
                    if (status === 'OK') {
                        directionsRenderer.setDirections(result);
                    }
                });
            }
        }

        function showToast(message, type = 'info') {
            const toast = document.getElementById('toast');
            const toastMessage = document.getElementById('toastMessage');
            
            toast.className = `toast toast-${type} show`;
            toastMessage.textContent = message;
            
            setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
        }

        document.addEventListener('DOMContentLoaded', () => {
            loadConfig();
            loadDoctorsData();
        });
