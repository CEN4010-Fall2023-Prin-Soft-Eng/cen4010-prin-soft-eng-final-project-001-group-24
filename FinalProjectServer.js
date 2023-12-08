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
 * /signup:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Sign up a new user or modify tour date and time for an existing user
 *     requestBody:
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
 *               country:
 *                 type: string
 *     responses:
 *       200:
 *         description: User signed up or tour date and time modified successfully
 *       400:
 *         description: Bad request - Duplicate username, password, date, time, or country
 *       409:
 *         description: Conflict - Overlapping dates or times
 *       500:
 *         description: Internal Server Error - Error signing up or modifying tour date and time
 */
app.post('/signup', (req, res) => {
  const { username, password, name, date, time, country } = req.body;

  // Check if user with the same attributes already exists
  if (checkUserExists(username, password, date, time, country)) {
    return res.status(400).send('Bad request - Duplicate username, password, date, time, or country');
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
    time,
    country
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

    try {
      fs.mkdirSync('users');
    } catch (err) {
      if (err.code !== 'EXIST') {
        console.error('Error creating directory:', err);
      }
    }

    fs.writeFile("users/" + username + ".json", str, (err) => {
      if (err) {
        console.error('Error writing to file:', err);
        return res.status(500).send('Error signing up');
      } else {
        return res.status(200).send('User signed up successfully');
      }
    });
  });
});

// Function to check if a user with the same information exists
function checkUserExists(username, password, date, time, country) {
  const userFiles = fs.readdirSync('users');
  for (const file of userFiles) {
    if (file.endsWith('.json')) {
      const userData = JSON.parse(fs.readFileSync(`users/${file}`, 'utf8'));
      if (
        userData.username === username &&
        userData.password === password &&
        userData.date === date &&
        userData.time === time &&
        userData.country === country
      ) {
        return true; // User with the same information already exists
      }
    }
  }
  return false; // No user with the same information found
}

// Function to check for overlapping dates or times
function checkOverlap(date, time) {
  const userFiles = fs.readdirSync('users');
  const newDateTime = new Date(`${date} ${time}`);
  
  for (const file of userFiles) {
    if (file.endsWith('.json')) {
      const userData = JSON.parse(fs.readFileSync(`users/${file}`, 'utf8'));
      
      // Parse existing user's date and time
      const existingDateTime = new Date(`${userData.date} ${userData.time}`);
      
      // Check for overlapping schedules
      if (
        userData.date === date && userData.time === time
        || newDateTime >= existingDateTime && newDateTime < new Date(existingDateTime.getTime() + yourAppointmentDurationInMilliseconds)
        || new Date(newDateTime.getTime() + yourAppointmentDurationInMilliseconds) > existingDateTime && newDateTime <= existingDateTime
      ) {
        return true; // Overlapping date/time found
      }
    }
  }
  
  return false; // No overlapping date/time found
}

// Define a global variable to store user information temporarily
let loggedInUser = null;

/**
 * @swagger
 * /login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Log in a user
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

    if (userExists) {
        // User exists, set the loggedInUser variable
        loggedInUser = getUserDetails(username, password);
        return res.status(200).send('Login Successful');
    } else {
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
        });

        // Set the loggedInUser variable
        loggedInUser = user;

        return res.status(200).send('Login Successful');
    }
});

/**
 * @swagger
 * /logout:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Log out the current user
 *     responses:
 *       200:
 *         description: User logged out successfully
 *       401:
 *         description: No user is currently logged in
 */
app.post('/logout', (req, res) => {
    if (loggedInUser) {
        // If a user is logged in, log them out by clearing the loggedInUser variable
        loggedInUser = null;
        return res.status(200).send('Logout Successful');
    } else {
        // No user is currently logged in
        return res.status(401).send('No user is currently logged in');
    }
});

 


/**
 * @swagger
 * /searchUsers:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Search for a user by username
 *     parameters:
 *       - name: query
 *         in: query
 *         description: Username to search for
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User found successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Error searching for the user
 */
app.get('/searchUsers', async (req, res) => {
  try {
    const query = req.query.query;

    // Read the list of users from the 'users' directory
    const userFiles = fs.readdirSync('users');

    // Find the user by username
    const foundUser = userFiles
      .map(file => {
        const userData = JSON.parse(fs.readFileSync(`users/${file}`, 'utf8'));
        return {
          id: userData.identifier, // Assuming 'identifier' is a unique identifier for users
          username: userData.username,
          date: userData.date,
          time: userData.time,
          name: userData.name,
          country: userData.country,
        };
      })
      .find(user => user.username === query);

    if (foundUser) {
      res.status(200).json(foundUser);
    } else {
      res.status(404).send('User not found');
    }
  } catch (error) {
    res.status(500).send('Error searching for the user');
  }
});



  
/**
 * @swagger
 * /listUsers:
 *   get:
 *     tags:
 *       - Users
 *     summary: List all users.
 *     responses:
 *       200:
 *         description: Success. An array of users has been retrieved.
 *       500:
 *         description: Error. Internal server error occurred.
 */

let rsp_obj = {};  // Add this line to declare rsp_obj

app.get('/listUsers', function (req, res) {
  console.log("list users");

  // Read the list of users from the 'users' directory
  const userFiles = fs.readdirSync('users');

  const userList = userFiles.map(file => {
    const userData = JSON.parse(fs.readFileSync(`users/${file}`, 'utf8'));
    return {
      id: userData.identifier, // Assuming 'identifier' is a unique identifier for users
      username: userData.username,
      date: userData.date,
      time: userData.time,
      name: userData.name,
      country: userData.country,
    };
  });

  var obj = {};
  obj.users = userList;

  return res.status(200).send(obj);
});


/**
 * @swagger
 * /users/{username}:
 *   put:
 *     summary: Update an existing user by username.
 *     description: Use this endpoint to update an existing user based on their username.
 *     parameters:
 *       - name: username
 *         description: User's username
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: password
 *         description: User's password
 *         in: formData
 *         required: true
 *         schema:
 *           type: string
 *       - name: date
 *         description: User's appointment date
 *         in: formData
 *         required: true
 *         schema:
 *           type: string
 *       - name: time
 *         description: User's appointment time
 *         in: formData
 *         required: true
 *         schema:
 *           type: string
 *       - name: country
 *         description: User's country
 *         in: formData
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Error. Unable to update resource.
 *       201:
 *         description: Success. The user has been updated.
 *       404:
 *         description: Error. The requested resource was not found.
 */
app.put('/users/:username', function (req, res) {
  var username = req.params.username;
  var filePath = `users/${username}.json`;
  var obj = {
    username: req.body.username,
    password: req.body.password,
    date: req.body.date,
    time: req.body.time,
    country: req.body.country
  };
  var str = JSON.stringify(obj, null, 2);

  // Check if the file exists
  fs.access(filePath, fs.constants.F_OK, function (err) {
    var rsp_obj = {};

    if (err) {
      // Handle case where the file doesn't exist (404)
      rsp_obj.message = 'error - resource not found';
      return res.status(404).send(rsp_obj);
    }

    // File exists, update the user information
    fs.writeFile(filePath, str, function (err) {
      if (err) {
        // Handle error (update failed)
        rsp_obj.message = 'error - unable to update resource';
        return res.status(200).send(rsp_obj);
      } else {
        // Handle success (update successful)
        rsp_obj = {
          message: 'successfully updated',
          user: obj
        };
        return res.status(201).send(rsp_obj);
      }
    });
  });
});



/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function checkUserExists(username, password, date, time, country) {
  console.log("checkUserExists");
  const listOfUsers = glob.sync("users/*.json");

  for (let i = 0; i < listOfUsers.length; i++) {
    let user = JSON.parse(fs.readFileSync(listOfUsers[i], 'utf8'));
    if (
      user.username === username &&
      user.password === password &&
      user.date === date &&
      user.time === time &&
      user.country === country
    ) {
      return true;
    }
  }
  return false;
}


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

    // Check for date and time overlap within the same hour
    if (
      incomingDateTime.getFullYear() === existingDateTime.getFullYear() &&
      incomingDateTime.getMonth() === existingDateTime.getMonth() &&
      incomingDateTime.getDate() === existingDateTime.getDate() &&
      incomingDateTime.getHours() === existingDateTime.getHours()
    ) {
      return true; // Overlap found
    }
  }

  return false; // No overlap found
}


//Start the server
app.listen(PORT, () =>{
    console.log('Server is running on port ${PORT}...');
    console.log('Webapp:   http://localhost:${PORT}/');
    console.log('API Docs: http://localhost:${PORT}/api-docs');
  });
  
