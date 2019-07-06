const db = (new require('pg').Pool())
db.connect();
console.log("connection pool created")
module.exports = db;