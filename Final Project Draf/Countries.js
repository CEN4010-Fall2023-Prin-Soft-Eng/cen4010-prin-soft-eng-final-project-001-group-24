

// function handleLogout(event){
//   event.preventDefault();

// }

let countries = [];

document.addEventListener("DOMContentLoaded", () => {
  fetchData();
});

async function fetchData() {
  try {
    const response = await fetch("Countries.json");
    const data = await response.json();
    countries = data.countries;
    displayCountries(countries);
  } catch (error) {
    console.error("Error fetching countries:", error);
  }
}

function displayCountries(countryList) {
  const countriesContainer = document.getElementById("countries-container");
  countriesContainer.innerHTML = "";

  countryList.forEach(country => {
      const countryDiv = document.createElement("div");
      countryDiv.innerHTML = `<a href='country-detail.html?${country.name}'>
      
      <img src=${country.imageUrl} name=${country.name}/>
      ${country.name}</a>`;
    

      countriesContainer.appendChild(countryDiv);
  });
}

function searchCountries() {
  const searchTerm = document.querySelector("input").value.toLowerCase();
  const filteredCountries = countries.filter(country => country.name.toLowerCase().includes(searchTerm));
  displayCountries(filteredCountries);
}

function sortCountries() {
  const sortFilter = document.getElementById("sortFilter").value;

  const sortedCountries = [...countries];
  switch (sortFilter) {
      case "alphabetical":
          sortedCountries.sort((a, b) => a.name.localeCompare(b.name));
          break;
      case "reverseAlphabetical":
          sortedCountries.sort((a, b) => b.name.localeCompare(a.name));
          break;
      case "nameLength":
          sortedCountries.sort((a, b) => a.name.length - b.name.length);
          break;
      default:
          // Default to alphabetical sorting
          sortedCountries.sort((a, b) => a.name.localeCompare(b.name));
          break;
  }

  displayCountries(sortedCountries);
}

// Initial display of countries
displayCountries(countries);