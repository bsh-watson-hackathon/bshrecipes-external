'use strict';

const request = require('request');
const uuid = require('uuid/v1');
const async = require('async');
const fileService = require('./fileService');
const recipeListHtmlParser = require('./recipeListHtmlParser');

function getExtUuid(){
  return "ext_" + Math.random().toString()+Date.now().toString();
}

function Out(text,filename) {
  if(filename){
    fileService.saveFile(text, filename+".out")
  }else {
    console.log(text);
  }
}
function JsonOut(data,filename) {
  let text=JSON.stringify(data, null, 2)
  Out(text,filename)
}

function getRecipeId(data) {
  let result = new RegExp('.*\/(.+)\/')[Symbol.match](data);
  if( (result) && (result.length >=2 ) ) {
    return result[1];
  }

	return null;
};
const external = {

    getRecipes(title, resultCallback) {
        if (!resultCallback) {
            throw new Error('Callback is missing');
        }

        let options = {
            method: 'GET',
            url: "http://www.jamieoliver.com/search/?s=" + title,
        };


        request(options, (err, response, body) => {
            let filename = "recipesList.html";
            fileService.saveFile(body, filename, ( )=> {
              console.log("List file saved!!!");
              // TODO Here use document conversion to parse recipes list. Use fileService.saveFile to save recipeFile
              recipeListHtmlParser.parseList("/home/vcap/app/output/"+filename, function(err, recipeListObj) {
              // recipeListHtmlParser.parseList("output/"+filename, function(err, recipeListObj) {
                if(err){
                  console.error(err);
                  if(err === "can not parse") {
                    resultCallback(null, []);
                  }else{
                    resultCallback(err, null);
                  }
                }else{
                  let resultOfSearch=[];

                  async.each(recipeListObj, function(dataObj, MyEachCallbackSoko) {
                    let Uuid = getExtUuid();
                    let recipeMedadata = {
                      lastModified:0,
                      vibs:[ ],
                      categories:[],
                      countries:[],
                      productTypes:[],
                      previewImage:dataObj.imgUrl,
                      identifier:Uuid,
                      type:"Recipe",
                      keywords:[],
                      relatedKeywords:[],
                      contentType:"Recipe",
                      detailImage:null,
                      data:[
                        {
                          title:dataObj.title,
                          description:null,
                          locale:"en-US",
                          url:null
                        }
                      ],
                      totalTime:0,
                      rating:0,
                      kcal:0,
                      difficulty:0
                    };

                    let recipeDetails = {
                      identifier:Uuid,
                      summary:null,
                      tip:null,
                      fat:0,
                      kcal:null,
                      protein:0,
                      servings:"",
                      steps:[],
                      ingredients_lists:null,
                      locale:"en-US",
                      carbohydrate:0,
                      totalTime:0,
                      preparationTime:0,
                      cookingTime:0,
                      rating:0,
                      difficulty:0,
                      utensils:[],
                      comments:null
                    };

                    let elem = dataObj
                    let filename = Uuid + ".html";
                    let options = {
                        method: 'GET',
                        url: dataObj.url,
                    };
                    request(options, (err, response, body) => {
                      fileService.saveFile(body, filename, ( )=> {
                        console.log(filename);

                        recipeListHtmlParser.parseRecipe("output/"+filename, getRecipeId(dataObj.url) , (err, parsedRecipeResult) => {
                          console.log(filename+" parseRecipe done\n")
                          if(!err){
                            if(parsedRecipeResult){
                              recipeDetails.ingredients_lists = parsedRecipeResult;
                              resultOfSearch.push({metadata:recipeMedadata, details:recipeDetails});

                              recipeListHtmlParser.parseSteps("output/"+filename, getRecipeId(dataObj.url) , (err, parsedStepResult) => {
                                if(!err){
                                  recipeDetails.steps = parsedStepResult;
                                  console.log(filename+" parseSteps done\n")
                                  resultOfSearch.push({metadata:recipeMedadata, details:recipeDetails});
                                }else{
                                  console.error(err);
                                }
                                MyEachCallbackSoko();
                              });
                            }else{ // no Data case
                              MyEachCallbackSoko();
                            }
                          }else{// error case
                            MyEachCallbackSoko();
                          }
                        });
                      });
                    });
                  },
                  function(err) {
                      // if any of the file processing produced an error, err would equal that error
                      if( err ) {
                        // One of the iterations produced an error.
                        // All processing will now stop.
                        console.log('A file failed to process');
                      } else {
                        console.log('All files have been processed successfully');
                        JsonOut(resultOfSearch,"output/result.json");
                        resultCallback(null, resultOfSearch);
                      }
                  });
                }//else
              });
            });
        });

        /** MOCKED RESPONSE
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
            var id = uuid();
            results.metadata.identifier = 'ext_' + id;
            results.details.identifier = 'ext_' + id;
            response.push(results);
            callback(null, response);
        });
        **/
    },


};

module.exports = external;
