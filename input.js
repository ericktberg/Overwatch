var loc;
var state;
var lastCircle, lastRect;

function nextLocation(newLoc) {
	loc = newLoc;
}

function avatarChange() {
	var m = getRadioValue("mode");
	var value;
	if (m == "Death") {
		value = document.getElementById("opposingSelect").value;
	} else {
		value = document.getElementById("avatarSelect").value;
	}
	
	
	d3.select("#methodSelect").selectAll("option").remove();
	
	d3.select("#methodSelect").selectAll("option")
		.data(methodArray(characters.filter(function(d) { return d.name == value; })[0]))
		.enter().append("option")
		.attr("value",function(d) { return d; })
		.text(function(d) { return d; });	
}

function saveForm() {
	var user = document.getElementById("username").value;
	var map2 = document.getElementsByClassName("mapButton active")[0].id;
	var playerCharacter = document.getElementById("avatarSelect").value;
	var opposingCharacter = document.getElementById("opposingSelect").value;
	var assistCharacter = document.getElementById("assistSelect").value;
	
	var side = getRadioValue("side")
	var mode = getRadioValue("mode")

	var playerLocation = document.getElementById("playerX").value + "x" + document.getElementById("playerY").value;
	var enemyLocation = document.getElementById("enemyX").value + "x" + document.getElementById("enemyY").value;

	console.log(user + " " + map2  + " " +  playerCharacter + " " + opposingCharacter + " " + assistCharacter + " " + side  + " " + mode + " " + playerLocation + " " + enemyLocation);
	
	lastCircle.attr("class", playerCharacter);
	lastRect.attr("class", opposingCharacter);
	
	loc = "player";
	state = {circle: false, rect: false};
	lastCircle = null, lastRect = null;
}

function getRadioValue(name) {
	var radios = document.getElementsByName(name);
	
	for(i = 0; i < radios.length; i++) {
		if(radios[i].checked) {
			return radios[i].value;
		}
	}
}

function methodArray(character) {
	var array = [];
	for (field in character) {
		if (field != "name") {
			array.push(character[field]);
		}
	}
	
	return array;
}

function drawInput(user, map) {
	loc = "player";
	state = {circle: false, rect: false};
	lastCircle = null, lastRect = null;

	d3.select("#avatarSelect").selectAll("option")
		.data(characters.map(function(d) { return d.name; }))
		.enter().append("option")
		.attr("value",function(d) { return d; })
		.text(function(d) { return d; });
	d3.select("#opposingSelect").selectAll("option")
		.data(characters.map(function(d) { return d.name; }))
		.enter().append("option")
		.attr("value",function(d) { return d; })
		.text(function(d) { return d; });
		
	var c = characters.slice();
	c.unshift({name: "Solo"});
	d3.select("#assistSelect").selectAll("option")
		.data(c.map(function(d) { return d.name; }))
		.enter().append("option")
		.attr("value",function(d) { return d; })
		.text(function(d) { return d; });
		
	d3.select("#methodSelect").selectAll("option")
		.data(methodArray(characters[0]))
		.enter().append("option")
		.attr("value",function(d) { return d; })
		.text(function(d) { return d; });	
	
	function zoomed() {
		container.attr("transform", d3.event.transform);
	}
	
	var zoom = d3.zoom()
	.scaleExtent([.8,3])
	.on("zoom", zoomed);
	
	var svg = d3.select("#graph").append("svg")
		.attr("width","100%")
		.attr("height","100%")
		.call(zoom);
		
	var clicked = function() {
			var mouse = d3.event; 
			var transform = container.attr("transform")
			var locationX = mouse.layerX, locationY = mouse.layerY;
			if (transform) {
				transform = getTransformation(transform);
				locationX = Math.round(mouse.layerX/transform.scaleX - (transform ? transform.translateX/transform.scaleX : 0));
				locationY = Math.round(mouse.layerY/transform.scaleY - (transform ? transform.translateY/transform.scaleY : 0));
			}
			document.getElementById(loc + "X").value = locationX;
			document.getElementById(loc + "Y").value = locationY;
			
			
			if (loc == "player") {
				if (state.circle) {
					lastCircle.attr("transform", "translate(" + locationX + "," + locationY + ")");
				} else {
					lastCircle = container.append("circle")
						.attr("r", 7.5)
						.attr("transform", "translate(" + locationX + "," + locationY + ")");
					state.circle = true;
				}
			} 
			else {
				if (state.rect) {
					lastRect.attr("transform", "translate(" + (locationX-5) + "," + (locationY-5) + ")");
				} else {
					lastRect = container.append("rect")
						.attr("height", function(d) { return 10; })
						.attr("width", function(d) { return 10; })
						.attr("transform", "translate(" + (locationX-5) + "," + (locationY-5) + ")");
					state.rect = true;
				}
			}
			nextLocation(loc == "player" ? "enemy" : "player");
			
		
	}
	
	var container = svg.append("g").attr("id","container").on("click", clicked);
	
	container.append("svg:image")
		.attr("height", 938)
		.attr("width", 1916)
		.attr("xlink:href","maps/Hanamura.jpg");
}

/* http://stackoverflow.com/questions/38224875/replacing-d3-transform-in-d3-v4 */
function getTransformation(transform) {
  // Create a dummy g for calculation purposes only. This will never
  // be appended to the DOM and will be discarded once this function 
  // returns.
  var g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  
  // Set the transform attribute to the provided string value.
  g.setAttributeNS(null, "transform", transform);
  
  // consolidate the SVGTransformList containing all transformations
  // to a single SVGTransform of type SVG_TRANSFORM_MATRIX and get
  // its SVGMatrix. 
  var matrix = g.transform.baseVal.consolidate().matrix;
  
  // Below calculations are taken and adapted from the private function
  // transform/decompose.js of D3's module d3-interpolate.
  var {a, b, c, d, e, f} = matrix;   // ES6, if this doesn't work, use below assignment
  // var a=matrix.a, b=matrix.b, c=matrix.c, d=matrix.d, e=matrix.e, f=matrix.f; // ES5
  var scaleX, scaleY, skewX;
  if (scaleX = Math.sqrt(a * a + b * b)) a /= scaleX, b /= scaleX;
  if (skewX = a * c + b * d) c -= a * skewX, d -= b * skewX;
  if (scaleY = Math.sqrt(c * c + d * d)) c /= scaleY, d /= scaleY, skewX /= scaleY;
  if (a * d < b * c) a = -a, b = -b, skewX = -skewX, scaleX = -scaleX;
  return {
    translateX: e,
    translateY: f,
    rotate: Math.atan2(b, a) * 180 / Math.PI,
    skewX: Math.atan(skewX) * 180 / Math.PI,
    scaleX: scaleX,
    scaleY: scaleY
  };
}