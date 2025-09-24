-- Create database (optional)
CREATE DATABASE IF NOT EXISTS cybercat_ctf CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE cybercat_ctf;

CREATE TABLE IF NOT EXISTS users (
	id SERIAL PRIMARY KEY,
	full_name VARCHAR(100) NOT NULL,
	email VARCHAR(255) NOT NULL UNIQUE,
	username VARCHAR(50) NOT NULL UNIQUE,
	password_hash VARCHAR(255) NOT NULL,
	created_at TIMESTAMP NOT NULL DEFAULT NOW()
);


