<?php
require_once __DIR__ . '/utils.php';

// Allow only POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
	json_response(405, ['error' => 'Method Not Allowed']);
}

start_secure_session();

// Unset all session variables
$_SESSION = [];

// Delete the session cookie if it exists
if (ini_get('session.use_cookies')) {
	$params = session_get_cookie_params();
	setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'], $params['secure'], $params['httponly']);
}

// Destroy the session
session_destroy();

json_response(200, ['message' => 'Logged out']);


