<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/utils.php';

header('Content-Type: application/json');
session_start();

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'You must be logged in to register']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$conn = getDBConnection();

try {
    if ($method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (empty($data['competition_id'])) {
            throw new Exception("Competition ID is required");
        }
        
        $user_id = intval($_SESSION['user_id']);
        $competition_id = intval($data['competition_id']);
        $team_name = isset($data['team_name']) ? pg_escape_string($conn, $data['team_name']) : null;
        $registration_notes = isset($data['registration_notes']) ? pg_escape_string($conn, $data['registration_notes']) : null;
        
        // Check if competition exists and is open for registration
        $comp_query = "SELECT * FROM competitions WHERE id = $competition_id";
        $comp_result = pg_query($conn, $comp_query);
        $competition = pg_fetch_assoc($comp_result);
        
        if (!$competition) {
            throw new Exception("Competition not found");
        }
        
        if ($competition['status'] !== 'registration_open' && $competition['status'] !== 'upcoming') {
            throw new Exception("Registration is not open for this competition");
        }
        
        // Check if registration deadline has passed
        if (strtotime($competition['registration_deadline']) < time()) {
            throw new Exception("Registration deadline has passed");
        }
        
        // Check if max participants reached
        if ($competition['max_participants'] && 
            $competition['current_participants'] >= $competition['max_participants']) {
            throw new Exception("Competition has reached maximum participants");
        }
        
        // Check if user already registered
        $check_query = "SELECT id FROM competition_registrations 
                       WHERE user_id = $user_id AND competition_id = $competition_id";
        $check_result = pg_query($conn, $check_query);
        
        if (pg_num_rows($check_result) > 0) {
            throw new Exception("You are already registered for this competition");
        }
        
        // Insert registration
        $query = "
            INSERT INTO competition_registrations (
                user_id, 
                competition_id, 
                team_name, 
                registration_notes,
                registration_status,
                payment_status
            ) VALUES (
                $user_id,
                $competition_id,
                " . ($team_name ? "'$team_name'" : "NULL") . ",
                " . ($registration_notes ? "'$registration_notes'" : "NULL") . ",
                'pending',
                'unpaid'
            ) RETURNING *
        ";
        
        $result = pg_query($conn, $query);
        
        if (!$result) {
            throw new Exception(pg_last_error($conn));
        }
        
        $registration = pg_fetch_assoc($result);
        
        http_response_code(201);
        echo json_encode([
            'success' => true,
            'message' => 'Successfully registered for competition',
            'registration' => $registration
        ]);
        
    } else {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
    }
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['error' => $e->getMessage()]);
}

pg_close($conn);
?>

