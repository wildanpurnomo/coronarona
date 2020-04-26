const Donasi = require('../donasi/donasiModel');

exports.getLoginPage = (req, res) => {
    res.render('admin/login');
}

exports.getIndexPage = (req, res, next) => {
    Donasi
        .find({})
        .then((list) => {
            res.render('admin/main', {
                donasiList: list
            });
        })
        .catch(next);
}

exports.getDetailPage = (req, res, next) => {
    Donasi
        .findOne({ _id: req.params.id })
        .then((item) => {
            res.render('admin/detail', {
                data: item
            });
        })
        .catch(next);
}

exports.createNew = (req, res, next) => {
    Donasi
        .create(req.body)
        .then((data) => {
            res.send(data);
        })
        .catch(next);
}

exports.changeApproval = (req, res, next) => {
    Donasi
        .findOneAndUpdate({ _id: req.params.id }, req.body)
        .then((updateBody) => {
            Donasi
                .findOne({ _id: req.params.id })
                .then((updated) => {
                    res.send(updated);
                })
            
        })
        .catch(next);
}