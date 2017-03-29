'use strict';

const http = require('http'),
    processenv = require('processenv');

const external = require('./lib/external'),
    getApp = require('./lib/getApp');

// var connectionString = null;
var port = 8888;

// if (process.env.VCAP_SERVICES) {
//     var env = JSON.parse(process.env.VCAP_SERVICES);
//     connectionString = env['compose-for-mongodb'][0].credentials.uri;
//     port = process.env.PORT || 3000;
// } else {
//     connectionString = processenv('MONGO_URL') || 'mongodb://admin:secret@127.0.0.1:27017/admin',
//         port = processenv('PORT') || 3000;
// }

const app = getApp(external);

const server = http.createServer(app);

server.listen(port, () => {
    console.log('Server listening');
});
