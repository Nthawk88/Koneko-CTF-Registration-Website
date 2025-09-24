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
    // Restore session and set nav visibility ASAP to avoid flashing protected links
    restoreUserSession();
    updateAuthUI();

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
    const speechBubbles = document.querySelectorAll('.speech-bubble span');
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
    
    speechBubbles.forEach(bubble => {
        setInterval(() => {
            const randomMessage = messages[Math.floor(Math.random() * messages.length)];
            typeMessage(bubble, randomMessage);
        }, 8000);
    });
}

function typeMessage(element, message) {
    element.textContent = '';
    let i = 0;
    
    const typeInterval = setInterval(() => {
        element.textContent += message[i];
        i++;
        
        if (i >= message.length) {
            clearInterval(typeInterval);
        }
    }, 100);
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
        icon.style.left = `${Math.random() * 100}%`;
    });
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
        if (user && (user.username || user.fullName)) {
            window.currentUser = user;
        }
    } catch (e) {}
}

function updateUserUI() {
    if (!window.currentUser) return;
    const username = window.currentUser.username || window.currentUser.fullName || 'Player';
    const welcomeP = document.querySelector('#dashboard .welcome-text p');
    if (welcomeP) {
        welcomeP.textContent = `Welcome back, ${username}! Ready for some challenges?`;
    }
    updateAuthUI();
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

    if (linkDashboard) linkDashboard.style.display = isAuthed ? 'inline-block' : 'none';
    if (linkProfile) linkProfile.style.display = isAuthed ? 'inline-block' : 'none';
    const linkLogout = document.querySelector('.nav-link[data-page="logout"]');
    if (linkLogout) linkLogout.style.display = isAuthed ? 'inline-block' : 'none';
    if (linkSignin) linkSignin.style.display = isAuthed ? 'none' : '';
    if (linkSignup) linkSignup.style.display = isAuthed ? 'none' : '';

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

function performSignOut() {
    try { localStorage.removeItem('currentUser'); } catch (e) {}
    window.currentUser = null;
    updateAuthUI();
    showNotification('Signed out', 'success');
    location.hash = 'signin';
    showPage('signin');
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
