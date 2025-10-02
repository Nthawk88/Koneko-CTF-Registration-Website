<?php
require_once __DIR__ . '/db.php';

try {
    $pdo = get_pdo();
    
    // Create users table if it doesn't exist
    $createTable = "
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            full_name VARCHAR(100) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            username VARCHAR(50) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            role VARCHAR(20) NOT NULL DEFAULT 'user',
            created_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
    ";
    
    $pdo->exec($createTable);
    echo "Database initialized successfully!\n";
    
} catch (Exception $e) {
    echo "Error initializing database: " . $e->getMessage() . "\n";
}
?>
