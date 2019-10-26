// function displayResults(scrapedData) {
//   // First, empty the table
//   $("#tbody").empty();
//   // Then, for each entry of json...
//   scrapedData.forEach(function(articles) {
//     // Append each property to table
//     var tr = $("<tr>").append(
//       $("<td>").text(articles.title),
//       $("<td>").text(articles.link),
//       $("<td>").text(articles.image),
//       $("<td>").text(articles.summary)
//     );

//     $("#tbody").append(tr);
//   });
// }

$.getJSON("/all", function(data){
  console.log(data);
  for (var i = 0; i < data.length; i++){
    $("#results").append( "<tr><td>" + data[i].title + "</td>" +
                            "<td><a href='" + data[i].link + "'>" + data[i].link + "</a></td>" +
                            "<td><img src='" + data[i].image +  " '/></td>" + 
                            "<td>" + data[i].summary + "</td></tr>");
  }

});


function setActive(selector) {
  $("th").removeClass("active");
  $(selector).addClass("active");
}


// $.getJSON("/all", function(data) {
//   console.log("im para for displayresults", data)
//   // Call our function to generate a table body
//   displayResults(data);
// });


// $("#headline-sort").on("click", function() {
//   // Set new column as currently-sorted (active)
//   setActive("#title");

//   // Do an api call to the back end for json with all animals sorted by name
//   $.getJSON("/title", function(data) {
//     // Call our function to generate a table body
//     displayResults(data);
//   });
// });




$("#headline-sort").on("click", function(){
  $("#tbody").empty();
  setActive("#title");

  $.getJSON("/title", function(data){
    console.log(data);
    for (var i = 0; i < data.length; i ++) {
      $("#tbody").append("<tr><td>" + data[i].title + "</td>" +
      "<td><a href='" + data[i].link + "'>" + data[i].link + "</a></td>" +
      "<td><img src='" + data[i].image +  " '/></td>" +
      "<td>" + data[i].summary + "</td></tr>");
    }
  })

});

// $("#more-articles").on('click', function(){
//  console.log("ive been clicked")
//  $("#tbody").empty();
//   $.get('/scrape')
//   .then(function(response){
//     location.reload()
//   })
// })


