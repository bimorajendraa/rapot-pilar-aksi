const mysql = require('mysql2/promise');

function getSslConfig() {
    if (process.env.DB_SSL !== 'true') return undefined;
    if (process.env.DB_CA_CERT) {
        return { ca: process.env.DB_CA_CERT.replace(/\\n/g, '\n') };
    }
    return { rejectUnauthorized: true };
}

// Cache the pool on `global` so hot serverless invocations reuse the same
// connections instead of opening a new pool on every request.
function getPool() {
    if (!global._mysqlPool) {
        global._mysqlPool = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
            ssl: getSslConfig(),
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
        });
    }
    return global._mysqlPool;
}

module.exports = { getPool, getSslConfig };
