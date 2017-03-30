'use strict';
const htmlparser = require("htmlparser");
const watson = require('watson-developer-cloud');
const fs = require('fs');
const fileService = require('./fileService');



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

function nextIngredTagSearchStep(data, callback) {
  let result=[]
  for(let a=0; a < data.length; a++) {
    if( (data[a].type === "tag")  ) {
      if(data[a].name === "div") {
        if(0  < data[a].children.length) {
          result = result.concat( data[a].children );
        }
      } else if(data[a].name === "ul") {
        if(data[a].attribs.class === "ingred-list")  {
          callback(data[a].children);
          return null;
        }
      }
    }
  }
  return result;
}

function findIngredlist(children, callback) {
  let ToDolist = [children];
  let Loop = true;

  for(let counter = 0; Loop && (counter < ToDolist.length);counter++) {
    let tmp = [];
    if(ToDolist[counter]) {
      tmp = nextIngredTagSearchStep( ToDolist[counter], (data)=>{
        Out('found');
        let ListIngredients=[];
        let currentlist = {name:null,list:[]};
        for(let a = 0; (a < data.length);a++) {
          if((data[a].type == "tag") && (data[a].name == "li")) {
              if((data[a].attribs) && (data[a].attribs.class === "ingred-heading") ){
                ListIngredients.push(currentlist)
                currentlist = {name:normIngred(data[a].children[0].raw),list:[]};
              }else{
                currentlist.list.push( normIngred(data[a].children[0].raw) );
              }
          }
        }
        ListIngredients.push(currentlist);
        callback(null, ListIngredients);
      });
    }
    if(tmp) {
      if(tmp.length > 0) {
        ToDolist.push(tmp);
      }
    } else {
      Loop = false;
    }
  }
  callback('not found', null);
}

function normIngred(data) {
  let tmp = / +/g[Symbol.replace](data,' ');
  tmp = /\n /g[Symbol.replace](tmp,'');
  tmp = / ,/g[Symbol.replace](tmp,',');
  return tmp;
}

var document_conversion = watson.document_conversion({
  username: "bd229756-947d-417e-af69-a96af6697248",
  password: "MhXftK6HxctB",
  version:      'v1',
  version_date: '2015-12-15'
});

const recipeListHtmlParser = {
  parseList(filename, callback) { // callback(err,jsonData)
    if (!callback) {
        throw new Error('Callback is missing');
    }

    document_conversion.convert(
    {
      file: fs.createReadStream(filename),
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
          //???
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
                Recipe.url = RecipeHtml[b].attribs.href
                let RecipeChildrenHtml = RecipeHtml[b].children
                for (let  c= 0, c_len = RecipeChildrenHtml.length; c < c_len; c++) {
                  if( (RecipeChildrenHtml[c].name === "img") && (RecipeChildrenHtml[c].attribs.src) ){
                      Recipe.imgUrl = "http:"+RecipeChildrenHtml[c].attribs.src
                  }
                  if(RecipeChildrenHtml[c].name === "h2") {
                    Recipe.title = RecipeChildrenHtml[c].children[0].raw
                  }
                }
              }
            }
          }
          if(Recipe.url) {
            //JsonOut(Recipe)
            result.push(Recipe)
          }
        }
      }
      callback(null, result);
    });

  },
  parseRecipe(filename, RecipeName, callback) {
    if (!callback) {
        throw new Error('Callback is missing');
    }
    document_conversion.convert(
      {
        file: fs.createReadStream(filename),
        //conversion_target: "answer_units",//'normalized_html',
        // Use a custom configuration.
        conversion_target: 'normalized_html',
        normalized_html: {
          exclude_tags_completely:["head","script"],
          exclude_content:{
            xpaths:[
            "//body/div[@class='site-wrapper wrap--"+RecipeName+"']/section[@id='recipe-single']/div[@class='container recipe-container']/div[@class='row recipe-header']/div[@class='col-lg-9 col-sd-12 col-md-12 col-sm-12']/div[@class='row']/div[@class='recipe-left-col col-sm-5 col-md-4 col-sd-4 col-lg-4']/div[@class='recipe-ingredients']/div[@class='recipe-method-nav']"
            ]
          },
          keep_content:{
              xpaths:[
              "//body/div[@class='site-wrapper wrap--"+RecipeName+"']/section[@id='recipe-single']/div[@class='container recipe-container']/div[@class='row recipe-header']/div[@class='col-lg-9 col-sd-12 col-md-12 col-sm-12']/div[@class='row']/div[@class='recipe-left-col col-sm-5 col-md-4 col-sd-4 col-lg-4']/div[@class='recipe-ingredients']"
              ]
          }
        }
      },
      function (err, response) {
        if (err) {
          callback(err);
        } else {
          let rawHtml = response;

          let handler = new htmlparser.DefaultHandler(function (error, dom) {
              //???
          });

          let parser = new htmlparser.Parser(handler);
          parser.parseComplete(rawHtml);
          let Ingredients_Recipe = null

console.log("\n"+filename);
          findIngredlist(handler.dom[1].children[1].children[0].children,callback);
console.log("done loop\n")
        }

      }
    );
  },

  parseSteps(filename, RecipeName, callback) {
    document_conversion.convert({
      file: fs.createReadStream(filename),
      //conversion_target: "answer_units",//'normalized_html',
      // Use a custom configuration.
      conversion_target: 'normalized_html',
      normalized_html: {
        exclude_tags_completely:["head","script"],
        exclude_content:
        {
            xpaths:[
            "//body/div[@class='site-wrapper wrap--"+RecipeName+"']/section[@id='recipe-single']/div[@class='container recipe-container']/div[@class='row recipe-header']/div[@class='col-lg-9 col-sd-12 col-md-12 col-sm-12']/div[@class='row']/div[@class='instructions-col col-sm-7 col-md-8 col-sd-8 col-lg-8']/div[@class='recipe-instructions']/div[@class='instructions-wrapper']/div[@class='method-p']/div[@class='fnf-food-fight milk']"
            ]
        },
        keep_content:
        {
            xpaths:[
            "//body/div[@class='site-wrapper wrap--"+RecipeName+"']/section[@id='recipe-single']/div[@class='container recipe-container']/div[@class='row recipe-header']/div[@class='col-lg-9 col-sd-12 col-md-12 col-sm-12']/div[@class='row']/div[@class='instructions-col col-sm-7 col-md-8 col-sd-8 col-lg-8']/div[@class='recipe-instructions']/div[@class='instructions-wrapper']/div[@class='method-p']"
            ]
        }
      },
    },
    function (err, response) {
      let result = []

      if (err) {
        callback(err);
      } else {
        let rawHtml = response
        let handler = new htmlparser.DefaultHandler(function (error, dom) {
        });
        let parser = new htmlparser.Parser(handler);
        parser.parseComplete(rawHtml);

        let Steps_Recipe;
        Steps_Recipe = handler.dom[1].children[1].children[0].children[3].children[1].children;//[1].children;//.children[0];

        let ListSteps = [];
        Steps_Recipe.forEach(function(el){
            if (el.children) {
                el.children.forEach(function(el1) {
                    if(el1.type === 'text') {
                        ListSteps.push(el1.raw);
                    }
                })
            }
        });

        JsonOut(ListSteps);
        callback(null,ListSteps);
      }
    });
  }
};

module.exports = recipeListHtmlParser;
