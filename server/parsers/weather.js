import { XMLParser } from 'fast-xml-parser';
import request from 'request';
import { weatherUrl } from '../../config/weather.js';

export default (bot) => {

    request(weatherUrl, { xml: true }, (err, _res, body) => {
        if (err) { return console.log(err); }
        
        const parser = new XMLParser();
        const { rss: { channel: { item: { description } } } } = parser.parse(body);
        bot.sendMessage(process.env.CHAT_ID, description);
    });
};
