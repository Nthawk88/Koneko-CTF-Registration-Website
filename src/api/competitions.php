<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/utils.php';

header('Content-Type: application/json');
session_start();

$conn = getDBConnection();

try {
    // Get all active competitions
    $query = "
        SELECT 
            c.*,
            CASE 
                WHEN cr.id IS NOT NULL THEN true
                ELSE false
            END as is_registered
        FROM competitions c
        LEFT JOIN competition_registrations cr 
            ON c.id = cr.competition_id 
            AND cr.user_id = " . (isset($_SESSION['user_id']) ? intval($_SESSION['user_id']) : 0) . "
        WHERE c.status IN ('upcoming', 'registration_open', 'ongoing')
        ORDER BY c.start_date ASC
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

