import { XMLParser } from 'fast-xml-parser';
import { decode } from 'html-entities';
import fetch from 'node-fetch';
import db from '../db/index.js';


const generateTags = (categories) => {
  if (!categories) return '';

  if (typeof categories === 'string') {
    return `#${categories.replace(/\s/g, '_')}`;
  }

  if (Array.isArray(categories)) {
    return categories.map(category => generateTags(category)).join(', ');
  }
};

const URLS_NAMES = {
  komkur: 'Коммерческий курьер',
  vb: 'Вечерний Бобруйск',
  bk: 'Бобруйский курьер'
}

const URLS = {
  komkur: 'https://komkur.info/news?format=feed&amp;type=rss',
  vb: 'https://bobruisk.ru/news/rss/news',
  bk: 'https://babruysk.by/feed/',
  // gorispolkom: 'http://bobruisk.by/service/feeds/news.xml',
};

export default async (bot) => {
  const promises = [];
  const { data: { news: { lastUpdate } } } = db();
  
  Object.entries(URLS).forEach(([media, url], idx) => {
    console.log('Building news', idx);
    promises.push(
      fetch(url)
        .then((response) => response.text())
        .then(xmlData => {
          console.log('Got news', idx);
          const parser = new XMLParser();
          const data = parser.parse(xmlData);
          return data?.rss?.channel.item;
        })
        .catch(e => {
          console.log(e);

          return [];
        })
    );
  });

  Promise.all(promises).then(async (data) => {
    const news = [];
    data.forEach((newsArr, idx) => {
      newsArr.forEach(newsItem => {
        news.push(
          {
            source: Object.keys(URLS)[idx],
            data: {
              title: newsItem.title,
              date: new Date(newsItem.pubDate).toString(),
              description: decode(newsItem?.description?.replace(/((<[^>]*>)|(\n))?/gm, '')),
              category: generateTags(newsItem.category),
              link: newsItem.link,
            },
          }
        )
      })
    });

    const filteredNews = news
      .filter(n => new Date(n.data.date) > new Date(lastUpdate))
      .sort((a, b) => new Date(a.data.date) > new Date(b.data.date) ? 1 : -1);

    filteredNews.slice(filteredNews.length > 10 ? -10 : 0).forEach((news, idx) => {
      const message = `<b>${news.data.title}</b>

${news.data.description}

<a href="${news.data.link}?utm_source=tgbn">Подробнее</a> на <code>${URLS_NAMES[news.source] || ''}</code>

${news.data.category}`;

      setTimeout(() => {
        bot.sendMessage(process.env.CHAT_ID, message, {
          parse_mode: 'HTML',
        });
      }, (idx + 1) * 1000);
    })

    db().data.news.lastUpdate = new Date().toString();
    try {
      await db().write();
    } catch(e) {
      console.error(e);
    }
  });
};
