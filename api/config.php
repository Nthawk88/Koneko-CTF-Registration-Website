<?php
// Database configuration - fill these with your MySQL credentials
// It's recommended to create a dedicated MySQL user with limited privileges.

define('DB_HOST', getenv('DB_HOST') ?: 'ep-tiny-voice-a1a49fzy-pooler.ap-southeast-1.aws.neon.tech');
define('DB_PORT', getenv('DB_PORT') ?: '5432');
define('DB_NAME', getenv('DB_NAME') ?: 'neondb');
define('DB_USER', getenv('DB_USER') ?: 'neondb_owner');
define('DB_PASS', getenv('DB_PASS') ?: 'npg_qkfmW5NpYP7X');
define('DATABASE_URL', getenv('DATABASE_URL') ?: 'postgresql://neondb_owner:npg_qkfmW5NpYP7X@ep-tiny-voice-a1a49fzy-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require');

// Session settings
ini_set('session.cookie_httponly', 1);
ini_set('session.use_strict_mode', 1);
// If serving over HTTPS, uncomment the following line
// ini_set('session.cookie_secure', 1);
