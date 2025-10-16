<?php
require_once __DIR__ . '/utils.php';

// Allow only POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
	json_response(405, ['error' => 'Method Not Allowed']);
}

logoutUser();

json_response(200, ['message' => 'Logged out']);


