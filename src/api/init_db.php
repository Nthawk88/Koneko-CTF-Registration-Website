<?php
require_once __DIR__ . '/db.php';

if (php_sapi_name() !== 'cli') {
	http_response_code(403);
	die('Access denied');
}

try {
	$pdo = get_pdo();
	$sqlFile = __DIR__ . '/../sql/init.sql';
	if (!is_file($sqlFile)) {
		throw new RuntimeException('SQL definition file not found');
	}

	$sql = file_get_contents($sqlFile);
	if ($sql === false) {
		throw new RuntimeException('Failed to read SQL definition file');
	}

	$pdo->exec($sql);
	echo "Database initialized successfully!\n";
} catch (Throwable $e) {
	echo "Error initializing database: " . $e->getMessage() . "\n";
}
