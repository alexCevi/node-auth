const router = require('express').Router();
const User = require('../model/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { registerValidation, loginValidation } = require('../validation');

router.post('/register', async (req, res) => {

    // register data validation
    const { error } = registerValidation(req.body);
    if(error) return res.status(400).send({
        error: error.details[0].message
    });

    // check if eamil already exists
    const emailExists = await User.findOne({email: req.body.email});
    if (emailExists) return res.status(400).send({
        error: 'an account already exists with that email'
    })

    // Password hash
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    //create a new user
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword
    });
    try {
        const savedUser = await user.save();
        // send something so the frontend can navigate
        res.send({user: user._id});
    } catch (err) {
        res.status(400).send(err);
    }
});

// login
router.post('/login', async (req, res) => {
    // register data validation
    const { error } = loginValidation(req.body);
    if(error) return res.send({
       error: error.details[0].message
    });

     // check if eamil exists
    const user = await User.findOne({email: req.body.email});
    if (!user) return res.send({
        error: 'username or password is invalid'
    });

    // check if password is correct
    const validPass = await bcrypt.compare(req.body.password, user.password);
    if(!validPass) return res.send({
        error: 'username or password is invalid'
    });

    // create and assign jwt
    const token = jwt.sign({_id: user._id}, process.env.TOKEN_SECRET, {
        expiresIn: '2d'
    });
    res.header('auth-token', token).send({
        authToken: token
    });
})

module.exports = router;
