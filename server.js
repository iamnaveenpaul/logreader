var http = require('http');
const url = require('url');

var LogReader = require('./lib/logReader');
var logReaderObj = new LogReader();

//API supports pagination
var app = function (req, res) {
    const queryObject = url.parse(req.url,true).query;
    const pathname = url.parse(req.url,true).pathname;

    var timeMin = queryObject.timeMin || new Date('1 Jan 2020');
    var timeMax = queryObject.timeMax || new Date('1 Jan 2020');
    var skip = queryObject.pageno?parseInt(queryObject.pageno):0;


    res.setHeader("Content-Type", "application/json");
    console.log(pathname)

    if (pathname == '/logs') { 
        logReaderObj
            .search(timeMin,timeMax,skip,function(err,results){
                res.write(JSON.stringify({Success:!err,data: results}));  
                res.end();
            });
    } else {
        res.write(JSON.stringify({ message: "Resource not found."}));  
        res.end();
    };
}

// process.on('uncaughtException', function (err) {
//     console.error(err);
//     console.log("Node NOT Exiting...");
// });

http.createServer(app).listen(7000);