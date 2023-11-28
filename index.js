const fs = require("fs");
const path = require("path");
const xml2js = require("xml2js");

function convertOozieWorkflow(xmlFile) {
  const xmlData = fs.readFileSync(xmlFile, "utf-8");

  // Parse XML data
  xml2js.parseString(xmlData, { explicitArray: false }, (err, result) => {
    if (err) {
      console.error("Error parsing XML:", err);
      return;
    }

    const nodes = [];

    // Process actions
    result["workflow-app"]["action"].forEach((action) => {
      const actionData = {
        data: {
          id: action.$.name,
          label: action.$.name,
          type: determineJobType(action),
        },
        position: {
          x: 0,
          y: 0, // Set the desired position
        },
      };

      // Add job-specific properties
      switch (actionData.data.type) {
        case "hive":
          actionData.data["job-tracker"] = action.hive["job-tracker"];
          actionData.data["name-node"] = action.hive["name-node"];
          actionData.data.script = replaceExpressions(action.hive.script);

          break;
        case "pig":
          actionData.data["job-tracker"] = action.pig["job-tracker"];
          actionData.data["name-node"] = action.pig["name-node"];
          actionData.data.script = replaceExpressions(action.pig.script);

          break;
        case "map-reduce":
          actionData.data["job-tracker"] = action["map-reduce"]["job-tracker"];
          actionData.data["name-node"] = action["map-reduce"]["name-node"];
        
          // Add additional properties for Map-Reduce job
          actionData.data.configuration = getConfiguration(action['map-reduce']['configuration']);

          break;
        default:
          // Handle other job types
          break;
      }

      nodes.push(actionData);
    });

    const jsonResult = { nodes };

    console.log("Conversion complete. JSON:", JSON.stringify(jsonResult));
  });
}

function determineJobType(action) {
  if (action.hasOwnProperty("hive")) {
    return "hive";
  } else if (action.hasOwnProperty("pig")) {
    return "pig";
  } else if (action.hasOwnProperty("map-reduce")) {
    return "map-reduce";
  } else {
    return "unknown";
  }
}

// Example usage
const xmlFile = path.resolve(__dirname, "mapreduce.xml");

function replaceExpressions(script) {
  // Use regular expressions to replace expressions like ${wf:errorCode("wordcount")} with their actual values
  return script.replace(/\${[^}]+}/g, (match) => {
    // You can handle different types of expressions here
    // For simplicity, this example just removes the expression syntax
    return match.replace(/\${|}/g, "");
  });
}

function getScriptContent(configuration, propertyName) {
  const property = configuration.property.find(prop => prop.name === propertyName);
  return property ? property.value : null;
}


function getConfiguration(configuration) {
  const config = {};

  configuration.property.forEach(property => {
      config[property.name] = property.value;
  });

  return config;
}


convertOozieWorkflow(xmlFile);
