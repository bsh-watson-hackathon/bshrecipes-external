'use strict';

var mkdirp = require('mkdirp');
var fs = require('fs');
var getDirName = require('path').dirname;

const fileService = {

    saveFile (htmlString, name) {
        let filename = 'output/' + name;
        mkdirp(getDirName(filename), (err) => {
            fs.writeFile(filename, htmlString, {flag: 'wx'}, (err) => {
                if (err) {
                    return console.log(err);
                }

                console.log("The file was saved!");
            });
        })

    }

};

module.exports = fileService;
