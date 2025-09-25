<?php
define('DATABASE_URL', getenv('DATABASE_URL') ?: 'postgresql://postgres:postgres@db/cybercat_ctf');

ini_set('session.cookie_httponly', 1);
ini_set('session.use_strict_mode', 1);
ini_set('session.cookie_secure', 1);
