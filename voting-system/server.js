const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session');
const User = require('./models/User');

const app = express();

// MongoDB connection (Mongoose 7+ no longer needs options)
mongoose.connect('mongodb://127.0.0.1:27017/votingDB')
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.log(err));

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use(session({
    secret: 'secretkey',
    resave: false,
    saveUninitialized: false
}));

// Routes

app.get('/', (req, res) => {
    res.redirect('/login');
});

// Signup page
app.get('/signup', (req, res) => {
    res.render('signup');
});

// Signup POST
app.post('/signup', async (req, res) => {
    try {
        const { fullname, email, username, password, confirmPassword } = req.body;

        if (password !== confirmPassword) {
            return res.render('signup', { error: "Passwords do not match" });
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.render('signup', { error: "Username already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            fullname,
            email,
            username,
            password: hashedPassword
        });

        await user.save();
        res.redirect('/login');

    } catch (err) {
        console.error(err);
        res.render('signup', { error: "Something went wrong" });
    }
});

// Login page
app.get('/login', (req, res) => {
    res.render('login');
});

// Login POST
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.render('login', { error: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.render('login', { error: "Incorrect password" });

    req.session.userId = user._id;
    res.redirect('/dashboard');
});

// Dashboard
app.get('/dashboard', async (req, res) => {
    if (!req.session.userId) return res.redirect('/login');

    const user = await User.findById(req.session.userId);
    res.render('dashboard', { user });
});

// Logout
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

app.listen(3000, () => {
    console.log('🚀 Server running on http://localhost:3000');
});