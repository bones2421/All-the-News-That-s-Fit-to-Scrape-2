function displayResults(scrapedData) {

  $("tbody").empty();
  scrapedData.forEach(function (article) {

    var tr = $("<tr>").append(
      $("<td>").text(article.title),
      $("<td>").text(article.link),
      $("<td>").text(article.image),
      $("<td>").text(article.summary)
    )
    $("tbody").append(tr);
  });
}





$.getJSON("/all", function (data) {
  displayResults(data);
})