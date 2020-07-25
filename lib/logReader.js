var fs = require('fs');
const url = require('url');
var filename = "./logs/example.txt";

const PAGE_SIZE = 50;

var Utility = require('../lib/utility');
var utilityObj = new Utility(PAGE_SIZE);

function Log(){}

Log.prototype.search = function(timeMin,timeMax,skip,callback){
  
  if(!skip || skip == -1){
    skip = 0;
  }

  if(new Date(timeMin) == "Invalid Date" || new Date(timeMax) == "Invalid Date") {
    callback(true,"Invalid date format");
    return;
  }

  utilityObj.buildIndex(filename,function(indexFile, totalLines) {

    const timeMinEpoch = utilityObj.getDateInEpoch(timeMin);
    const timeMaxEpoch = utilityObj.getDateInEpoch(timeMax,true);

    if (timeMaxEpoch < timeMinEpoch) {
      callback(true,"To date always should be greater than from date") ;
    };

    let fromDatePosition = utilityObj.searchIndex(indexFile, timeMinEpoch, 0, totalLines, false);
    let toDatePosition = utilityObj.searchIndex(indexFile, timeMaxEpoch, 0, totalLines, true);

    fromDatePosition = utilityObj.setFromPosition(fromDatePosition,skip,totalLines);
    toDatePosition = utilityObj.setToPosition(fromDatePosition,toDatePosition,totalLines);

    if (fromDatePosition >= totalLines || fromDatePosition == -1) {
      callback(true,"Logs for given date range not found");
      return;
    } else {
      if (toDatePosition >= totalLines || toDatePosition == -1) {
        toDatePosition = totalLines - 1;
      }
    }

    if(!indexFile[toDatePosition] || !indexFile[fromDatePosition]){
      callback(true,"Logs for given date range not found");
      return;
    };

    let len = indexFile[toDatePosition].position - indexFile[fromDatePosition].position;
    let position = indexFile[fromDatePosition].position;
    const buffer = Buffer.alloc(len);
    let offset = 0;

    fs.open(filename, 'r', function(err, fd) {
      try {
        fs.read(fd, buffer, offset, len, position, function(err, bytes, buffer) {
          if(err){
            callback(true,"Something went wrong");
            return;
          }
          callback(false,utilityObj.buildResponse(buffer,fromDatePosition,toDatePosition,totalLines))
        });
      } catch(error){
        callback(true,"Something went wrong");
      }
    })
  })
}

module.exports = Log;