import pg from 'pg';
const { Pool } = pg
const pool = new Pool({
    user: 'postgres',
    password: '123456',
    host: 'localhost',
    port: 5432,
    database: 'banco_solar',
    idleTimeoutMillis: 1000
});

export default pool;