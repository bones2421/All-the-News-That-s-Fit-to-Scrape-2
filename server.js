// Dependencies
var express = require("express");
var mongojs = require("mongojs");
var exphbs = require('express-handlebars');
// Require axios and cheerio. This makes the scraping possible
var axios = require("axios");
var cheerio = require("cheerio");

// Initialize Express
var app = express();
app.use(express.static("public"));

// Set Handlebars as the default templating engine.
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Database configuration
var databaseUrl = "scraper";
var collections = ["scrapedData"];

// Hook mongojs configuration to the db variable
var db = mongojs(databaseUrl, collections);
db.on("error", function(error) {
  console.log("Database Error:", error);
});

// Main route, render index.handlebars
app.get("/", function(req, res) {
  res.render("index");
})



// Retrieve data from the db
app.get("/all", function(req, res) {
  // Find all results from the scrapedData collection in the db
  db.scrapedData.find({}, function(error, found) {
    // Throw any errors to the console
    if (error) {
      console.log(error);
    }
    // If there are no errors, send the data to the browser as json
    else {
      res.json(found);
    }
  });
});

// Scrape data from one site and place it into the mongodb db
app.get("/scrape", function(req, res) {
  // Make a request via axios for the news section of `ycombinator`
  axios.get("https://kotaku.com/").then(function(response) {
    // Load the html body from axios into cheerio
    var $ = cheerio.load(response.data);
    // For each element with a "title" class
    $("article").each(function(i, element) {
      // Save the text and href of each link enclosed in the current element
      var title = $(element).find("h1").children("a").text();
      var link = $(element).find("h1").children("a").attr("href");
      var image = $(element).find("source").attr("data-srcset");
      var summary = $(element).find("p").text();

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
  });

  // Send a "Scrape Complete" message to the browser
  res.send("Scrape Complete");
});


///sort by headline
app.get("/title", function(req, res) {
  // Query: In our database, go to the animals collection, then "find" everything,
  // but this time, sort it by name (1 means ascending order)
  db.scrapedData.find().sort({ title: 1 }, function(error, found) {
    // Log any errors if the server encounters one
    if (error) {
      console.log(error);
    }
    // Otherwise, send the result of this query to the browser
    else {
      res.json(found);
    }
  });
});











// Listen on port 3000
app.listen(3000, function() {
  console.log("App running on port 3000!");
});
