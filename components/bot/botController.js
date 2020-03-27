const axios = require('axios');
const Client = require('./botClient');
const userController = require('../user/userController');
const dialogflowController = require('../dialogflow/dialogflowController');
var newsContexts = [];

exports.callback = (req, res) => {
    Promise
        .all(req.body.events.map(handleEvent))
        .then((result) => res.json(result))
        .catch((err) => {
            console.error(err);
            res.status(500).end();
        });
}

const handleEvent = (event) => {
    var result = Promise.resolve(null);

    if (event.type === 'message') {
        result = handleDialogflow(event);
    } else if (event.type === 'follow') {
        result = handleFollow(event);
    } else if (event.type === 'unfollow') {
        result = handleUnfollow(event);
    }

    return result;
}

const handleDialogflow = (event) => {
    dialogflowController
        .processInput(event.message.text.toLowerCase(), newsContexts)
        .then((result) => {
            if (result !== null) {
                const intent = result.intent.displayName.toLowerCase();
                if (intent === "statistic intent") {
                    handleStats(event);
                } else if (intent === "news intent") {
                    handleNews(event, result);
                } else {
                    handleDialogflowDefault(event, result)
                }
            }
        })
        .catch((err) => {
            console.error(err);
        });
}

const handleDialogflowDefault = (event, result) => {
    const replyMessage = {
        type: 'text',
        text: result.fulfillmentText
    };

    return Client.replyMessage(event.replyToken, replyMessage);
}

const handleFollow = (event) => {
    const user = {
        userID: event.source.userId
    };

    const replyMessage = {
        type: 'text',
        text: `Halo. Ini adalah bot seputar COVID-19.\nFitur bot ini :\n1. Informasi umum. Chat "trivial" untuk memulai.\n2. Berita seputar corona. Chat "news" untuk memulai.\n3. Statistic corona di Indonesia. Chat "stats" untuk memulai.\n4. List hotline COVID-19 Yogyakarta. Chat "hotline" untuk memulai.\n5. List donasi COVID-19. Chat "donasi" untuk memulai.\n6. Chat "menu" untuk melihat navigasi ini kembali.`
    };

    userController.insertUser(user);
    return Client.replyMessage(event.replyToken, replyMessage);
}

const handleUnfollow = (event) => {
    userController.deleteUser(event.source.userId);
}

const handleNews = (event, result) => {
    if (result.outputContexts.length > 0) {
        const replyMessage = {
            type: 'text',
            text: result.fulfillmentText
        };
        newsContexts = result.outputContexts;

        return Client.replyMessage(event.replyToken, replyMessage);
    } else {
        amount = result.parameters.fields.amount.numberValue;
        if (amount > 6) {
            const replyMessage = {
                type: 'text',
                text: "Maaf Kebanyakan :( Aku cuma bisa nampilin maks 6."
            };

            return Client.replyMessage(event.replyToken, replyMessage);
        } else {
            newsContexts = [];
            axios
                .get("http://newsapi.org/v2/top-headlines", { params: { q: `corona`, country: `id`, apiKey: process.env.NEWS_API_KEY } })
                .then((response) => {
                    var newsBody = "";

                    for (var i = 0; i < amount; i++) {
                        newsBody += `${i + 1}. ${response.data.articles[i].title}\n${response.data.articles[i].description}\nSumber: ${response.data.articles[i].url}\n\n`;
                    };

                    var newsFooter = "Sumber: Google News API";
                    const replyMessage = {
                        type: 'text',
                        text: `${newsBody}\n\n${newsFooter}`
                    };

                    return Client.replyMessage(event.replyToken, replyMessage);
                })
                .catch(err => {
                    console.error(err)
                })
        }
    }
}

const handleStats = (event) => {
    const requestConfig = {
        "method": "GET",
        "url": "https://covid-19-coronavirus-statistics.p.rapidapi.com/v1/stats",
        "headers": {
            "content-type": "application/octet-stream",
            "x-rapidapi-host": "covid-19-coronavirus-statistics.p.rapidapi.com",
            "x-rapidapi-key": process.env.STATS_API_KEY
        },
        "params": {
            "country": "Indonesia"
        }
    };

    axios(requestConfig)
        .then((response) => {
            const stats = response.data.data.covid19Stats[0];
            const replyMessage = {
                type: 'text',
                text: `Statistik di Indonesia.\nTerkonfirmasi: ${stats.confirmed}.\nKematian: ${stats.deaths}.\nSembuh: ${stats.recovered}.\n\nSumber statistik ini adalah API umum. Kami sarankan tetap mengikuti perkembangan terkini di media nasional.`
            }

            return Client.replyMessage(event.replyToken, replyMessage);
        })
        .catch(err => {
            console.log(err);
        });
}