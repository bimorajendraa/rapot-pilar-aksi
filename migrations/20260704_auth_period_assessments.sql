-- ════════════════════════════════════════════════════════════
--  Migration: auth (users table) + assessment periods + score-0 fix
--  Target: MySQL 8 / MariaDB 10.4+ (Aiven)
--
--  Run once, in order, against the target database. Take a backup/export
--  first — step 5 deletes duplicate assessment rows.
--
--  Does NOT touch the scoring formula, weights, band thresholds, or
--  existing member/department data. Does NOT insert plaintext passwords
--  (accounts are created afterwards by `npm run seed:users`).
-- ════════════════════════════════════════════════════════════

-- 1. Tambah kolom periode assessment (existing rows default ke MID_YEAR)
ALTER TABLE assessments
  ADD COLUMN IF NOT EXISTS assessment_period ENUM('MID_YEAR', 'END_YEAR') NOT NULL DEFAULT 'MID_YEAR' AFTER member_id;

-- 2. Tambah kolom updated_at agar edit assessment bisa dilacak
ALTER TABLE assessments
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at;

-- 3. Recalculate total_score untuk data lama yang masih 0 atau NULL
--    (formula sama persis dengan lib/scoring.js — bobot 22/25/23/30, tidak diubah)
UPDATE assessments
SET total_score = ROUND(
  ((COALESCE(p1_1,0) + COALESCE(p1_2,0) + COALESCE(p1_3,0) + COALESCE(p1_4,0)) / 16 * 22) +
  ((COALESCE(p2_1,0) + COALESCE(p2_2,0) + COALESCE(p2_3,0) + COALESCE(p2_4,0)) / 16 * 25) +
  ((COALESCE(p3_1,0) + COALESCE(p3_2,0) + COALESCE(p3_3,0) + COALESCE(p3_4,0)) / 16 * 23) +
  ((COALESCE(p4_1,0) + COALESCE(p4_2,0) + COALESCE(p4_3,0) + COALESCE(p4_4,0)) / 16 * 30),
  2
)
WHERE total_score IS NULL OR total_score = 0;

-- 4. Update band untuk data lama berdasarkan total_score (thresholds tidak diubah)
UPDATE assessments
SET band = CASE
  WHEN total_score >= 95 THEN 'Outstanding'
  WHEN total_score >= 85 THEN 'Excellent'
  WHEN total_score >= 75 THEN 'Very Good'
  WHEN total_score >= 65 THEN 'Good'
  WHEN total_score >= 50 THEN 'Fair'
  ELSE 'Needs Improvement'
END
WHERE total_score IS NOT NULL;

-- 5. Hapus assessment duplikat untuk member + periode yang sama, simpan row terbaru (id terbesar)
--    Harus dijalankan SEBELUM unique constraint di step 6, atau constraint akan gagal dibuat.
DELETE a1 FROM assessments a1
JOIN assessments a2
  ON a1.member_id = a2.member_id
  AND a1.assessment_period = a2.assessment_period
  AND a1.id < a2.id;

-- 6. Tambahkan unique constraint agar tidak ada duplikasi lagi (member_id, assessment_period)
ALTER TABLE assessments
  ADD UNIQUE KEY uq_assessments_member_period (member_id, assessment_period);

-- 7. Sinkronkan members.score dan members.band dari assessment MID_YEAR untuk backward compatibility.
--    Ini hanya field ringkasan lama — dashboard/report yang baru mengambil skor dari `assessments`
--    berdasarkan periode yang dipilih, bukan dari members.score.
UPDATE members m
JOIN assessments a ON a.member_id = m.id
SET m.score = a.total_score,
    m.band = a.band
WHERE a.assessment_period = 'MID_YEAR';

-- 8. Buat tabel users/accounts untuk login (password diisi lewat scripts/seed-users.js, bukan di sini)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('EB', 'DEPT') NOT NULL,
  dept_id INT NULL,
  dept_name VARCHAR(20) NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_users_department
    FOREIGN KEY (dept_id) REFERENCES departments(id)
    ON DELETE SET NULL
);

-- 9. Pastikan satu departemen hanya punya satu akun DEPT.
--    Akun EB memakai dept_id = NULL — MySQL/MariaDB tidak menganggap dua NULL sebagai duplikat
--    pada unique index, jadi ini tidak membatasi jumlah akun EB (disengaja, lihat catatan di README).
CREATE UNIQUE INDEX uq_users_dept_account
ON users (dept_id, role);
