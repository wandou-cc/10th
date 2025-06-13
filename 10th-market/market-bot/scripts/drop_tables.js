const mysql = require('mysql2/promise');
require('dotenv').config();

async function dropAllTables() {
    let connection;
    try {
        // 创建数据库连接
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_DATABASE || 'market_bot'
        });

        console.log('Connected to database successfully');

        // 获取所有表名
        const [tables] = await connection.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = '${process.env.DB_DATABASE || 'market_bot'}'
        `);

        if (tables.length === 0) {
            console.log('No tables found in the database');
            return;
        }

        // 禁用外键检查
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');

        // 删除所有表
        for (const table of tables) {
            const tableName = table.TABLE_NAME;
            console.log(`Dropping table: ${tableName}`);
            await connection.query(`DROP TABLE IF EXISTS ${tableName}`);
        }

        // 启用外键检查
        await connection.query('SET FOREIGN_KEY_CHECKS = 1');

        console.log('All tables have been dropped successfully');

    } catch (error) {
        console.error('Error dropping tables:', error);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
            console.log('Database connection closed');
        }
    }
}

// 执行删除操作
dropAllTables().catch(console.error); 