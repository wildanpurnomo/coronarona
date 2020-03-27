const User = require('./userModel');

exports.insertUser = (user) => {
    User
        .create(user)
        .then((user) => {
            console.log(`${user.userID} just followed.`);
        });
}

exports.deleteUser = (userId) => {
    User
        .findOneAndDelete({ userID: userId })
        .then((deleted) => {
            console.log(`${deleted.userID} just unfollowed.`);
        });
}