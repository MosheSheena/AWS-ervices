var AWS = require("aws-sdk");

AWS.config.update({
  region: "us-east-1",
  endpoint: "http://localhost:8000"
});

var dynamoDB = new AWS.DynamoDB();

var params = {
    TableName : "Transactions",
    Transactions : [
        {
            id : "1",
            providerName : "Amit",
            buyerName: "Moshe",
            service: ServiceObj
        }
    ]
};

dynamoDB.createTable(params, function(err, data) {
    if (err) {
        console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
    }
});