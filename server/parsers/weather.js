import { XMLParser } from 'fast-xml-parser';
import request from 'request';
import fetch from 'node-fetch';
import { weatherUrl } from '../../config/weather.js';

const icons = {
    '01d': '☀️', '01n': '☀️',
    '02d': '⛅️', '02n': '⛅️',
    '03d': '☁️', '03n': '☁️',
    '04d': '🌩', '04n': '🌩',
    '09d': '🌧', '09n': '🌧',
    '10d': '🌦', '10n': '🌦',
    '11d': '⛈', '11n': '⛈',
    '13d': '❄️', '13n': '❄️',
    '50d': '💨', '50n': '💨',
};
  
const monthes = [
    'Января', 'Февраля', 'Марта', 'Апреля', 'Мая', 'Июня',
    'Июля', 'Августа', 'Сентября', 'Октября', 'Ноября', 'Декабря',
];

export default (bot) => {

    request(weatherUrl, { xml: true }, (err, _res, body) => {
        if (err) { return console.log(err); }
        
        const parser = new XMLParser();
        const { rss: { channel: { item: { description } } } } = parser.parse(body);
        bot.sendMessage(process.env.CHAT_ID, description);
    });
};

export const weather = (bot) => {

    fetch(`https://api.openweathermap.org/data/2.5/forecast/daily?units=metric&id=${process.env.WEATHER_CITY}&appid=${process.env.WEATHER_KEY}`)
        .then(resp => resp.json())
        .then(data => {
            const dayForecast = data.list[0];

            const unixTime = dayForecast.dt;
            const maxTmp = dayForecast.temp.max;
            const minTmp = dayForecast.temp.min;
            const nightTmp = dayForecast.temp.night;
            const humidity = dayForecast.humidity;
            const windSpeed = dayForecast.speed;
            const icon = dayForecast.weather[0].icon;

            const message = '<b>' + icons[icon] + ' ' + new Date(unixTime * 1000).getDate() + ' ' + monthes[new Date(unixTime * 1000).getMonth()] + "</b>\
\n\
\nВ течение дня <i>от " + minTmp + "°C до " + maxTmp + "°C</i>\n\
··· Ночью <i>" + nightTmp + "°C</i>\n\
··· Влажность <i>" + humidity + "%</i>\n\
··· Ветер <i>" + windSpeed + "м/с</i>\n\
\n\
#погода";

            bot.sendMessage(process.env.CHAT_ID, message, {
                parse_mode: 'HTML',
            });
        })
        .catch(console.log)
}
