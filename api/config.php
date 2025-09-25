<?php
// Database configuration - using DATABASE_URL from environment

define('DATABASE_URL', getenv('DATABASE_URL') ?: 'postgresql://postgres:postgres@db/cybercat_ctf');

// Session settings
ini_set('session.cookie_httponly', 1);
ini_set('session.use_strict_mode', 1);
// If serving over HTTPS, uncomment the following line
// ini_set('session.cookie_secure', 1);
