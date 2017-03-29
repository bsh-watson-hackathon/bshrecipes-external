'use strict';

const request = require('request');
const async = require('async');
const fileService = require('./fileService');
const recipeListHtmlParser = require('./recipeListHtmlParser');

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
            let filename = "recipesList.html";
            fileService.saveFile(body, filename, ( )=> {
              // TODO Here use document conversion to parse recipes list. Use fileService.saveFile to save recipeFile
              recipeListHtmlParser.parseList("output/"+filename, function (err,data) {
                if(err){
                  console.error(err)
                }else{
                  console.log(JSON.stringify(data, null, 2));
                }
              });
            });
        });

        /** MOCKED RESPONSE **/
        let response = [];
        async.parallel({
            metadata: (callback) => {
                fileService.readFile('examples/recipeMetadata.json', (resp) => {
                    callback(null, resp);
                });
            },
            details: (callback) => {
                fileService.readFile('examples/recipeDetails.json', (resp) => {
                    callback(null, resp);
                })
            }
        }, (err, results) => {
            response.push(results);
            callback(null, response);
        });
    },


};

module.exports = external;
