<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/utils.php';

ensure_http_method('GET');

$user = getCurrentUser();
$pdo = get_pdo();
ensure_required_tables($pdo);

try {
    $stmt = $pdo->prepare('SELECT
            c.id,
            c.name,
            c.description,
            c.start_date,
            c.end_date,
            c.registration_deadline,
            c.max_participants,
            c.difficulty_level,
            c.prize_pool,
            c.category,
            c.rules,
            c.contact_person,
            c.banner_url,
            c.banner_updated_at,
            c.created_at,
            (
                SELECT COUNT(*)
                FROM competition_registrations cr
                WHERE cr.competition_id = c.id
                    AND cr.registration_status IN (\'pending\', \'approved\', \'waitlisted\')
            ) AS current_participants,
            (
                SELECT COUNT(*) > 0
                FROM competition_registrations cr
                WHERE cr.competition_id = c.id
                    AND cr.user_id = :user_id
                    AND cr.registration_status IN (\'pending\', \'approved\', \'waitlisted\')
            ) AS is_registered,
            (CASE WHEN c.banner_data IS NOT NULL THEN 1 ELSE 0 END) AS has_banner
        FROM competitions c
        ORDER BY c.created_at DESC');

    $stmt->execute([
        ':user_id' => $user['id'] ?? 0,
    ]);

    $competitions = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];

    foreach ($competitions as &$competition) {
        $competition['status'] = compute_competition_status(
            $competition['start_date'],
            $competition['end_date'],
            $competition['registration_deadline']
        );
        $competition['is_registered'] = (bool) $competition['is_registered'];
        $competition['current_participants'] = (int) $competition['current_participants'];
        $competition['bannerUrl'] = ($competition['has_banner'] ?? 0) ? 'api/competition_banner.php?id=' . $competition['id'] : null;
        if (!$competition['bannerUrl'] && !empty($competition['banner_url'])) {
            $competition['bannerUrl'] = $competition['banner_url'];
        }
        $versionSource = $competition['banner_updated_at'] ?? $competition['created_at'] ?? null;
        $competition['bannerVersion'] = $versionSource ? strtotime($versionSource) : null;
        unset($competition['banner_updated_at']);
        unset($competition['has_banner']);
    }

    json_response(200, [
        'competitions' => $competitions,
    ]);
} catch (Throwable $e) {
    error_log('competitions error: ' . $e->getMessage());
    json_response(500, ['error' => 'Server error']);
}
