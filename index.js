// Dependancies

const server = require('./lib/api/server');

//Declare the app
let app = {};

//Initialization
app.init = function(){
    //Start the server
    server.init();
}

//Execute the app
app.init();

//Export module
module.exports = app;
