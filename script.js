const APIKEY = "83e5b2e29e34a6651b74d699800634e6";

function getLatLon(limit) {
  return new Promise((resolve, reject) => {
    const location = document.querySelector("#location").value;

    let request = fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${location}&limit=${limit}&appid=${APIKEY}`,
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

async function getWeatherData() {
  const lang = document.querySelector("select").value.split(" ")[1];

  try {
    let data = await getLatLon(1);

    const lat = data[0].lat;
    const lon = data[0].lon;

    const URL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&lang=${lang}&appid=${APIKEY}`;

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

// Event setup
const locationForm = document.querySelector("form");
locationForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  // Hide info display for now
  document.querySelector(".info-display").classList.remove("visible");

  // Show loader
  document.querySelector(".loader").classList.add("visible");

  try {
    const data = await getWeatherData();
    console.log(data);

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
  } catch (error) {
    console.error(error);
  }
});

// Some autocompletion
const input = document.querySelector("input#location");
input.addEventListener("keyup", async (event) => {
  try {
    console.log(1)
    const cities = await getLatLon(15);

    const datalist = document.querySelector("datalist#cities");
    datalist.innerHTML = "";

    cities.forEach((city) => {
      const option = document.createElement("option");
      option.value = city.name;

      datalist.appendChild(option);
    });
  } 
  catch (err) {
    console.error(err);
  }
});
