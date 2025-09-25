<?php
require_once __DIR__ . '/config.php';

function get_pdo(): PDO {
	static $pdo = null;
	if ($pdo !== null) {
		return $pdo;
	}

	// Parse DATABASE_URL
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

		try {
			$pdo = new PDO($dsn, $user, $pass, $options);
			return $pdo;
		} catch (Exception $e) {
			// If DATABASE_URL fails, this will throw the exception
			throw $e;
		}
	}

	// This should not happen since DATABASE_URL should always be valid
	throw new Exception('Invalid DATABASE_URL configuration');
}
