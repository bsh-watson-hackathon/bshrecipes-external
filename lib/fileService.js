'use strict';

var fs = require('fs');

const fileService = {

    saveFile (htmlString, name) {
        let filename = 'output/' + name;
        fs.writeFile(filename, htmlString, {flag: 'wx'}, function (err) {
            if (err) {
                return console.log(err);
            }

            console.log("The file was saved!");
        });

    }

};

module.exports = fileService;
