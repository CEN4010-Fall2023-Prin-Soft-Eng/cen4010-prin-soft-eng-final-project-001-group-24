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
 *     summary: Log in a user or create a new user
 *     parameters:
 *       - name: username
 *         description: User's username
 *         in: formData
 *         required: true
 *         schema:
 *           type: string
 *       - name: password
 *         description: User's password
 *         in: formData
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       401:
 *         description: Invalid username or password
 *       500:
 *         description: Error logging in
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
              console.log('Directory already exists!');
            }
          });
        } else {
          console.log('Directory created successfully!');
        }
  
        fs.writeFile(`users/${identifier}.json`, str, (err) => {
          if (err) {
            return res.status(500).send({ message: 'Error creating user' });
          } else {
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
 *     summary: Creates a new person object with all of its attributes.
 *     description: Use this endpoint to create a new person.
 *     parameters:
 *       - name: username
 *         description: username
 *         in: formData
 *         required: true
 *         schema:
 *           type: string
 *       - name: password
 *         description: password
 *         in: formData
 *         required: true
 *         schema:
 *           type: string
 *       - name: name
 *         description: name
 *         in: formData
 *         required: true
 *         schema:
 *           type: string
 *       - name: Date
 *         description: Date
 *         in: formData
 *         required: true
 *         schema:
 *           type: string
 *       - name: Time
 *         description: Time
 *         in: formData
 *         required: true
 *         schema:
 *           type: string
 *
 *     responses:
 *       200:
 *         description: User signed up successfully
 *       400:
 *         description: Bad request - Duplicate username, password, date, or time
 *       409:
 *         description: Conflict - Overlapping dates or times
 *       500:
 *         description: Internal Server Error - Error signing up
 */


app.post('/signup', (req, res) => {
  const { username, password, name, date, time } = req.body;

  // Check if user with the same attributes already exists
  if (checkUserExists(username, password, date, time)) {
    return res.status(400).send('Bad request - Duplicate username, password, date, or time');
  }

  // Check for overlapping dates or times
  if (checkOverlap(date, time)) {
    return res.status(409).send('Conflict - Overlapping dates or times');
  }

  // If all checks pass, sign up the user
  const identifier = new Date().toISOString();
  const user = {
    identifier,
    username,
    password,
    name,
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
        return res.status(500).send('Error signing up');
      } else {
        return res.status(200).send('User signed up successfully');
      }
    });
  });
});



/**
 * @swagger
 * /searchItems:
 *   get:
 *     tags:
 *       - Items
 *     summary: Search items by username, date, time, or name
 *     parameters:
 *       - name: query
 *         in: query
 *         description: Search query (username, date, time, or name)
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

    // Example: Searching items in a Parse class named 'Item' by username, date, time, or name
    const Item = Parse.Object.extend('Item');
    const itemQuery = new Parse.Query(Item);

    if (query) {
      // Search by username, date, time, or name
      const usernameQuery = new Parse.Query(Item);
      usernameQuery.matches('username', new RegExp(query, 'i'));

      const dateQuery = new Parse.Query(Item);
      dateQuery.matches('date', new RegExp(query, 'i'));

      const timeQuery = new Parse.Query(Item);
      timeQuery.matches('time', new RegExp(query, 'i'));

      const nameQuery = new Parse.Query(Item);
      nameQuery.matches('name', new RegExp(query, 'i'));

      // Combine the queries using OR operation
      itemQuery._orQuery([usernameQuery, dateQuery, timeQuery, nameQuery]);
    }

    const items = await itemQuery.find();

    const itemList = items.map(item => ({
      id: item.id,
      name: item.get('name'),  
      date: item.get('date'),  
      time: item.get('time'),  
      username: item.get('username'),
    }));

    res.status(200).json(itemList);
  } catch (error) {
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
    const username = req.query.username; // Extract username from query parameters

    // Example: Listing items for a specific user from a Parse class named 'Item'
    const Item = Parse.Object.extend('Item');
    const itemQuery = new Parse.Query(Item);
    
    if (username) {
      itemQuery.equalTo('username', username);
    }
    
    const items = await itemQuery.find();

    const itemList = items.map(item => ({
      id: item.id,
      name: item.get('name'),  
      date: item.get('date'),  
      time: item.get('time'),  
      username: item.get('username'),
    }));

    res.status(200).json(itemList);
  } catch (error) {
    res.status(500).send('Error listing items');
  }
});

/**
 * @swagger
 * /signup:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Sign up a new user or modify tour date and time for an existing user
 *     requestBody:
 *       in: formData
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               time:
 *                 type: string
 *                 format: time
 *     responses:
 *       200:
 *         description: User signed up or tour date and time modified successfully
 *       400:
 *         description: Bad request - Duplicate username, password, date, or time
 *       409:
 *         description: Conflict - Overlapping dates or times
 *       500:
 *         description: Internal Server Error - Error signing up or modifying tour date and time
 */
app.post('/signup', (req, res) => {
  const { username, password, name, date, time } = req.body;

  // Check if user with the same attributes already exists
  if (checkUserExists(username, password, date, time)) {
    // Perform logic to modify tour date and time for an existing user
    if (modifyTourDateAndTime(username, date, time)) {
      return res.status(200).send('User signed up or tour date and time modified successfully');
    } else {
      return res.status(500).send('Error modifying tour date and time');
    }
  }

  // Check for overlapping dates or times
  if (checkOverlap(date, time)) {
    return res.status(409).send('Conflict - Overlapping dates or times');
  }

  // If all checks pass, sign up the user
  const identifier = new Date().toISOString();
  const user = {
    identifier,
    username,
    password,
    name,
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
        return res.status(500).send('Error signing up');
      } else {
        return res.status(200).send('User signed up successfully');
      }
    });
  });
});




function checkUserExists(username, password) {
  console.log("checkUserExists");
  const listOfUsers = glob.sync("users/*.json");

  for (let i = 0; i < listOfUsers.length; i++) {
    let user = JSON.parse(fs.readFileSync(listOfUsers[i], 'utf8'));
    if ( user.username === username &&
      user.password === password &&
      user.date === date &&
      user.time === time) {
      return true;
    }
  }
  return false;
}

// Function to check for overlapping dates or times
function checkOverlap(date, time) {
  // Get all existing user records
  const listOfUsers = glob.sync("users/*.json");

  // Parse the incoming date and time
  const incomingDateTime = new Date(`${date}T${time}`);

  // Iterate through existing records to check for overlaps
  for (let i = 0; i < listOfUsers.length; i++) {
    let user = JSON.parse(fs.readFileSync(listOfUsers[i], 'utf8'));

    // Parse the existing record's date and time
    const existingDateTime = new Date(`${user.date}T${user.time}`);

    // Check for date and time overlap
    if (incomingDateTime.getTime() === existingDateTime.getTime()) {
      return true; // Overlap found
    }
  }

  return false; // No overlap found
}


// Function to find a user by username
function findUserByUsername(username) {
  const listOfUsers = glob.sync("users/*.json");

  for (let i = 0; i < listOfUsers.length; i++) {
    let user = JSON.parse(fs.readFileSync(listOfUsers[i], 'utf8'));
    if (user.username === username) {
      return user;
    }
  }

  return null; // User not found
}

// Function to save the updated user information
function saveUpdatedUser(user) {
  const str = JSON.stringify(user, null, 2);
  fs.writeFileSync(`users/${user.identifier}.json`, str, 'utf8');
}

// Function to modify tour date and time for a user
function modifyTourDateAndTime(username, newDate, newTime) {
  try {
    // Find the user by username
    const user = findUserByUsername(username);

    if (!user) {
      // If the user is not found, return false (modification failed)
      return false;
    }

    // Update the user's tour date and time with the new values
    user.date = newDate;
    user.time = newTime;

    // Save the updated user information
    saveUpdatedUser(user);

    // Return true to indicate successful modification
    return true;
  } catch (error) {
    // Handle any errors that may occur during the modification process
    console.error('Error modifying tour date and time:', error);
    return false;
  }
}


//Start the server
  app.listen(5678, () => {
    console.log('Server is running...');
    console.log('Webapp:   http://localhost:5678/');
    console.log('API Docs: http://localhost:5678/api-docs');
  });
  
