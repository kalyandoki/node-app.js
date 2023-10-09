const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const databasePath = path.join(__dirname, "newdetails.db");

const app = express();

app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const convertStateDbObjectToResponseObject = (dbObject) => {
  return {
    stateId: dbObject.state_id,
    stateName: dbObject.state_name,
    population: dbObject.population,
  };
};

const convertDistrictDbObjectToResponseObject = (dbObject) => {
  return {
    districtId: dbObject.district_id,
    districtName: dbObject.district_name,
    stateId: dbObject.state_id,
    cases: dbObject.cases,
    cured: dbObject.cured,
    active: dbObject.active,
    deaths: dbObject.deaths,
  };
};

function authenticationMiddleware(request, response, next) {
  let jwtToken;
  const authHeader = request.headers["authorization"];
  if (authHeader !== undefined) {
    jwtToken = authHeader.split(" ")[1];
  }
  if (jwtToken === undefined) {
    response.status(401);
    response.send("Invalid JWT Token");
  } else {
    jwt.verify(jwtToken, "MY_SECRET_TOKEN", async (error, payload) => {
      if (error) {
        response.status(401);
        response.send("Invalid JWT Token");
      } else {
        next();
      }
    });
  }
}


// details get.request //

app.get('/details/:user_id', authenticationMiddleware, async (req, res) => {
    const { user_id } = req.params;
    try {
      const user = await User.findOne({ where: { user_id } });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      return res.json(user);
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  });

  // update put.request // 

  app.put('/update', authenticationMiddleware, async (req, res) => {
    const newDetails = req.body;
    try {
      await User.update(newDetails, { where: { user_id: newDetails.user_id } });
      return res.json({ message: 'User details updated successfully' });
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  });

  // image get.request //

  app.get('/image/:user_id', authenticationMiddleware, async (req, res) => {
    const { user_id } = req.params;
    try {
      const user = await User.findOne({ where: { user_id } });
      if (!user || !user.user_image) {
        return res.status(404).json({ message: 'Image not found' });
      }
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  });

  // insert post.request //

  app.post('/insert', authenticationMiddleware, async (req, res) => {
    const user = req.body.user_details;
    try {
      const newUser = await User.create(user);
      return res.json({ message: 'User created successfully', user: newUser });
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  });

  // delete delete.request // 

  app.delete('/delete/:user_id', authenticationMiddleware, async (req, res) => {
    const { user_id } = req.params;
    try {
      await User.destroy({ where: { user_id } });
      return res.json({ message: 'User deleted successfully' });
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  
  
  