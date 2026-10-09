import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '../db/db.db');

export class DataAccess
{
    static db = new DatabaseSync(dbPath);

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