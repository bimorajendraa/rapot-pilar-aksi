// Creates/updates the login accounts (1 EB super admin + 1 per department).
// Safe to re-run: upserts by `username`, never touches members/departments/assessments.
//
// Requires DEFAULT_EB_PASSWORD and DEFAULT_DEPT_PASSWORD in the environment —
// refuses to run with a silent/hardcoded default password.

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const { getSslConfig } = require('../lib/db');

const ACCOUNTS = [
    { username: 'eb', role: 'EB', deptName: null },
    { username: 'hrd', role: 'DEPT', deptName: 'HRD' },
    { username: 'ia', role: 'DEPT', deptName: 'IA' },
    { username: 'swf', role: 'DEPT', deptName: 'SWF' },
    { username: 'rta', role: 'DEPT', deptName: 'RTA' },
    { username: 'im', role: 'DEPT', deptName: 'IM' },
    { username: 'ea', role: 'DEPT', deptName: 'EA' },
    { username: 'es', role: 'DEPT', deptName: 'ES' },
    { username: 'socdev', role: 'DEPT', deptName: 'SOCDEV' },
    { username: 'manage', role: 'DEPT', deptName: 'MANAGE' },
];

async function seedUsers() {
    const { DEFAULT_EB_PASSWORD, DEFAULT_DEPT_PASSWORD } = process.env;
    if (!DEFAULT_EB_PASSWORD || !DEFAULT_DEPT_PASSWORD) {
        console.error('❌ DEFAULT_EB_PASSWORD dan DEFAULT_DEPT_PASSWORD wajib diisi di .env sebelum menjalankan seed ini.');
        process.exitCode = 1;
        return;
    }

    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
            ssl: getSslConfig(),
        });

        console.log('🚀 Terkoneksi ke database!');

        const [depRows] = await connection.query('SELECT id, name FROM departments');
        const deptIdByName = Object.fromEntries(depRows.map(d => [d.name, d.id]));

        for (const acc of ACCOUNTS) {
            const plainPassword = acc.role === 'EB' ? DEFAULT_EB_PASSWORD : DEFAULT_DEPT_PASSWORD;
            const passwordHash = await bcrypt.hash(plainPassword, 10);
            const deptId = acc.deptName ? deptIdByName[acc.deptName] ?? null : null;

            if (acc.deptName && deptId === null) {
                console.warn(`⚠️  Departemen '${acc.deptName}' tidak ditemukan di tabel departments, dept_id akan NULL untuk akun '${acc.username}'.`);
            }

            await connection.execute(
                `INSERT INTO users (username, password_hash, role, dept_id, dept_name, is_active)
                 VALUES (?, ?, ?, ?, ?, 1)
                 ON DUPLICATE KEY UPDATE
                   password_hash = VALUES(password_hash),
                   role = VALUES(role),
                   dept_id = VALUES(dept_id),
                   dept_name = VALUES(dept_name),
                   is_active = 1`,
                [acc.username, passwordHash, acc.role, deptId, acc.deptName]
            );
            console.log(`✅ Akun '${acc.username}' (${acc.role}${acc.deptName ? ' · ' + acc.deptName : ''}) siap.`);
        }

        console.log(`🏁 Selesai. ${ACCOUNTS.length} akun berhasil dibuat/diperbarui.`);
    } catch (err) {
        console.error('❌ Terjadi kesalahan:', err.message);
        process.exitCode = 1;
    } finally {
        if (connection) await connection.end();
    }
}

seedUsers();
