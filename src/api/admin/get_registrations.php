<?php
require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/../utils.php';

header('Content-Type: application/json');
session_start();

// Check if user is logged in and is admin
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['error' => 'Access denied. Admin privileges required.']);
    exit;
}

$conn = getDBConnection();

try {
    $query = "
        SELECT 
            cr.id,
            cr.user_id,
            cr.competition_id,
            cr.team_name,
            cr.registration_status,
            cr.payment_status,
            cr.registration_notes,
            cr.score,
            cr.rank,
            cr.registered_at,
            u.full_name as user_name,
            u.email as user_email,
            u.username,
            c.name as competition_name,
            c.category as competition_category
        FROM competition_registrations cr
        JOIN users u ON cr.user_id = u.id
        JOIN competitions c ON cr.competition_id = c.id
        ORDER BY cr.registered_at DESC
    ";
    
    $result = pg_query($conn, $query);
    
    if (!$result) {
        throw new Exception(pg_last_error($conn));
    }
    
    $registrations = pg_fetch_all($result);
    echo json_encode($registrations ?: []);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['error' => $e->getMessage()]);
}

pg_close($conn);
?>

