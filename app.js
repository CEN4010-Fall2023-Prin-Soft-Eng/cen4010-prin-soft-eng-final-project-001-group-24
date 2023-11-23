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