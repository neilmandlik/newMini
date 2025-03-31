const mysql=require('mysql2')
require('dotenv').config()
const con=mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: process.env.DB_PASSWORD,
        database: 'mini'
});

module.exports=con
