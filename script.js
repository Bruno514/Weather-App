const APIKEY = "83e5b2e29e34a6651b74d699800634e6";

// Event handling
const locationForm = document.querySelector("form");

function getLatLon() {
  return new Promise((resolve, reject) => {
    const location = document.querySelector("#location").value;

    let request = fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${location}&limit=1&appid=${APIKEY}`,
      { mode: "cors" }
    );

    request
      .then((response) => {
        if (!response.ok) {
          reject(response.status);
        }
        return response.json();
      })
      .then((response) => resolve(response));
  });
}

async function getWeatherData() {
  let [data, err] = await getLatLon()
    .then((v) => [v, null])
    .catch((e) => [null, e]);

  if (err) {
    throw new Error(err);
  }

  const lat = data[0].lat;
  const lon = data[0].lon;

  const URL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${APIKEY}`;

  try {
    let request = await fetch(URL, { mode: "cors" });
    let requestJson = await request.json();

    return requestJson;
  } catch (error) {
    throw error;
  }
}

locationForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  // Hide info display for now
  document.querySelector(".info-display").classList.remove("visible")

  // Show loader 
  document.querySelector(".loader").classList.add("visible")

  try {
    const data = await getWeatherData();
    console.log(data)
  
    const temperatureConverted = Math.round(data.main.temp - 273.15);
    const city = data.name;
    console.log(data.name)
    const description = data.weather[0].description;
    const iconElement = document.querySelector(".icon");
    const iconId = data.weather[0].icon;
    const iconSrc = `https://openweathermap.org/img/wn/${iconId}@2x.png`;
    iconElement.src = iconSrc;

    // Make info visible and change width of input
    document.querySelector(".info-display").classList.add("visible")
    document.querySelector("input#location").classList.add("small")

    // Hide loader
  document.querySelector(".loader").classList.remove("visible")

    // Alter info
    document.querySelector(".temperature").textContent = `${temperatureConverted}°`
    document.querySelector(".description").textContent = `${description.charAt(0).toUpperCase() + description.slice(1)}` // Capitalize
    document.querySelector(".city-name").textContent = `${city}` // Capitalize

  } catch (error) {
    console.log("Error: " + error);
  }
});
