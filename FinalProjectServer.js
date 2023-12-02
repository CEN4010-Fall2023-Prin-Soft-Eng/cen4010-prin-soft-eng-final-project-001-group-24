const express = require('express');
const bodyParser = require('body-parser');
const Parse = require('parse/node');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Parse
Parse.initialize("qmiVcBHkyOi90FYFNs6r7e4J5beskXYTkqe85Qqm", "zgAXSRve1aW88Ck7dfO06emiorlN5KXmOrtYFuho");
Parse.serverURL = "https://parseapi.back4app.com/";

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files
app.use(express.static(__dirname + '/public'));

// Routes

// Login
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    Parse.User.logIn(username, password)
        .then((user) => {
            console.log("User logged in:", user);
            res.redirect('/home.html');
        })
        .catch((error) => {
            console.error("Error logging in:", error);
            res.status(500).send('Error logging in');
        });
});

// Signup
app.post('/signup', (req, res) => {
    const { username, email, newPassword } = req.body;

    const user = new Parse.User();
    user.set("username", username);
    user.set("password", newPassword);
    user.set("email", email);

    user.signUp()
        .then((user) => {
            console.log("User signed up:", user);
            res.redirect('/home.html');
        })
        .catch((error) => {
            console.error("Error signing up:", error);
            res.status(500).send('Error signing up');
        });
});

// Favorites
app.post('/addFavorite', (req, res) => {
    const { userId, itemId } = req.body;

    // Assuming you have a Parse class named 'Favorite' to store user favorites
    const Favorite = Parse.Object.extend('Favorite');
    const favorite = new Favorite();
    favorite.set('userId', userId);
    favorite.set('itemId', itemId);

    favorite.save()
        .then(() => {
            console.log('Favorite added successfully');
            res.send('Favorite added successfully');
        })
        .catch((error) => {
            console.error('Error adding favorite:', error);
            res.status(500).send('Error adding favorite');
        });
});

app.post('/deleteFavorite', (req, res) => {
    const { userId, itemId } = req.body;

    // Assuming you have a Parse class named 'Favorite' to store user favorites
    const Favorite = Parse.Object.extend('Favorite');
    const query = new Parse.Query(Favorite);

    query.equalTo('userId', userId);
    query.equalTo('itemId', itemId);

    query.find()
        .then((favorites) => {
            if (favorites.length > 0) {
                // Delete the first matching favorite (you might need to adjust based on your data model)
                return favorites[0].destroy();
            } else {
                throw new Error('Favorite not found');
            }
        })
        .then(() => {
            console.log('Favorite deleted successfully');
            res.send('Favorite deleted successfully');
        })
        .catch((error) => {
            console.error('Error deleting favorite:', error);
            res.status(500).send('Error deleting favorite');
        });
});

app.get('/listFavorites', (req, res) => {
    const userId = req.query.userId;

    // Assuming you have a Parse class named 'Favorite' to store user favorites
    const Favorite = Parse.Object.extend('Favorite');
    const query = new Parse.Query(Favorite);

    query.equalTo('userId', userId);

    query.find()
        .then((favorites) => {
            console.log('Favorites retrieved successfully');
            res.json(favorites);
        })
        .catch((error) => {
            console.error('Error retrieving favorites:', error);
            res.status(500).send('Error retrieving favorites');
        });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
