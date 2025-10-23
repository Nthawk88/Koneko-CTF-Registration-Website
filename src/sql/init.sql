CREATE TABLE IF NOT EXISTS users (
	id SERIAL PRIMARY KEY,
	full_name VARCHAR(100) NOT NULL,
	email VARCHAR(255) NOT NULL UNIQUE,
	username VARCHAR(50) NOT NULL UNIQUE,
	password_hash VARCHAR(255) NOT NULL,
	role VARCHAR(20) NOT NULL DEFAULT 'user',
	avatar_url VARCHAR(500) DEFAULT NULL,
	bio TEXT DEFAULT NULL,
	location VARCHAR(100) DEFAULT NULL,
	updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
	created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS competitions (
	id SERIAL PRIMARY KEY,
	name VARCHAR(255) NOT NULL,
	description TEXT,
	start_date TIMESTAMP NOT NULL,
	end_date TIMESTAMP NOT NULL,
	registration_deadline TIMESTAMP NOT NULL,
	max_participants INTEGER DEFAULT NULL,
	current_participants INTEGER DEFAULT 0,
	difficulty_level VARCHAR(50) DEFAULT 'beginner',
	prize_pool VARCHAR(255) DEFAULT NULL,
	status VARCHAR(20) NOT NULL DEFAULT 'upcoming',
	category VARCHAR(100) NOT NULL,
	rules TEXT,
	contact_person VARCHAR(255),
	banner_url VARCHAR(500) DEFAULT NULL,
	created_at TIMESTAMP NOT NULL DEFAULT NOW(),
	CHECK (status IN ('upcoming', 'registration_open', 'registration_closed', 'ongoing', 'completed', 'cancelled')),
	CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
	CHECK (end_date > start_date),
	CHECK (registration_deadline <= start_date)
);

CREATE TABLE IF NOT EXISTS competition_registrations (
	id SERIAL PRIMARY KEY,
	user_id INTEGER NOT NULL,
	competition_id INTEGER NOT NULL,
	team_name VARCHAR(255) DEFAULT NULL,
	registration_status VARCHAR(20) NOT NULL DEFAULT 'pending',
	payment_status VARCHAR(20) DEFAULT 'unpaid',
	registration_notes TEXT DEFAULT NULL,
	score INTEGER DEFAULT 0,
	rank INTEGER DEFAULT NULL,
	registered_at TIMESTAMP NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
	FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
	FOREIGN KEY (competition_id) REFERENCES competitions(id) ON DELETE CASCADE,
	UNIQUE(user_id, competition_id),
	CHECK (registration_status IN ('pending', 'approved', 'rejected', 'cancelled', 'waitlisted')),
	CHECK (payment_status IN ('unpaid', 'pending', 'paid', 'refunded'))
);
