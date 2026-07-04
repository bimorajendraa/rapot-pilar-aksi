require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { getPool } = require('../lib/db');

const app = express();
app.use(cors());
app.use(express.json());

// ── GET: Health Check ──────────────────────────────────
app.get('/api/health', (req, res) => {
    res.json({ message: 'Rapot Pilar Aksi API is running' });
});

// ── GET: Ambil Semua Anggota ───────────────────────────
app.get('/api/members', async (req, res) => {
    try {
        const pool = getPool();
        const [rows] = await pool.query('SELECT * FROM members ORDER BY name ASC');
        res.json(rows);
    } catch (err) {
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
        res.status(500).json({ error: err.message });
    }
});

// ── GET: Ambil Assessment Member ───────────────────────
app.get('/api/assessments/:memberId', async (req, res) => {
    try {
        const pool = getPool();
        const [rows] = await pool.query('SELECT * FROM assessments WHERE member_id = ? ORDER BY id DESC LIMIT 1', [req.params.memberId]);
        if (rows.length === 0) return res.json(null);
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── POST: Simpan Nilai Raport (Assessment) ─────────────
app.post('/api/assessments', async (req, res) => {
    const { memberId, score, band, ratings, notes } = req.body;

    if (!memberId || score === undefined || !ratings || ratings.length !== 16) {
        return res.status(400).json({ error: 'Data tidak lengkap. Pastikan 16 indikator sudah diisi.' });
    }

    try {
        const pool = getPool();

        // 1. Update nilai di tabel members (untuk rangkuman dashboard)
        await pool.query(
            'UPDATE members SET score = ?, band = ? WHERE id = ?',
            [score, band, memberId]
        );

        // 2. Simpan rincian nilai & catatan ke tabel assessments
        await pool.query(
            `INSERT INTO assessments
            (member_id, p1_1, p1_2, p1_3, p1_4, p2_1, p2_2, p2_3, p2_4, p3_1, p3_2, p3_3, p3_4, p4_1, p4_2, p4_3, p4_4, total_score, band, appreciation, suggestions, personal_message)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                memberId,
                ...ratings,
                score, band,
                notes?.appreciation || '',
                notes?.suggestions || '',
                notes?.message || ''
            ]
        );

        res.json({ message: 'Raport dan detail penilaian berhasil disimpan!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = app;
