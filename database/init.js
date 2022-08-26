const mongoose = require('mongoose');

const uri = process.env.MONGO_URI;
 
module.exports = function()
{
  return new Promise(function(resolve, reject){
    mongoose.connect(uri)
    .then(function(){
      resolve();
    })
    .catch(function(){
      reject();
    })
  })
}
