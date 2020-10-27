var config = require('config');
var mysql = require('mysql');
var emulator = config.get('app.emulator')
var fs = require('fs');
var parser = require('xml2json');
var Path = require('path')
var axios = require('axios')
var query;
var furnidata;
var furnisfloor = new Map();
var furniswall = new Map();
var db = mysql.createConnection({
    host: config.get('mysql.host'),
    user: config.get('mysql.username'),
    password: config.get('mysql.password'),
    database: config.get('mysql.database')
})

function findId(data, idToLookFor, type) {
    if (type == 'floor')
        var array = furnidata.furnidata.roomitemtypes.furnitype;
    else
        var array = furnidata.furnidata.wallitemtypes.furnitype;
    for (var i = 0; i < array.length; i++) {
        if (array[i].id == idToLookFor) {
            return (array[i]);
        }
    }
}
function wait(ms) {
    return new Promise( (resolve) => {setTimeout(resolve, ms)});
}
var dlfurni = 0;
function download (swf) {  
    axios({
        method: "get",
        url: config.get('download.url_furnis') + swf + '.swf',
        responseType: "stream"
    }).then(function (response) {
        response.data.pipe(fs.createWriteStream("./furnis/"+ swf + '.swf'));
        dlfurni++
    })
}


fs.truncate('add-furnidata-floor.xml', 0, function () { })
fs.truncate('add-furnidata-wall.xml', 0, function () { })

fs.readFile(Path.resolve(__dirname, 'furnidata.xml'), 'utf8', function (err, data) {
    if (err) throw err;
    furnidata = JSON.parse(parser.toJson(data))
    db.query(query, function (error, results, fields) {
        if (error) throw error;
        results.forEach(function (result) {
            if (result.type == 's')
                furnisfloor.set(result.id, result.item_name + '|' + result.public_name)
            else if (result.type == 'i')
                furniswall.set(result.id, result.item_name + '|' + result.public_name)
        })
        if (furniswall.size + furnisfloor.size === results.length) {
            furnisfloor.forEach(function (val, key) {
                var valuse = val.split('|')
                var actualfurni = findId(furnidata, key, 'floor')
                if (actualfurni == undefined) {
                    if(config.get('download.enabled')) { download(valuse[0])}
                    fs.appendFileSync('add-furnidata-floor.xml', '<furnitype id=\"' + key + '\" classname=\"' + valuse[0] + '\">\r\n<revision>45508<\/revision>\r\n<defaultdir>0<\/defaultdir>\r\n<xdim>1<\/xdim>\r\n<ydim>1<\/ydim>\r\n<partcolors>...<\/partcolors>\r\n<name>'+ valuse[1] +'<\/name>\r\n<adurl\/>\r\n<offerid>'+ key +'<\/offerid>\r\n<buyout>1<\/buyout>\r\n<rentofferid>-1<\/rentofferid>\r\n<rentbuyout>0<\/rentbuyout>\r\n<bc>0<\/bc>\r\n<customparams\/>\r\n<specialtype>1<\/specialtype>\r\n<canstandon>0<\/canstandon>\r\n<cansiton>0<\/cansiton>\r\n<canlayon>0<\/canlayon>\r\n<\/furnitype>\r\n', function (err) {
                        if (err) {
                            return console.log(err);
                        }
                    })
                }
                wait(5000)
            })
            furniswall.forEach(function (val, key) {
                var valuse = val.split('|')
                var actualfurni = findId(furnidata, key, 'wall')
                if (actualfurni == undefined) {
                    fs.appendFileSync('add-furnidata-wall.xml', '<furnitype id=\"' + key + '\" classname=\"' + valuse[0] + '\">\r\n<revision>45508<\/revision>\r\n<defaultdir>0<\/defaultdir>\r\n<xdim>1<\/xdim>\r\n<ydim>1<\/ydim>\r\n<partcolors>...<\/partcolors>\r\n<name>'+ valuse[1] +'<\/name>\r\n<adurl\/>\r\n<offerid>'+ key +'<\/offerid>\r\n<buyout>1<\/buyout>\r\n<rentofferid>-1<\/rentofferid>\r\n<rentbuyout>0<\/rentbuyout>\r\n<bc>0<\/bc>\r\n<customparams\/>\r\n<specialtype>1<\/specialtype>\r\n<canstandon>0<\/canstandon>\r\n<cansiton>0<\/cansiton>\r\n<canlayon>0<\/canlayon>\r\n<\/furnitype>\r\n', function (err) {
                        if (err) {
                            return console.log(err);
                        }

                    })
                }
            })
            console.log('Finished !');
            //process.exit()
        }
    })
});



db.connect();

switch (emulator) {
    case "plus" || "comet":
        query = "SELECT id,item_name,public_name,type FROM furniture WHERE type IN ('s','i') AND item_name != ''";
        break;
    case "arcturus":
        query = "SELECT id,item_name,public_name,type FROM items_base WHERE type IN ('s','i') AND item_name != ''";
        break;
}


