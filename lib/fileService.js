'use strict';

var mkdirp = require('mkdirp');
var fs = require('fs');
var getDirName = require('path').dirname;

const fileService = {

    saveFile (htmlString, name) {
        let filename = 'output/' + name;
        mkdirp(getDirName(filename), (err) => {
            fs.writeFile(filename, htmlString, (err) => {
                if (err) {
                    return console.log(err);
                }

                console.log("The file was saved!");
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
