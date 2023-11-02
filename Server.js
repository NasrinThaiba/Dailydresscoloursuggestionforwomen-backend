const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const bcrypt = require("bcrypt");
require("dotenv").config();

const Customer = require("./Models/Customer");

const app = express();

app.use(bodyParser.json());
app.use(cors());

const Port = process.env.PORT
const DB_URL = process.env.DB_URL

mongoose
.connect(DB_URL, {})
.then(()=> console.log("Server is connected to MangoDB"))
.catch((err)=> console.log("Server is unable to connect", err))

app.post("/api/register", async (req, res) => {
    const { username, password, email, gender } = req.body;

    const hashPassword = await bcrypt.hash(password, 10);

    const customer = new Customer({ username, password: hashPassword, email, gender });

    try {
        await customer.save();
        console.log(customer);
        res.json({ message: "User registered successfully!!!" });
    } catch (error) {
        res.status(500).json({ message: "Error occurred during registration" });
    }
});

app.post("/api/login", async(req,res)=>{
    const {email, password} = req.body;

    const customer = await Customer.findOne({email}) 
    if(!customer){
        res.json({messsage: "Email doesn't exists, Authentication Failed"})
    }

    const passwordMatch = await bcrypt.compare(password, customer.password)
    if(!passwordMatch){
        res.json({message: "Password doesn't match, Authentication Failed"})
    }

const token = jwt.sign(
    { email: customer.email, role: "Mentor" },
    process.env.SECRET_KEY,
    { expiresIn: "1h" }
);

res.json({token});

});

app.get("/api/home", (req,res)=>{
    res.send("Home accessed Successfully!!!")
});

let weatherDataCache = {};

app.get('/weather/:cityName', async (req, res) => {
  try {
    const cityName = req.params.cityName;
    if (weatherDataCache[cityName]) {
      res.json(weatherDataCache[cityName]);
    } else {
      const apiKey = process.env.API_KEY;
      const weatherResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=metric`
      );

      const weatherData = weatherResponse.data;
      weatherDataCache[cityName] = weatherData;
      res.json(weatherData);
    }
  } catch (error) {
    res.status(500).json({ error: 'Error fetching weather data' });
  }
});

app.get('/weather/coordinates/:lat/:lon', async (req, res) => {
  try {
    const { lat, lon } = req.params;
    const apiKey = '16bfa98849718de13b6e8978b87d47b8';
    const weatherResponse = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    );
    const weatherData = weatherResponse.data;
    res.json(weatherData);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching weather data' });
  }
});

const weatherToDressColor = {
  'Clouds': {
    colors: ['Red', 'Orange', 'Teal'],
    clothing: 'Wear casual clothing with layers to stay warm.',
  },
  'Clear': {
    colors: ['Yellow', 'Pastel Pink', 'Skyblue'],
    clothing: 'Wear lightweight and breathable clothing to stay cool.',
  },
  'Rain': {
    colors: ['Yellow', 'Red'],
    clothing: 'Wear waterproof and water-resistant clothing to stay dry.',
  },
  'Drizzle': {
    colors: ['Coral', 'Mint Green', 'Light Orange'],
    clothing: 'Wear a light jacket and water-resistant shoes.',
  },
  'Mist': {
    colors: ['Lavender', 'Light blue'],
    clothing: 'Wear moisture-wicking and breathable fabrics.',
  },
};

app.get('/clothingSuggestions', (req, res) => {
  res.json(weatherToDressColor);
  console.log(weatherToDressColor);
  
});

const suggestedColorsMapforSpecialDays = {
  Christmas: 'Red',
  Valentine: 'Pink',
  Easter: 'Pastel',
  Halloween: 'Orange',
  NewYear: 'Gold',
  Thanksgiving: 'Brown',
  Diwali: 'Yellow',
  Bakrid: 'Green',
  Ramzan: 'Blue',
  Pongal: 'Golden Yellow',
};

//const specialDayColors = {};

app.post('/api/suggest-colors-specialday', (req, res) => {
  const { selectedDay } = req.body;
  const suggestedColorforspecialday = suggestedColorsMapforSpecialDays[selectedDay];

  if (suggestedColorforspecialday) {
    res.json({ suggestedColorforspecialday });
  } else {
    res.status(400).json({ message: 'Invalid or unsupported special day' });
  }
});

const suggestedColorsMapforSkintype = {
    fair: ['Emerald Green', 'Navy', 'Bold Shades of Blue'],
    medium: ['Dusky Pink', 'Soft rose', 'Jade Green', 'Peach'],
    dark: ['White', 'Gray', 'Light Blue', 'Orange', 'Pink'],
  };
  
  // Route for suggesting dress colors based on selected skin tone
  app.post('/api/suggest-colors-skintype', (req, res) => {
    const { skinTone } = req.body;
    const suggestedColorsforskin = suggestedColorsMapforSkintype[skinTone];
  
    if (suggestedColorsforskin) {
      res.json({ suggestedColorsforskin });
    } else {
      res.status(400).json({ message: 'Invalid or unsupported skin tone' });
    }
  });

  const suggestedColorsMapforWeekDays = {
    Monday: 'Floral White',
    Tuesday: 'Indian Red',
    Wednesday: 'Lime Green',
    Thursday: 'Light Yellow',
    Friday: 'Alice Blue',
    Saturday: 'Rebecca Purple',
    Sunday: 'Maroon',
  };
  
  
  app.post('/api/suggest-colors-weekday', (req, res) => {
    const { selectedDay } = req.body;
    const suggestedColorforweekday = suggestedColorsMapforWeekDays[selectedDay];
  
    if (suggestedColorforweekday) {
      res.json({ suggestedColorforweekday });
    } else {
      res.status(400).json({ message: 'Invalid or unsupported Weekday' });
    }
  });

app.listen(Port, ()=>{
    console.log("Server is running in the port", Port)
})