'use strict';

const http = require('http'),
    processenv = require('processenv');

const external = require('./lib/external'),
    getApp = require('./lib/getApp');

var connectionString = null;
var port = null;

if (process.env.VCAP_SERVICES) {
    port = process.env.PORT || 3000;
} else {
    port = processenv('PORT') || 3000;
}

const app = getApp(external);

const server = http.createServer(app);

server.listen(port, () => {
    console.log('Server listening');
});
