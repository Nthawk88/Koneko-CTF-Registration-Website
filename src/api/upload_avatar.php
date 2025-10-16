<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'db.php';
require_once 'utils.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

try {
    // Get user from session
    $user = getCurrentUser();
    if (!$user) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit();
    }
    
    $userId = $user['id'];
    
    // Check if file was uploaded
    if (!isset($_FILES['avatar']) || $_FILES['avatar']['error'] !== UPLOAD_ERR_OK) {
        throw new Exception('No file uploaded or upload error');
    }
    
    $file = $_FILES['avatar'];
    
    // Validate file
    $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    $maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!in_array($file['type'], $allowedTypes)) {
        throw new Exception('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed');
    }
    
    if ($file['size'] > $maxSize) {
        throw new Exception('File too large. Maximum size is 5MB');
    }
    
    // Validate image
    $imageInfo = getimagesize($file['tmp_name']);
    if ($imageInfo === false) {
        throw new Exception('Invalid image file');
    }
    
    // Generate unique filename
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = 'avatar_' . $userId . '_' . time() . '.' . $extension;
    $uploadPath = '../uploads/avatars/' . $filename;
    
    // Create uploads directory if it doesn't exist
    $uploadDir = dirname($uploadPath);
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }
    
    // Move uploaded file
    if (!move_uploaded_file($file['tmp_name'], $uploadPath)) {
        throw new Exception('Failed to save uploaded file');
    }
    
    // Resize image to standard avatar size (200x200)
    $resizedPath = '../uploads/avatars/thumb_' . $filename;
    resizeImage($uploadPath, $resizedPath, 200, 200);
    
    // Update database with new avatar URL
    $avatarUrl = 'uploads/avatars/' . $filename;
    $pdo = get_pdo();
    $stmt = $pdo->prepare("UPDATE users SET avatar_url = ?, updated_at = NOW() WHERE id = ?");
    $stmt->execute([$avatarUrl, $userId]);
    
    // Delete old avatar files if they exist
    if (!empty($user['avatar_url'])) {
        $oldAvatarPath = '../' . $user['avatar_url'];
        $oldThumbPath = '../uploads/avatars/thumb_' . basename($user['avatar_url']);
        
        if (file_exists($oldAvatarPath)) {
            unlink($oldAvatarPath);
        }
        if (file_exists($oldThumbPath)) {
            unlink($oldThumbPath);
        }
    }
    
    // Get updated user data
    $updatedUser = getUserById($userId);
    
    echo json_encode([
        'success' => true,
        'message' => 'Avatar uploaded successfully',
        'user' => $updatedUser,
        'avatar_url' => $avatarUrl
    ]);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['error' => $e->getMessage(), 'debug' => [
        'file' => $e->getFile(),
        'line' => $e->getLine(),
        'trace' => $e->getTraceAsString()
    ]]);
}

function resizeImage($sourcePath, $destinationPath, $width, $height) {
    $imageInfo = getimagesize($sourcePath);
    $sourceWidth = $imageInfo[0];
    $sourceHeight = $imageInfo[1];
    $mimeType = $imageInfo['mime'];
    
    // Create source image resource
    switch ($mimeType) {
        case 'image/jpeg':
            $sourceImage = imagecreatefromjpeg($sourcePath);
            break;
        case 'image/png':
            $sourceImage = imagecreatefrompng($sourcePath);
            break;
        case 'image/gif':
            $sourceImage = imagecreatefromgif($sourcePath);
            break;
        case 'image/webp':
            $sourceImage = imagecreatefromwebp($sourcePath);
            break;
        default:
            throw new Exception('Unsupported image type');
    }
    
    if (!$sourceImage) {
        throw new Exception('Failed to create source image');
    }
    
    // Create destination image
    $destImage = imagecreatetruecolor($width, $height);
    
    // Preserve transparency for PNG and GIF
    if ($mimeType === 'image/png' || $mimeType === 'image/gif') {
        imagealphablending($destImage, false);
        imagesavealpha($destImage, true);
        $transparent = imagecolorallocatealpha($destImage, 255, 255, 255, 127);
        imagefill($destImage, 0, 0, $transparent);
    }
    
    // Resize image
    imagecopyresampled($destImage, $sourceImage, 0, 0, 0, 0, $width, $height, $sourceWidth, $sourceHeight);
    
    // Save resized image
    $success = false;
    switch ($mimeType) {
        case 'image/jpeg':
            $success = imagejpeg($destImage, $destinationPath, 90);
            break;
        case 'image/png':
            $success = imagepng($destImage, $destinationPath, 9);
            break;
        case 'image/gif':
            $success = imagegif($destImage, $destinationPath);
            break;
        case 'image/webp':
            $success = imagewebp($destImage, $destinationPath, 90);
            break;
    }
    
    // Clean up
    imagedestroy($sourceImage);
    imagedestroy($destImage);
    
    if (!$success) {
        throw new Exception('Failed to save resized image');
    }
}
?>
