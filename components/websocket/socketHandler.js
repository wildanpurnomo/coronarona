const axios = require('axios');
const socket = require('socket.io');
const Donasi = require('../donasi/donasiModel');
const dfController = require('../dialogflow/dialogflowController');

module.exports = (server) => {
    const io = socket(server);
    io.on('connection', (socket) => {
        console.log("a client connected");

        socket.on('chat', async (data) => {
            let result = await dfController.processInput(data.message, socket.id);
            try {
                const intent = result.intent.displayName.toLowerCase();

                if (intent === "statistic intent") {
                    handleStats(io, socket.id);
                } else if (intent === "news intent") {
                    handleNews(io, socket.id, result);
                } else if (intent === "list donasi intent") {
                    handleListDonasi(io, socket.id);
                } else if (intent === "create donasi intent") {
                    handleCreateDonasi(io, socket.id, result);
                } else {
                    io.to(socket.id).emit('reply', {
                        reply: result.fulfillmentText
                    });
                }
            } catch (err) {
                console.error(err);
                io.to(socket.id).emit('reply', {
                    reply: "Mohon maaf saya sedang error. Atau coba dengan keyword. Chat 'menu' untuk melihat keyword."
                });
            }
        });
    });
}

const handleStats = async (io, id) => {
    let response = await axios.get("https://corona.lmao.ninja/countries/indonesia");
    try {
        const stats = response.data;
        io.to(id).emit('reply', {
            reply: `Statistik di Indonesia.\nTotal Kasus: ${stats.cases}.\nTambahan kasus dari sebelumnya: ${stats.todayCases}.\nTotal Meninggal: ${stats.deaths}\nTambahan kematian dari sebelumnya: ${stats.todayDeaths}\nTotal Sembuh: ${stats.recovered}\nKasus Aktif: ${stats.active}.\n\nSumber statistik ini adalah API umum. Kami sarankan tetap mengikuti perkembangan terkini di media nasional.`
        });
    } catch (error) {
        console.error(error);
        io.to(id).emit('reply', {
            reply: `Maaf saya sedang error.`
        });
    }
}

const handleNews = async (io, id, result) => {
    if (result.outputContexts.length > 0) {
        io.to(id).emit('reply', {
            reply: result.fulfillmentText
        });
    } else {
        let response = await axios.get("http://newsapi.org/v2/top-headlines", { params: { q: `corona`, country: `id`, apiKey: process.env.NEWS_API_KEY } });
        try {
            let inputAmount = result.parameters.fields.amount.numberValue;
            let newsAmount = response.data.articles.length
            let permittedAmount = inputAmount > newsAmount ? newsAmount : inputAmount;

            var newsBody = "";
            for (var i = 0; i < permittedAmount; i++) {
                newsBody += `${i + 1}. ${response.data.articles[i].title}\n${response.data.articles[i].description}\nSumber: ${response.data.articles[i].url}\n\n`;
            };

            let newsFooter = "Sumber: Google News API";
            io.to(id).emit('reply', {
                reply: `${newsBody}\n\n${newsFooter}`
            });
        } catch (error) {
            console.error(error);
            io.to(id).emit('reply', {
                reply: `Maaf saya sedang error.`
            });
        }
    }
}

const handleListDonasi = async (io, id) => {
    let donasiList = await Donasi.find({ adminApproval: true });
    if (donasiList !== null) {
        var messageBody = "";
        for (var i = 0; i < donasiList.length; i++) {
            messageBody += `${i + 1}). ${donasiList[i].name}\n${donasiList[i].description}\n${donasiList[i].contactPerson}\nLink: ${donasiList[i].url}\n\n`
        }

        io.to(id).emit('reply', {
            reply: messageBody.trim()
        });
    }
}

const handleCreateDonasi = (io, id, result) => {
    if (result.outputContexts.length > 0) {
        io.to(id).emit('reply', {
            reply: result.fulfillmentText
        });
    } else {
        let newDonasi = new Donasi({
            issuerID: "WEB",
            name: result.parameters.fields.name.stringValue,
            description: result.parameters.fields.description.stringValue,
            contactPerson: result.parameters.fields.contactPerson.stringValue,
            url: result.parameters.fields.url.stringValue
        })

        newDonasi.save((err) => {
            if (err) console.error(err);
        });

        io.to(id).emit('reply', {
            reply: `Makasih ya :v Donasi anda sedang direview sama mimin.`
        });
    }
}