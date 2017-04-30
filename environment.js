var defense = true;
var attack = false;
var user = "darn42";
var map = [{name: "Hanamura", active: true}];
var hero = {Genji: true};
var mode = "Eliminations";
var style = "Aggregate"
var tab = "visualisations";

var styles = [
		{name: "Aggregate", modes: true},
		{name: "Heat", modes: true},
		{name: "Point", modes: true},
		{name: "Input", modes: false},
		{name: "Hotspot", modes: true},
		{name: "ProCompare", modes: true}]

draw();

function setTitle() {
	document.getElementById("title").innerHTML =  map.reduce(function(acc, d) { return acc + d.active ? d.name + " " : "" }, "") + (!attack || !defense ? (attack ? "Attack" : "Defense") : "") + " " + mode;
}

function switchTabs(event, newTab) {
	
		document.getElementById(tab+"Button").classList.remove("active")
		document.getElementById(newTab+"Button").classList.add("active")
		document.getElementById(tab).classList.remove("active");
		document.getElementById(newTab).classList.add("active");
		
		if(event)
			event.currentTarget.classList.add("active");
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
	document.getElementById(style).classList.remove("active");
	document.getElementById(newStyle).classList.add("active");
	style = newStyle;
	erase();
	draw();
}


function erase() {
	d3.select("#graph").select("svg").remove();
}

function draw() {
	if (style == "Point") {
		drawPoints(attack, defense, map, mode);  // pointMap.js
	}
	else if (style == "Heat") {
		drawHeat(attack, defense, map, mode);  // heatMap.js
	}
	else if (style == "Aggregate") {
		drawAggregate(attack, defense, map, mode);  // aggregate.js	
	}
	else if (style == "Input") {
		drawInput(user, map);
	}

	setTitle()
}