const state = {
	currentPage: 'home',
	currentUser: null,
	admin: {
		initialized: false,
		competitions: [],
		payments: [],
		registrations: [],
	},
};

document.addEventListener('DOMContentLoaded', init);

async function init() {
	setupNavigation();
	wireAuthForms();
	wireProfileEditor();
	wireSignOut();
	setupAdminUI();

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

	if (state.currentUser?.role === 'admin') {
		refreshAdminData();
	}
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
	const profileLink = document.querySelector('.nav-link[data-page="profile"]');
	const dashboardLink = document.querySelector('.nav-link[data-page="dashboard"]');
	const adminLink = document.getElementById('admin-link');

	if (signinLink) signinLink.style.display = authed ? 'none' : '';
	if (signupLink) signupLink.style.display = authed ? 'none' : '';
	if (logoutLink) logoutLink.style.display = authed ? '' : 'none';
	if (profileLink) profileLink.style.display = authed ? '' : 'none';
	if (dashboardLink) dashboardLink.style.display = authed ? '' : 'none';
	if (adminLink) {
		adminLink.style.display = authed && state.currentUser?.role === 'admin' ? '' : 'none';
	}

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

	if (pageId === 'admin' && (!state.currentUser || state.currentUser.role !== 'admin')) {
		const message = state.currentUser
			? 'Access denied. Admin privileges required.'
			: 'Please sign in to access the admin panel';
		notify(message, 'error');
		pageId = state.currentUser ? 'home' : 'signin';
	} else if (pageId === 'admin') {
		setActiveAdminTab('competitions');
		refreshAdminData();
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

function setupAdminUI() {
	const adminPage = document.getElementById('admin');
	if (!adminPage || state.admin.initialized) return;

	const tabButtons = adminPage.querySelectorAll('.admin-tab');
	tabButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
			const tabKey = btn.dataset.tab;
			if (!tabKey) return;
			setActiveAdminTab(tabKey);
			if (state.currentUser?.role === 'admin') {
				switch (tabKey) {
					case 'competitions':
						fetchAdminCompetitions();
						break;
					case 'payments':
						fetchAdminPayments();
						break;
					case 'registrations':
						fetchAdminRegistrations();
						break;
					default:
						break;
				}
			}
        });
    });

	const addForm = document.getElementById('addCompetitionForm');
	if (addForm) {
		addForm.addEventListener('submit', handleAdminCompetitionCreate);
	}

	const editForm = document.getElementById('editCompetitionForm');
	if (editForm) {
		editForm.addEventListener('submit', handleAdminCompetitionUpdate);
	}

	const modalClose = document.querySelector('#editCompetitionModal .modal-close');
	if (modalClose) {
		modalClose.addEventListener('click', closeEditCompetitionModal);
	}

	const editModal = document.getElementById('editCompetitionModal');
	if (editModal) {
		editModal.addEventListener('click', (event) => {
			if (event.target === editModal) {
				closeEditCompetitionModal();
			}
		});
	}

	const competitionsList = document.getElementById('adminCompetitionsList');
	if (competitionsList) {
		competitionsList.addEventListener('click', handleAdminCompetitionsClick);
	}

	const paymentsBody = document.getElementById('paymentsTableBody');
	if (paymentsBody) {
		paymentsBody.addEventListener('click', handleAdminPaymentsClick);
	}

	state.admin.initialized = true;
	window.closeEditCompetitionModal = closeEditCompetitionModal;
}

function setActiveAdminTab(tabKey) {
	const tabs = document.querySelectorAll('.admin-tab');
	const contents = document.querySelectorAll('.admin-tab-content');
	tabs.forEach((tab) => {
		tab.classList.toggle('active', tab.dataset.tab === tabKey);
	});
	contents.forEach((content) => {
		content.classList.toggle('active', content.id === `admin-${tabKey}Tab`);
	});
}

async function handleAdminCompetitionCreate(event) {
	event.preventDefault();
	const form = event.currentTarget;
	const submitBtn = form.querySelector('button[type="submit"]');
	const data = Object.fromEntries(new FormData(form).entries());

	try {
		if (submitBtn) submitBtn.disabled = true;
		const response = await apiRequest('admin/manage_competitions.php', {
			method: 'POST',
			body: data,
		});
		showAdminAlert('competitionAlert', response.message || 'Competition added successfully!', 'success');
		form.reset();
		await fetchAdminCompetitions();
	} catch (err) {
		showAdminAlert('competitionAlert', err.message, 'error');
	} finally {
		if (submitBtn) submitBtn.disabled = false;
	}
}

async function handleAdminCompetitionUpdate(event) {
	event.preventDefault();
	const form = event.currentTarget;
	const submitBtn = form.querySelector('button[type="submit"]');
	const data = Object.fromEntries(new FormData(form).entries());

	if (!data.id) {
		showAdminAlert('competitionAlert', 'Missing competition identifier', 'error');
		return;
	}

	try {
		if (submitBtn) submitBtn.disabled = true;
		await apiRequest('admin/manage_competitions.php', {
			method: 'PUT',
			body: data,
		});
		showAdminAlert('competitionAlert', 'Competition updated successfully!', 'success');
		closeEditCompetitionModal();
		await fetchAdminCompetitions();
	} catch (err) {
		showAdminAlert('competitionAlert', err.message, 'error');
	} finally {
		if (submitBtn) submitBtn.disabled = false;
	}
}

function handleAdminCompetitionsClick(event) {
	const button = event.target.closest('button[data-action]');
	if (!button) return;
	const competitionId = button.dataset.id;
	if (!competitionId) return;

	if (button.dataset.action === 'edit') {
		openEditCompetitionModal(competitionId);
	}

	if (button.dataset.action === 'delete') {
		deleteAdminCompetition(competitionId);
	}
}

function openEditCompetitionModal(id) {
	const competition = state.admin.competitions.find((comp) => String(comp.id) === String(id));
	if (!competition) {
		notify('Competition not found', 'error');
		return;
	}

	const form = document.getElementById('editCompetitionForm');
	if (!form) return;

	form.querySelector('input[name="id"]').value = competition.id;
	form.querySelector('input[name="name"]').value = competition.name || '';
	form.querySelector('textarea[name="description"]').value = competition.description || '';
	form.querySelector('select[name="status"]').value = competition.status || 'upcoming';

	const modal = document.getElementById('editCompetitionModal');
	if (modal) {
		modal.classList.add('active');
	}
}

function closeEditCompetitionModal() {
	const modal = document.getElementById('editCompetitionModal');
	if (modal) {
		modal.classList.remove('active');
	}
}

async function deleteAdminCompetition(id) {
	if (!window.confirm('Are you sure you want to delete this competition? This will also delete all registrations.')) return;

	try {
		await apiRequest('admin/manage_competitions.php', {
			method: 'DELETE',
			body: { id },
		});
		showAdminAlert('competitionAlert', 'Competition deleted successfully!', 'success');
		await fetchAdminCompetitions();
	} catch (err) {
		showAdminAlert('competitionAlert', err.message, 'error');
	}
}

function handleAdminPaymentsClick(event) {
	const button = event.target.closest('button[data-action]');
	if (!button) return;
	const registrationId = button.dataset.id;
	if (!registrationId) return;

	if (button.dataset.action === 'approve') {
		verifyAdminPayment(registrationId, 'paid');
	}

	if (button.dataset.action === 'reject') {
		verifyAdminPayment(registrationId, 'refunded');
	}
}

async function refreshAdminData() {
	if (!state.currentUser || state.currentUser.role !== 'admin') return;

	await Promise.allSettled([
		fetchAdminCompetitions(),
		fetchAdminPayments(),
		fetchAdminRegistrations(),
	]);
}

async function fetchAdminCompetitions() {
	if (!state.currentUser || state.currentUser.role !== 'admin') return;

	try {
		const competitions = await apiRequest('admin/manage_competitions.php');
		state.admin.competitions = Array.isArray(competitions) ? competitions : [];
		renderAdminCompetitions();
            } catch (err) {
		state.admin.competitions = [];
		renderAdminCompetitions();
		showAdminAlert('competitionAlert', err.message, 'error');
	}
}

async function fetchAdminPayments() {
	if (!state.currentUser || state.currentUser.role !== 'admin') return;

	try {
		const payments = await apiRequest('admin/verify_payments.php');
		state.admin.payments = Array.isArray(payments) ? payments : [];
		renderAdminPayments();
	} catch (err) {
		state.admin.payments = [];
		renderAdminPayments();
		showAdminAlert('paymentAlert', err.message, 'error');
	}
}

async function fetchAdminRegistrations() {
	if (!state.currentUser || state.currentUser.role !== 'admin') return;

	try {
		const registrations = await apiRequest('admin/get_registrations.php');
		state.admin.registrations = Array.isArray(registrations) ? registrations : [];
		renderAdminRegistrations();
	} catch (err) {
		state.admin.registrations = [];
		renderAdminRegistrations();
	}
}

function renderAdminCompetitions() {
	const container = document.getElementById('adminCompetitionsList');
	if (!container) return;

	if (!state.admin.competitions.length) {
		container.innerHTML = '<p class="empty-state">No competitions yet.</p>';
		return;
	}

	container.innerHTML = state.admin.competitions
		.map((comp) => {
			const statusLabel = String(comp.status || 'upcoming').replace(/_/g, ' ');
			const participants = comp.current_participants || 0;
			const maxParticipants = comp.max_participants ? `/${comp.max_participants}` : '';
			return `
				<div class="competition-card">
					<div class="competition-header">
						<div class="competition-title">${escapeHtml(comp.name || 'Untitled Competition')}</div>
						<span class="status-badge status-${escapeHtml(comp.status || 'upcoming')}">${escapeHtml(statusLabel)}</span>
					</div>
					<p><strong>Category:</strong> ${escapeHtml(comp.category || 'N/A')}</p>
					<p><strong>Difficulty:</strong> ${escapeHtml(comp.difficulty_level || 'N/A')}</p>
					<p><strong>Start:</strong> ${escapeHtml(formatDate(comp.start_date))}</p>
					<p><strong>End:</strong> ${escapeHtml(formatDate(comp.end_date))}</p>
					<p><strong>Participants:</strong> ${participants}${maxParticipants}</p>
					${comp.prize_pool ? `<p><strong>Prize:</strong> ${escapeHtml(comp.prize_pool)}</p>` : ''}
					<div class="competition-actions">
						<button type="button" class="btn btn-sm btn-warning" data-action="edit" data-id="${comp.id}">Edit</button>
						<button type="button" class="btn btn-sm btn-danger" data-action="delete" data-id="${comp.id}">Delete</button>
					</div>
				</div>
			`;
		})
		.join('');
}

function renderAdminPayments() {
	const tbody = document.getElementById('paymentsTableBody');
	if (!tbody) return;

	if (!state.admin.payments.length) {
		tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No pending payments</td></tr>';
		return;
	}

	tbody.innerHTML = state.admin.payments
		.map((payment) => `
			<tr>
				<td>${escapeHtml(payment.id)}</td>
				<td>
					<strong>${escapeHtml(payment.user_name || 'Unknown')}</strong><br>
					<small>${escapeHtml(payment.user_email || '')}</small>
				</td>
				<td>${escapeHtml(payment.competition_name || '')}</td>
				<td>${payment.team_name ? escapeHtml(payment.team_name) : '-'}</td>
				<td>
					<span class="status-badge ${payment.payment_status === 'paid' ? 'status-registration_open' : 'status-upcoming'}">
						${escapeHtml(payment.payment_status)}
					</span>
				</td>
				<td>${escapeHtml(formatDate(payment.registered_at))}</td>
				<td>
					<button type="button" class="btn btn-sm btn-success" data-action="approve" data-id="${payment.id}">Approve</button>
					<button type="button" class="btn btn-sm btn-danger" data-action="reject" data-id="${payment.id}">Reject</button>
				</td>
			</tr>
		`)
		.join('');
}

function renderAdminRegistrations() {
	const tbody = document.getElementById('registrationsTableBody');
	if (!tbody) return;

	if (!state.admin.registrations.length) {
		tbody.innerHTML = '<tr><td colspan="8" style="text-align: center;">No registrations yet</td></tr>';
		return;
	}

	tbody.innerHTML = state.admin.registrations
		.map((reg) => `
			<tr>
				<td>${escapeHtml(reg.id)}</td>
				<td>
					<strong>${escapeHtml(reg.user_name || 'Unknown')}</strong><br>
					<small>@${escapeHtml(reg.username || '')}</small>
				</td>
				<td>${escapeHtml(reg.competition_name || '')}</td>
				<td>${reg.team_name ? escapeHtml(reg.team_name) : '-'}</td>
				<td>
					<span class="status-badge ${reg.registration_status === 'approved' ? 'status-registration_open' : 'status-upcoming'}">
						${escapeHtml(reg.registration_status || '')}
					</span>
				</td>
				<td>
					<span class="status-badge ${reg.payment_status === 'paid' ? 'status-registration_open' : 'status-upcoming'}">
						${escapeHtml(reg.payment_status || '')}
					</span>
				</td>
				<td>${escapeHtml(reg.score || 0)}</td>
				<td>${escapeHtml(formatDate(reg.registered_at))}</td>
			</tr>
		`)
		.join('');
}

async function verifyAdminPayment(registrationId, status) {
	try {
		await apiRequest('admin/verify_payments.php', {
			method: 'POST',
			body: {
				registration_id: registrationId,
				payment_status: status,
			},
		});
		const successMessage = status === 'paid' ? 'Payment approved successfully!' : 'Payment rejected successfully!';
		showAdminAlert('paymentAlert', successMessage, 'success');
		await Promise.allSettled([fetchAdminPayments(), fetchAdminRegistrations()]);
	} catch (err) {
		showAdminAlert('paymentAlert', err.message, 'error');
	}
}

function showAdminAlert(elementId, message, type = 'info') {
	const container = document.getElementById(elementId);
	if (!container) return;
	container.innerHTML = `<div class="alert alert-${escapeHtml(type)}">${escapeHtml(message)}</div>`;
	setTimeout(() => {
		if (container.innerHTML.includes(message)) {
			container.innerHTML = '';
		}
	}, 5000);
}

function formatDate(dateString) {
	if (!dateString) return 'N/A';
	const date = new Date(dateString);
	if (Number.isNaN(date.getTime())) return dateString;
	return date.toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	});
}

function escapeHtml(value) {
	if (value === null || value === undefined) return '';
	const div = document.createElement('div');
	div.textContent = String(value);
	return div.innerHTML;
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
	state.admin.competitions = [];
	state.admin.payments = [];
	state.admin.registrations = [];
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
