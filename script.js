//==================================
// Setting variables
//==================================

var citySearch;
var APIkey = "&appid=e969729ebb4d28334716be8dcf1aa904";
var weatherAPI = "https://api.openweathermap.org/data/2.5/weather?";
var uviAPI = "https://api.openweathermap.org/data/2.5/uvi?lat=";
var forecastAPI = "https://api.openweathermap.org/data/2.5/forecast?q=";
var geoAPI = navigator.geolocation;
var units = "&units=imperial";
var getWeatherIcon = "http://openweathermap.org/img/wn/";
var searchHistoryArr = [];

$(document).ready(function () {
  //===========================================
  // Event Listener For Our  City Search Button
  //===========================================

  function search() {
    $("#search-button").on("click", function () {
      citySearch = $("#search-input").val().trim();

      if (citySearch === "") {
        return;
      }
      $("#search-input").val("");
      getWeather(citySearch);
    });
  }

  //================================
  //Running our function Get Weather
  //================================
  function getWeather(search) {
    //============================================================================
    // Storing In A Variable Our  API URL For Our Weather API With APIKey Included
    //============================================================================

    var queryURL = weatherAPI + "q=" + search + units + APIkey;

    //============================================================
    // Performing an AJAX GET request to our Weather API queryURL
    //============================================================
    $.ajax({
      url: queryURL,
      method: "GET",
      statusCode: {
        404: function () {
          $("#current-forecast").hide();
          $("#five-day-forecast-container").hide();
          $("#error-div").show();
        },
      },

      //=================================================
      // After the data from the AJAX request comes back
      //=================================================
    }).then(function (response) {
      $("#error-div").hide();
      $("#current-forecast").show();
      $("#five-day-forecast-container").show();

      //=================================================
      // Saving The Response_Url Property In Variables
      //=================================================

      var results = response;
      var name = results.name;
      var temperature = Math.floor(results.main.temp);
      var humidity = results.main.humidity;
      var windSpeed = results.wind.speed;
      var date = new Date(results.dt * 1000).toLocaleDateString("en-US");
      var weatherIcon = results.weather[0].icon;
      var weatherIconURL = getWeatherIcon + weatherIcon + ".png";

      storeHistory(name);

      $("#city-name").text(name + " (" + date + ") ");
      $("#weather-image").attr("src", weatherIconURL);
      $("#temperature").html("<b>Temperature: </b>" + temperature + " °F");
      $("#humidity").html("<b>Humidity: </b>" + humidity + "%");
      $("#wind-speed").html("<b>Wind Speed: </b>" + windSpeed + " MPH");

      //============================================================================
      // Storing In A Variable Our  API URL For Our UV API With APIKey Included
      //============================================================================

      var lat = response.coord.lat;
      var lon = response.coord.lon;
      var uviQueryURL = uviAPI + lat + "&lon=" + lon + APIkey;

      //============================================================
      // Performing an AJAX GET request to our UV API queryURL
      //============================================================
      $.ajax({
        url: uviQueryURL,
        method: "GET",

        //=================================================
        // After the data from the AJAX request comes back
        //=================================================
      }).then(function (uviResponse) {
        //=================================================
        // Saving The Response_Url Property In Variables
        //=================================================

        var uviResults = uviResponse;
        var uvi = uviResults.value;
        $("#uv-index").html(
          "<b>UV Index: </b>" +
            '<span class="badge badge-pill badge-light" id="uvi-badge">' +
            uvi +
            "</span>"
        );

        //==========================================================
        // setting background color to uv index depending on number
        //==========================================================

        if (uvi < 3) {
          $("#uvi-badge").css("background-color", "green");
        } else if (uvi < 6) {
          $("#uvi-badge").css("background-color", "yellow");
        } else if (uvi < 8) {
          $("#uvi-badge").css("background-color", "orange");
        } else if (uvi < 11) {
          $("#uvi-badge").css("background-color", "red");
        } else {
          $("#uvi-badge").css("background-color", "purple");
        }
      });

      //============================================================================
      // Storing In A Variable Our  API URL For Our Forecast API With APIKey Included
      //============================================================================

      var cityName = name;
      var countryCode = response.sys.country;
      var forecastQueryURL =
        forecastAPI + cityName + "," + countryCode + units + APIkey;

      //============================================================
      // Performing an AJAX GET request to our Forecast API queryURL
      //============================================================

      $.ajax({
        url: forecastQueryURL,
        method: "GET",

        //=================================================
        // After the data from the AJAX request comes back
        //=================================================
      }).then(function (forecastResponse) {
        //=================================================
        // Saving The Forecast Response Url Property Results In Variables
        //=================================================

        var forecastResults = forecastResponse;
        var forecastArr = [];

        for (var i = 5; i < 40; i += 8) {
          var forecastObj = {};
          var forecastResultsDate = forecastResults.list[i].dt_txt;
          var forecastDate = new Date(forecastResultsDate).toLocaleDateString(
            "en-US"
          );
          var forecastTemp = forecastResults.list[i].main.temp;
          var forecastHumidity = forecastResults.list[i].main.humidity;
          var forecastIcon = forecastResults.list[i].weather[0].icon;

          //==================================
          // Pushing Attributes To The li
          //==================================

          forecastObj["list"] = {};
          forecastObj["list"]["date"] = forecastDate;
          forecastObj["list"]["temp"] = forecastTemp;
          forecastObj["list"]["humidity"] = forecastHumidity;
          forecastObj["list"]["icon"] = forecastIcon;

          forecastArr.push(forecastObj);
        }

        for (var j = 0; j < 5; j++) {
          var forecastArrDate = forecastArr[j].list.date;
          var forecastIconURL =
            getWeatherIcon + forecastArr[j].list.icon + ".png";
          var forecastArrTemp = Math.floor(forecastArr[j].list.temp);
          var forecastArrHumidity = forecastArr[j].list.humidity;

          $("#date-" + (j + 1)).text(forecastArrDate);
          $("#weather-image-" + (j + 1)).attr("src", forecastIconURL);
          $("#temp-" + (j + 1)).text(
            "Temp: " + Math.floor(forecastArrTemp) + " °F"
          );
          $("#humidity-" + (j + 1)).text(
            "Humidity: " + forecastArrHumidity + "%"
          );
        }
        $("#weather-container").show();
      });
    });
  }

  function getCurrentLocation() {
    function success(position) {
      const currentLat = position.coords.latitude;
      const currentLon = position.coords.longitude;

      //======================================================================================
      // Storing In A Variable Our  API URL For Our Current Location API With APIKey Included
      //======================================================================================
      var currentLocationQueryURL =
        weatherAPI +
        "lat=" +
        currentLat +
        "&lon=" +
        currentLon +
        units +
        APIkey;

      //=====================================================================
      // Performing An AJAX GET Request To Our Current Location  API queryURL
      //=====================================================================

      $.ajax({
        url: currentLocationQueryURL,
        method: "GET",

        //=================================================
        // After the data from the AJAX request comes back
        //=================================================
      }).then(function (currentLocationResponse) {
        var currentLocationResults = currentLocationResponse;
        var currentLocationName = currentLocationResults.name;
        var currentLocationTemp = currentLocationResults.main.temp;
        var currentLocationHumidity = currentLocationResults.main.humidity;
        var currentLocationIcon = currentLocationResults.weather[0].icon;
        var currentLocationIconURL =
          getWeatherIcon + currentLocationIcon + ".png";

        $("#current-location").text(currentLocationName);
        $("#weather-image-current-location").attr(
          "src",
          currentLocationIconURL
        );
        $("#temp-current-location").html(
          "<b>Temperature: </b>" + currentLocationTemp + " °F"
        );
        $("#humidity-current-location").html(
          "<b>Humidity: </b>" + currentLocationHumidity + "%"
        );
      });

      $("#current-location-weather").show();
    }

    //=======================================
    //Error handling function
    //=======================================

    function error() {
      $("#current-location").text("Cannot get your current location.");
    }

    if (!geoAPI) {
      $("#current-location").text(
        "Geolocation is not supported by your browser"
      );
    } else {
      geoAPI.getCurrentPosition(success, error);
    }
  }

  //===========================================
  //Event Listener To Get The Current Location
  //===========================================

  function currentLocationButton() {
    $("#current-location-button").on("click", function () {
      getCurrentLocation();
    });
  }

  //===========================================
  // IF Else statements To store Search History
  //===========================================

  function storeHistory(citySearchName) {
    var searchHistoryObj = {};

    if (searchHistoryArr.length === 0) {
      searchHistoryObj["city"] = citySearchName;
      searchHistoryArr.push(searchHistoryObj);
      localStorage.setItem("searchHistory", JSON.stringify(searchHistoryArr));
    } else {
      var checkHistory = searchHistoryArr.find(
        ({ city }) => city === citySearchName
      );

      if (searchHistoryArr.length < 5 && checkHistory === undefined) {
        searchHistoryObj["city"] = citySearchName;
        searchHistoryArr.push(searchHistoryObj);
        localStorage.setItem("searchHistory", JSON.stringify(searchHistoryArr));
      } else if (checkHistory === undefined) {
        searchHistoryArr.shift();
        searchHistoryObj["city"] = citySearchName;
        searchHistoryArr.push(searchHistoryObj);
        localStorage.setItem("searchHistory", JSON.stringify(searchHistoryArr));
      }
    }

    //==============
    //Clear History
    //==============

    $("#search-history").empty();
    displayHistory();
  }

  function displayHistory() {
    var getLocalSearchHistory = localStorage.getItem("searchHistory");
    var localSearchHistory = JSON.parse(getLocalSearchHistory);

    if (getLocalSearchHistory === null) {
      createHistory();
      getLocalSearchHistory = localStorage.getItem("searchHistory");
      localSearchHistory = JSON.parse(getLocalSearchHistory);
    }

    //=================================
    //Creating li for search history
    //=================================

    for (var i = 0; i < localSearchHistory.length; i++) {
      var historyLi = $("<li>");
      historyLi.addClass("list-group-item");
      historyLi.text(localSearchHistory[i].city);

      //===================================================================================
      // Preppending our search to make it appear first at the top of the history results
      //===================================================================================

      $("#search-history").prepend(historyLi);
      $("#search-history-container").show();
    }
    return (searchHistoryArr = localSearchHistory);
  }

  function createHistory() {
    searchHistoryArr.length = 0;
    localStorage.setItem("searchHistory", JSON.stringify(searchHistoryArr));
  }

  //===========================
  //Event Listeners
  //===========================

  function clearHistory() {
    $("#clear-button").on("click", function () {
      $("#search-history").empty();
      $("#search-history-container").hide();
      localStorage.removeItem("searchHistory");
      createHistory();
    });
  }

  function clickHistory() {
    $("#search-history").on("click", "li", function () {
      var cityNameHistory = $(this).text();
      getWeather(cityNameHistory);
    });
  }

  //=============================
  //Running All The Functions
  //=============================

  search();
  $("#current-forecast").hide();
  $("#five-day-forecast-container").hide();
  $("#search-history-container").hide();
  $("#current-location-weather").hide();
  $("#error-div").hide();
  displayHistory();
  clearHistory();
  clickHistory();
  currentLocationButton();
  renderSearchHistory();
});
