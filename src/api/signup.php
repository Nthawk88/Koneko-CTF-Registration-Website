<?php

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/utils.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
	json_response(405, ['error' => 'Method Not Allowed']);
}

try {
	$input = get_json_input();
} catch (InvalidArgumentException $e) {
	json_response(400, ['error' => $e->getMessage()]);
}

$fullName = sanitize_string($input['fullName'] ?? '');
$email = sanitize_string($input['email'] ?? '');
$username = sanitize_string($input['username'] ?? '');
$password = (string) ($input['password'] ?? '');
$confirmPassword = (string) ($input['confirmPassword'] ?? '');

if ($fullName === '' || $email === '' || $username === '' || $password === '' || $confirmPassword === '') {
	json_response(400, ['error' => 'All fields are required']);
}

if (!validate_email($email)) {
	json_response(400, ['error' => 'Invalid email format']);
}

if (!preg_match('/^[A-Za-z0-9_]{3,32}$/', $username)) {
	json_response(400, ['error' => 'Username must be 3-32 characters and alphanumeric/underscore only']);
}

if (strlen($password) < 12 || strlen($password) > 128) {
	json_response(400, ['error' => 'Password must be between 12 and 128 characters']);
}

if (!preg_match('/[A-Z]/', $password) || !preg_match('/[a-z]/', $password) || !preg_match('/[0-9]/', $password)) {
	json_response(400, ['error' => 'Password must include upper, lower, and numeric characters']);
}

if ($password !== $confirmPassword) {
	json_response(400, ['error' => 'Passwords do not match']);
}

try {
	$pdo = get_pdo();
	$passwordHash = password_hash($password, PASSWORD_DEFAULT);

	$stmt = $pdo->prepare('INSERT INTO users (full_name, email, username, password_hash, created_at, updated_at)
		VALUES (:name, :email, :username, :password_hash, NOW(), NOW())');
	$stmt->execute([
		':name' => $fullName,
		':email' => $email,
		':username' => $username,
		':password_hash' => $passwordHash,
	]);

	json_response(201, ['message' => 'Account created successfully']);
} catch (PDOException $e) {
	if ($e->getCode() === '23505') {
		json_response(409, ['error' => 'Email or username already exists']);
	}

	json_response(500, ['error' => 'Server error']);
}

