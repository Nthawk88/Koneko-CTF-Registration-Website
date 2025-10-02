<?php
require_once __DIR__ . '/config.php';

function get_pdo(): PDO {
	static $pdo = null;
	if ($pdo !== null) {
		return $pdo;
	}

	$parsed = parse_url(DATABASE_URL);
	if ($parsed !== false) {
		$scheme = $parsed['scheme'] ?? 'postgresql';
		$host = $parsed['host'] ?? '127.0.0.1';
		$port = $parsed['port'] ?? 5432;
		$user = $parsed['user'] ?? '';
		$pass = $parsed['pass'] ?? '';
		$db   = ltrim($parsed['path'] ?? '', '/');

		// Parse query parameters for Neon endpoint
		$query = [];
		if (isset($parsed['query'])) {
			parse_str($parsed['query'], $query);
		}
		
		$dsn = 'pgsql:host=' . $host . ';port=' . $port . ';dbname=' . $db . ';sslmode=require';
		
		// Add endpoint ID for Neon if present
		if (isset($query['options']) && strpos($query['options'], 'endpoint=') !== false) {
			$dsn .= ';options=' . $query['options'];
		}
		$options = [
			PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
			PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
			PDO::ATTR_EMULATE_PREPARES => false,
		];

		try {
			$pdo = new PDO($dsn, $user, $pass, $options);
			return $pdo;
		} catch (Exception $e) {
			throw $e;
		}
	}

	throw new Exception('Invalid DATABASE_URL configuration');
}
