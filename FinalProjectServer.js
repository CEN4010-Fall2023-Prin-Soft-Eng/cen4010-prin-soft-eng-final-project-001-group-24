const express = require('express');
const bodyParser = require('body-parser');
const Parse = require('parse/node');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');
const fs = require('fs');
const glob = require('glob');

const app = express();
const PORT = process.env.PORT || 5678;

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


// Define a route for the root path
app.get('/', (req, res) => {
    res.send('Welcome to the Final Project Server!');
  });

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

    const itemList = items.map(item => ({
      id: item.id,
      name: item.get('name'),  // Assuming there's a field named 'name' in your 'Item' class
      date: item.get('date'),  // Assuming there's a field named 'date' in your 'Item' class
      time: item.get('time'),  // Assuming there's a field named 'time' in your 'Item' class
      // Add more fields as needed
    }));

    res.status(200).json(itemList);
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
 *       404:
 *         description: Item not found
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

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    const itemDetails = {
      id: item.id,
      name: item.get('name'),  
      description: item.get('description'), 
      date: item.get('date'),  
      time: item.get('time'),  
      
    };

    res.status(200).json(itemDetails);
  } catch (error) {
    console.error('Error getting item details:', error);
    res.status(500).send('Error getting item details');
  }
});


  // Function to check if a historical tour setup exists
function checkTourSetupExists(identifier) {
  const listOfSetups = glob.sync("historical_tours/*.json");

  for (let i = 0; i < listOfSetups.length; i++) {
    let setup = JSON.parse(fs.readFileSync(listOfSetups[i], 'utf8'));
    if (setup.identifier === identifier) {
      return true;
    }
  }
  return false;
}

// Endpoint to create a new historical tour setup
app.post('/createTourSetup', (req, res) => {
  const identifier = new Date().toISOString(); // Using ISO date format as the identifier
  const { date, time, name } = req.body;

  const setup = {
    identifier,
    date,
    time,
    name,
  };

  const str = JSON.stringify(setup, null, 2);
  const dir = 'historical_tours';

  fs.access(dir, (err) => {
    if (err) {
      fs.mkdir(dir, (err) => {
        if (err) {
          console.error(err);
        } else {
          console.log('Directory created successfully!');
        }
      });
    } else {
      console.log('Directory already exists!');
    }

    if (!checkTourSetupExists(identifier)) {
      fs.writeFile(`historical_tours/${identifier}.json`, str, (err) => {
        if (err) {
          return res.status(500).send({ message: 'Error creating tour setup' });
        } else {
          return res.status(201).send({ identifier, message: 'Tour setup created successfully' });
        }
      });
    } else {
      return res.status(200).send({ identifier, message: 'Tour setup already exists' });
    }
  });
});

// Endpoint to get details of a historical tour setup by identifier
app.get('/getTourSetup/:identifier', (req, res) => {
  const identifier = req.params.identifier;

  fs.readFile(`historical_tours/${identifier}.json`, 'utf8', (err, data) => {
    if (err) {
      console.error('Error getting tour setup:', err);
      return res.status(404).send({ message: 'Tour setup not found' });
    } else {
      const setup = JSON.parse(data);
      return res.status(200).send(setup);
    }
  });
});

// Endpoint to list all historical tour setups
app.get('/listTourSetups', (req, res) => {
  const arr = [];
  const files = glob.sync('historical_tours/*.json');

  files.forEach((file) => {
    const data = fs.readFileSync(file, 'utf8');
    const setup = JSON.parse(data);
    arr.push(setup);
  });

  return res.status(200).send({ setups: arr });
});

//Start the server
  app.listen(5678, () => {
    console.log('Server is running...');
    console.log('Webapp:   http://localhost:5678/');
    console.log('API Docs: http://localhost:5678/api-docs');
  });
  
