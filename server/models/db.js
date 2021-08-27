const MongoClient = require('mongodb').MongoClient;
const {
  dbUrl,
  database,
} = require("../config")

const client = new MongoClient(dbUrl);
let db = {};

//  Connect to the database function
function _connect(cb) {
  //  Configure link information
  MongoClient.connect(dbUrl, function (err, client) {
    if (err) throw err;
    cb(client);
    console.log("Connect successfully to server");
  })
}

//  Initialize the connection to the database - connect to the database and create an index to improve query efficiency
function _init(cname) {
  _connect(function (client) {
    const col = client.db(database).collection(cname);
    col.createIndex({
      "username": "text"
    }, function (err) {
      if (err) throw err;
      console.log('usernameIndex created successfully');
      client.close();
    });
  });
}

// Data initialization
_init("user");

//  increase
db.insert = function (colName, data, cb) {
  _connect(function (client) {
    const col = client.db(database).collection(colName);
    col.insertOne(data, function (err, result) {
      //  Throw data or errors and hand them to external processing
      cb(err, result);
      //  Close the connection
      client.close();
    })
  })
}

//  delete
db.delete = function (colName, match, cb) {
  _connect(function (client) {
    const col = client.db(database).collection(colName);
    col.deleteMany(match, function (err, result) {
      //  Throw data or errors and hand them to external processing
      cb(err, result);
      //  Close the connection
      client.close();
    })
  })
}

//  update
db.update = function(colName, match, updated, cb){
  _connect(function(client){
    const col = client.db(database).collection(colName);
    col.update(match,{$set:updated},function(err, result){
      //  Throw data or errors and hand them to external processing
      cb(err, result);
      //  Close the connection
      client.close();
    })
  })
}

//  check
db.find = function (colName, match, cb){
  _connect(function(client){
    const col = client.db(database).collection(colName);
      col.find(match).toArray(function (err, result) {
        // Call the error or data for external processing
        cb(err, result);
        // close the connection
        client.close();
      })    
  })
}

module.exports = db;