<?php
require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/../utils.php';

header('Content-Type: application/json');
session_start();

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 0); // Don't display errors, log them instead

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
            // Get all competitions
            $query = "SELECT * FROM competitions ORDER BY created_at DESC";
            $result = pg_query($conn, $query);
            
            if (!$result) {
                throw new Exception(pg_last_error($conn));
            }
            
            $competitions = pg_fetch_all($result);
            echo json_encode($competitions ?: []);
            break;

        case 'POST':
            // Create new competition
            $data = json_decode(file_get_contents('php://input'), true);
            
            // Log received data for debugging
            error_log("Received competition data: " . print_r($data, true));
            
            // Validate required fields
            $required = ['name', 'start_date', 'end_date', 'registration_deadline', 'category'];
            foreach ($required as $field) {
                if (empty($data[$field])) {
                    throw new Exception("Field '$field' is required");
                }
            }
            
            // Prepare data with defaults
            $name = pg_escape_string($conn, $data['name']);
            $description = isset($data['description']) ? pg_escape_string($conn, $data['description']) : null;
            $start_date = pg_escape_string($conn, $data['start_date']);
            $end_date = pg_escape_string($conn, $data['end_date']);
            $registration_deadline = pg_escape_string($conn, $data['registration_deadline']);
            $max_participants = isset($data['max_participants']) && $data['max_participants'] !== '' ? intval($data['max_participants']) : 'NULL';
            $difficulty_level = isset($data['difficulty_level']) ? pg_escape_string($conn, $data['difficulty_level']) : 'beginner';
            $prize_pool = isset($data['prize_pool']) && $data['prize_pool'] !== '' ? pg_escape_string($conn, $data['prize_pool']) : null;
            $status = isset($data['status']) ? pg_escape_string($conn, $data['status']) : 'upcoming';
            $category = pg_escape_string($conn, $data['category']); // Required field, no default
            $rules = isset($data['rules']) && $data['rules'] !== '' ? pg_escape_string($conn, $data['rules']) : null;
            $contact_person = isset($data['contact_person']) ? pg_escape_string($conn, $data['contact_person']) : null;
            $banner_url = isset($data['banner_url']) ? pg_escape_string($conn, $data['banner_url']) : null;
            
            $query = "INSERT INTO competitions (
                name, description, start_date, end_date, registration_deadline,
                max_participants, difficulty_level, prize_pool, status, category,
                rules, contact_person, banner_url
            ) VALUES (
                '$name', " . ($description ? "'$description'" : "NULL") . ", 
                '$start_date', '$end_date', '$registration_deadline',
                $max_participants, '$difficulty_level', " . ($prize_pool ? "'$prize_pool'" : "NULL") . ",
                '$status', '$category', " . ($rules ? "'$rules'" : "NULL") . ",
                " . ($contact_person ? "'$contact_person'" : "NULL") . ",
                " . ($banner_url ? "'$banner_url'" : "NULL") . "
            ) RETURNING *";
            
            // Log the query for debugging
            error_log("SQL Query: " . $query);
            
            $result = pg_query($conn, $query);
            
            if (!$result) {
                $error = pg_last_error($conn);
                error_log("PostgreSQL Error: " . $error);
                throw new Exception("Database error: " . $error);
            }
            
            $competition = pg_fetch_assoc($result);
            
            if (!$competition) {
                throw new Exception("Failed to retrieve created competition");
            }
            
            http_response_code(201);
            echo json_encode(['success' => true, 'competition' => $competition, 'message' => 'Competition created successfully']);
            break;

        case 'PUT':
            // Update competition
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (empty($data['id'])) {
                throw new Exception("Competition ID is required");
            }
            
            $id = intval($data['id']);
            $updates = [];
            
            if (isset($data['name'])) {
                $updates[] = "name = '" . pg_escape_string($conn, $data['name']) . "'";
            }
            if (isset($data['description'])) {
                $updates[] = "description = '" . pg_escape_string($conn, $data['description']) . "'";
            }
            if (isset($data['status'])) {
                $updates[] = "status = '" . pg_escape_string($conn, $data['status']) . "'";
            }
            if (isset($data['start_date'])) {
                $updates[] = "start_date = '" . pg_escape_string($conn, $data['start_date']) . "'";
            }
            if (isset($data['end_date'])) {
                $updates[] = "end_date = '" . pg_escape_string($conn, $data['end_date']) . "'";
            }
            if (isset($data['registration_deadline'])) {
                $updates[] = "registration_deadline = '" . pg_escape_string($conn, $data['registration_deadline']) . "'";
            }
            if (isset($data['max_participants'])) {
                $updates[] = "max_participants = " . intval($data['max_participants']);
            }
            if (isset($data['difficulty_level'])) {
                $updates[] = "difficulty_level = '" . pg_escape_string($conn, $data['difficulty_level']) . "'";
            }
            if (isset($data['prize_pool'])) {
                $updates[] = "prize_pool = '" . pg_escape_string($conn, $data['prize_pool']) . "'";
            }
            if (isset($data['category'])) {
                $updates[] = "category = '" . pg_escape_string($conn, $data['category']) . "'";
            }
            if (isset($data['rules'])) {
                $updates[] = "rules = '" . pg_escape_string($conn, $data['rules']) . "'";
            }
            if (isset($data['contact_person'])) {
                $updates[] = "contact_person = '" . pg_escape_string($conn, $data['contact_person']) . "'";
            }
            if (isset($data['banner_url'])) {
                $updates[] = "banner_url = '" . pg_escape_string($conn, $data['banner_url']) . "'";
            }
            
            if (empty($updates)) {
                throw new Exception("No fields to update");
            }
            
            $query = "UPDATE competitions SET " . implode(', ', $updates) . " WHERE id = $id RETURNING *";
            $result = pg_query($conn, $query);
            
            if (!$result) {
                throw new Exception(pg_last_error($conn));
            }
            
            $competition = pg_fetch_assoc($result);
            
            if (!$competition) {
                http_response_code(404);
                echo json_encode(['error' => 'Competition not found']);
            } else {
                echo json_encode(['success' => true, 'competition' => $competition]);
            }
            break;

        case 'DELETE':
            // Delete competition
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (empty($data['id'])) {
                throw new Exception("Competition ID is required");
            }
            
            $id = intval($data['id']);
            $query = "DELETE FROM competitions WHERE id = $id RETURNING id";
            $result = pg_query($conn, $query);
            
            if (!$result) {
                throw new Exception(pg_last_error($conn));
            }
            
            $deleted = pg_fetch_assoc($result);
            
            if (!$deleted) {
                http_response_code(404);
                echo json_encode(['error' => 'Competition not found']);
            } else {
                echo json_encode(['success' => true, 'message' => 'Competition deleted']);
            }
            break;

        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
    }
} catch (Exception $e) {
    error_log("Exception in manage_competitions.php: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    http_response_code(400);
    echo json_encode([
        'error' => $e->getMessage(),
        'details' => 'Check server error log for more information'
    ]);
}

if ($conn) {
    pg_close($conn);
}
?>

