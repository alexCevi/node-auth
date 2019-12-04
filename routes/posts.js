const router = require('express').Router();
const verify = require('../verifyToken');
const User = require('../model/User');


router.get('/', verify, (req, res) => {
    User.findById(req.user._id).then(response => {
        res.send(response.name);
    }).catch(error => {
        console.log(error);
    });
});

module.exports = router;
