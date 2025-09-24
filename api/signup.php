<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/utils.php';

// Allow only POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
	json_response(405, ['error' => 'Method Not Allowed']);
}

// Expect JSON
$input = get_json_input();
$fullName = sanitize_string($input['fullName'] ?? '');
$email = sanitize_string($input['email'] ?? '');
$username = sanitize_string($input['username'] ?? '');
$password = (string)($input['password'] ?? '');
$confirmPassword = (string)($input['confirmPassword'] ?? '');

if ($fullName === '' || $email === '' || $username === '' || $password === '' || $confirmPassword === '') {
	json_response(400, ['error' => 'All fields are required']);
}

if (!validate_email($email)) {
	json_response(400, ['error' => 'Invalid email']);
}

if ($password !== $confirmPassword) {
	json_response(400, ['error' => 'Passwords do not match']);
}

if (strlen($password) < 8) {
	json_response(400, ['error' => 'Password must be at least 8 characters']);
}

try {
	$pdo = get_pdo();
	// Check duplicates
	$stmt = $pdo->prepare('SELECT id FROM users WHERE email = :email OR username = :username LIMIT 1');
	$stmt->execute([':email' => $email, ':username' => $username]);
	if ($stmt->fetch()) {
		json_response(409, ['error' => 'Email or username already exists']);
	}

	$passwordHash = password_hash($password, PASSWORD_DEFAULT);
	$insert = $pdo->prepare('INSERT INTO users (full_name, email, username, password_hash, created_at) VALUES (:full_name, :email, :username, :password_hash, NOW())');
	$insert->execute([
		':full_name' => $fullName,
		':email' => $email,
		':username' => $username,
		':password_hash' => $passwordHash,
	]);

	json_response(201, ['message' => 'Account created successfully']);
} catch (Throwable $e) {
	json_response(500, ['error' => 'Server error']);
}

