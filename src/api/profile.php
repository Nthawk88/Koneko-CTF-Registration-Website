<?php
session_start();
require_once "db.php";
require_once "utils.php";

// pastikan user login
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["error" => "Unauthorized"]);
    exit();
}

$userId = $_SESSION['user_id'];

// method GET → ambil data profile
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->prepare("SELECT id, username, email FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    echo json_encode($user);
    exit();
}

// method POST → update data profile
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);

    $email = htmlspecialchars($data['email'] ?? '');
    $username = htmlspecialchars($data['username'] ?? '');

    if (!$email || !$username) {
        http_response_code(400);
        echo json_encode(["error" => "Invalid input"]);
        exit();
    }

    $stmt = $pdo->prepare("UPDATE users SET username = ?, email = ? WHERE id = ?");
    $stmt->execute([$username, $email, $userId]);

    echo json_encode(["success" => true, "message" => "Profile updated"]);
    exit();
}
