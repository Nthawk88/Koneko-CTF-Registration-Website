<?php

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/utils.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
	json_response(405, ['error' => 'Method Not Allowed']);
}

try {
	start_secure_session();
	$user = getCurrentUser();

	if (!$user) {
		json_response(401, ['error' => 'Unauthorized']);
	}

	try {
		$input = get_json_input();
	} catch (InvalidArgumentException $e) {
		json_response(400, ['error' => $e->getMessage()]);
	}

	$updates = [];
	$params = ['id' => $user['id']];

	$fullNameValue = $input['fullName'] ?? $input['full_name'] ?? null;
	if ($fullNameValue !== null) {
		$fullName = sanitize_string($fullNameValue);
		if ($fullName === '' || strlen($fullName) > 100) {
			json_response(400, ['error' => 'Full name must be 1-100 characters']);
		}
		$updates[] = 'full_name = :full_name';
		$params['full_name'] = $fullName;
	}

	$emailValue = $input['email'] ?? null;
	if ($emailValue !== null) {
		$email = sanitize_string($emailValue);
		if (!validate_email($email)) {
			json_response(400, ['error' => 'Invalid email format']);
		}
		$updates[] = 'email = :email';
		$params['email'] = $email;
	}

	$locationValue = $input['location'] ?? null;
	if ($locationValue !== null) {
		$location = sanitize_string($locationValue);
		if (strlen($location) > 100) {
			json_response(400, ['error' => 'Location must be under 100 characters']);
		}
		$updates[] = 'location = :location';
		$params['location'] = $location === '' ? null : $location;
	}

	$bioValue = $input['bio'] ?? null;
	if ($bioValue !== null) {
		$bio = sanitize_string($bioValue);
		if (strlen($bio) > 500) {
			json_response(400, ['error' => 'Bio must be under 500 characters']);
		}
		$updates[] = 'bio = :bio';
		$params['bio'] = $bio === '' ? null : $bio;
	}

	if (!$updates) {
		json_response(400, ['error' => 'No valid fields to update']);
	}

	$pdo = get_pdo();
	if (isset($params['email'])) {
		$check = $pdo->prepare('SELECT 1 FROM users WHERE email = :email AND id <> :id');
		$check->execute([':email' => $params['email'], ':id' => $user['id']]);
		if ($check->fetch()) {
			json_response(409, ['error' => 'Email already in use']);
		}
	}

	$sql = 'UPDATE users SET ' . implode(', ', $updates) . ', updated_at = NOW() WHERE id = :id';
	$stmt = $pdo->prepare($sql);
	$stmt->execute($params);

	$updatedUser = getUserById((int) $user['id']);
	json_response(200, [
		'message' => 'Profile updated successfully',
		'user' => format_user_response($updatedUser ?? []),
	]);
} catch (Throwable $e) {
	json_response(500, ['error' => 'Server error']);
}
