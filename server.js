const express = require('express');
const dotenv = require('dotenv');
const passport = require('passport');
const cookieSession = require('cookie-session');
const bodyParser = require('body-parser');
const path = require('path');
const { google } = require('googleapis');

dotenv.config();
const app = express();

require('./passport-setup');

// Middleware setup
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
    name: 'session',
    keys: [process.env.SESSION_SECRET],
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use('/', require('./routes/auth'));

app.get('/', (req, res) => {
    if (req.isAuthenticated()) {
        return res.redirect('/profile');
    }
    res.render('home');
});

app.get('/profile', (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/');
    }
    res.render('profile', { user: req.user });
});

app.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(400).send('Error logging out');
        }
        res.redirect('/');
    });
});

app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});
