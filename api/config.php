<?php
// Database configuration - use environment variables only

define('DB_HOST', getenv('DB_HOST') ?: 'db');
define('DB_PORT', getenv('DB_PORT') ?: '5432');
define('DB_NAME', getenv('DB_NAME') ?: 'cybercat_ctf');
define('DB_USER', getenv('DB_USER') ?: 'postgres');
define('DB_PASS', getenv('DB_PASS') ?: 'postgres');
define('DATABASE_URL', getenv('DATABASE_URL') ?: 'postgresql://postgres:postgres@db/cybercat_ctf');

// Session settings
ini_set('session.cookie_httponly', 1);
ini_set('session.use_strict_mode', 1);
// If serving over HTTPS, uncomment the following line
// ini_set('session.cookie_secure', 1);
