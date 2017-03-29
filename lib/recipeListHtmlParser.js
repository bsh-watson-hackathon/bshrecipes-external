'use strict';

const htmlparser = require("htmlparser");
const watson = require('watson-developer-cloud');
const fs = require('fs');

function JsonOut(data) {
  console.log(JSON.stringify(data, null, 2));
}

var document_conversion = watson.document_conversion({
  username: "bd229756-947d-417e-af69-a96af6697248",
  password: "MhXftK6HxctB",
  version:      'v1',
  version_date: '2015-12-15'
});

const recipeListHtmlParser = {
    parseList(Filename, callback) { // callback(err,jsonData)
        if (!callback) {
            throw new Error('Callback is missing');
        }

        document_conversion.convert(
        {
          file: fs.createReadStream(Filename),
          //conversion_target: "answer_units",//'normalized_html',
          // Use a custom configuration.
          conversion_target: 'normalized_html',
          normalized_html: {
            exclude_tags_completely:["head","script"],
            exclude_content:{
              xpaths:[
                "//body/div[@class='site-wrapper wrap--search']/header[@id='main-header']",
                "//body/div[@class='site-wrapper wrap--search']/section[@id='facets-mobile-wrapper']",
                "//body/div[@class='site-wrapper wrap--search']/section[@id='search-top']",
                "//body/div[@class='site-wrapper wrap--search']/section[@id='search-facets']",
                "//body/div[@class='site-wrapper wrap--search']/div[@id='footer']"
              ]
            },
            keep_content:{
              xpaths:["//body/div[@class='site-wrapper wrap--search']/section[@id='search-results']/div[@class='row']/div[@class='container']/div[@id='search-isotope']"
              ]
            }
          },
        },
        function (err, response) {
          let result = []

          if (err) {
            callback(err);
          } else {
            //console.log(response);

            let rawHtml = response
            let handler = new htmlparser.DefaultHandler(function (error, dom) {
            });
            let parser = new htmlparser.Parser(handler);
            parser.parseComplete(rawHtml);

      //JsonOut(handler.dom)
            let RecipeHtmlList = handler.dom[1].children[1].children[0].children
            for (let a = 0, a_len = RecipeHtmlList.length; a < a_len; a++) {
              let Recipe = {}

              let raw = RecipeHtmlList[a].raw
              if((raw.length >= 18) && (raw.substring(0, 18) === 'div class="col-lg-')) {

                let RecipeHtml = RecipeHtmlList[a].children
                for (let  b= 0, b_len = RecipeHtml.length; b < b_len; b++) {
                  if( (RecipeHtml[b].name === 'a') && (RecipeHtml[b].attribs.href) ) {
                    Recipe.link = RecipeHtml[b].attribs.href
                    let RecipeChildrenHtml = RecipeHtml[b].children
                    for (let  c= 0, c_len = RecipeChildrenHtml.length; c < c_len; c++) {
                      if( (RecipeChildrenHtml[c].name === "img") && (RecipeChildrenHtml[c].attribs.src) ){
                          Recipe.img = "http:"+RecipeChildrenHtml[c].attribs.src
                      }
                      if(RecipeChildrenHtml[c].name === "h2") {
                        Recipe.title = RecipeChildrenHtml[c].children[0].raw
                      }
                    }
                  }
                }
              }
              if(Recipe.link) {
                //JsonOut(Recipe)
                result.push(Recipe)
              }
            }
          }
          callback(null, result);
        }
      );

    },


};

module.exports = recipeListHtmlParser;
