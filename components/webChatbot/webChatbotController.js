exports.getIndexPage = (req, res) => {
    res.render('webChatbot/index', { port: process.env.PORT || 8000 });
}