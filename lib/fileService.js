'use strict';

var mkdirp = require('mkdirp');
var fs = require('fs');
var getDirName = require('path').dirname;
var Box = require('nodejs-box');

const fileService = {

    saveFile (htmlString, name, callback) {
        let filename = '/home/vcap/app/output/' + name;
        mkdirp(getDirName(filename), (err) => {
            fs.writeFile(filename, htmlString, (err) => {
                if (err) {
                    return console.log(err);
                }
                if(callback)
                  callback()
            });
        })

    },

    readFile (name, callback) {
        var obj;
        fs.readFile(name, 'utf8', (err, data) => {
            if (err) throw err;
            obj = JSON.parse(data);
            callback(obj);
        });
    }

};

module.exports = fileService;
