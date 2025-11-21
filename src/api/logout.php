<?php
require_once __DIR__ . '/utils.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
	json_response(405, ['error' => 'Method Not Allowed']);
}

start_secure_session();
verify_csrf_token();
logoutUser();

json_response(200, ['message' => 'Logged out successfully']);

