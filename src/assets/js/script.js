// Global Variables
let currentPage = 'home';
let competitions = [];
let dashboardCompetitions = [];
let activityFeed = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupNavigation();
    // Optional features (guarded in case not defined elsewhere)
    try { setupMascotAnimations && setupMascotAnimations(); } catch (e) {}
    try { setupBackgroundEffects && setupBackgroundEffects(); } catch (e) {}
    try { setupForms && setupForms(); } catch (e) {}
    try { typeof setupTabs === 'function' && setupTabs(); } catch (e) {}
    try { typeof loadCompetitions === 'function' && loadCompetitions(); } catch (e) {}
    try { typeof loadDashboardData === 'function' && loadDashboardData(); } catch (e) {}
    try { setupPasswordToggles && setupPasswordToggles(); } catch (e) {}
    try { typeof setupProfileEdit === 'function' && setupProfileEdit(); } catch (e) {}
    // Ensure profile dropdown gets wired if dashboard is present
    try { setupProfileMenuDropdown && setupProfileMenuDropdown(); } catch (e) {}
    
    // Load current user data from server FIRST, then restore from localStorage as fallback
    loadCurrentUser().then(() => {
        // Only restore from localStorage if server session is not available
        if (!window.currentUser) {
            restoreUserSession();
        }
        updateAuthUI();
    }).catch(() => {
        // On error, try localStorage as fallback only if we're not on a protected page
        const currentPage = location.hash.replace('#', '') || 'home';
        if (currentPage !== 'dashboard' && currentPage !== 'profile') {
            restoreUserSession();
        }
        updateAuthUI();
    });
    
    // Cek hash URL saat pertama kali load
    const initialPage = location.hash.replace('#', '') || 'home';
    showPage(initialPage);

    // Update page saat hash berubah
    window.addEventListener('hashchange', () => {
        const page = location.hash.replace('#', '') || 'home';
        showPage(page);
    });
}

// ✅ FIXED: Notifikasi sederhana
function showNotification(message, type) {
    // Cari elemen notif, kalau belum ada buat
    let notification = document.getElementById('notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'notification';
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.padding = '10px 15px';
        notification.style.border = '2px solid';
        notification.style.borderRadius = '8px';
        notification.style.background = '#111';
        notification.style.color = '#fff';
        notification.style.zIndex = '2000';
        document.body.appendChild(notification);
    }

    // Warna sesuai type
    if (type === 'success') {
        notification.style.borderColor = '#28a745';
        notification.innerHTML = `<i class="fas fa-check-circle" style="color:#28a745; margin-right:5px;"></i>${message}`;
    } else if (type === 'error') {
        notification.style.borderColor = '#dc3545';
        notification.innerHTML = `<i class="fas fa-exclamation-circle" style="color:#dc3545; margin-right:5px;"></i>${message}`;
    } else {
        notification.style.borderColor = '#00ffff';
        notification.innerHTML = `<i class="fas fa-info-circle" style="color:#00ffff; margin-right:5px;"></i>${message}`;
    }

    // Auto hilang
    setTimeout(() => {
        if (notification) notification.remove();
    }, 3000);
}

// Navigation System
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.getAttribute('data-page');
            if (page === 'logout') {
                performSignOut();
                return;
            }
            location.hash = page; // update hash
            showPage(page);
            
            // Close mobile menu
            navMenu.classList.remove('active');
        });
    });

    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });
}

function showPage(pageId) {
    // Hide all pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
    
    // Auth guard for protected pages
    if ((pageId === 'dashboard' || pageId === 'profile') && !isAuthenticated()) {
        showNotification('Please sign in to access that page', 'error');
        location.hash = 'signin';
        pageId = 'signin';
    }
    
    // Admin-only guard
    if (pageId === 'admin') {
        if (!isAuthenticated()) {
            showNotification('Please sign in to access admin panel', 'error');
            location.hash = 'signin';
            pageId = 'signin';
        } else if (!window.currentUser || window.currentUser.role !== 'admin') {
            showNotification('Access denied. Admin privileges required.', 'error');
            location.hash = 'home';
            pageId = 'home';
        } else {
            // Load admin data when accessing admin page
            setTimeout(() => {
                loadAdminCompetitions();
            }, 100);
        }
    }

    // Show target page
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
        currentPage = pageId;
        
        // Update navigation active state
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-page') === pageId) {
                link.classList.add('active');
            }
        });
        // Ensure auth-based visibility is always enforced
        updateAuthUI();
        
        // Update page title
        updatePageTitle(pageId);
        
        // Trigger page-specific functions
        // if (pageId === 'competitions') {
        //     renderCompetitions();
        // } else if (pageId === 'dashboard') {
        //     renderDashboard();
        //     updateUserUI();
        //     setupProfileMenuDropdown();
        // }
    }
}

function updatePageTitle(pageId) {
    const titles = {
        'home': 'Koneko CTF - Capture The Flag Competition',
        'competitions': 'CTF Competitions - Koneko CTF',
        'dashboard': 'Dashboard - Koneko CTF',
        'profile': 'Profile Management - Koneko CTF',
        'signin': 'Sign In - Koneko CTF',
        'signup': 'Sign Up - Koneko CTF'
    };
    
    document.title = titles[pageId] || 'Koneko CTF';
}

// Mascot Animations
function setupMascotAnimations() {
    const speechBubbles = document.querySelectorAll('.speech-text');
    const messages = [
        "Ready to hack the matrix?",
        "Let's pwn some challenges!",
        "Time to show your skills!",
        "Meow-velous hacking ahead!",
        "CTF time, let's go!",
        "Ready for some cyber fun?",
        "Hack the planet, meow!",
        "Let's catch some flags!"
    ];
    
    speechBubbles.forEach((bubble, bubbleIndex) => {
        let currentMessageIndex = bubbleIndex % messages.length;
        
        // Function to cycle through messages in order
        function showNextMessage() {
            if (bubble.isTyping) return; // Prevent overlapping animations
            
            const message = messages[currentMessageIndex];
            currentMessageIndex = (currentMessageIndex + 1) % messages.length;
            
            typeMessage(bubble, message);
        }
        
        // Start the first message after a delay
        setTimeout(() => {
            showNextMessage();
        }, bubbleIndex * 1000); // Stagger initial messages
        
        // Set up interval for subsequent messages
        setInterval(showNextMessage, 10000); // Increased interval for better readability
    });
}

function typeMessage(element, message) {
    // Clear any existing typing animation
    if (element.typingInterval) {
        clearInterval(element.typingInterval);
    }
    
    // Set typing flag
    element.isTyping = true;
    
    element.textContent = '';
    let i = 0;
    
    element.typingInterval = setInterval(() => {
        if (i < message.length) {
            element.textContent += message[i];
            i++;
        } else {
            // Typing complete
            clearInterval(element.typingInterval);
            element.typingInterval = null;
            element.isTyping = false;
        }
    }, 80); // Slightly faster typing for better UX
}

// Background Effects
function setupBackgroundEffects() {
    setupMatrixRain();
    setupFloatingIcons();
}

function setupMatrixRain() {
    const canvas = document.getElementById('matrix-canvas');
    if (!canvas) return; // ✅ Cegah error kalau canvas belum ada
    const ctx = canvas.getContext('2d');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const matrix = "ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()*&^%+-/~{[|`]}";
    const matrixArray = matrix.split("");
    
    const fontSize = 10;
    const columns = canvas.width / fontSize;
    
    const drops = [];
    for (let x = 0; x < columns; x++) {
        drops[x] = 1;
    }
    
    function drawMatrix() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.04)'; // ini cuma untuk "clear canvas" + efek fading
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#00ffffff'; // ini yang benar-benar dipakai untuk warna huruf
        ctx.font = fontSize + 'px monospace'
        
        for (let i = 0; i < drops.length; i++) {
            // Restore original Matrix rain effect with random characters
            const text = matrixArray[Math.floor(Math.random() * matrixArray.length)];
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);
            
            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }
    
    setInterval(drawMatrix, 35);
    
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

function setupFloatingIcons() {
    const floatingIcons = document.querySelectorAll('.floating-icon');
    
    floatingIcons.forEach((icon, index) => {
        icon.style.animationDelay = `${index * -2}s`;
        // Restore random positioning for more natural floating effect
        icon.style.left = `${Math.random() * 100}%`;
    });
}

// ============================
// Missing Functions Implementation
// ============================

function setupTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons and panes
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));

            // Add active class to clicked button and corresponding pane
            btn.classList.add('active');
            const tabId = btn.getAttribute('data-tab') + '-tab';
            document.getElementById(tabId)?.classList.add('active');
        });
    });
}

async function loadCompetitions() {
    try {
        const response = await fetch('/api/competitions.php');
        const data = await response.json();
        
        if (response.ok) {
            competitions = data || [];
            renderCompetitions();
            setupCompetitionFilters();
        } else {
            console.error('Error loading competitions:', data.error);
            competitions = [];
            renderCompetitions();
        }
    } catch (error) {
        console.error('Error fetching competitions:', error);
        competitions = [];
        renderCompetitions();
    }
}

function setupCompetitionFilters() {
    // Search functionality
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            renderCompetitions();
        });
    }

    // Filter buttons
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');
            // Re-render competitions
            renderCompetitions();
        });
    });
}

function renderCompetitions() {
    const container = document.getElementById('competitions-list');
    if (!container) return;

    const searchTerm = document.getElementById('search-input')?.value?.toLowerCase() || '';
    const activeFilter = document.querySelector('.filter-btn.active')?.getAttribute('data-filter') || 'all';

    let filteredCompetitions = competitions.filter(comp => {
        const matchesSearch = (comp.name && comp.name.toLowerCase().includes(searchTerm)) ||
                            (comp.description && comp.description.toLowerCase().includes(searchTerm)) ||
                            (comp.category && comp.category.toLowerCase().includes(searchTerm));
        
        let matchesFilter = true;
        if (activeFilter === 'open') {
            matchesFilter = comp.status === 'registration_open';
        } else if (activeFilter === 'upcoming') {
            matchesFilter = comp.status === 'upcoming';
        } else if (activeFilter === 'ended') {
            matchesFilter = comp.status === 'completed';
        }
        
        return matchesSearch && matchesFilter;
    });

    if (filteredCompetitions.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 3rem; color: #64748b;"><p>No competitions found.</p></div>';
        return;
    }

    container.innerHTML = filteredCompetitions.map(comp => `
        <div class="competition-card ${comp.status}">
            ${comp.banner_url ? `<div style="width: 100%; height: 150px; background: url('${escapeHtml(comp.banner_url)}') center/cover; border-radius: 8px 8px 0 0; margin: -1rem -1rem 1rem -1rem;"></div>` : ''}
            <div class="competition-header">
                <h3>${escapeHtml(comp.name)}</h3>
                <span class="competition-status status-${comp.status}">${comp.status.replace('_', ' ')}</span>
            </div>
            <p class="competition-description">${escapeHtml(comp.description || 'No description available')}</p>
            <div class="competition-meta">
                <span class="meta-item">
                    <i class="fas fa-users"></i>
                    ${comp.current_participants || 0}${comp.max_participants ? '/' + comp.max_participants : ''} participants
                </span>
                <span class="meta-item">
                    <i class="fas fa-chart-line"></i>
                    ${comp.difficulty_level}
                </span>
                <span class="meta-item">
                    <i class="fas fa-tag"></i>
                    ${comp.category}
                </span>
            </div>
            <div class="competition-meta">
                <span class="meta-item">
                    <i class="fas fa-calendar"></i>
                    ${formatDate(comp.start_date)} - ${formatDate(comp.end_date)}
                </span>
            </div>
            ${comp.prize_pool ? `<div style="margin: 0.5rem 0; font-weight: 600; color: #10b981;"><i class="fas fa-trophy"></i> Prize: ${escapeHtml(comp.prize_pool)}</div>` : ''}
            <div class="competition-actions">
                ${comp.is_registered ? 
                    '<button class="btn btn-outline btn-sm" disabled><i class="fas fa-check"></i> Registered</button>' :
                    (comp.status === 'registration_open' || comp.status === 'upcoming') ? 
                        `<button class="btn btn-primary btn-sm" onclick="showRegisterModal(${comp.id})"><i class="fas fa-play"></i> Register</button>` :
                        '<button class="btn btn-outline btn-sm" disabled>Closed</button>'
                }
            </div>
        </div>
    `).join('');
}

async function loadDashboardData() {
    try {
        const response = await fetch('/api/my_competitions.php');
        const data = await response.json();
        
        if (response.ok) {
            dashboardCompetitions = data || [];
            // Mock activity feed for now - can be implemented later
            activityFeed = [];
            renderDashboard();
        } else {
            console.error('Error loading dashboard data:', data.error);
            dashboardCompetitions = [];
            activityFeed = [];
            renderDashboard();
        }
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        dashboardCompetitions = [];
        activityFeed = [];
        renderDashboard();
    }
}

function renderDashboard() {
    // Render dashboard competitions
    const dashboardContainer = document.getElementById('dashboard-competitions');
    if (dashboardContainer) {
        if (dashboardCompetitions.length === 0) {
            dashboardContainer.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #64748b;">
                    <i class="fas fa-trophy" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                    <p>You haven't registered for any competitions yet.</p>
                    <button class="btn btn-primary" onclick="showPage('competitions')" style="margin-top: 1rem;">
                        <i class="fas fa-search"></i> Browse Competitions
                    </button>
                </div>
            `;
        } else {
            dashboardContainer.innerHTML = dashboardCompetitions.map(comp => `
                <div class="competition-card dashboard ${comp.status}">
                    <div class="competition-header">
                        <h3>${escapeHtml(comp.name)}</h3>
                        <span class="competition-status status-${comp.status}">${comp.status.replace('_', ' ')}</span>
                    </div>
                    <p style="color: #64748b; margin: 0.5rem 0;">${escapeHtml(comp.description || '')}</p>
                    <div class="competition-meta">
                        <span class="meta-item">
                            <i class="fas fa-users"></i>
                            Team: ${comp.team_name ? escapeHtml(comp.team_name) : 'Solo'}
                        </span>
                        <span class="meta-item">
                            <i class="fas fa-calendar"></i>
                            ${formatDate(comp.start_date)}
                        </span>
                    </div>
                    ${comp.status === 'ongoing' ? `
                        <div class="competition-stats">
                            <div class="stat">
                                <span class="stat-label">Score</span>
                                <span class="stat-value">${comp.score || 0}</span>
                            </div>
                            ${comp.rank ? `
                            <div class="stat">
                                <span class="stat-label">Rank</span>
                                <span class="stat-value">#${comp.rank}</span>
                            </div>
                            ` : ''}
                        </div>
                    ` : ''}
                    <div class="competition-meta" style="margin-top: 0.5rem;">
                        <span class="meta-item" style="font-size: 0.875rem;">
                            <strong>Registration:</strong> 
                            <span class="status-badge status-${comp.registration_status}">${comp.registration_status}</span>
                        </span>
                        <span class="meta-item" style="font-size: 0.875rem;">
                            <strong>Payment:</strong> 
                            <span class="status-badge status-${comp.payment_status === 'paid' ? 'registration_open' : 'upcoming'}">${comp.payment_status}</span>
                        </span>
                    </div>
                </div>
            `).join('');
        }
    }

    // Render activity feed
    const activityContainer = document.getElementById('activity-feed');
    if (activityContainer) {
        activityContainer.innerHTML = activityFeed.map(activity => `
            <div class="activity-item ${activity.type}">
                <div class="activity-icon">
                    <i class="fas fa-${activity.type === 'challenge_solved' ? 'check-circle' :
                                   activity.type === 'competition_joined' ? 'users' : 'trophy'}"></i>
                </div>
                <div class="activity-content">
                    <p class="activity-message">${activity.message}</p>
                    <span class="activity-time">${activity.time}</span>
                </div>
                ${activity.points > 0 ? `<div class="activity-points">+${activity.points}</div>` : ''}
            </div>
        `).join('');
    }
}

function setupProfileEdit() {
    const editBtn = document.getElementById('edit-profile-btn');
    const cancelBtn = document.getElementById('cancel-edit-btn');
    const saveBtn = document.querySelector('#profile-actions .btn-primary');
    const actions = document.getElementById('profile-actions');
    const inputs = document.querySelectorAll('#info-tab input, #info-tab textarea');
    const avatarBtn = document.querySelector('.avatar-upload .btn-outline');
    const avatarInput = document.createElement('input');
    
    avatarInput.type = 'file';
    avatarInput.accept = 'image/*';
    avatarInput.style.display = 'none';

    if (editBtn) {
        editBtn.addEventListener('click', () => {
            inputs.forEach(input => input.disabled = false);
            actions.style.display = 'flex';
            editBtn.style.display = 'none';
        });
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            inputs.forEach(input => input.disabled = true);
            actions.style.display = 'none';
            editBtn.style.display = 'inline-block';
            // Reload user data to reset form
            loadCurrentUser();
        });
    }

    if (saveBtn) {
        saveBtn.addEventListener('click', async () => {
            await saveProfile();
        });
    }

    // Avatar upload functionality
    if (avatarBtn) {
        avatarBtn.addEventListener('click', () => {
            avatarInput.click();
        });
    }

    avatarInput.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (file) {
            await uploadAvatar(file);
        }
    });

    // Bio character counter real-time update
    const bioTextarea = document.querySelector('#info-tab textarea[name="bio"]');
    if (bioTextarea) {
        bioTextarea.addEventListener('input', () => {
            const charCounter = document.querySelector('.char-counter');
            if (charCounter) {
                const bioLength = bioTextarea.value.length;
                charCounter.textContent = `${bioLength}/500`;
            }
        });
    }

    // Add avatar input to page
    document.body.appendChild(avatarInput);
}

async function saveProfile() {
    const fullNameInput = document.querySelector('#info-tab input[name="full_name"]');
    const emailInput = document.querySelector('#info-tab input[name="email"]');
    const locationInput = document.querySelector('#info-tab input[name="location"]');
    const bioTextarea = document.querySelector('#info-tab textarea[name="bio"]');
    
    const profileData = {
        full_name: fullNameInput?.value?.trim() || '',
        email: emailInput?.value?.trim() || '',
        location: locationInput?.value?.trim() || '',
        bio: bioTextarea?.value?.trim() || ''
    };
    
    console.log('Sending profile data:', profileData);
    
    try {
        const response = await fetch('api/update_profile.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'same-origin',
            body: JSON.stringify(profileData)
        });
        
        const responseText = await response.text();
        console.log('Raw response:', responseText);
        
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            console.error('Failed to parse JSON:', e);
            throw new Error('Invalid response from server');
        }
        
        if (response.ok) {
            showNotification(data.message || 'Profile updated successfully', 'success');
            
            // Update local user data with proper field mapping
            const userData = data.user;
            if (userData) {
                // Convert snake_case to camelCase for consistency
                window.currentUser = { 
                    ...window.currentUser, 
                    ...userData,
                    fullName: userData.full_name || userData.fullName,
                    avatarUrl: userData.avatar_url || userData.avatarUrl,
                    createdAt: userData.created_at || userData.createdAt,
                    updatedAt: userData.updated_at || userData.updatedAt
                };
            }
            localStorage.setItem('currentUser', JSON.stringify(window.currentUser));
            
            // Update UI
            updateUserUI();
            
            // Hide edit form
            const editBtn = document.getElementById('edit-profile-btn');
            const actions = document.getElementById('profile-actions');
            const inputs = document.querySelectorAll('#info-tab input, #info-tab textarea');
            
            inputs.forEach(input => input.disabled = true);
            actions.style.display = 'none';
            editBtn.style.display = 'inline-block';
            
        } else {
            console.error('Profile update error:', data);
            showNotification(data.error || 'Failed to update profile', 'error');
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        showNotification('Failed to update profile', 'error');
    }
}

async function uploadAvatar(file) {
    const formData = new FormData();
    formData.append('avatar', file);
    
    try {
        showNotification('Uploading avatar...', 'info');
        
        const response = await fetch('api/upload_avatar.php', {
            method: 'POST',
            credentials: 'same-origin',
            body: formData
        });
        
        const responseText = await response.text();
        console.log('Avatar upload response:', responseText);
        
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            console.error('Failed to parse avatar response:', e);
            throw new Error('Invalid response from server');
        }
        
        if (response.ok) {
            showNotification(data.message || 'Avatar uploaded successfully', 'success');
            
            // Update local user data with new avatar URL and proper field mapping
            const userData = data.user;
            if (userData) {
                // Convert snake_case to camelCase for consistency
                window.currentUser = { 
                    ...window.currentUser, 
                    ...userData,
                    fullName: userData.full_name || userData.fullName,
                    avatarUrl: data.avatar_url || userData.avatar_url || userData.avatarUrl,
                    createdAt: userData.created_at || userData.createdAt,
                    updatedAt: userData.updated_at || userData.updatedAt
                };
            }
            localStorage.setItem('currentUser', JSON.stringify(window.currentUser));
            
            // Update UI immediately
            updateUserUI();
            
            // Force refresh avatar display
            const avatarPreview = document.querySelector('.avatar-preview');
            if (avatarPreview && data.avatar_url) {
                const avatarUrl = data.avatar_url + '?t=' + Date.now();
                avatarPreview.innerHTML = `<img src="${avatarUrl}" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
            }
            
        } else {
            showNotification(data.error || 'Failed to upload avatar', 'error');
        }
    } catch (error) {
        console.error('Error uploading avatar:', error);
        showNotification('Failed to upload avatar', 'error');
    }
}

// ⚡ Semua fungsi lain (setupForms, loadCompetitions, renderDashboard, dsb) biarkan sama persis dengan file aslinya
// cukup tambahkan bagian di atas agar website bisa jalan lancar.

// ============================
// API Integration (PHP backend)
// ============================

async function apiRequest(path, method, body) {
    const res = await fetch(`api/${path}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
        credentials: 'same-origin'
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        const msg = data && data.error ? data.error : `Request failed (${res.status})`;
        throw new Error(msg);
    }
    return data;
}

function setupForms() {
    // Sign In
    const signinForm = document.getElementById('signin-form');
    if (signinForm && !signinForm.__wired) {
        signinForm.__wired = true;
        signinForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const inputs = signinForm.querySelectorAll('input');
            const identifier = inputs[0]?.value?.trim();
            const password = inputs[1]?.value || '';
            try {
                const res = await apiRequest('signin.php', 'POST', { identifier, password });
                showNotification('Signed in successfully', 'success');
                // Optionally store minimal user info in memory/localStorage
                window.currentUser = res.user;
                try { localStorage.setItem('currentUser', JSON.stringify(res.user)); } catch (e) {}
                updateUserUI();
                location.hash = 'dashboard';
                showPage('dashboard');
            } catch (err) {
                showNotification(err.message, 'error');
            }
        });
    }

    // Sign Up
    const signupForm = document.getElementById('signup-form');
    if (signupForm && !signupForm.__wired) {
        signupForm.__wired = true;
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const inputs = signupForm.querySelectorAll('input');
            const fullName = inputs[0]?.value?.trim();
            const email = inputs[1]?.value?.trim();
            const username = inputs[2]?.value?.trim();
            const password = inputs[3]?.value || '';
            const confirmPassword = inputs[4]?.value || '';

            if (password !== confirmPassword) {
                showNotification('Passwords do not match', 'error');
                return;
            }

            try {
                await apiRequest('signup.php', 'POST', { fullName, email, username, password, confirmPassword });
                showNotification('Account created. Please sign in.', 'success');
                location.hash = 'signin';
                showPage('signin');
            } catch (err) {
                showNotification(err.message, 'error');
            }
        });
    }
}

function restoreUserSession() {
    try {
        const raw = localStorage.getItem('currentUser');
        if (!raw) return;
        const user = JSON.parse(raw);
        if (user && (user.username || user.fullName || user.full_name)) {
            // Ensure consistent field mapping
            window.currentUser = {
                ...user,
                fullName: user.full_name || user.fullName,
                avatarUrl: user.avatar_url || user.avatarUrl,
                createdAt: user.created_at || user.createdAt,
                updatedAt: user.updated_at || user.updatedAt
            };
        }
    } catch (e) {}
}

// Load current user from server
async function loadCurrentUser() {
    try {
        console.log('Loading current user from server...');
        const response = await fetch('api/get_current_user.php', {
            credentials: 'same-origin'
        });
        
        console.log('Server response:', response.status, response.ok);
        
        if (response.ok) {
            const data = await response.json();
            console.log('User data from server:', data);
            const userData = data.user;
            if (userData) {
                // Convert snake_case to camelCase for consistency
                window.currentUser = {
                    ...userData,
                    fullName: userData.full_name || userData.fullName,
                    avatarUrl: userData.avatar_url || userData.avatarUrl,
                    createdAt: userData.created_at || userData.createdAt,
                    updatedAt: userData.updated_at || userData.updatedAt
                };
                localStorage.setItem('currentUser', JSON.stringify(window.currentUser));
                console.log('User authenticated, session restored');
            }
        } else {
            // User not authenticated - clear local session too
            const errorData = await response.json().catch(() => ({}));
            console.log('User not authenticated:', errorData);
            window.currentUser = null;
            localStorage.removeItem('currentUser');
            
            // If we're on a protected page, redirect to signin
            const currentPage = location.hash.replace('#', '') || 'home';
            if (currentPage === 'dashboard' || currentPage === 'profile') {
                location.hash = 'signin';
                showPage('signin');
            }
        }
    } catch (error) {
        console.error('Error loading current user:', error);
        // On error, assume not authenticated
        window.currentUser = null;
        localStorage.removeItem('currentUser');
    }
}

function updateUserUI() {
    if (!window.currentUser) return;
    const user = window.currentUser;
    const displayName = user.fullName || user.username || 'Player';
    
    // Update dashboard welcome message
    const welcomeP = document.querySelector('#dashboard .welcome-text p');
    if (welcomeP) {
        welcomeP.textContent = `Welcome back, ${displayName}! Ready for some challenges?`;
    }
    
    // Update profile name in dashboard
    const profileName = document.querySelector('.profile-name');
    if (profileName) {
        profileName.textContent = user.fullName || user.username || 'User';
    }
    
    // Update profile information in profile page
    updateProfilePage();
    
    updateAuthUI();
}

function updateProfilePage() {
    if (!window.currentUser) return;
    const user = window.currentUser;
    
    // Update avatar
    const avatarPreview = document.querySelector('.avatar-preview');
    if (avatarPreview && user.avatarUrl) {
        // Add timestamp to prevent caching issues
        const avatarUrl = user.avatarUrl + '?t=' + Date.now();
        avatarPreview.innerHTML = `<img src="${avatarUrl}" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
    } else if (avatarPreview) {
        avatarPreview.innerHTML = '<i class="fas fa-user"></i>';
    }
    
    // Also update any other avatar displays on the page
    const allAvatarImages = document.querySelectorAll('img[alt="Avatar"], .avatar img, .profile-avatar img');
    allAvatarImages.forEach(img => {
        if (user.avatarUrl) {
            const avatarUrl = user.avatarUrl + '?t=' + Date.now();
            img.src = avatarUrl;
        } else {
            // Replace with default avatar icon
            const parent = img.parentElement;
            if (parent) {
                parent.innerHTML = '<i class="fas fa-user"></i>';
            }
        }
    });
    
    // Update profile basic info
    const profileBasicInfo = document.querySelector('.profile-basic-info');
    if (profileBasicInfo) {
        const nameElement = profileBasicInfo.querySelector('h3');
        const emailElement = profileBasicInfo.querySelector('p');
        const locationElement = profileBasicInfo.querySelector('p:nth-of-type(2)');
        const bioElement = profileBasicInfo.querySelector('.profile-bio');
        const dateElement = profileBasicInfo.querySelector('p:nth-of-type(4)'); // Now at position 4
        
        if (nameElement) nameElement.textContent = user.fullName || user.username || 'User';
        if (emailElement) emailElement.textContent = user.email || '';
        
        // Update location (now at position 2)
        if (locationElement && user.location) {
            locationElement.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${user.location}`;
            locationElement.style.display = 'block';
        } else if (locationElement) {
            locationElement.style.display = 'none';
        }
        
        // Update bio display (now at position 3)
        const bioText = profileBasicInfo.querySelector('.bio-text');
        if (bioElement && bioText) {
            if (user.bio && user.bio.trim()) {
                bioText.textContent = user.bio;
                bioElement.style.display = 'block';
            } else {
                bioElement.style.display = 'none';
            }
        }
        
        // Update joined date (now at position 4 - last)
        if (dateElement && user.createdAt) {
            try {
                const joinDate = new Date(user.createdAt).toLocaleDateString();
                dateElement.innerHTML = `<i class="fas fa-calendar"></i> Joined ${joinDate}`;
            } catch (e) {
                dateElement.innerHTML = `<i class="fas fa-calendar"></i> Joined ${user.createdAt}`;
            }
        } else if (dateElement) {
            dateElement.innerHTML = `<i class="fas fa-calendar"></i> Joined Recently`;
        }
    }
    
    // Also update the profile display section (the one above the form)
    const profileDisplaySection = document.querySelector('.profile-display');
    if (profileDisplaySection) {
        const displayName = profileDisplaySection.querySelector('.profile-display-name');
        const displayEmail = profileDisplaySection.querySelector('.profile-display-email');
        const displayLocation = profileDisplaySection.querySelector('.profile-display-location');
        const displayBio = profileDisplaySection.querySelector('.profile-display-bio');
        
        if (displayName) displayName.textContent = user.fullName || user.username || 'User';
        if (displayEmail) displayEmail.textContent = user.email || '';
        if (displayLocation) {
            if (user.location) {
                displayLocation.textContent = user.location;
                displayLocation.style.display = 'block';
            } else {
                displayLocation.style.display = 'none';
            }
        }
        if (displayBio) {
            if (user.bio) {
                displayBio.textContent = user.bio;
                displayBio.style.display = 'block';
            } else {
                displayBio.style.display = 'none';
            }
        }
    }
    
    // Update form fields
    const formInputs = document.querySelectorAll('#info-tab input, #info-tab textarea');
    formInputs.forEach(input => {
        const name = input.getAttribute('name') || input.previousElementSibling?.textContent?.toLowerCase();
        if (name && user[name.replace(' ', '')]) {
            input.value = user[name.replace(' ', '')];
        }
    });
    
    // Update specific form fields using name attributes
    const fullNameInput = document.querySelector('#info-tab input[name="full_name"]');
    const emailInput = document.querySelector('#info-tab input[name="email"]');
    const locationInput = document.querySelector('#info-tab input[name="location"]');
    const bioTextarea = document.querySelector('#info-tab textarea[name="bio"]');
    
    if (fullNameInput) fullNameInput.value = user.fullName || '';
    if (emailInput) emailInput.value = user.email || '';
    if (locationInput) locationInput.value = user.location || '';
    if (bioTextarea) {
        bioTextarea.value = user.bio || '';
        // Update character counter
        const charCounter = document.querySelector('.char-counter');
        if (charCounter) {
            const bioLength = bioTextarea.value.length;
            charCounter.textContent = `${bioLength}/500`;
        }
    }
}

function isAuthenticated() {
    return !!window.currentUser;
}

function updateAuthUI() {
    const isAuthed = isAuthenticated();
    const linkDashboard = document.querySelector('.nav-link[data-page="dashboard"]');
    const linkProfile = document.querySelector('.nav-link[data-page="profile"]');
    const linkSignin = document.querySelector('.nav-link[data-page="signin"]');
    const linkSignup = document.querySelector('.nav-link[data-page="signup"]');
    const linkAdmin = document.getElementById('admin-link');

    if (linkDashboard) linkDashboard.style.display = isAuthed ? 'inline-block' : 'none';
    if (linkProfile) linkProfile.style.display = isAuthed ? 'inline-block' : 'none';
    const linkLogout = document.querySelector('.nav-link[data-page="logout"]');
    if (linkLogout) linkLogout.style.display = isAuthed ? 'inline-block' : 'none';
    if (linkSignin) linkSignin.style.display = isAuthed ? 'none' : '';
    if (linkSignup) linkSignup.style.display = isAuthed ? 'none' : '';
    
    // Show admin link only for admin users
    if (linkAdmin) {
        linkAdmin.style.display = (isAuthed && window.currentUser && window.currentUser.role === 'admin') ? 'inline-block' : 'none';
    }

    // Hide entire user profile menu when logged out
    const userProfileMenu = document.getElementById('user-profile-menu');
    if (userProfileMenu) {
        userProfileMenu.style.display = isAuthed ? '' : 'none';
    }
}

function setupProfileMenuDropdown() {
    const container = document.getElementById('user-profile-menu');
    if (!container || container.__wired) return;
    container.__wired = true;

    const signoutBtn = container.querySelector('#menu-signout');

    // Toggle only when clicking on profile-info or caret
    const toggleTargets = [container.querySelector('.profile-info'), container.querySelector('.profile-caret'), container.querySelector('.profile-avatar')].filter(Boolean);
    toggleTargets.forEach(el => {
        el.addEventListener('click', () => {
            container.classList.toggle('open');
        });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
        if (!container.contains(e.target)) {
            container.classList.remove('open');
        }
    });

    // Actions
    container.querySelectorAll('.dropdown-item[data-action="edit-profile"]').forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            location.hash = 'profile';
            showPage('profile');
            // Try switch to edit mode
            const editBtn = document.getElementById('edit-profile-btn');
            if (editBtn) {
                editBtn.click();
            }
            container.classList.remove('open');
        });
    });

    if (signoutBtn && !signoutBtn.__wired) {
        signoutBtn.__wired = true;
        signoutBtn.addEventListener('click', performSignOut);
    }
}

async function performSignOut() {
    try {
        // Call server logout API first
        const response = await fetch('api/logout.php', {
            method: 'POST',
            credentials: 'same-origin'
        });
        
        if (response.ok) {
            console.log('Server logout successful');
        }
    } catch (error) {
        console.error('Logout API error:', error);
    }
    
    // Clear local session regardless of API response
    try { 
        localStorage.removeItem('currentUser'); 
    } catch (e) {
        console.error('Failed to clear localStorage:', e);
    }
    
    // Clear all user data
    window.currentUser = null;
    
    // Force reload to clear any cached session data
    updateAuthUI();
    showNotification('Signed out', 'success');
    
    // Redirect to signin page
    location.hash = 'signin';
    showPage('signin');
    
    // Force a page reload to ensure all session data is cleared
    setTimeout(() => {
        window.location.reload();
    }, 1000);
}

// ============================
// Password toggles & strength
// ============================

function setupPasswordToggles() {
    // Toggle show/hide password for all password inputs with .password-toggle button
    const containers = document.querySelectorAll('.password-input');
    containers.forEach(container => {
        const toggleBtn = container.querySelector('.password-toggle');
        const input = container.querySelector('input');
        if (!toggleBtn || !input || toggleBtn.__wired) return;
        toggleBtn.__wired = true;
        toggleBtn.addEventListener('click', () => {
            const isHidden = input.type === 'password';
            input.type = isHidden ? 'text' : 'password';
            const icon = toggleBtn.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-eye');
                icon.classList.toggle('fa-eye-slash');
            }
        });
    });

    // Password strength meter on signup password field
    const signupForm = document.getElementById('signup-form');
    if (signupForm && !signupForm.__strengthWired) {
        signupForm.__strengthWired = true;
        const pwdInput = signupForm.querySelectorAll('input[type="password"]')[0];
        const strengthWrap = signupForm.querySelector('.password-strength');
        const fill = strengthWrap ? strengthWrap.querySelector('.strength-fill') : null;
        const textEl = strengthWrap ? strengthWrap.querySelector('.strength-text') : null;
        if (pwdInput && fill && textEl) {
            const update = () => {
                const { score, label, color } = computePasswordStrength(pwdInput.value);
                const width = Math.min(100, Math.max(0, Math.round((score / 4) * 100)));
                fill.style.width = width + '%';
                fill.style.backgroundColor = color;
                textEl.textContent = `Password strength: ${label}`;
            };
            pwdInput.addEventListener('input', update);
            update();
        }
    }
}

function computePasswordStrength(value) {
    let score = 0;
    if (value.length >= 8) score++;
    if (/[a-z]/.test(value)) score++;
    if (/[A-Z]/.test(value)) score++;
    if (/[0-9]/.test(value)) score++;
    if (/[^A-Za-z0-9]/.test(value)) score++;
    // Normalize to 0..4
    if (score > 4) score = 4;
    const labels = ['Very Weak', 'Weak', 'Medium', 'Strong', 'Very Strong'];
    const colors = ['#dc3545', '#fd7e14', '#ffc107', '#28a745', '#20c997'];
    return {
        score,
        label: labels[score],
        color: colors[score]
    };
}

// ==========================================
// COMPETITION REGISTRATION FUNCTIONS
// ==========================================

let registrationModalCompetitionId = null;

function showRegisterModal(competitionId) {
    // Check if user is logged in
    if (!window.currentUser) {
        alert('Please sign in to register for competitions');
        showPage('signin');
        return;
    }
    
    registrationModalCompetitionId = competitionId;
    const competition = competitions.find(c => c.id == competitionId);
    
    if (!competition) {
        alert('Competition not found');
        return;
    }
    
    // Create modal HTML if it doesn't exist
    let modal = document.getElementById('registerModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'registerModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px;">
                <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h2 style="margin: 0;">Register for Competition</h2>
                    <span class="modal-close" onclick="closeRegisterModal()" style="font-size: 2rem; cursor: pointer; color: #64748b;">&times;</span>
                </div>
                <div id="registerModalContent"></div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    // Fill modal content
    document.getElementById('registerModalContent').innerHTML = `
        <div>
            <h3 style="margin-bottom: 1rem;">${escapeHtml(competition.name)}</h3>
            <p style="color: #64748b; margin-bottom: 1rem;">${escapeHtml(competition.description || '')}</p>
            
            <div style="background: #f8fafc; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                <p><strong>Start Date:</strong> ${formatDate(competition.start_date)}</p>
                <p><strong>End Date:</strong> ${formatDate(competition.end_date)}</p>
                <p><strong>Difficulty:</strong> ${competition.difficulty_level}</p>
                ${competition.prize_pool ? `<p><strong>Prize Pool:</strong> ${escapeHtml(competition.prize_pool)}</p>` : ''}
            </div>
            
            <div id="registerAlert"></div>
            
            <form id="registerForm" onsubmit="submitRegistration(event)">
                <div class="form-group" style="margin-bottom: 1rem;">
                    <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">Team Name (Optional)</label>
                    <input type="text" name="team_name" id="teamName" placeholder="Enter team name or leave empty for solo" 
                           style="width: 100%; padding: 0.75rem; border: 2px solid #e2e8f0; border-radius: 8px;">
                </div>
                
                <div class="form-group" style="margin-bottom: 1.5rem;">
                    <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">Notes (Optional)</label>
                    <textarea name="registration_notes" id="regNotes" rows="3" placeholder="Any additional information..."
                              style="width: 100%; padding: 0.75rem; border: 2px solid #e2e8f0; border-radius: 8px; resize: vertical;"></textarea>
                </div>
                
                <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 1rem; margin-bottom: 1rem; border-radius: 4px;">
                    <p style="margin: 0; font-size: 0.875rem;">
                        <strong>Note:</strong> After registration, your payment status will be pending. 
                        Admin will verify your payment before final approval.
                    </p>
                </div>
                
                <div style="display: flex; gap: 1rem;">
                    <button type="submit" class="btn btn-primary" style="flex: 1;">
                        <i class="fas fa-check"></i> Confirm Registration
                    </button>
                    <button type="button" class="btn btn-outline" onclick="closeRegisterModal()" style="flex: 1;">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    `;
    
    modal.style.display = 'flex';
}

function closeRegisterModal() {
    const modal = document.getElementById('registerModal');
    if (modal) {
        modal.style.display = 'none';
    }
    registrationModalCompetitionId = null;
}

async function submitRegistration(event) {
    event.preventDefault();
    
    const form = event.target;
    const teamName = form.team_name.value.trim();
    const notes = form.registration_notes.value.trim();
    
    try {
        const response = await fetch('/api/register_competition.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                competition_id: registrationModalCompetitionId,
                team_name: teamName || null,
                registration_notes: notes || null
            })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            // Show success message
            document.getElementById('registerAlert').innerHTML = `
                <div style="background: #dcfce7; color: #166534; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                    <strong>Success!</strong> ${result.message}
                </div>
            `;
            
            // Close modal after 2 seconds and reload data
            setTimeout(() => {
                closeRegisterModal();
                loadCompetitions();
                loadDashboardData();
            }, 2000);
        } else {
            // Show error
            document.getElementById('registerAlert').innerHTML = `
                <div style="background: #fee2e2; color: #991b1b; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                    <strong>Error:</strong> ${result.error}
                </div>
            `;
        }
    } catch (error) {
        console.error('Error registering:', error);
        document.getElementById('registerAlert').innerHTML = `
            <div style="background: #fee2e2; color: #991b1b; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                <strong>Error:</strong> Failed to register. Please try again.
            </div>
        `;
    }
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ==========================================
// ADMIN PANEL FUNCTIONS (from admin.js)
// ==========================================

function switchAdminTab(tab) {
    // Update tab buttons
    document.querySelectorAll('.admin-tab').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.admin-tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    document.getElementById('admin-' + tab + 'Tab').classList.add('active');
    
    // Reload data when switching tabs
    if (tab === 'payments') {
        loadAdminPayments();
    } else if (tab === 'registrations') {
        loadAdminRegistrations();
    } else if (tab === 'competitions') {
        loadAdminCompetitions();
    }
}

async function loadAdminCompetitions() {
    try {
        const response = await fetch('/api/admin/manage_competitions.php');
        const competitions = await response.json();
        
        const container = document.getElementById('adminCompetitionsList');
        
        if (!competitions || competitions.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 2rem;">No competitions yet.</p>';
            return;
        }
        
        container.innerHTML = competitions.map(comp => `
            <div class="competition-card">
                <div class="competition-header">
                    <div class="competition-title">${escapeHtml(comp.name)}</div>
                    <span class="status-badge status-${comp.status}">${comp.status.replace('_', ' ')}</span>
                </div>
                <p><strong>Category:</strong> ${comp.category}</p>
                <p><strong>Difficulty:</strong> ${comp.difficulty_level}</p>
                <p><strong>Start:</strong> ${formatDate(comp.start_date)}</p>
                <p><strong>End:</strong> ${formatDate(comp.end_date)}</p>
                <p><strong>Participants:</strong> ${comp.current_participants || 0}${comp.max_participants ? '/' + comp.max_participants : ''}</p>
                ${comp.prize_pool ? `<p><strong>Prize:</strong> ${escapeHtml(comp.prize_pool)}</p>` : ''}
                <div class="competition-actions">
                    <button class="btn btn-sm btn-warning" onclick="editAdminCompetition(${comp.id})">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteAdminCompetition(${comp.id})">Delete</button>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading admin competitions:', error);
        showAdminAlert('competitionAlert', 'Error loading competitions', 'error');
    }
}

async function loadAdminPayments() {
    try {
        const response = await fetch('/api/admin/verify_payments.php');
        const payments = await response.json();
        
        const tbody = document.getElementById('paymentsTableBody');
        
        if (!payments || payments.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No pending payments</td></tr>';
            return;
        }
        
        tbody.innerHTML = payments.map(payment => `
            <tr>
                <td>${payment.id}</td>
                <td>
                    <strong>${escapeHtml(payment.user_name)}</strong><br>
                    <small>${escapeHtml(payment.user_email)}</small>
                </td>
                <td>${escapeHtml(payment.competition_name)}</td>
                <td>${payment.team_name ? escapeHtml(payment.team_name) : '-'}</td>
                <td>
                    <span class="status-badge status-${payment.payment_status}">
                        ${payment.payment_status}
                    </span>
                </td>
                <td>${formatDate(payment.registered_at)}</td>
                <td>
                    <button class="btn btn-sm btn-success" onclick="verifyAdminPayment(${payment.id}, 'paid')">Approve</button>
                    <button class="btn btn-sm btn-danger" onclick="verifyAdminPayment(${payment.id}, 'refunded')">Reject</button>
                </td>
            </tr>
        `).join('');
        
    } catch (error) {
        console.error('Error loading payments:', error);
        showAdminAlert('paymentAlert', 'Error loading payments', 'error');
    }
}

async function loadAdminRegistrations() {
    try {
        const response = await fetch('/api/admin/get_registrations.php');
        const registrations = await response.json();
        
        const tbody = document.getElementById('registrationsTableBody');
        
        if (!registrations || registrations.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align: center;">No registrations yet</td></tr>';
            return;
        }
        
        tbody.innerHTML = registrations.map(reg => `
            <tr>
                <td>${reg.id}</td>
                <td>
                    <strong>${escapeHtml(reg.user_name)}</strong><br>
                    <small>@${escapeHtml(reg.username)}</small>
                </td>
                <td>${escapeHtml(reg.competition_name)}</td>
                <td>${reg.team_name ? escapeHtml(reg.team_name) : '-'}</td>
                <td>
                    <span class="status-badge status-${reg.registration_status}">
                        ${reg.registration_status}
                    </span>
                </td>
                <td>
                    <span class="status-badge status-${reg.payment_status}">
                        ${reg.payment_status}
                    </span>
                </td>
                <td>${reg.score || 0}</td>
                <td>${formatDate(reg.registered_at)}</td>
            </tr>
        `).join('');
        
    } catch (error) {
        console.error('Error loading registrations:', error);
    }
}

async function verifyAdminPayment(registrationId, status) {
    try {
        const response = await fetch('/api/admin/verify_payments.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                registration_id: registrationId,
                payment_status: status
            })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showAdminAlert('paymentAlert', `Payment ${status === 'paid' ? 'approved' : 'rejected'} successfully!`, 'success');
            loadAdminPayments();
            loadAdminRegistrations();
        } else {
            showAdminAlert('paymentAlert', result.error || 'Failed to update payment', 'error');
        }
        
    } catch (error) {
        console.error('Error verifying payment:', error);
        showAdminAlert('paymentAlert', 'Error verifying payment', 'error');
    }
}

function editAdminCompetition(id) {
    // TODO: Implement edit modal
    alert('Edit functionality - Competition ID: ' + id);
}

async function deleteAdminCompetition(id) {
    if (!confirm('Are you sure you want to delete this competition? This will also delete all registrations.')) {
        return;
    }
    
    try {
        const response = await fetch('/api/admin/manage_competitions.php', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showAdminAlert('competitionAlert', 'Competition deleted successfully!', 'success');
            loadAdminCompetitions();
        } else {
            showAdminAlert('competitionAlert', result.error || 'Failed to delete competition', 'error');
        }
        
    } catch (error) {
        console.error('Error deleting competition:', error);
        showAdminAlert('competitionAlert', 'Error deleting competition', 'error');
    }
}

function closeEditCompetitionModal() {
    document.getElementById('editCompetitionModal').style.display = 'none';
}

function showAdminAlert(elementId, message, type) {
    const alertDiv = document.getElementById(elementId);
    if (!alertDiv) return;
    
    alertDiv.innerHTML = `<div class="alert alert-${type}" style="padding: 1rem; border-radius: 8px; margin-bottom: 1rem; background: ${type === 'success' ? '#dcfce7' : '#fee2e2'}; color: ${type === 'success' ? '#166534' : '#991b1b'};">${message}</div>`;
    setTimeout(() => {
        alertDiv.innerHTML = '';
    }, 5000);
}

// Setup admin form handlers
document.addEventListener('DOMContentLoaded', function() {
    const addCompForm = document.getElementById('addCompetitionForm');
    if (addCompForm && !addCompForm.dataset.initialized) {
        addCompForm.dataset.initialized = 'true';
        addCompForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());
            
            console.log('Sending competition data:', data);
            
            try {
                const response = await fetch('/api/admin/manage_competitions.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                console.log('API Response:', result);
                
                if (response.ok) {
                    showAdminAlert('competitionAlert', result.message || 'Competition added successfully!', 'success');
                    e.target.reset();
                    loadAdminCompetitions();
                } else {
                    showAdminAlert('competitionAlert', result.error || 'Failed to add competition', 'error');
                    console.error('API Error:', result);
                }
                
            } catch (error) {
                console.error('Error adding competition:', error);
                showAdminAlert('competitionAlert', 'Network error: ' + error.message, 'error');
            }
        });
    }
});
