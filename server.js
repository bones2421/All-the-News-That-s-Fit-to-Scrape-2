// Dependencies
var mongojs = require("mongojs");
var cheerio = require("cheerio");
var axios = require("axios");
var express = require("express");
var exphbs = require('express-handlebars');

var app = express();
var PORT = process.env.PORT || 3000
app.use(express.static("public"));


// Set Handlebars as the default templating engine.
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Database configuration
var collections = ["scrapedData"];

// Hook mongojs configuration to the db variable
var db = mongojs(process.env.MONGODB_URI || 'scraper', collections);
db.on("error", function (error) {
  console.log("Database Error:", error);
});

// Main route, render index.handlebars
app.get("/", function(req, res) {
  res.render("index");
})

// Make a request via axios to grab the HTML body from the site of your choice
app.get("/scrape", function (req, res) {

  axios
    .get("https://kotaku.com/")
    .then(function (response) {
      // Load the HTML into cheerio and save it to a variable
      // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
      var $ = cheerio.load(response.data);

      // An empty array to save the data that we'll scrape
      var results = [];

      // Select each element in the HTML body from which you want information.
      // NOTE: Cheerio selectors function similarly to jQuery's selectors,
      // but be sure to visit the package's npm page to see how it works
      $("article").each(function (i, element) {
        var title = $(element)
          .find("h1")
          .children("a")
          .text();
        var link = $(element)
          .find("h1")
          .children("a")
          .attr("href");
        var image = $(element)
          .find("source")
          .attr("data-srcset");
        var summary = $(element)
          .find("p").text();

       // If this found element had both a title and a link
       if (title && link && image && summary) {
        // Insert the data in the scrapedData db
        db.scrapedData.insert({
          title: title,
          link: link,
          image: image,
          summary: summary
        },
        function(err, inserted) {
          if (err) {
            // Log the error if one is encountered during the query
            console.log(err);
          }
          else {
            // Otherwise, log the inserted data
            console.log(inserted);
          }
        });
      }
      });

      // Log the results once you've looped through each of the elements found with cheerio
      console.log(results);
    })
});


// route 1
app.get("/all", function (req, res) {
  db.scrapedData.find({}, function (err, found) {
    if (err) {
      console.log(err)
    } else {
      res.json(found)
    }
  });
});


//title route 
app.get("/title", function(req, res) {
 
  db.scrapedData.find().sort({ title: 1 }, function(error, found) {
    // Log any errors if the server encounters one
    if (error) {
      console.log(error);
    }
    // Otherwise, send the result of this query to the browser
    else {
      res.send(found);
    }
  });
});





app.listen(PORT, function () {
  console.log("App running on port 3000!");
});
