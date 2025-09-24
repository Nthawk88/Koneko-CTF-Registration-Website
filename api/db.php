<?php
require_once __DIR__ . '/config.php';

function get_pdo(): PDO {
	static $pdo = null;
	if ($pdo !== null) {
		return $pdo;
	}

	// Prefer DATABASE_URL if provided (e.g., from Neon)
	if (defined('DATABASE_URL') && DATABASE_URL) {
		$parsed = parse_url(DATABASE_URL);
		if ($parsed !== false) {
			$scheme = $parsed['scheme'] ?? 'postgresql';
			$host = $parsed['host'] ?? '127.0.0.1';
			$port = $parsed['port'] ?? 5432;
			$user = $parsed['user'] ?? '';
			$pass = $parsed['pass'] ?? '';
			$db   = ltrim($parsed['path'] ?? '', '/');
			$dsn  = 'pgsql:host=' . $host . ';port=' . $port . ';dbname=' . $db . ';sslmode=require';
			$options = [
				PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
				PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
				PDO::ATTR_EMULATE_PREPARES => false,
			];
			$pdo = new PDO($dsn, $user, $pass, $options);
			return $pdo;
		}
	}

	$dsn = 'pgsql:host=' . DB_HOST . ';port=' . DB_PORT . ';dbname=' . DB_NAME;
	$options = [
		PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
		PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
		PDO::ATTR_EMULATE_PREPARES => false,
	];

	$pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
	return $pdo;
}
