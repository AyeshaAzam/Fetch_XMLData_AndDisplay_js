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
    .filter(item => item.nodeType === 1)
    .map(item => {
      return {
        pubDate: item.querySelector("pubDate").innerHTML,
        guid: item.querySelector("guid").innerHTML,
        title: item.querySelector("title").innerHTML,
        link: item.querySelector("link").innerHTML
      };
    }); // Get rid of the whitespace text nodes
};

const getAllNewsFromRssFeeds = (newsFeeds) => {
  return newsFeeds.flatMap(getAllNewsFromOneRssFeed);
};

// for sort:
const sortNewsByPublishDate = (a, b) => {
  let date1 = new Date(a.pubDate);
  let date2 = new Date(b.pubDate);
  return date1 == date2 ? 0 : date1 < date2 ? 1 : -1;
};

const getAllNewsWithUniqueGuid = (items) => {
  let uniqueNewsList = [];
  items.forEach((newsItem) => {
    var containsInUniqueList = false;
    for (let i = 0; i < uniqueNewsList.length; i++) {
      if (
        uniqueNewsList[i].guid === newsItem.guid
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
    newsLink.href = item.link;
    newsLink.target = "_blank";
    newsLink.innerHTML = item.title;

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
