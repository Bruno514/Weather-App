const APIKEY_OW = "83e5b2e29e34a6651b74d699800634e6";
const APIKEY_GEOAPIFY = "46472531fa224e08bcb7ed4ccf2eb86b";

function getLatLon(limit, input) {
  return new Promise((resolve, reject) => {
    const location = input;

    let request = fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${location}&limit=${limit}&appid=${APIKEY_OW}`,
      { mode: "cors" }
    );

    request
      .then((response) => {
        if (!response.ok) {
          let err = new Error("HTTP status code: " + response.status);
          err.response = response;
          err.status = response.status;

          reject(err);
        }

        return response.json();
      })
      .then((response) => {
        // Check if response contains data
        if (response.length) {
          resolve(response);
        }

        const err = new Error("City not found");
        reject(err);
      });
  });
}

async function getAutocompleteCities(query) {
  URL = `https://api.geoapify.com/v1/geocode/autocomplete?text=${query}&apiKey=${APIKEY_GEOAPIFY}`;

  try {
    response = await fetch(URL, { mode: "cors" });
    responseJson = await response.json();
  } catch (err) {
    throw err;
  }

  return responseJson;
}

async function getWeatherData(input) {
  const lang = document.querySelector("select").value.split(" ")[1];

  try {
    let data = await getLatLon(1, input);

    const lat = data[0].lat;
    const lon = data[0].lon;

    const URL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&lang=${lang}&appid=${APIKEY_OW}`;

    try {
      let request = await fetch(URL, { mode: "cors" });
      let requestJson = await request.json();

      return requestJson;
    } catch (err) {
      throw err;
    }
  } catch (err) {
    throw err;
  }
}

function getDateString() {
  const locale = document.querySelector("select").value.split(" ")[0];
  const day = new Date().getDate();
  const dayLong = new Date().toLocaleString(locale, { weekday: "long" });
  const monthLong = new Date().toLocaleString(locale, { month: "long" });

  return `${dayLong}, ${monthLong} ${day}`;
}

async function displayWeatherData(input) {
  // Hide info display for now
  document.querySelector(".info-display").classList.remove("visible");

  // Show loader
  document.querySelector(".loader").classList.add("visible");

  try {
    const data = await getWeatherData(input);

    const temperatureConverted = Math.round(data.main.temp - 273.15);
    const dateString = getDateString();
    const city = data.name;
    const country = data.sys.country;
    const description = data.weather[0].description;
    const iconElement = document.querySelector(".icon");
    const iconId = data.weather[0].icon;
    const iconSrc = `https://openweathermap.org/img/wn/${iconId}@2x.png`;
    iconElement.src = iconSrc;

    // Make info visible and change width of input
    document.querySelector(".info-display").classList.add("visible");
    document.querySelector("input#location").classList.add("small");

    // Hide loader
    document.querySelector(".loader").classList.remove("visible");

    // Alter info
    document.querySelector(
      ".temperature"
    ).textContent = `${temperatureConverted}°`;
    document.querySelector(".date").textContent = `${dateString}`;
    document.querySelector(".description").textContent = `${
      description.charAt(0).toUpperCase() + description.slice(1)
    }`; // Capitalize
    document.querySelector(".city-name").textContent = `${city}, ${country}`; // Capitalize

    document.querySelector(".autocomplete-items").classList.remove("visible");
  } catch (error) {
    document.querySelector(".loader").classList.remove("visible");
    console.error(error);
  }
}

// Event setup
const locationForm = document.querySelector("form");
locationForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  displayWeatherData(document.querySelector("input").value);
});

// Some autocompletion
const input = document.querySelector("input#location");
input.addEventListener("keyup", async (event) => {
  try {
    const cities = await getAutocompleteCities(event.target.value);

    const autocompleteItems = document.querySelector(".autocomplete-items");
    autocompleteItems.innerHTML = "";

    cities.features.forEach((feature) => {
      const option = document.createElement("div");
      const properties = feature.properties;

      if (properties.hasOwnProperty("city")) {
        const city = properties.city;

        option.textContent = city;

        option.addEventListener("click", function () {
          displayWeatherData(city);
        });

        autocompleteItems.appendChild(option);
      }
    });
  } catch (err) {
    console.error(err);
  }
});

// Show and hive autocomplete
input.addEventListener("focus", () => {
  document.querySelector(".autocomplete-items").classList.add("visible");
});
input.addEventListener("focusout", () => {
  setTimeout(() => {
    document.querySelector(".autocomplete-items").classList.remove("visible");
  }, 200);
});
