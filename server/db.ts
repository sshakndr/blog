import {Pool} from 'pg'
const pool = new Pool({
    user: "postgres",
    password: "Sasha1006",
    host: "localhost",
    port: 5432,
    database: "node_postgres"
});

export {pool}
