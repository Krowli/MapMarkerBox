// ***********************************************
mapboxgl.accessToken =
	"pk.eyJ1IjoibWtvemFrMDEwOCIsImEiOiJjamljeGF4Y3MwNGZrM3BvNmMxd2hsY2wzIn0.ErvzY580HhOEokFZR1GOTg";
// ***********************************************
let monument = [-77.038659, 38.931567];
let map = new mapboxgl.Map({
	container: "map",
	style: "mapbox://styles/mapbox/dark-v10",
	center: monument,
	zoom: 15
});
/**
 * My geolocation
 */
map.addControl(
	new mapboxgl.GeolocateControl({
		positionOptions: {
			enableHighAccuracy: true
		},
		trackUserLocation: true
	})
);
let description = `

						          <p>
						            <a class="color" id="black" data-color="black" data-number="zero"></a>
						            <a class="color" id="gray" data-color="gray" data-number="one"></a>
						            <a class="color" id="red" data-color="red" data-number="two"></a>
						            <a class="color" id="orange" data-color="orange" data-number="three"></a>
						            <a class="color" id="lime" data-color="lime" data-number="four"></a>
						            <a class="color" id="green" data-color="green" data-number="five"></a>
						            </p>
						          <div class="wrapper--center"><a id="remove-marker">Remove</a></div>
						        `;
let json = {
	type: "FeatureCollection",
	features: []
};
let elementsPlaces = [];
let isDraggable = false;

let dragged = (isDraggableBool, color) => {
	document.querySelector(".fa-hand-rock-o").style.color = color;

	elementsPlaces.forEach(element => {
		element.marker.setDraggable(isDraggableBool);
		element.marker.on("dragend", function() {
			element.el.setAttribute("lng", this.getLngLat().lng);
			element.el.setAttribute("lat", this.getLngLat().lat);
		});
	});
	isDraggable = !isDraggable;
};

let createMarkerWithPopup = elem => {
	var el = document.createElement("div");

	var gu = {
		lat: elem.geometry ? elem.geometry.coordinates[1] : elem.lngLat.wrap().lat,
		lng: elem.geometry ? elem.geometry.coordinates[0] : elem.lngLat.wrap().lng
	};

	el.className += "places";
	var clearMarker = document.querySelector(".total");
	el.setAttribute(
		"lng",
		elem.geometry ? elem.geometry.coordinates[0] : elem.lngLat.wrap().lng
	);
	el.setAttribute(
		"lat",
		elem.geometry ? elem.geometry.coordinates[1] : elem.lngLat.wrap().lat
	);
	if (elem.geometry) {
		el.style.backgroundColor = elem.geometry.color;
		el.setAttribute("data-numberc", colorName(elem.geometry.color));
	}

	clearMarker.innerHTML = Number(clearMarker.innerHTML) + 1;
	/* 0 – black, 1 – gray, 2 – red, 3 – orange, 4 – lime, 5 – green */

	var marker = new mapboxgl.Marker(el).setLngLat(gu).addTo(map);
	elementsPlaces.push({
		marker: new mapboxgl.Marker(el).setLngLat(gu).addTo(map),
		el: el
	});

	updateMap();
	counterColor();
	el.addEventListener("click", function(e) {
		e.stopPropagation();

		// remove second popup
		if (document.getElementsByClassName("mapboxgl-popup").length) {
			removeElementsByClass("mapboxgl-popup");
		}
		// create popup

		new mapboxgl.Popup()
			.setLngLat({
				lng: el.getAttribute("lng"),
				lat: el.getAttribute("lat")
			})
			.setHTML(description)
			.addTo(map);

		//event for remove popup and marker
		document
			.getElementById("remove-marker")
			.addEventListener("click", function(e) {
				e.preventDefault();
				marker.remove();
				removeElementsByClass("mapboxgl-popup");
				counterColor();
				delete this;
			});

		//change color marker
		var color = document.querySelectorAll(".color");
		Object.entries(color).map(object => {
			object[1].addEventListener("click", function() {
				el.style.backgroundColor = this.getAttribute("data-color");
				el.setAttribute(
					"data-numberc",
					colorName(
						window.getComputedStyle(this).getPropertyValue("background-color")
					)
				);
				counterColor();
			});
		});
	});
};
document.getElementById("dragged").addEventListener("click", function(e) {
	if (isDraggable) {
		dragged(false, "black");
	} else {
		dragged(true, "red");
	}
});
/**
 * Load map
 */
map.on("load", function() {
	// Change the cursor to a pointer when the mouse is over the places layer.
	map.resize();
	map.on("click", function(e) {
		if (!isDraggable) {
			createMarkerWithPopup(e);
		}
	});

	/**
	 * Show coordinates mouse when you move
	 */
	map.on("mousemove", function(e) {
		document.getElementById("info").innerHTML =
			// e.point is the x, y coordinates of the mousemove event relative
			// to the top-left corner of the map
			JSON.stringify(e.point) +
			"<br />" +
			// e.lngLat is the longitude, latitude geographical position of the event
			JSON.stringify(e.lngLat.wrap());
	});
	map.on("mouseenter", "places", function() {
		map.getCanvas().style.cursor = "pointer";
	});

	// Change it back to a pointer when it leaves.
	map.on("mouseleave", "places", function() {
		map.getCanvas().style.cursor = "";
	});
});

/**
 * Event for button Export for download GeoJson data
 */
document.getElementById("export").addEventListener("click", function(e) {
	updateMap();
	var convertedData =
		"text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(json));

	// Create export
	document
		.getElementById("export")
		.setAttribute("href", "data:" + convertedData);

	document.getElementById("export").setAttribute("download", "data.geojson");
});
/**
 * Function for add new Markers with configuration
 */
document.getElementById("load").addEventListener("change", e => {
	var files = document.getElementById("load").files;
	let index = files[0].name.split(".").length - 1;
	let type = files[0].name.split(".");

	if (files.length <= 0) {
		return false;
	}

	var fr = new FileReader();
	if (type[index] === "geojson") {
		fr.onload = function(e) {
			var result = JSON.parse(e.target.result);
			var formatted = JSON.stringify(result, null, 2); // to string json
			document.getElementById("result").value = formatted;
			document.querySelector(".container--right").style.display = "flex";

			result.features.forEach(element => {
				createMarkerWithPopup(element);
			});
		};

		fr.readAsText(files.item(0));
	} else {
		alert("Upload geojson file");
		return false;
	}
});
/**
 * Add/Update all Markers to the map
 */
function updateMap() {
	json.features = [];
	var places = document.querySelectorAll(".places");
	places.forEach(element => {
		let color = element.style.backgroundColor;
		json.features.push(
			JSON.parse(
				`{"id":"${Number(Math.random() * 200000)}","type":
				"Feature",
				"properties":{},
				"geometry":
				{
					"coordinates":[${element.getAttribute("lng")},${element.getAttribute("lat")}],
					"type":"Point",
					"color": "${color}"
				}
			}`
			)
		);
	});
}

/**
 * counterColor how many colors
 */
function counterColor() {
	var places = document.querySelectorAll(".places");
	var counter = document.querySelectorAll(".count");
	/// O(n2)
	for (let x = 1; x < counter.length; x++) {
		var sum = 0;
		for (let y = 0; y < places.length; y++) {
			if (
				counter[x].getAttribute("data-pcount") ==
				places[y].getAttribute("data-numberc")
			) {
				sum += 1;
			}
		}
		counter[x].innerHTML = sum;
	}
	document.querySelector(".total").innerHTML = document.querySelectorAll(
		".places"
	).length;
}

/**
 * remove all element by class name
 * @param {String} className
 */
function removeElementsByClass(className) {
	var elements = document.getElementsByClassName(className);
	while (elements.length > 0) {
		elements[0].parentNode.removeChild(elements[0]);
	}
}

/* 0 – black, 1 – gray, 2 – red, 3 – orange, 4 – lime, 5 – green */

/**
 * Return number of color
 * @param {String} color
 */
function colorName(color) {
	switch (color) {
		case "rgb(0, 0, 0)":
		case "black":
			return "zero";
			break;
		case "rgb(128, 128, 128)":
		case "gray":
			return "one";
			break;
		case "rgb(255, 0, 0)":
		case "red":
			return "two";
			break;
		case "rgb(255, 165, 0)":
		case "orange":
			return "three";
			break;
		case "rgb(0, 255, 0)":
		case "lime":
			return "four";
			break;
		case "rgb(0, 128, 0)":
		case "green":
			return "five";
			break;

		default:
			return "total";
			break;
	}
}
