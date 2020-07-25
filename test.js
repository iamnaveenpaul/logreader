const fs = require('fs');
const filename = "./logs/example.txt";

var Utility = require('./util/utility');
var utilityObj = new Utility();

const getLog = function(fromDate, toDate) {
  const PAGE_SIZE = 3000;
  const skip = 1;

  utilityObj.buildIndex(function(indexFile, totalLines) {
    const fromDateSec = new Date(fromDate).getTime();
    const toDateSec = new Date(toDate).getTime();

    if (toDateSec < fromDateSec) {
      console.log("To date always should be greater than from date");
      return;
    }

    let fromDatePos = utilityObj.searchIndex(indexFile, fromDateSec, 0, totalLines, false);
    let toDatePos = utilityObj.searchIndex(indexFile, toDateSec, 0, totalLines, true);

    if (fromDatePos >= totalLines || fromDatePos == -1) {
      console.log("Log for given date range is not found");

    } else {
      if (toDatePos >= totalLines || toDatePos == -1) {
        toDatePos = totalLines - 1;
      }
      console.log('total entries:', toDatePos - fromDatePos);

      // #################
      if ((fromDatePos + PAGE_SIZE * skip) < totalLines) {
        fromDatePos = fromDatePos + PAGE_SIZE * skip;
      } else {
        fromDatePos = fromDatePos + (totalLines - (PAGE_SIZE * skip));
      }

      if ((fromDatePos + PAGE_SIZE) < totalLines) {
        toDatePos = fromDatePos + PAGE_SIZE;
      } else {
        toDatePos = totalLines - 1;
      }
      // #################

      const len = indexFile[toDatePos].position - indexFile[fromDatePos].position;
      const position = indexFile[fromDatePos].position;
      const buffer = Buffer.alloc(len);
      const offset = 0;
    
      fs.open(filename, 'r', function(err, fd) {
        fs.read(fd, buffer, offset, len, position, function(err, bytes, buffer) {
          console.log(buffer.toString());
        });
      })
    }
  })
}

getLog("18 Jan 2020", "20 Jan 2020");