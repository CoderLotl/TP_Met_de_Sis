import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// DB_PATH permite apuntar a otra base (los tests usan una copia temporal).
const dbPath = process.env.DB_PATH || path.join(__dirname, '../db/db.db');

export class DataAccess
{
    static db = new DatabaseSync(dbPath);

    static
    {
        this.db.exec(`CREATE TABLE IF NOT EXISTS "login_history" (
            "id"        INTEGER NOT NULL,
            "userId"    INTEGER NOT NULL,
            "clientIp"  TEXT,
            "userAgent" TEXT,
            "lang"      TEXT,
            "createdAt" TEXT NOT NULL,
            PRIMARY KEY("id" AUTOINCREMENT)
        )`);

        this.db.exec(`CREATE TABLE IF NOT EXISTS "action_logs" (
            "id"        INTEGER NOT NULL,
            "userId"    INTEGER NOT NULL,
            "endpoint"  TEXT NOT NULL,
            "method"    TEXT NOT NULL,
            "clientIp"  TEXT,
            "userAgent" TEXT,
            "lang"      TEXT,
            "createdAt" TEXT NOT NULL,
            PRIMARY KEY("id" AUTOINCREMENT)
        )`);

        let userColumns = this.db.prepare('PRAGMA table_info(users)').all();
        let hasDeletedColumn = userColumns.some(column => column.name === 'deleted');

        if(!hasDeletedColumn)
        {
            this.db.exec('ALTER TABLE users ADD COLUMN deleted INTEGER NOT NULL DEFAULT 0');
        }
    }

    static select(table, columns = [], whereColumns = [], whereValues = [])
    {
        let query = `SELECT ${columns.length > 0 ? columns.join(', ') : '*'} FROM ${table}`;

        if(whereColumns.length > 0 && whereValues.length > 0)
        {
            let whereClauses = whereColumns.map((col, index) => `${col} = ?`);
            query += ` WHERE ${whereClauses.join(' AND ')}`;
        }

        return this.db.prepare(query).all(...whereValues);
    }

    static insert(table, columns = [], values = [])
    {
        let query = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${values.map(() => '?').join(', ')})`;
        return this.db.prepare(query).run(...values);
    }

    static update(table, setColumns = [], setValues = [], whereColumns = [], whereValues = [])
    {
        let setClauses = setColumns.map((col, index) => `${col} = ?`);
        let query = `UPDATE ${table} SET ${setClauses.join(', ')}`;

        if(whereColumns.length > 0 && whereValues.length > 0)
        {
            let whereClauses = whereColumns.map((col, index) => `${col} = ?`);
            query += ` WHERE ${whereClauses.join(' AND ')}`;
        }

        return this.db.prepare(query).run(...setValues, ...whereValues);
    }

    static delete(table, whereColumns = [], whereValues = [])
    {
        let query = `DELETE FROM ${table}`;

        if(whereColumns.length > 0 && whereValues.length > 0)
        {
            let whereClauses = whereColumns.map((col, index) => `${col} = ?`);
            query += ` WHERE ${whereClauses.join(' AND ')}`;
        }

        return this.db.prepare(query).run(...whereValues);
    }
}