//the libraries we need  

require('dotenv').config();
const express = require('express');
const expressJwt = require('express-jwt');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const app = express();



// Create a connection to the MySQL database
const connection = mysql.createConnection({
  host: '127.0.0.1',
  user: 'loginSystem',
  password: '6rHJEJdB27mL',
  database: 'login_system'
});
connection.connect((err)=>{
  if (err) {
      console.log('connection is failed ! try again ');
  }
  else{
      console.log('connection to mysql seccussfully');
  }
  });
  app.use(express.json());


  
// the login API
app.post("/login",(req,res)=>{
  const username=req.body.username;
  const password=req.body.password;
  const user={
    name:username
  };
  // we check if the user is exists 
  connection.query("SELECT * FROM users WHERE username=?",[username],(err,result)=>{
     if(err){
      res.status(500).send(err);
      return;
     }
     
        // If the user exists, check the password
        if (result.length > 0) {
          const access_token=jwt.sign(user,process.env.ACCESS_TOKEN_SECRET);
          // at least we can add expiration time 
          const hashedPassword = result[0].password;
  
          // Compare between the passwords
          if (bcrypt.compareSync(password, hashedPassword)) {
            res.json({access_token:access_token}); 
            // The password is correct, so log the user in
            res.status(200).send(
              "Right password"
           );
           
            return;
          }
        }
        res.status(401).send("Wrong password");
  }); 
});

//   <--- here if you need to create new user to try the code --->
// app.post('/users', (req, res) => {
//   const { username, password } = req.body;

//   bcrypt.hash(password, 10, (err, hashedPassword) => {
//     if (err) {
//       console.error('An error:', err);
//       res.status(500).json({ message: 'An error no.1' });
//       return;
//     }

//     const sql = 'INSERT INTO users (username, password) VALUES (?, ?)';
//     const values = [username, hashedPassword];

//     connection.query(sql, values, (err, result) => {
//       if (err) {
//         console.error('An error happend while creating user:', err);
//         res.status(500).json({ message: 'An error occurred while creating the user.' });
//       } else {
//         console.log('User created successfully!');
//         res.status(200).json({ message: 'User created successfully!' });
//       }
//     });
//   });
// });


// to extract the token from header to check if it validate or not 
function authenticateToken(req,res,next){
  const authHeader = req.headers.authorization;
  const token=authHeader.split(' ')[1];
  if(token==null) return res.status(401);

  jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,user)=>{
      if(err) return res.status(403);
      req.user=user
      next();
  })

}


// This is Home API_____
 
app.get('/home', authenticateToken, async (req, res) => {
  // Get the user's username from the JWT token
  const username = req.user.name;

  // Query the database for the user's data
  const sql = 'SELECT * FROM users WHERE username = ?';
  const values = [username];

  // Wait for the query to finish executing
  const results = await connection.promise().query(sql, values);

  // Get the user's data from the results
  const user = results[0];

  // Send the user's data in the response
  res.status(200).json({ user });
});


// The post we used 
app.listen(3000);
