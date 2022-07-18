import mysql from "mysql";
const poolConnectionDB = mysql.createPool({
  connectionLimit: 10,
  host: "91.236.136.231",
  user: "u170175_admin",
  password: "admin323",
  database: "u170175_db",
});

export default (sqlString: string, sqlOptions: any, sqlCb: any) => {
  poolConnectionDB.getConnection((err, connection) => {
    if (err) console.log(err);
    connection.query(sqlString, sqlOptions, (errDB, response) => {
      if (errDB) console.log(errDB);
      sqlCb(response, errDB);
      connection.release();
    });
  });
};
