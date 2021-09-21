var newsItemsArr = [];

const fetchAllRssFeeds = async () => {
  const one = "https://www.dn.se/rss/";
  const two = "https://www.dn.se/rss/kultur/";
  const three = "https://www.dn.se/rss/sport/";
  const four = "https://www.dn.se/rss/debatt/";
  const five = "https://feeds.expressen.se/nyheter";
  const six = "https://feeds.expressen.se/noje";
  const seven = "https://feeds.expressen.se/motor";
  const eight = "https://feeds.expressen.se/gt/ledare";
  const nine = "https://feeds.expressen.se/kvp/kultur";
  const ten = "https://www.di.se/rss";

  return await Promise.all([
    axios.get(one),
    axios.get(two),
    axios.get(three),
    axios.get(four),
    axios.get(five),
    axios.get(six),
    axios.get(seven),
    axios.get(eight),
    axios.get(nine),
    axios.get(ten),
  ]);
};

const getAllNewsFromRssFeeds = (newsFeeds) => {
  newsFeeds.map((newItem) => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(newItem.data, "text/xml");
    let newsItemList = xmlDoc
      .getElementsByTagName("channel")[0]
      .querySelectorAll("item");

    // Sort and push into new Array
    for (var i in newsItemList) {
      if (newsItemList[i].nodeType == 1) {
        // get rid of the whitespace text nodes
        newsItemsArr.push(newsItemList[i]);
      }
    }
  });
};

// for sort:
const sortNewsByPublishDate = () => {
  newsItemsArr.sort(function (a, b) {
    let date1 = new Date(a.getElementsByTagName("pubDate")[0].innerHTML);
    let date2 = new Date(b.getElementsByTagName("pubDate")[0].innerHTML);
    return date1 == date2 ? 0 : date1 < date2 ? 1 : -1;
  });
};

const removeDublicateNews = () => {
  let uniqueNewsList = [];
  newsItemsArr.forEach((newsItem) => {
    var containsInUniqueList = false;
    for (let i = 0; i < uniqueNewsList.length; i++) {
      if (
        uniqueNewsList[i].getElementsByTagName("guid")[0].innerHTML ===
        newsItem.getElementsByTagName("guid")[0].innerHTML
      ) {
        containsInUniqueList = true;
      }
    }

    if (uniqueNewsList.length === 0 || !containsInUniqueList) {
      uniqueNewsList.push(newsItem);
    }
  });
  return uniqueNewsList;
};

const displayNews = (tenLatestNews) => {
  const newsItems = document.getElementById("newsItems");
  tenLatestNews.forEach((item, index) => {
    let newsLink = document.createElement("a");
    newsLink.style.display = "inline";
    // newsLink.style.whiteSpace = "nowrap";

    newsLink.style.textDecoration = "none";
    newsLink.href = item.querySelector("link").innerHTML;
    newsLink.target = "_blank";
    newsLink.innerHTML = item.querySelector("title").innerHTML;

    let para = document.createElement("p");
    para.innerHTML = `${index + 1}. \xa0\xa0 `;
    para.appendChild(newsLink);

    newsItems.appendChild(para);
  });
};

const displayTenLatestNews = async () => {
  try {
    let res = await fetchAllRssFeeds();
    getAllNewsFromRssFeeds(res);
    sortNewsByPublishDate();
    newsItemsArr = removeDublicateNews();
    let tenLatestNews = Array.prototype.slice.call(newsItemsArr).slice(0, 10);
    displayNews(tenLatestNews);
  } catch (error) {
    console.log("Error fetching data", error);
  }
};

displayTenLatestNews();
