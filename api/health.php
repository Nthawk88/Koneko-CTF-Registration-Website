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
		'configuredDbName' => DB_NAME,
		'connectedDatabase' => $dbName,
		'usersTableCount' => $userCount,
	]);
} catch (Throwable $e) {
    $debug = isset($_GET['debug']) && $_GET['debug'] === '1';
    $payload = ['error' => 'DB connection failed'];
    if ($debug) {
        $payload['exception'] = get_class($e);
        $payload['message'] = $e->getMessage();
    }
    json_response(500, $payload);
}

?>


