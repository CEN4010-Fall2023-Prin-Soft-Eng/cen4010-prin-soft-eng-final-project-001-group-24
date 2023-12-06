const express = require('express');
const bodyParser = require('body-parser');
const Parse = require('parse/node');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');
const fs = require('fs');
const glob = require('glob');

const app = express();
const PORT = process.env.PORT || 5678

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
      url: `http://localhost:5678`,
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



// Define a route for the root path
app.get('/', (req, res) => {
  res.send('Welcome to the Final Project Server!');
});


/**
 * @swagger
 * /login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Log in a user or create a new user with appointment details
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
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             example:
 *               identifier: '2023-12-04T12:30:00Z'
 *               message: 'User created successfully'
 *       200:
 *         description: User logged in successfully with appointment details
 *         content:
 *           application/json:
 *             example:
 *               date: 'Appointment Date'
 *               time: 'Appointment Time'
 *       401:
 *         description: Invalid username or password
 *         content:
 *           text/plain:
 *             example: 'Invalid username or password'
 *       500:
 *         description: Error creating user or retrieving details
 *         content:
 *           application/json:
 *             example:
 *               message: 'Error creating user'
 */
 app.post('/login', (req, res) => {
    const { username, password } = req.body;
  
    // Check if the user with the given login information exists
    const userExists = checkUserExists(username, password);
  
    if (!userExists) {
      // If the user doesn't exist, create a new user with date and time for appointment
      const identifier = new Date().toISOString();
      const date = "Appointment Date"; // Replace with the actual date
      const time = "Appointment Time"; // Replace with the actual time
  
      const user = {
        identifier,
        username,
        password,
        date,
        time
      };
  
      const str = JSON.stringify(user, null, 2);
      const dir = 'users';
  
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
  
        fs.writeFile(`users/${identifier}.json`, str, (err) => {
          if (err) {
            console.error('Error creating user:', err);
            return res.status(500).send({ message: 'Error creating user' });
          } else {
            console.log('User created successfully');
            return res.status(201).send({ identifier, message: 'User created successfully' });
          }
        });
      });
    } else {
      // User exists, implement the logic to retrieve date and time for appointment
      const user = getUserDetails(username, password); // Implement this function
      if (user) {
        // User found, return date and time for appointment
        return res.status(200).send({ date: user.date, time: user.time });
      } else {
        // User not found, handle accordingly
        return res.status(401).send('Invalid username or password');
      }
    }
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
     res.redirect('/index.html');
   })
   .catch((error) => {
     res.status(500).send('Error signing up');
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
      name: item.get('name'),  
      date: item.get('date'),  
      time: item.get('time'),  
      
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

/**
 * Endpoint to get details of a user by username
 * @swagger
 * /getUserDetails/{username}:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Get user details
 *     parameters:
 *       - name: username
 *         in: path
 *         description: Username of the user
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User details
 *       404:
 *         description: User not found
 *       500:
 *         description: Error getting user details
 */
app.get('/getUserDetails/:username', (req, res) => {
  const username = req.params.username;

  // Example: Retrieving details for a user from a Parse class named 'User'
  const User = Parse.Object.extend('_User');
  const userQuery = new Parse.Query(User);
  userQuery.equalTo('username', username);

  userQuery.first()
    .then((user) => {
      if (user) {
        console.log('User details retrieved successfully');
        res.json({
          username: user.get('username'),
          email: user.get('password'),
          // Add other user details as needed
        });
      } else {
        res.status(404).send({ message: 'User not found' });
      }
    })
    .catch((error) => {
      res.status(500).send({ message: 'Error getting user details' });
    });
});



function checkUserExists(username, password) {
  console.log("checkUserExists");
  const listOfUsers = glob.sync("users/*.json");

  for (let i = 0; i < listOfUsers.length; i++) {
    let user = JSON.parse(fs.readFileSync(listOfUsers[i], 'utf8'));
    if (user.username === username && user.password === password) {
      return true;
    }
  }
  return false;
}


//Start the server
  app.listen(5678, () => {
    console.log('Server is running...');
    console.log('Webapp:   http://localhost:5678/');
    console.log('API Docs: http://localhost:5678/api-docs');
  });
  
