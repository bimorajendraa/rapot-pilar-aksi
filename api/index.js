require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { getPool } = require('../lib/db');
const { signToken, requireAuth, getUserScope, canAccessMember } = require('../lib/auth');
const { computeScore, computeBand, isValidRatings } = require('../lib/scoring');

const app = express();
app.use(cors());
app.use(express.json());

const PERIODS = ['MID_YEAR', 'END_YEAR'];
const DEFAULT_PERIOD = 'MID_YEAR';

function normalizePeriod(period) {
    return PERIODS.includes(period) ? period : DEFAULT_PERIOD;
}

// ── GET: Health Check (public) ─────────────────────────
app.get('/api/health', (req, res) => {
    res.json({ message: 'Rapot Pilar Aksi API is running' });
});

// ── POST: Login (public) ───────────────────────────────
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body || {};
    if (!username || !password) {
        return res.status(400).json({ error: 'Username dan password wajib diisi.' });
    }

    try {
        const pool = getPool();
        const [rows] = await pool.query(
            'SELECT * FROM users WHERE username = ? AND is_active = 1 LIMIT 1',
            [username]
        );
        const user = rows[0];
        if (!user) {
            return res.status(401).json({ error: 'Username atau password salah.' });
        }

        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) {
            return res.status(401).json({ error: 'Username atau password salah.' });
        }

        const token = signToken(user);
        res.json({
            token,
            user: {
                username: user.username,
                role: user.role,
                dept_id: user.dept_id,
                dept_name: user.dept_name,
            },
        });
    } catch (err) {
        console.error('API ERROR:', err);
        res.status(500).json({ error: err.message });
    }
});

// ── Everything below requires a valid token ────────────
app.use(requireAuth);

// ── GET: Info akun yang sedang login ───────────────────
app.get('/api/auth/me', (req, res) => {
    res.json({ user: req.user });
});

// ── GET: Ambil Anggota (scoped by role, score/band per periode) ──
app.get('/api/members', async (req, res) => {
    try {
        const period = normalizePeriod(req.query.period);
        const { isAdmin, deptName } = getUserScope(req.user);
        const pool = getPool();

        const params = [period];
        let where = '';
        if (!isAdmin) {
            where = 'WHERE m.dept_name = ?';
            params.push(deptName);
        }

        const [rows] = await pool.query(
            `SELECT m.id, m.name, m.nrp, m.dept_name, m.pos, m.batch,
                    a.total_score AS score, a.band AS band
             FROM members m
             LEFT JOIN assessments a ON a.member_id = m.id AND a.assessment_period = ?
             ${where}
             ORDER BY m.name ASC`,
            params
        );
        res.json(rows);
    } catch (err) {
        console.error('API ERROR:', err);
        res.status(500).json({ error: err.message });
    }
});

// ── GET: Ambil Semua Departemen ────────────────────────
app.get('/api/departments', async (req, res) => {
    try {
        const pool = getPool();
        const [rows] = await pool.query('SELECT * FROM departments');
        res.json(rows);
    } catch (err) {
        console.error('API ERROR:', err);
        res.status(500).json({ error: err.message });
    }
});

// ── GET: Analytics (scoped, per periode) ───────────────
app.get('/api/analytics', async (req, res) => {
    try {
        const period = normalizePeriod(req.query.period);
        const { isAdmin, deptName } = getUserScope(req.user);
        const pool = getPool();

        const params = [period];
        let where = '';
        if (!isAdmin) {
            where = 'WHERE d.name = ?';
            params.push(deptName);
        }

        const [deptRows] = await pool.query(
            `SELECT d.name, d.fullname, d.color,
                    AVG(a.total_score) AS avg_score,
                    COUNT(a.id) AS assessed_count
             FROM departments d
             LEFT JOIN members m ON m.dept_name = d.name
             LEFT JOIN assessments a ON a.member_id = m.id AND a.assessment_period = ?
             ${where}
             GROUP BY d.id, d.name, d.fullname, d.color`,
            params
        );

        const bandParams = [period];
        let bandWhere = '';
        if (!isAdmin) {
            bandWhere = 'AND m.dept_name = ?';
            bandParams.push(deptName);
        }
        const [bandRows] = await pool.query(
            `SELECT a.band, COUNT(*) AS count
             FROM assessments a
             JOIN members m ON m.id = a.member_id
             WHERE a.assessment_period = ? ${bandWhere}
             GROUP BY a.band`,
            bandParams
        );

        res.json({ period, departments: deptRows, bandDistribution: bandRows });
    } catch (err) {
        console.error('API ERROR:', err);
        res.status(500).json({ error: err.message });
    }
});

// ── GET: Ambil Assessment Member untuk periode tertentu ──
app.get('/api/assessments/:memberId', async (req, res) => {
    try {
        const period = normalizePeriod(req.query.period);
        const pool = getPool();

        const [memberRows] = await pool.query('SELECT dept_name FROM members WHERE id = ?', [req.params.memberId]);
        const member = memberRows[0];
        if (!member) return res.status(404).json({ error: 'Anggota tidak ditemukan.' });

        if (!canAccessMember(req.user, member.dept_name)) {
            return res.status(403).json({ error: 'Tidak punya akses ke anggota ini.' });
        }

        const [rows] = await pool.query(
            'SELECT * FROM assessments WHERE member_id = ? AND assessment_period = ? LIMIT 1',
            [req.params.memberId, period]
        );
        res.json(rows[0] || null);
    } catch (err) {
        console.error('API ERROR:', err);
        res.status(500).json({ error: err.message });
    }
});

// ── POST: Simpan Nilai Raport (Assessment) ─────────────
app.post('/api/assessments', async (req, res) => {
    const { memberId, period, ratings, notes } = req.body || {};

    if (!memberId) {
        return res.status(400).json({ error: 'memberId wajib diisi.' });
    }
    if (!PERIODS.includes(period)) {
        return res.status(400).json({ error: `period wajib salah satu dari: ${PERIODS.join(', ')}` });
    }
    if (!isValidRatings(ratings)) {
        return res.status(400).json({ error: 'Data tidak lengkap. Pastikan 16 indikator sudah diisi dengan nilai 1-4.' });
    }

    try {
        const pool = getPool();

        const [memberRows] = await pool.query('SELECT dept_name FROM members WHERE id = ?', [memberId]);
        const member = memberRows[0];
        if (!member) return res.status(404).json({ error: 'Anggota tidak ditemukan.' });

        if (!canAccessMember(req.user, member.dept_name)) {
            return res.status(403).json({ error: 'Tidak punya akses untuk menilai anggota ini.' });
        }

        // Backend selalu menghitung ulang — nilai/band dari frontend tidak dipercaya.
        const score = computeScore(ratings);
        const band = computeBand(score);

        await pool.query(
            `INSERT INTO assessments
            (member_id, assessment_period, p1_1, p1_2, p1_3, p1_4, p2_1, p2_2, p2_3, p2_4, p3_1, p3_2, p3_3, p3_4, p4_1, p4_2, p4_3, p4_4, total_score, band, appreciation, suggestions, personal_message)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                p1_1 = VALUES(p1_1), p1_2 = VALUES(p1_2), p1_3 = VALUES(p1_3), p1_4 = VALUES(p1_4),
                p2_1 = VALUES(p2_1), p2_2 = VALUES(p2_2), p2_3 = VALUES(p2_3), p2_4 = VALUES(p2_4),
                p3_1 = VALUES(p3_1), p3_2 = VALUES(p3_2), p3_3 = VALUES(p3_3), p3_4 = VALUES(p3_4),
                p4_1 = VALUES(p4_1), p4_2 = VALUES(p4_2), p4_3 = VALUES(p4_3), p4_4 = VALUES(p4_4),
                total_score = VALUES(total_score), band = VALUES(band),
                appreciation = VALUES(appreciation), suggestions = VALUES(suggestions), personal_message = VALUES(personal_message)`,
            [
                memberId, period,
                ...ratings,
                score, band,
                notes?.appreciation || '',
                notes?.suggestions || '',
                notes?.message || ''
            ]
        );

        // Backward compatibility: keep members.score/band pointing at the
        // most recently saved assessment. Not the source of truth for
        // period-scoped views (those read from `assessments` directly).
        await pool.query(
            'UPDATE members SET score = ?, band = ? WHERE id = ?',
            [score, band, memberId]
        );

        const [savedRows] = await pool.query(
            'SELECT * FROM assessments WHERE member_id = ? AND assessment_period = ? LIMIT 1',
            [memberId, period]
        );

        res.json({ message: 'Raport dan detail penilaian berhasil disimpan!', assessment: savedRows[0] });
    } catch (err) {
        console.error('API ERROR:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = app;
