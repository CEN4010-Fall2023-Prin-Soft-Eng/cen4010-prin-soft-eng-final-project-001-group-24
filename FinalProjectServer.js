const express = require('express');
const bodyParser = require('body-parser');
const Parse = require('parse/node');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Parse
Parse.initialize("qmiVcBHkyOi90FYFNs6r7e4J5beskXYTkqe85Qqm", "zgAXSRve1aW88Ck7dfO06emiorlN5KXmOrtYFuho");
Parse.serverURL = "https://parseapi.back4app.com/";

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files
app.use(express.static(__dirname + '/public'));

// Swagger Configuration
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Your API',
    version: '1.0.0',
    description: 'API documentation for your project',
  },
  servers: [
    {
      url: `http://localhost:${PORT}`,
      description: 'Local server',
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ['FinalProjectServer.js'], // Your API routes
};

const swaggerSpec = swaggerJSDoc(options);

app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));
/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Authentication endpoints
 */

/**
* @swagger
* /login:
*   post:
*     tags:
*       - Authentication
*     summary: Log in a user
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             properties:
*               username:
*                 type: string
*               password:
*                 type: string
*     responses:
*       200:
*         description: User logged in successfully
*       500:
*         description: Error logging in
*/
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

/**
* @swagger
* /signup:
*   post:
*     tags:
*       - Authentication
*     summary: Sign up a new user
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             properties:
*               username:
*                 type: string
*               email:
*                 type: string
*               newPassword:
*                 type: string
*     responses:
*       200:
*         description: User signed up successfully
*       500:
*         description: Error signing up
*/
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

/**
* @swagger
* tags:
*   name: Favorites
*   description: User favorites endpoints
*/

/**
* @swagger
* /addFavorite:
*   post:
*     tags:
*       - Favorites
*     summary: Add a favorite
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             properties:
*               userId:
*                 type: string
*               itemId:
*                 type: string
*     responses:
*       200:
*         description: Favorite added successfully
*       500:
*         description: Error adding favorite
*/
app.post('/addFavorite', (req, res) => {
 const { userId, itemId } = req.body;

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

/**
* @swagger
* /deleteFavorite:
*   post:
*     tags:
*       - Favorites
*     summary: Delete a favorite
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             properties:
*               userId:
*                 type: string
*               itemId:
*                 type: string
*     responses:
*       200:
*         description: Favorite deleted successfully
*       500:
*         description: Error deleting favorite
*/
app.post('/deleteFavorite', (req, res) => {
 const { userId, itemId } = req.body;

 const Favorite = Parse.Object.extend('Favorite');
 const query = new Parse.Query(Favorite);

 query.equalTo('userId', userId);
 query.equalTo('itemId', itemId);

 query.find()
   .then((favorites) => {
     if (favorites.length > 0) {
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

/**
* @swagger
* /listFavorites:
*   get:
*     tags:
*       - Favorites
*     summary: List all favorites
*     parameters:
*       - name: userId
*         in: query
*         description: ID of the user
*         required: true
*         schema:
*           type: string
*     responses:
*       200:
*         description: List of user favorites
*       500:
*         description: Error listing favorites
*/
app.get('/listFavorites', (req, res) => {
 const userId = req.query.userId;

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

/**
* @swagger
* tags:
*   name: Items
*   description: Item management endpoints
*/

/**
* @swagger
* /searchItems:
*   get:
*     tags:
*       - Items
*     summary: Search items
*     parameters:
*       - name: query
*         in: query
*         description: Search query
*         required: true
*         schema:
*           type: string
*     responses:
*       200:
*         description: Items matching the search query
*       500:
*         description: Error searching items
*/


/**
 * @swagger
 * /searchItems:
 *   get:
 *     tags:
 *       - Items
 *     summary: Search items
 *     parameters:
 *       - name: query
 *         in: query
 *         description: Search query
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Items matching the search query
 *       500:
 *         description: Error searching items
 */
app.get('/searchItems', async (req, res) => {
    try {
      const query = req.query.query;
  
      // Example: Searching items in a Parse class named 'Item'
      const Item = Parse.Object.extend('Item');
      const itemQuery = new Parse.Query(Item);
      itemQuery.contains('name', query); // Search by name containing the query string
      const items = await itemQuery.find();
  
      res.json(items);
    } catch (error) {
      console.error('Error searching items:', error);
      res.status(500).send('Error searching items');
    }
  });
  
  /**
   * @swagger
   * /listItems:
   *   get:
   *     tags:
   *       - Items
   *     summary: List all items
   *     responses:
   *       200:
   *         description: List of all items
   *       500:
   *         description: Error listing items
   */
  app.get('/listItems', async (req, res) => {
    try {
      // Example: Listing all items from a Parse class named 'Item'
      const Item = Parse.Object.extend('Item');
      const itemQuery = new Parse.Query(Item);
      const items = await itemQuery.find();
  
      res.json(items);
    } catch (error) {
      console.error('Error listing items:', error);
      res.status(500).send('Error listing items');
    }
  });
  
  /**
   * @swagger
   * /getItemDetails/{itemId}:
   *   get:
   *     tags:
   *       - Items
   *     summary: Get item details
   *     parameters:
   *       - name: itemId
   *         in: path
   *         description: ID of the item
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Item details
   *       500:
   *         description: Error getting item details
   */
  app.get('/getItemDetails/:itemId', async (req, res) => {
    try {
      const itemId = req.params.itemId;
  
      // Example: Retrieving details for an item from a Parse class named 'Item'
      const Item = Parse.Object.extend('Item');
      const itemQuery = new Parse.Query(Item);
      const item = await itemQuery.get(itemId);
  
      res.json({
        id: item.id,
        name: item.get('name'),
        description: item.get('description'),
      });
    } catch (error) {
      console.error('Error getting item details:', error);
      res.status(500).send('Error getting item details');
    }
  });
  
  // Start the server
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });

