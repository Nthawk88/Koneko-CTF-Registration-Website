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

$method = $_SERVER['REQUEST_METHOD'];
$conn = getDBConnection();

try {
    switch ($method) {
        case 'GET':
            // Get all pending payments
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
                    c.name as competition_name
                FROM competition_registrations cr
                JOIN users u ON cr.user_id = u.id
                JOIN competitions c ON cr.competition_id = c.id
                WHERE cr.payment_status IN ('pending', 'unpaid')
                ORDER BY cr.registered_at DESC
            ";
            
            $result = pg_query($conn, $query);
            
            if (!$result) {
                throw new Exception(pg_last_error($conn));
            }
            
            $payments = pg_fetch_all($result);
            echo json_encode($payments ?: []);
            break;

        case 'POST':
            // Update payment status
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (empty($data['registration_id'])) {
                throw new Exception("Registration ID is required");
            }
            
            if (empty($data['payment_status'])) {
                throw new Exception("Payment status is required");
            }
            
            $registration_id = intval($data['registration_id']);
            $payment_status = pg_escape_string($conn, $data['payment_status']);
            
            // If payment is approved, also approve registration
            $registration_status = '';
            if ($payment_status === 'paid') {
                $registration_status = ", registration_status = 'approved'";
            } elseif ($payment_status === 'refunded') {
                $registration_status = ", registration_status = 'cancelled'";
            }
            
            $query = "
                UPDATE competition_registrations 
                SET payment_status = '$payment_status',
                    updated_at = NOW()
                    $registration_status
                WHERE id = $registration_id
                RETURNING *
            ";
            
            $result = pg_query($conn, $query);
            
            if (!$result) {
                throw new Exception(pg_last_error($conn));
            }
            
            $registration = pg_fetch_assoc($result);
            
            if (!$registration) {
                http_response_code(404);
                echo json_encode(['error' => 'Registration not found']);
            } else {
                // Update current_participants count in competitions table
                if ($payment_status === 'paid') {
                    $comp_id = $registration['competition_id'];
                    pg_query($conn, "
                        UPDATE competitions 
                        SET current_participants = (
                            SELECT COUNT(*) FROM competition_registrations 
                            WHERE competition_id = $comp_id 
                            AND payment_status = 'paid'
                            AND registration_status = 'approved'
                        )
                        WHERE id = $comp_id
                    ");
                }
                
                echo json_encode(['success' => true, 'registration' => $registration]);
            }
            break;

        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
    }
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['error' => $e->getMessage()]);
}

pg_close($conn);
?>

