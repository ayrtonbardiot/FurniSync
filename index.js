var config = require('config');
var mysql = require('mysql');
var emulator = config.get('app.emulator')
var query;
var db = mysql.createConnection({
    host: config.get('mysql.host'),
    user: config.get('mysql.username'),
    password: config.get('mysql.password'),
    database: config.get('mysql.database')
})

db.connect();

switch (emulator) {
    case "plus":
        query = "SELECT public_name FROM furniture";
        break;
    case "comet":
        query = "SELECT public_name FROM furniture";
        break;
    case "arcturus":
        query = "SELECT public_name FROM items_base";
        break;    
}
db.query(query, function (error, results, fields) {
    if (error) throw error;
    for (var i = 0; i < results.length; i++) {
        console.log(results[i].public_name);
    }
    if (i === results.length) {
        console.log('Finished !')
        process.exit();
    }
})

