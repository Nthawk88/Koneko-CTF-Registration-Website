// Check if user is admin on page load
document.addEventListener('DOMContentLoaded', async () => {
    await checkAdminAccess();
    loadCompetitions();
    loadPayments();
    loadRegistrations();
    setupEventListeners();
});

// Check admin access
async function checkAdminAccess() {
    try {
        const response = await fetch('api/get_current_user.php');
        const data = await response.json();
        
        if (!data.user || data.user.role !== 'admin') {
            document.getElementById('adminPanel').style.display = 'none';
            document.getElementById('accessDenied').style.display = 'block';
            return false;
        }
        
        document.getElementById('adminPanel').style.display = 'block';
        document.getElementById('accessDenied').style.display = 'none';
        return true;
    } catch (error) {
        console.error('Error checking admin access:', error);
        document.getElementById('adminPanel').style.display = 'none';
        document.getElementById('accessDenied').style.display = 'block';
        return false;
    }
}

// Setup event listeners
function setupEventListeners() {
    // Add competition form
    document.getElementById('addCompetitionForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await addCompetition(e.target);
    });
    
    // Edit competition form
    document.getElementById('editCompetitionForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await updateCompetition(e.target);
    });
}

// Switch tabs
function switchTab(tab) {
    // Update tab buttons
    document.querySelectorAll('.admin-tab').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    document.getElementById(tab + 'Tab').classList.add('active');
    
    // Reload data when switching tabs
    if (tab === 'payments') {
        loadPayments();
    } else if (tab === 'registrations') {
        loadRegistrations();
    }
}

// Load competitions
async function loadCompetitions() {
    try {
        const response = await fetch('api/admin/manage_competitions.php');
        const competitions = await response.json();
        
        const container = document.getElementById('competitionsList');
        
        if (!competitions || competitions.length === 0) {
            container.innerHTML = '<p>No competitions yet.</p>';
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
                    <button class="btn btn-sm btn-warning" onclick="editCompetition(${comp.id})">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteCompetition(${comp.id})">Delete</button>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading competitions:', error);
        showAlert('competitionAlert', 'Error loading competitions', 'error');
    }
}

// Add competition
async function addCompetition(form) {
    try {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        console.log('Sending competition data:', data);
        
        const response = await fetch('api/admin/manage_competitions.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        console.log('API Response:', result);
        
        if (response.ok) {
            showAlert('competitionAlert', result.message || 'Competition added successfully!', 'success');
            form.reset();
            loadCompetitions();
        } else {
            const errorMsg = result.error || 'Failed to add competition';
            const detailsMsg = result.details ? `\n${result.details}` : '';
            showAlert('competitionAlert', errorMsg + detailsMsg, 'error');
            console.error('API Error:', result);
        }
        
    } catch (error) {
        console.error('Error adding competition:', error);
        showAlert('competitionAlert', 'Network error: ' + error.message, 'error');
    }
}

// Edit competition
async function editCompetition(id) {
    try {
        const response = await fetch('api/admin/manage_competitions.php');
        const competitions = await response.json();
        const competition = competitions.find(c => c.id == id);
        
        if (!competition) {
            alert('Competition not found');
            return;
        }
        
        // Fill edit form
        document.getElementById('editId').value = competition.id;
        document.getElementById('editName').value = competition.name;
        document.getElementById('editDescription').value = competition.description || '';
        document.getElementById('editStatus').value = competition.status;
        
        // Show modal
        document.getElementById('editModal').classList.add('active');
        
    } catch (error) {
        console.error('Error loading competition:', error);
        alert('Error loading competition');
    }
}

// Update competition
async function updateCompetition(form) {
    try {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        const response = await fetch('api/admin/manage_competitions.php', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            alert('Competition updated successfully!');
            closeEditModal();
            loadCompetitions();
        } else {
            alert(result.error || 'Failed to update competition');
        }
        
    } catch (error) {
        console.error('Error updating competition:', error);
        alert('Error updating competition');
    }
}

// Delete competition
async function deleteCompetition(id) {
    if (!confirm('Are you sure you want to delete this competition? This will also delete all registrations.')) {
        return;
    }
    
    try {
        const response = await fetch('api/admin/manage_competitions.php', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            alert('Competition deleted successfully!');
            loadCompetitions();
        } else {
            alert(result.error || 'Failed to delete competition');
        }
        
    } catch (error) {
        console.error('Error deleting competition:', error);
        alert('Error deleting competition');
    }
}

// Load pending payments
async function loadPayments() {
    try {
        const response = await fetch('api/admin/verify_payments.php');
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
                    <span class="status-badge ${payment.payment_status === 'paid' ? 'status-registration_open' : 'status-upcoming'}">
                        ${payment.payment_status}
                    </span>
                </td>
                <td>${formatDate(payment.registered_at)}</td>
                <td>
                    <button class="btn btn-sm btn-success" onclick="verifyPayment(${payment.id}, 'paid')">Approve</button>
                    <button class="btn btn-sm btn-danger" onclick="verifyPayment(${payment.id}, 'refunded')">Reject</button>
                </td>
            </tr>
        `).join('');
        
    } catch (error) {
        console.error('Error loading payments:', error);
        showAlert('paymentAlert', 'Error loading payments', 'error');
    }
}

// Verify payment
async function verifyPayment(registrationId, status) {
    try {
        const response = await fetch('api/admin/verify_payments.php', {
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
            showAlert('paymentAlert', `Payment ${status === 'paid' ? 'approved' : 'rejected'} successfully!`, 'success');
            loadPayments();
            loadRegistrations();
        } else {
            showAlert('paymentAlert', result.error || 'Failed to update payment', 'error');
        }
        
    } catch (error) {
        console.error('Error verifying payment:', error);
        showAlert('paymentAlert', 'Error verifying payment', 'error');
    }
}

// Load all registrations
async function loadRegistrations() {
    try {
        const response = await fetch('api/admin/get_registrations.php');
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
                    <span class="status-badge ${reg.registration_status === 'approved' ? 'status-registration_open' : 'status-upcoming'}">
                        ${reg.registration_status}
                    </span>
                </td>
                <td>
                    <span class="status-badge ${reg.payment_status === 'paid' ? 'status-registration_open' : 'status-upcoming'}">
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

// Close edit modal
function closeEditModal() {
    document.getElementById('editModal').classList.remove('active');
}

// Logout
async function logout() {
    try {
        await fetch('api/logout.php');
        window.location.href = '/index.html';
    } catch (error) {
        console.error('Error logging out:', error);
    }
}

// Helper functions
function showAlert(elementId, message, type) {
    const alertDiv = document.getElementById(elementId);
    alertDiv.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
    setTimeout(() => {
        alertDiv.innerHTML = '';
    }, 5000);
}

function formatDate(dateString) {
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

