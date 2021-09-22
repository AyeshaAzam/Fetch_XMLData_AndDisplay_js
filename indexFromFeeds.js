const fetchOneRssFeed = (url) => {
  return fetch(url).then(response => response.text());
}

const fetchAllRssFeeds = async () => {
  const feedList = await fetch("./feed.json").then(response => response.json());

  return Promise.all(feedList.feeds.map(fetchOneRssFeed));
};

const getAllNewsFromOneRssFeed = (newsFeed) => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(newsFeed, "text/xml");
  return Array.from(xmlDoc
    .getElementsByTagName("channel")[0]
    .querySelectorAll("item"))
    .filter(item => item.nodeType === 1); // Get rid of the whitespace text nodes
};

const getAllNewsFromRssFeeds = (newsFeeds) => {
  return newsFeeds.flatMap(getAllNewsFromOneRssFeed);
};

// for sort:
const sortNewsByPublishDate = (a, b) => {
  let date1 = new Date(a.querySelector("pubDate").innerHTML);
  let date2 = new Date(b.querySelector("pubDate").innerHTML);
  return date1 == date2 ? 0 : date1 < date2 ? 1 : -1;
};

const getAllNewsWithUniqueGuid = (items) => {
  let uniqueNewsList = [];
  items.forEach((newsItem) => {
    var containsInUniqueList = false;
    for (let i = 0; i < uniqueNewsList.length; i++) {
      if (
        uniqueNewsList[i].querySelector("guid").innerHTML ===
        newsItem.querySelector("guid").innerHTML
      ) {
        containsInUniqueList = true;
        break;
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
    const news = getAllNewsFromRssFeeds(res);
    news.sort(sortNewsByPublishDate);
    const uniqueItems = getAllNewsWithUniqueGuid(news);
    let tenLatestNews = uniqueItems.slice(0, 10);
    displayNews(tenLatestNews);
  } catch (error) {
    console.log("Error fetching data", error);
  }
};

displayTenLatestNews();
