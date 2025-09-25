<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/utils.php';
require_once __DIR__ . '/config.php';

try {
	$pdo = get_pdo();
	$dbRow = $pdo->query('SELECT current_database() AS db')->fetch();
	$dbName = $dbRow ? ($dbRow['db'] ?? null) : null;

	$userCount = 0;
	try {
		$countRow = $pdo->query('SELECT COUNT(*) AS c FROM users')->fetch();
		$userCount = (int)($countRow['c'] ?? 0);
	} catch (Throwable $e) {
		// table might not exist
	}

	json_response(200, [
		'configuredDbName' => 'neondb', // Using cloud database
		'connectedDatabase' => $dbName,
		'usersTableCount' => $userCount,
	]);
} catch (Throwable $e) {
    json_response(500, ['error' => 'DB connection failed']);
}

?>


