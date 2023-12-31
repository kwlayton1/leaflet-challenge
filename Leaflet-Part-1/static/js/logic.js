// Store our API endpoint as queryUrl.
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson";

// Perform a GET request to the query URL/
d3.json(queryUrl).then(function (data) {
  // Once we get a response, send the data.features object to the createFeatures function.
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {
  function onEachFeature(feature, layer) {
    // Create a popup content string that includes depth and magnitude.
    let popupContent = `<h3>${feature.properties.place}</h3><hr>`;
    popupContent += `<p>Date: ${new Date(feature.properties.time)}</p>`;
    popupContent += `<p>Magnitude: ${feature.properties.mag}</p>`;
    popupContent += `<p>Depth: ${feature.geometry.coordinates[2]}</p>`;

    // Bind the popup content to the layer.
    layer.bindPopup(popupContent);
  }

  let earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng, {
        radius: calculateRadius(feature.properties.mag),
        fillColor: getColor(feature.geometry.coordinates[2]),
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8,
      });
    },
  });

  createMap(earthquakes);
}


function createMap(earthquakes) {
  // Create the base layers.
  let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

  let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  // Create a baseMaps object.
  let baseMaps = {
    "Street Map": street,
    "Topographic Map": topo
  };

  // Create an overlay object to hold our overlay.
  let overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load.
  let myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [street, earthquakes]
  });

  // Create a layer control.
  // Pass it our baseMaps and overlayMaps.
  // Add the layer control to the map.
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  let legend = L.control({ position: "bottomright" })

  legend.onAdd = () => {
    let div = L.DomUtil.create("div", "legend");
    div.innerHTML = `
    <div>-10 -10</div>
    <div>10 - 30</div>
    <div>30 - 50</div>
    <div>50 - 70</div>
    <div>70 - 90</div>
    <div> 90 +</div>
  `

    return div;
  }

  legend.addTo(myMap)
}

function calculateRadius(magnitude) {
  // You can adjust the multiplier to control the size of the bubbles.
  return magnitude * 5;
}

function getColor(depth) {
  // You can customize this function to set colors based on depth ranges.
  if (depth < 10) return "#00ff00"; // Green for shallow earthquakes
  else if (depth < 30) return "#ffff00"; // Yellow for moderate depth
  else return "#ff0000"; // Red for deep earthquakes
}

