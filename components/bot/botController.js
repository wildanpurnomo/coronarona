const axios = require('axios');
const Client = require('./botClient');
const User = require('../user/userModel');
const Donasi = require('../donasi/donasiModel');
const dialogflowController = require('../dialogflow/dialogflowController');

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
        .processInput(event.message.text.toLowerCase(), event.source.userId)
        .then((result) => {
            if (result !== null) {
                const intent = result.intent.displayName.toLowerCase();
                if (intent === "statistic intent") {
                    handleStats(event);
                } else if (intent === "news intent") {
                    handleNews(event, result);
                } else if (intent === "list donasi intent") {
                    handleListDonasi(event);
                } else if (intent === "create donasi intent") {
                    handleCreateDonasi(event, result);
                } else {
                    handleDialogflowDefault(event, result);
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

    return Client.pushMessage(event.source.userId, replyMessage);
}

const handleFollow = (event) => {
    const replyMessage = {
        type: 'text',
        text: `Salam! Kenalin aku bot Coronarona. Saat ini aku punya 5 fitur : informasi trivial seputar corona, menampilkan berita terkini seputar corona, statistik corona di indonesia, informasi hotline COVID-19 di Yogyakarta dan informasi donasi yang bisa kamu bantu :)\n\nKamu bisa langsung chat kayak biasa atau menggunakan kata kunci. Chat "menu" untuk melihat semua kata kunci.`
    };

    let newUser = new User({
        userID: event.source.userId
    });
    newUser.save((err, data) => {
        if (err) return console.error(err);

        console.log(`Mongo Id : ${data._id}`);
    });

    return Client.pushMessage(event.source.userId, replyMessage);
}

const handleUnfollow = (event) => {
    User.deleteOne({ userID: event.source.userId }, (err) => {
        if (err) return console.error(err);

        console.log(`${event.source.userId} has unfollowed.`);
    });
}

const handleNews = (event, result) => {
    if (result.outputContexts.length > 0) {
        let replyMessage = {
            type: 'text',
            text: result.fulfillmentText
        };

        return Client.pushMessage(event.source.userId, replyMessage);
    } else {
        axios
            .get("http://newsapi.org/v2/top-headlines", { params: { q: `corona`, country: `id`, apiKey: process.env.NEWS_API_KEY } })
            .then((response) => {
                let inputAmount = result.parameters.fields.amount.numberValue;
                let newsAmount = response.data.articles.length
                let permittedAmount = inputAmount > newsAmount ? newsAmount : inputAmount;

                var newsBody = "";
                for (var i = 0; i < permittedAmount; i++) {
                    newsBody += `${i + 1}. ${response.data.articles[i].title}\n${response.data.articles[i].description}\nSumber: ${response.data.articles[i].url}\n\n`;
                };

                let newsFooter = "Sumber: Google News API";
                let replyMessage = {
                    type: 'text',
                    text: `${newsBody}\n\n${newsFooter}`
                };

                return Client.pushMessage(event.source.userId, replyMessage);
            })
            .catch(err => {
                console.error(err)
            })
    }
}

const handleStats = (event) => {
    axios
        .get("https://corona.lmao.ninja/countries/indonesia")
        .then((response) => {
            const stats = response.data;
            const replyMessage = {
                type: 'text',
                text: `Statistik di Indonesia.\nTotal Kasus: ${stats.cases}.\nTambahan kasus dari sebelumnya: ${stats.todayCases}.\nTotal Meninggal: ${stats.deaths}\nTambahan kematian dari sebelumnya: ${stats.todayDeaths}\nTotal Sembuh: ${stats.recovered}\nKasus Aktif: ${stats.active}.\n\nSumber statistik ini adalah API umum. Kami sarankan tetap mengikuti perkembangan terkini di media nasional.`
            }

            return Client.pushMessage(event.source.userId, replyMessage);
        });
}

const handleListDonasi = async (event) => {
    let donasiList = await Donasi.find({ adminApproval: true });
    if (donasiList !== null) {
        var messageBody = "";
        for (var i = 0; i < donasiList.length; i++) {
            messageBody += `${i + 1}). ${donasiList[i].name}\n${donasiList[i].description}\n${donasiList[i].contactPerson}\nLink: ${donasiList[i].url}\n\n`
        }

        let replyMessage = {
            type: 'text',
            text: messageBody.trim()
        }

        return Client.pushMessage(event.source.userId, replyMessage);
    }
}

const handleCreateDonasi = (event, result) => {
    if (result.outputContexts.length > 0) {
        let replyMessage = {
            type: 'text',
            text: result.fulfillmentText
        };

        return Client.pushMessage(event.source.userId, replyMessage);
    } else {
        let newDonasi = new Donasi({
            issuerID: event.source.userId,
            name: result.parameters.fields.name.stringValue,
            description: result.parameters.fields.description.stringValue,
            contactPerson: result.parameters.fields.contactPerson.stringValue,
            url: result.parameters.fields.url.stringValue
        })

        newDonasi.save((err) => {
            if (err) console.error(err);
        });

        let replyMessage = {
            type: 'text',
            text: `Makasih ya :v Donasi anda sedang direview sama mimin.`
        };

        return Client.pushMessage(event.source.userId, replyMessage);
    }
}