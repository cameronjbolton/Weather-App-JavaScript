require('dotenv').config();
const apiKey = process.env.API_KEY;

const prompt = require('prompt-sync')();
const regex = /^\d{5}$/;
let zipCode = prompt('Enter a ZIP Code to get started:');

// Validate ZIP Code Input
while (true) {
    if (regex.test(zipCode)) {
        break;
    } else {
        zipCode = prompt('Invalid ZIP Code entered. Try again: ');
    }
}

// Main async function to handle API calls
(async () => {
    // Fetch location information
    const location = await convertZipToLocation(zipCode);
    if (location) {
        const { latitude, longitude, placeName, stateAbbr } = location;

        console.log(`Location: ${placeName}, ${stateAbbr}`);

        // Use the retrieved latitude and longitude in passCoordinates
        await passCoordinates(longitude, latitude);
    } else {
        console.log('Unable to retrieve location details');
    }
})();

// Function to convert ZIP code to location details
async function convertZipToLocation(zipCode) {
    const apiUrl = "https://api.zippopotam.us/us/" + zipCode;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Network error');
        }

        const data = await response.json();

        // Access the "places" array from the parsed JSON data
        const place = data.places[0];
        const placeName = place['place name'];
        const stateAbbr = place['state abbreviation'];
        const longitude = place.longitude;
        const latitude = place.latitude;

        // Return an object with the place details
        return { placeName, stateAbbr, longitude, latitude };
    } catch (error) {
        console.error('Fetch error: ', error);
        return null; // Handle error case
    }
}

// Function to pass coordinates to another API (e.g., weather API)
async function passCoordinates(longitude, latitude) {
    const apiUrl = "https://api.openweathermap.org/data/2.5/weather?lat=" 
                    + latitude + "&lon=" + longitude + "&appid=" + apiKey;
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Network error');
        }

        const data = await response.json();
        const weather = data.main;
        const temperature = weather.temp;
        const feels_like_temperature = weather.feels_like;
        const humidity = weather.humidity;

        const weatherDescription = data.weather[0];
        const description = weatherDescription.description;

        console.log("Currently, the weather is: " + description);
        console.log("The current temperature is: " + ((temperature - 273.15) * (9/5) + 32).toFixed(1)
                    +" degrees Fahrenheit");

    } catch (error) {
        console.error('Fetch error:', error);
    }
}