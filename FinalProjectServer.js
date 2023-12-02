// server.js

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const Parse = require('parse/node');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Parse
Parse.initialize("qmiVcBHkyOi90FYFNs6r7e4J5beskXYTkqe85Qqm", "zgAXSRve1aW88Ck7dfO06emiorlN5KXmOrtYFuho");
Parse.serverURL = "https://parseapi.back4app.com/";

// Middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    Parse.User.logIn(username, password)
        .then((user) => {
            console.log("User logged in:", user);
            res.redirect('/home.html'); // Change to your desired page
        })
        .catch((error) => {
            console.error("Error logging in:", error);
            res.status(500).send('Error logging in');
        });
});

app.post('/signup', (req, res) => {
    const { username, email, newPassword } = req.body;

    const user = new Parse.User();
    user.set("username", username);
    user.set("password", newPassword);
    user.set("email", email);

    user.signUp()
        .then((user) => {
            console.log("User signed up:", user);
            res.redirect('/home.html'); // Change to your desired page
        })
        .catch((error) => {
            console.error("Error signing up:", error);
            res.status(500).send('Error signing up');
        });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
