document.addEventListener('DOMContentLoaded', function () {
    Parse.initialize("qmiVcBHkyOi90FYFNs6r7e4J5beskXYTkqe85Qqm", "zgAXSRve1aW88Ck7dfO06emiorlN5KXmOrtYFuho");
    Parse.serverURL = "https://parseapi.back4app.com/";

    document.getElementById('loginForm').addEventListener('submit', function (event) {
        event.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        Parse.User.logIn(username, password).then((user) => {
            console.log("User logged in:", user);
            // Redirect to a new page after successful login
            window.location.href = 'home.html'; // Change 'dashboard.html' to your desired page
        }).catch((error) => {
            console.error("Error logging in:", error);
        });
    });

    document.getElementById('signupForm').addEventListener('submit', function (event) {
        event.preventDefault();

        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const newPassword = document.getElementById('newPassword').value;

        const user = new Parse.User();
        user.set("username", username);
        user.set("password", newPassword);
        user.set("email", email);

        user.signUp().then((user) => {
            console.log("User signed up:", user);
            // Redirect to a new page after successful sign-up
            window.location.href = 'home.html'; // Change 'dashboard.html' to your desired page
        }).catch((error) => {
            console.error("Error signing up:", error);
        });
    });
});


//Parse.initialize("qmiVcBHkyOi90FYFNs6r7e4J5beskXYTkqe85Qqm", "zgAXSRve1aW88Ck7dfO06emiorlN5KXmOrtYFuho");
//github test

//just in case you want to use .env make sure to install the .env package
//if not the api key is in the .env file for use.

//Geoapify Key = GEOAPIFY_API_KEY=8e839545a466486ea818f2f8792eb92b

require('dotenv').config(); // Load environment variables from a .env file

const fetch = require('node-fetch');
const apiKey = process.env.GEOAPIFY_API_KEY; // will take the api key from the .env file

const requestOptions = {
  method: 'GET',
};

const apiUrl = `https://api.geoapify.com/v2/place-details?id=514d368a517c511e40594bfd7b574ec84740f00103f90135335d1c00000000920313416e61746f6d697363686573204d757365756d&apiKey=${apiKey}`;

fetch(apiUrl, requestOptions)
  .then(response => response.json())
  .then(result => {
    // Process the result from the API
    console.log("Place Details:", result);
    // Perform additional actions based on the API response
  })
  .catch(error => console.log('Error:', error));
