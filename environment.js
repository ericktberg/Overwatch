var defense = true;
var attack = false;
var user = "ShadowBurn";
var map = "Hanamura";
var maps = {"Hanamura": {url: "maps/Hanamura.jpg", width: 1916, height: 938}};
var hero = {Genji: true};
var mode = "Elimination";
var style = "Aggregate";
var tab = "visualisations";

var styles = 
		{"Aggregate": {modes: true, contextual: true, selectable: true},
		 "Heat": {modes: true, contextual: true, selectable: true},
		 "Point": {modes: true, selectable: true},
		 "Input": {},
		 "Hotspots": {},
		 "ProCompare": {modes: true}};


draw();

function setTitle() {
	document.getElementById("title").innerHTML =  map + " " + mode;
}

function switchTabs(newTab) {
		document.getElementById(tab+"Button").classList.remove("active")
		document.getElementById(newTab+"Button").classList.add("active")
		
		document.getElementById(tab == "selected" ? style+"Selected" : tab).classList.remove("active");
		document.getElementById(newTab == "selected" ? style+"Selected" : newTab).classList.add("active");
		

		tab = newTab;
}

function toggleAttack() {
	if (defense && attack) {
		document.getElementById("Attack").classList.remove("active");
		attack = false;
		setTitle();
		erase();
		draw();
	}
	else if(!attack) {
		document.getElementById("Attack").classList.add("active");
		attack = true;
		setTitle();
		erase();
		draw();
	} else {
		document.getElementById("Attack").classList.remove("active");
		document.getElementById("Defense").classList.add("active");
		attack = false;
		defense = true;
		setTitle();
		erase();
		draw();
	}
	
}

function toggleDefense() {
	
	if (defense && attack) {
		document.getElementById("Defense").classList.remove("active");
		defense = false;
		setTitle();
		erase();
		draw();
	}
	else if(!defense) {
		document.getElementById("Defense").classList.add("active");
		defense = true;
		setTitle();
		erase();
		draw();
	} else {
		document.getElementById("Attack").classList.add("active");
		document.getElementById("Defense").classList.remove("active");
		attack = true;
		defense = false;
		setTitle();
		erase();
		draw();
	}
}

function changeMap(newMap) {
	map = newMap;
}

function setMode(newMode) {
	document.getElementById(mode).classList.remove("active");
	document.getElementById(newMode).classList.add("active");
	mode = newMode;
	setTitle();
	erase();
	draw();
}

function setStyle(newStyle) {
	if (style && styles[style].selectable)
		document.getElementById(style).classList.remove("active");
	if (styles[newStyle].selectable)
		document.getElementById(newStyle).classList.add("active");
	
	
	style = newStyle;
	if (styles[style].contextual)
		switchTabs('selected');
	erase();
	draw();
	
	
}


function erase() {
	d3.select("#graph").select("svg").remove();
}

function draw() {
	if (style == "Point") {
		drawPoints(user, attack, defense, map, mode);  // pointMap.js
	}
	else if (style == "Heat") {
		drawHeat(user, attack, defense, map, mode);  // heatMap.js
	}
	else if (style == "Aggregate") {
		drawAggregate(user, attack, defense, map, mode);  // aggregate.js	
	}
	else if (style == "Input") {
		drawInput(user, map);  // input.js
	} 
	else if (style == "Hotspots") {
		drawHotspots(user, attack, defense, map);  //heatHotspots.js
	}

	setTitle()
}