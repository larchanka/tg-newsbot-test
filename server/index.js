import 'dotenv/config';

import TelegramBot from 'node-telegram-bot-api';

import weatherParser, { weather } from './parsers/weather.js';
import newsParser from './parsers/news.js';
import { init as dbInit } from './db/index.js';

const bot = new TelegramBot(process.env.TG_BOT, {polling: true});
const timeouts = {
    weather: null,
    news: null,
};

dbInit();


// bot.on('message', (msg) => {
//     bot.sendMessage(msg.chat.id, 'Alive');
//     weather(bot, msg);
// });

// bot.onText(/\/weather/, (msg) => {
//     weatherParser(bot, msg);
// });

const getWeather = () => {
    console.log('Getting weather', new Date().toISOString());
    weather(bot);
    timeouts.weather = setTimeout(getWeather, 24 * 60 * 60 * 1000);
}

const getNews = () => {
    console.log('Getting news', new Date().toISOString());
    newsParser(bot);
    timeouts.news = setTimeout(getNews, 10 * 60 * 1000);
}

const Timers = () => {
    console.log('Setting timeout');
    const now = new Date();
    const morning = new Date();
    morning.setHours(6);
    morning.setMinutes(0);
    morning.setSeconds(0);

    if (now > morning) {
        morning.setDate(now.getDate() + 1);
    }

    let weatherTimeout = morning - now;
    
    console.log('\nNext weather', new Date(now.getTime() + weatherTimeout).toISOString());
    timeouts.weather = setTimeout(getWeather, weatherTimeout);
    getWeather();

    timeouts.news = setTimeout(getNews, 1000);

};

setTimeout(Timers, 1000);