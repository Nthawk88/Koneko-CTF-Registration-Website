<?php

$databaseUrl = getenv('DATABASE_URL');
if ($databaseUrl === false || $databaseUrl === '') {
	throw new RuntimeException('DATABASE_URL environment variable is required.');
}

define('DATABASE_URL', $databaseUrl);

ini_set('session.cookie_httponly', '1');
ini_set('session.use_only_cookies', '1');
ini_set('session.use_strict_mode', '1');

$isSecure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || (isset($_SERVER['SERVER_PORT']) && $_SERVER['SERVER_PORT'] === '443');
ini_set('session.cookie_secure', $isSecure ? '1' : '0');
ini_set('session.cookie_samesite', 'Lax');
