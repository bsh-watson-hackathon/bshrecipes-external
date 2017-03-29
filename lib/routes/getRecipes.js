'use strict';

const getRecipes = function (external) {

  return function (req, res) {

    if(req.query.title){
      external.getRecipes(req.query.title, (err, recipes) =>{
        if(err) {
          return res.status(500).end();
        }
        res.send(recipes);
      })
    }
  };
};

module.exports = getRecipes;
