require('dotenv').config()
const db = (new require('pg').Pool())
db.connect();
db.query(process.argv[2], (err, ans) => {
    if(err)
        console.log(err);
    else
        console.log(ans.rows)
    process.exit(0)
})