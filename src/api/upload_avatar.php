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

	if (!isset($_FILES['avatar']) || $_FILES['avatar']['error'] !== UPLOAD_ERR_OK) {
		json_response(400, ['error' => 'Avatar upload failed']);
	}

	$file = $_FILES['avatar'];
	$allowedTypes = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/gif' => 'gif', 'image/webp' => 'webp'];
	$maxSize = 2 * 1024 * 1024; // 2 MB

	if (!isset($allowedTypes[$file['type'] ?? ''])) {
		json_response(400, ['error' => 'Unsupported image type']);
	}

	if ($file['size'] > $maxSize) {
		json_response(400, ['error' => 'Avatar must be under 2 MB']);
	}

	$imgInfo = getimagesize($file['tmp_name']);
	if ($imgInfo === false) {
		json_response(400, ['error' => 'Invalid image file']);
	}

	$extension = $allowedTypes[$file['type']];
	$filename = sprintf('avatar_%d_%s.%s', (int) $user['id'], bin2hex(random_bytes(8)), $extension);
	$uploadDir = __DIR__ . '/../uploads/avatars';
	$uploadPath = $uploadDir . '/' . $filename;

	if (!is_dir($uploadDir) && !mkdir($uploadDir, 0755, true) && !is_dir($uploadDir)) {
		json_response(500, ['error' => 'Failed to create upload directory']);
	}

	if (!move_uploaded_file($file['tmp_name'], $uploadPath)) {
		json_response(500, ['error' => 'Unable to store uploaded avatar']);
	}

	$relativePath = 'uploads/avatars/' . $filename;

	$pdo = get_pdo();
	$stmt = $pdo->prepare('UPDATE users SET avatar_url = :avatar, updated_at = NOW() WHERE id = :id');
	$stmt->execute([
		':avatar' => $relativePath,
		':id' => $user['id'],
	]);

	$updatedUser = getUserById((int) $user['id']);
	json_response(200, [
		'message' => 'Avatar uploaded successfully',
		'user' => format_user_response($updatedUser ?? []),
	]);
} catch (Throwable $e) {
	json_response(500, ['error' => 'Server error']);
}
