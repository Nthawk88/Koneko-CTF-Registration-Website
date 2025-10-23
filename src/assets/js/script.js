const state = {
	currentPage: 'home',
	currentUser: null,
};

document.addEventListener('DOMContentLoaded', init);

async function init() {
	setupNavigation();
	wireAuthForms();
	wireProfileEditor();
	wireSignOut();

	await refreshSession();
	applyUserToUI();

	const initialPage = window.location.hash.replace('#', '') || 'home';
	showPage(initialPage);

	window.addEventListener('hashchange', () => {
		const page = window.location.hash.replace('#', '') || 'home';
		showPage(page);
	});
}

function notify(message, type = 'info') {
	let el = document.getElementById('toast');
	if (!el) {
		el = document.createElement('div');
		el.id = 'toast';
		el.style.position = 'fixed';
		el.style.top = '20px';
		el.style.right = '20px';
		el.style.padding = '12px 16px';
		el.style.borderRadius = '8px';
		el.style.fontSize = '0.9rem';
		el.style.zIndex = '3000';
		document.body.appendChild(el);
	}

	const colors = {
		success: '#16a34a',
		error: '#dc2626',
		info: '#2563eb',
	};
	el.textContent = message;
	el.style.backgroundColor = colors[type] || colors.info;
	el.style.color = '#fff';
	el.style.boxShadow = '0 10px 30px rgba(0,0,0,0.25)';

	clearTimeout(el.timeoutId);
	el.timeoutId = setTimeout(() => {
		el.remove();
	}, 3200);
}

async function refreshSession() {
	try {
		const data = await apiRequest('get_current_user.php');
		state.currentUser = data.user;
	} catch (err) {
		state.currentUser = null;
	}
}

function applyUserToUI() {
	updateAuthVisibility();
	updateDashboardGreeting();
	updateProfileSummary();
	populateProfileForm();
}

function updateAuthVisibility() {
	const authed = Boolean(state.currentUser);
	const showWhenAuthed = document.querySelectorAll('[data-auth="protected"]');
	showWhenAuthed.forEach((el) => {
		el.style.display = authed ? '' : 'none';
	});

	const signinLink = document.querySelector('.nav-link[data-page="signin"]');
	const signupLink = document.querySelector('.nav-link[data-page="signup"]');
	const logoutLink = document.querySelector('.nav-link[data-page="logout"]');

	if (signinLink) signinLink.style.display = authed ? 'none' : '';
	if (signupLink) signupLink.style.display = authed ? 'none' : '';
	if (logoutLink) logoutLink.style.display = authed ? '' : 'none';

	const profileMenu = document.getElementById('user-profile-menu');
	if (profileMenu) profileMenu.style.display = authed ? '' : 'none';
}

function updateDashboardGreeting() {
	const welcome = document.querySelector('#dashboard .welcome-text p');
	if (!welcome) return;

	if (state.currentUser) {
		const name = state.currentUser.fullName || state.currentUser.username || 'Player';
		welcome.textContent = `Welcome back, ${name}! Ready for some challenges?`;
	} else {
		welcome.textContent = 'Sign in to see your personalised dashboard.';
	}
}

function updateProfileSummary() {
	const nameEl = document.querySelector('.profile-name');
	if (nameEl) {
		nameEl.textContent = state.currentUser?.fullName || state.currentUser?.username || 'User';
	}

	const avatar = document.querySelector('.profile-avatar');
	if (avatar) {
		const img = avatar.querySelector('img');
		if (state.currentUser?.avatarUrl) {
			if (img) {
				img.src = `${state.currentUser.avatarUrl}?t=${Date.now()}`;
			} else {
				avatar.innerHTML = `<img src="${state.currentUser.avatarUrl}?t=${Date.now()}" alt="Avatar">`;
			}
		} else {
			avatar.innerHTML = '<i class="fas fa-user"></i>';
		}
	}

	const basicInfo = document.querySelector('.profile-basic-info');
	if (!basicInfo || !state.currentUser) return;

	const name = basicInfo.querySelector('h3');
	const email = basicInfo.querySelector('p');
	const location = basicInfo.querySelector('p:nth-of-type(2)');
	const bioLine = basicInfo.querySelector('.profile-bio');
	const bioText = basicInfo.querySelector('.bio-text');
	const joined = basicInfo.querySelector('p:nth-of-type(4)');

	if (name) {
		name.textContent = state.currentUser.fullName || state.currentUser.username;
	}
	if (email) {
		email.textContent = state.currentUser.email || '';
	}
	if (location) {
		if (state.currentUser.location) {
			location.style.display = 'block';
			location.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${state.currentUser.location}`;
		} else {
			location.style.display = 'none';
		}
	}
	if (bioLine && bioText) {
		if (state.currentUser.bio) {
			bioText.textContent = state.currentUser.bio;
			bioLine.style.display = 'block';
		} else {
			bioLine.style.display = 'none';
		}
	}
	if (joined) {
		const date = state.currentUser.createdAt ? new Date(state.currentUser.createdAt) : null;
		if (date && !Number.isNaN(date.getTime())) {
			joined.innerHTML = `<i class="fas fa-calendar"></i> Joined ${date.toLocaleDateString()}`;
		} else {
			joined.innerHTML = '<i class="fas fa-calendar"></i> Joined recently';
		}
	}
}

function populateProfileForm() {
	const user = state.currentUser;
	const fullNameInput = document.querySelector('#info-tab input[name="full_name"]');
	const emailInput = document.querySelector('#info-tab input[name="email"]');
	const locationInput = document.querySelector('#info-tab input[name="location"]');
	const bioTextarea = document.querySelector('#info-tab textarea[name="bio"]');
	const charCounter = document.querySelector('#info-tab .char-counter');

	if (!user) {
		[fullNameInput, emailInput, locationInput, bioTextarea].forEach((el) => {
			if (el) el.value = '';
		});
		if (charCounter) charCounter.textContent = '0/500';
		return;
	}

	if (fullNameInput) fullNameInput.value = user.fullName || '';
	if (emailInput) emailInput.value = user.email || '';
	if (locationInput) locationInput.value = user.location || '';
	if (bioTextarea) bioTextarea.value = user.bio || '';
	if (charCounter && bioTextarea) {
		charCounter.textContent = `${bioTextarea.value.length}/500`;
	}
}

function setupNavigation() {
	const navLinks = document.querySelectorAll('.nav-link');
	const navToggle = document.getElementById('nav-toggle');
	const navMenu = document.getElementById('nav-menu');

	navLinks.forEach((link) => {
		link.addEventListener('click', (event) => {
			event.preventDefault();
			const page = link.getAttribute('data-page');
			if (page === 'logout') {
				performSignOut();
				return;
			}
			window.location.hash = page;
			showPage(page);
			if (navMenu) navMenu.classList.remove('active');
		});
	});

	if (navToggle && navMenu) {
		navToggle.addEventListener('click', () => {
			navMenu.classList.toggle('active');
		});
	}
}

function showPage(pageId) {
	const pages = document.querySelectorAll('.page');
	pages.forEach((page) => page.classList.remove('active'));

	if ((pageId === 'dashboard' || pageId === 'profile') && !state.currentUser) {
		notify('Please sign in to access that page', 'error');
		pageId = 'signin';
	}

	const target = document.getElementById(pageId);
	if (target) {
		target.classList.add('active');
		state.currentPage = pageId;
		setActiveNavLink(pageId);
		setDocumentTitle(pageId);
	}
}

function setActiveNavLink(pageId) {
	const navLinks = document.querySelectorAll('.nav-link');
	navLinks.forEach((link) => {
		link.classList.toggle('active', link.getAttribute('data-page') === pageId);
	});
}

function setDocumentTitle(pageId) {
	const titles = {
		home: 'Koneko CTF - Capture The Flag Competition',
		competitions: 'CTF Competitions - Koneko CTF',
		dashboard: 'Dashboard - Koneko CTF',
		profile: 'Profile Management - Koneko CTF',
		signin: 'Sign In - Koneko CTF',
		signup: 'Sign Up - Koneko CTF',
	};
	document.title = titles[pageId] || 'Koneko CTF';
}

function wireAuthForms() {
	const signinForm = document.getElementById('signin-form');
	if (signinForm) {
		signinForm.addEventListener('submit', async (event) => {
			event.preventDefault();
			const identifier = signinForm.querySelector('input[type="text"]')?.value.trim() || '';
			const password = signinForm.querySelector('input[type="password"]')?.value || '';

			if (!identifier || !password) {
				notify('Email/username and password are required', 'error');
				return;
			}

			try {
				const data = await apiRequest('signin.php', {
					method: 'POST',
					body: { identifier, password },
				});
				state.currentUser = data.user;
				applyUserToUI();
				notify('Signed in successfully', 'success');
				showPage('dashboard');
				window.location.hash = 'dashboard';
			} catch (err) {
				notify(err.message, 'error');
			}
		});
	}

	const signupForm = document.getElementById('signup-form');
	if (signupForm) {
		signupForm.addEventListener('submit', async (event) => {
			event.preventDefault();
			const inputs = signupForm.querySelectorAll('input');
			const payload = {
				fullName: inputs[0]?.value.trim() || '',
				email: inputs[1]?.value.trim() || '',
				username: inputs[2]?.value.trim() || '',
				password: inputs[3]?.value || '',
				confirmPassword: inputs[4]?.value || '',
			};

	if (payload.password !== payload.confirmPassword) {
		notify('Passwords do not match', 'error');
		return;
	}

	try {
		await apiRequest('signup.php', {
			method: 'POST',
			body: payload,
		});
		notify('Account created. Please sign in.', 'success');
		showPage('signin');
		window.location.hash = 'signin';
	} catch (err) {
		notify(err.message, 'error');
	}
});
	}
}

function wireProfileEditor() {
	const editBtn = document.getElementById('edit-profile-btn');
	const cancelBtn = document.getElementById('cancel-edit-btn');
	const actions = document.getElementById('profile-actions');
	const formInputs = document.querySelectorAll('#info-tab input, #info-tab textarea');
	const saveBtn = actions?.querySelector('.btn-primary');
	const bioTextarea = document.querySelector('#info-tab textarea[name="bio"]');
	const charCounter = document.querySelector('#info-tab .char-counter');

	if (bioTextarea && charCounter) {
		bioTextarea.addEventListener('input', () => {
			charCounter.textContent = `${bioTextarea.value.length}/500`;
		});
	}

	if (editBtn && actions) {
		editBtn.addEventListener('click', () => {
			formInputs.forEach((input) => (input.disabled = false));
			actions.style.display = 'flex';
			editBtn.style.display = 'none';
		});
	}

	if (cancelBtn && editBtn && actions) {
		cancelBtn.addEventListener('click', () => {
			formInputs.forEach((input) => (input.disabled = true));
			actions.style.display = 'none';
			editBtn.style.display = 'inline-flex';
			populateProfileForm();
		});
	}

	if (saveBtn) {
		saveBtn.addEventListener('click', async (event) => {
			event.preventDefault();
			await submitProfileUpdate();
		});
	}

	const avatarButton = document.querySelector('.avatar-upload .btn-outline');
	if (avatarButton) {
		const fileInput = document.createElement('input');
		fileInput.type = 'file';
		fileInput.accept = 'image/*';
		fileInput.style.display = 'none';
		document.body.appendChild(fileInput);

		avatarButton.addEventListener('click', () => fileInput.click());
		fileInput.addEventListener('change', async () => {
			if (!fileInput.files?.length) return;
			await uploadAvatar(fileInput.files[0]);
			fileInput.value = '';
		});
	}
}

function wireSignOut() {
	const menuSignout = document.getElementById('menu-signout');
	if (menuSignout) {
		menuSignout.addEventListener('click', performSignOut);
	}
}

async function submitProfileUpdate() {
	const payload = {
		fullName: document.querySelector('#info-tab input[name="full_name"]')?.value.trim() ?? '',
		email: document.querySelector('#info-tab input[name="email"]')?.value.trim() ?? '',
		location: document.querySelector('#info-tab input[name="location"]')?.value.trim() ?? '',
		bio: document.querySelector('#info-tab textarea[name="bio"]')?.value.trim() ?? '',
	};

	try {
		const data = await apiRequest('update_profile.php', {
			method: 'POST',
			body: payload,
		});
		state.currentUser = data.user;
		applyUserToUI();
		notify('Profile updated successfully', 'success');
		const actions = document.getElementById('profile-actions');
		const editBtn = document.getElementById('edit-profile-btn');
		if (actions && editBtn) {
			const formInputs = document.querySelectorAll('#info-tab input, #info-tab textarea');
			formInputs.forEach((input) => (input.disabled = true));
			actions.style.display = 'none';
			editBtn.style.display = 'inline-flex';
		}
	} catch (err) {
		notify(err.message, 'error');
	}
}

async function uploadAvatar(file) {
	const formData = new FormData();
	formData.append('avatar', file);

	try {
		const data = await apiRequest('upload_avatar.php', {
			method: 'POST',
			body: formData,
			json: false,
		});
		state.currentUser = data.user;
		applyUserToUI();
		notify('Avatar uploaded successfully', 'success');
	} catch (err) {
		notify(err.message, 'error');
	}
}

async function performSignOut() {
	try {
		await apiRequest('logout.php', { method: 'POST' });
	} catch (err) {
		console.error(err);
	}

	state.currentUser = null;
	applyUserToUI();
	notify('Signed out', 'success');
	showPage('signin');
	window.location.hash = 'signin';
}

async function apiRequest(path, options = {}) {
	const opts = { credentials: 'include', ...options };

	if (opts.body && opts.json !== false) {
		opts.headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
		opts.body = JSON.stringify(opts.body);
	} else if (opts.json === false) {
		delete opts.json;
	}

	const response = await fetch(`api/${path}`, opts);
	let data = {};
	try {
		data = await response.json();
	} catch (err) {
		// ignore parse errors; handled below
	}

	if (!response.ok) {
		const message = data?.error || `Request failed (${response.status})`;
		throw new Error(message);
	}

	return data;
}

function wireSignOutMenu() {
	const container = document.getElementById('user-profile-menu');
	if (!container) return;

	container.addEventListener('click', (event) => {
		const target = event.target.closest('.dropdown-item');
		if (!target) return;
		const action = target.dataset.action;
		if (action === 'edit-profile') {
			window.location.hash = 'profile';
			showPage('profile');
			const editBtn = document.getElementById('edit-profile-btn');
			editBtn?.click();
		}
	});
}

wireSignOutMenu();
