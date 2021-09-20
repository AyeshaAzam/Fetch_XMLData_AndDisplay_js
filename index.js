const API_URL = "https://www.dn.se/rss/";
let xmlContent = "";
const newsItems = document.getElementById("newsItems");

fetch(API_URL)
  .then(function (response) {
    return response.text();
  })
  .then(function (xmldata) {
    //console.log("New data ", data);
    xmlContent = xmldata;
    let parser = new DOMParser(),
      xmlDoc = parser.parseFromString(xmlContent, "application/xml"); // creates XML dom   // text/xml

    let newsItemsList = xmlDoc
      .getElementsByTagName("channel")[0]
      .querySelectorAll("item");

    let array = Array.prototype.slice.call(newsItemsList);
    let showFirstTenItems = array.slice(0, 10);

    showFirstTenItems.forEach((item, index) => {
      let newsLink = document.createElement("a");
      newsLink.style.textDecoration = "none";
      newsLink.href = item.children[1].innerHTML; // item's second child link
      newsLink.target = "_blank";
      newsLink.innerHTML = item.children[0].innerHTML; //  item's firstChild  is title

      let para = document.createElement("p");
      para.innerHTML = `${index + 1}. \xa0 `;
      para.appendChild(newsLink);

      newsItems.appendChild(para);
    });
  });
