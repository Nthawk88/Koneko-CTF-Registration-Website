<?php

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/utils.php';

try {
	start_secure_session();
	$user = getCurrentUser();

	if (!$user) {
		json_response(401, ['error' => 'Not authenticated']);
	}

	json_response(200, ['user' => format_user_response($user)]);
} catch (Throwable $e) {
	json_response(500, ['error' => 'Server error']);
}
