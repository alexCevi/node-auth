const router = require("express").Router();
const User = require("../model/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { registerValidation, loginValidation } = require("../validation");

const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SEND_GRID_KEY);

router.post("/register", async (req, res) => {
    // register data validation
    const { error } = registerValidation(req.body);
    if (error)
        return res.status(400).send({
            error: error.details[0].message,
        });

    // check if eamil already exists
    const emailExists = await User.findOne({ email: req.body.email });
    if (emailExists)
        return res.status(400).send({
            error: "an account already exists with that email",
        });

    // Password hash
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    //create a new user
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
    });
    try {
        const savedUser = await user.save();
        // send something so the frontend can navigate
        res.send({ user: user._id });
    } catch (err) {
        res.status(400).send(err);
    }
});

// login
router.post("/login", async (req, res) => {
    // register data validation
    const { error } = loginValidation(req.body);
    if (error)
        return res.send({
            error: error.details[0].message,
        });

    // check if eamil exists
    const user = await User.findOne({ email: req.body.email });
    if (!user)
        return res.send({
            error: "username or password is invalid",
        });

    // check if password is correct
    const validPass = await bcrypt.compare(req.body.password, user.password);
    if (!validPass)
        return res.send({
            error: "username or password is invalid",
        });

    // create and assign jwt
    const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET, {
        expiresIn: "2d",
    });
    res.header("auth-token", token).send({
        authToken: token,
    });
});

// this is for requestion the email to RESET the password 2 dif tings
router.post("/forgotpassword", async (req, res) => {
    // check if email OR username exists
    const user = await User.findOne({ email: req.body.email });

    if (user) {
        // gen reset code value
        const resetCode = Math.floor(Math.random() * 90000) + 10000;

        // save data to user in db
        user.resetPasswordCode = resetCode;
        user.resetPasswordExpDate = Date.now() + 1800000; // set to expire in 30 mins after creation
        await user.save();

        const msg = {
            to: `${user.email}`,
            from: "alexcwebstudio@gmail.com", // this needs to be the varified account on sendgrid
            subject: "Password reset request",
            text: `password reset code is ${resetCode}`,
        };

        // send grid core send function
        sgMail
            .send(msg)
            .then(() => {
                return res.send();
            })
            .catch((err) => {
                console.log(console.log(err));
            });
    } else {
        return res.status(400).send({
            error: "no user found",
        });
    }
});

// this checks the reset code and then accepts password if valid
router.post("/resetPassword", async (req, res) => {
    //locate user and validate that the experation data is still valid
    const user = await User.findOne({
        email: req.body.email,
        resetPasswordExpDate: { $gt: Date.now() },
    });
    if (!user)
        return res.status(400).send({
            error: "Expired reset code", // can assume this because user has already provided email
        });
    if (req.body.resetCode !== user.resetPasswordCode)
        return res.status(400).send({
            error: "Invalid reset code",
        });

    // password hash
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    user.password = hashedPassword;
    user.resetPasswordCode = null;
    user.resetPasswordExpDate = null;
    await user.save();
    return res.send();
});

module.exports = router;
