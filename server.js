const express = require("express");
const cors = require("cors");

const app = express();

var corsOptions = {
    origin: "http://localhost:5173"
  };
  
  app.use(cors());
  
  // parse requests of content-type - application/json
  app.use(express.json());
  
  // parse requests of content-type - application/x-www-form-urlencoded
  app.use(express.urlencoded({ extended: true }));
  

const db = require("./app/models");
const Role = db.role;

db.mongoose
  .connect(`mongodb+srv://somaakshith:wH90ofXPd2iPQ523@login.pkqyn.mongodb.net/?retryWrites=true&w=majority&appName=Login`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Successfully connect to MongoDB.");
    initial();
  })
  .catch(err => {
    console.error("Connection error", err);
    process.exit();
  });

   async function initial() {
    try {
      const count = await Role.estimatedDocumentCount();
  
      if (count === 0) {
        const roles = ['user', 'moderator', 'admin'];
  
        for (const roleName of roles) {
          try {
            const role = new Role({ name: roleName });
            await role.save();
            console.log(`added '${roleName}' to roles collection`);
          } catch (err) {
            console.error(`Error adding '${roleName}' to roles collection:`, err);
          }
        }
      }
    } catch (err) {
      console.error('Error counting roles:', err);
    }
  }
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
require('./app/routes/auth.routes')(app);
require('./app/routes/user.routes')(app);