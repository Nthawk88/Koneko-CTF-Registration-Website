<?php
require_once __DIR__ . '/utils.php';

// Allow only POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
	json_response(405, ['error' => 'Method Not Allowed']);
}

// Start session and get current user info before logout
start_secure_session();
$sessionIdBefore = session_id();
$userIdBefore = $_SESSION['user_id'] ?? null;

// Perform logout
logoutUser();

// Don't start a new session after logout - just return success
json_response(200, [
	'message' => 'Logged out successfully',
	'debug' => [
		'session_id_before' => $sessionIdBefore,
		'user_id_before' => $userIdBefore,
		'session_destroyed' => true
	]
]);

