<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/utils.php';

header('Content-Type: application/json');
session_start();

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'You must be logged in']);
    exit;
}

$conn = getDBConnection();
$user_id = intval($_SESSION['user_id']);

try {
    // Get all competitions user is registered for
    $query = "
        SELECT 
            cr.id as registration_id,
            cr.team_name,
            cr.registration_status,
            cr.payment_status,
            cr.score,
            cr.rank,
            cr.registered_at,
            c.id as competition_id,
            c.name,
            c.description,
            c.start_date,
            c.end_date,
            c.registration_deadline,
            c.difficulty_level,
            c.prize_pool,
            c.status,
            c.category,
            c.banner_url
        FROM competition_registrations cr
        JOIN competitions c ON cr.competition_id = c.id
        WHERE cr.user_id = $user_id
        ORDER BY c.start_date DESC
    ";
    
    $result = pg_query($conn, $query);
    
    if (!$result) {
        throw new Exception(pg_last_error($conn));
    }
    
    $competitions = pg_fetch_all($result);
    echo json_encode($competitions ?: []);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['error' => $e->getMessage()]);
}

pg_close($conn);
?>

