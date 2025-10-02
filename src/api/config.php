<?php
define('DATABASE_URL', getenv('DATABASE_URL') ?: 'postgresql://neondb_owner:npg_qkfmW5NpYP7X@ep-tiny-voice-a1a49fzy-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&options=endpoint%3Dep-tiny-voice-a1a49fzy');

ini_set('session.cookie_httponly', 1);
ini_set('session.use_strict_mode', 1);
ini_set('session.cookie_secure', 1);
