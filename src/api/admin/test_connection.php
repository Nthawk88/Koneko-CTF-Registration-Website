<?php
// Test file untuk debug database connection dan session
require_once __DIR__ . '/../db.php';

header('Content-Type: application/json');
session_start();

$result = [
    'session_status' => session_status() === PHP_SESSION_ACTIVE ? 'Active' : 'Inactive',
    'session_id' => session_id(),
    'user_id' => isset($_SESSION['user_id']) ? $_SESSION['user_id'] : 'Not set',
    'user_role' => isset($_SESSION['role']) ? $_SESSION['role'] : 'Not set',
    'timestamp' => date('Y-m-d H:i:s')
];

try {
    $conn = getDBConnection();
    
    if ($conn) {
        $result['database'] = 'Connected';
        
        // Test query
        $testQuery = "SELECT COUNT(*) as count FROM users";
        $testResult = pg_query($conn, $testQuery);
        
        if ($testResult) {
            $row = pg_fetch_assoc($testResult);
            $result['users_count'] = $row['count'];
        }
        
        // Test competitions table
        $compQuery = "SELECT COUNT(*) as count FROM competitions";
        $compResult = pg_query($conn, $compQuery);
        
        if ($compResult) {
            $row = pg_fetch_assoc($compResult);
            $result['competitions_count'] = $row['count'];
        } else {
            $result['competitions_error'] = pg_last_error($conn);
        }
        
        pg_close($conn);
    } else {
        $result['database'] = 'Connection failed';
    }
} catch (Exception $e) {
    $result['database_error'] = $e->getMessage();
}

echo json_encode($result, JSON_PRETTY_PRINT);
?>

