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

if (strlen($username) < 3 || strlen($username) > 50) {
	json_response(400, ['error' => 'Username must be between 3 and 50 characters']);
}

// Password length limits to prevent DOS attacks
if (strlen($password) < 8 || strlen($password) > 128) {
	json_response(400, ['error' => 'Password must be between 8 and 128 characters']);
}

if ($password !== $confirmPassword) {
	json_response(400, ['error' => 'Passwords do not match']);
}

try {
	$pdo = get_pdo();
	$passwordHash = password_hash($password, PASSWORD_DEFAULT);
	
	// Use INSERT with ON CONFLICT to handle race conditions atomically
	$insert = $pdo->prepare('INSERT INTO users (full_name, email, username, password_hash, created_at) 
		VALUES (:full_name, :email, :username, :password_hash, NOW()) 
		ON CONFLICT (email) DO NOTHING 
		ON CONFLICT (username) DO NOTHING');
	
	$insert->execute([
		':full_name' => $fullName,
		':email' => $email,
		':username' => $username,
		':password_hash' => $passwordHash,
	]);
	
	// Check if the insert actually succeeded (rowCount will be 0 if conflict occurred)
	if ($insert->rowCount() === 0) {
		json_response(409, ['error' => 'Email or username already exists']);
	}

	json_response(201, ['message' => 'Account created successfully']);
} catch (Throwable $e) {
	json_response(500, ['error' => 'Server error']);
}

