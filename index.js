// import File System Module
const fs = require("fs");
const path = require("path");

// import xml2js Module
const { parseString } = require("xml2js");

fs.readFile(path.resolve(__dirname, "workflow.xml"), "utf-8", (err, result) => {
  if (err) {
    console.log(err);
    return;
  }

  // // parsing xml data
  parseString(result, function (err, results) {
    // parsing to json
    let data = JSON.stringify(results);

    // display the json data
    console.log("results", data);
  });
});
