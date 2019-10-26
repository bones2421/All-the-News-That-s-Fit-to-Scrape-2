// Dependencies
var mongojs = require("mongojs");
var cheerio = require("cheerio");
var axios = require("axios");
var express = require("express");
var exphbs = require('express-handlebars');

var app = express();
var PORT = process.env.PORT || 3000;
app.use(express.static("public"));


// Set Handlebars as default templating engine.
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Database configuration
var collections = ["scrapedData"];

// Hook mongojs configuration to db variable
var db = mongojs(process.env.MONGODB_URI || 'scraper', collections);
db.on("error", function (error) {
  console.log("Database Error:", error);
});

// Main route, render index.handlebars
app.get("/", function(req, res) {
  res.render("index");
});

// Make request via axios to grab HTML body from site of your choice
app.get("/scrape", function (req, res) {

  db.scrapedData.drop();

  axios
    .get("https://kotaku.com/")
    .then(function (response) {
      // Load HTML into cheerio and save it to variable
      // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
      var $ = cheerio.load(response.data);

      //empty array to save data we'll scrape
      var results = [];

      // Select each element in HTML body from which you want info.
      // NOTE: Cheerio selectors function similarly to jQuery's selectors,
      //be sure to visit the package's npm page to see how it works
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

       // If this found element had both title and link
       if (title && link && image && summary) {

        
        // Insert data in scrapedData db
        db.scrapedData.insert({
          title: title,
          link: link,
          image: image,
          summary: summary
        }, 
        function(err, inserted) {
          if (err) {
            // Log error if one is encountered during query
            console.log(err);
          }
          else {
            // Otherwise, log inserted data
            console.log("scrapedData");
            console.log(inserted);
          }
        });
      }
      });

      // Log results once looped through each element found with cheerio
      console.log(results);
    });
});


// route 1
app.get("/all", function (req, res) {
  db.scrapedData.find({}, function (err, found) {
    if (err) {
      console.log(err);
    } else {
      res.json(found);
    }
  });
});


//title route 
app.get("/title", function(req, res) {
 
  db.scrapedData.find().sort({ title: 1 }, function(error, found) {
    // Log any errors if server encounters one
    if (error) {
      console.log(error);
    }
    // Otherwise, send result of query to browser
    else {
      res.send(found);
    }
  });
});





app.listen(PORT, function () {
  console.log("App running on port 3000!");
});
