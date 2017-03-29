'use strict';

const request = require('request');
const fileService = require('./fileService');

const external = {

    getRecipes(title, callback) {
        if (!callback) {
            throw new Error('Callback is missing');
        }

        let options = {
            method: 'GET',
            url: "http://www.jamieoliver.com/search/?s=" + title,
        };

        request(options, (err, response, body) => {
            fileService.saveFile(body, "recipesList.html");
            // TODO Here use document conversion to parse recipes list. Use fileService.saveFile to save recipeFile
        });

        /** MOCKED RESPONSE **/
        let response = [];
        let obj = {
            metadata: {},
            details: {}
        };
        fileService.readFile('examples/recipeMetadata.json', (resp) => {
            obj.metadata = resp;
            fileService.readFile('examples/recipeDetails.json', (resp) => {
                obj.details = resp;
                response.push(obj);
                callback(null, response);
            })
        });
    },


};

module.exports = external;
