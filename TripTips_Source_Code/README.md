# CS375 Final Project
Author: Hai Le, Harry Chong, Willow Livengood and Paras Doshi

[Required]
Run 'npm install' to install all the dependencies required to run TripTips.

[Start Application]
As developer: npm run dev
For production: npm run start

Access the website at: http://localhost:8080/

[Modules Descriptions]
ejs - Template viewer for modules. Embedded JavaScript in HTML.
Nodemon - Restart server automatically when making changes.
passport.js - Handle session and authentication.
passport-local - Handle email/password verifications.
express-session - Handle user session across site.
connect-flash - Handle notifications for failed logins/wrong emails.

Database Setup:
- Create a database called 'triptips_db'.
- 'users' table:
    CREATE TABLE users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(25) NOT NULL,
        email VARCHAR(25) NOT NULL,
        password VARCHAR(25) NOT NULL,
        date DATE
    );

- 'locations' table:
    CREATE TABLE locations (
        locName VARCHAR(255) NOT NULL,
        locAddress VARCHAR(255),
        locType VARCHAR(255),
        locPrice VARCHAR(10),
        locNote VARCHAR(255),
        UserID INT,
        FOREIGN KEY (UserID) REFERENCES users(id),
        locLon VARCHAR(255),
        locLat VARCHAR(255),
        locID INT PRIMARY KEY AUTO_INCREMENT
    );   
