
var playerInterp = d3.interpolateLab("#77070c",  "#002b82")
var enemyInterp = d3.interpolateLab("#f91199", "#00b6ff");

function color(mode, player, value) {
	switch(player+mode) {
		case "playerElimination": 
			return playerInterp(1);
			break;
		case "enemyElimination": 
			return enemyInterp(1);
			break;
		case "playerDeath":
			return playerInterp(0);
			break;
		case "enemyDeath":
			return enemyInterp(0);
			break;		
		case "playerHotspot":
			return value < 0 ? playerInterp(0) : playerInterp(1);
			break;
		case "enemyHotspot":
			return enemyInterp(value);
			break;
	}
	

}

function contextHeat() {
	d3.csv("data/users.csv", function(data) {
		fillSelect("#compareUserSelect", 
			data.filter(function(d) { return d.user != user })
				.map(function(d) { return d.user; })
		);
		
	});
	
}

function drawHeat(user, attack, defense, map, mode) {
	var width = 835,
		height = 817,
		ul_x = 460, ul_y = 61,
		radius = 7,
		centerVal = .3, edgeVal = .6;
	var dx = radius * 2 * Math.sin(Math.PI / 3),
		dy = radius * 1.5;
	
	var hexData = {Elimination: {}, Death: {}, Assist: {}, enemyElimination: {}, enemyDeath: {}, enemyAssist: {}};
	
	function zoomed() {
		container.attr("transform", d3.event.transform);
	}
	
	var zoom = d3.zoom()
	.scaleExtent([.8,3])
	.on("zoom", zoomed);
	
	
	function mouseOver(d) {
		
		if (mode == "Hotspot") {
			var isElim = d3.select("path."+"i"+d.i+"j"+d.j).classed("Elimination"),
				isDeath = d3.select("path."+"i"+d.i+"j"+d.j).classed("Death");
			
			if (isElim || isDeath) {
				var subMode = isElim ? "Elimination" : "Death";
				var node = hexData[subMode]["i"+d.i+"j"+d.j]
				if (node) {
					var totals = {};
					var chain = node.chain;
					for (var i = 0; i < chain.length; i++) {
						var weight = chain[i].count;
						var array = chain[i].array;
						
						for (var j = 0; j < array.length; j++) {
							var l = array[j];
							if (!totals[l]) {
								totals[l] = {count: 1};
							}
							totals[l].count *= hexData["enemy"+subMode][l].count*weight;
						}
					}
					
					for (path in totals) {
						d3.select("path."+path)
								.attr("opacity", 1 - totals[path].count)
								.attr("fill", color(subMode, "enemy"));
					}
				}
			}
		}
		else {
			var node = hexData[mode]["i"+d.i+"j"+d.j]
			if (node) {
				var totals = {};
				var chain = node.chain;
				
				for (var i = 0; i < chain.length; i++) {
					var weight = chain[i].count;
					var array = chain[i].array;
					
					for (var j = 0; j < array.length; j++) {
						var l = array[j];
						if (!totals[l]) {
							totals[l] = {count: 1};
						}
						totals[l].count *= hexData["enemy"+mode][l].count*weight;
					}
				}
				
				for (path in totals) {
					d3.select("path."+path)
							.attr("opacity", 1 - totals[path].count)
							.attr("fill", color(mode, "enemy"));
				}
			}	
		}
	}
	
	function mouseOut(d) {
		if (mode == "Hotspot") {
			var dom = d3.select("path."+"i"+d.i+"j"+d.j)
			
			var isElim = dom.classed("Elimination"),
				isDeath = dom.classed("Death");
			
			if (isElim || isDeath) {
				var subMode = isElim ? "Elimination" : "Death";
			
				var node = hexData[subMode]["i"+d.i+"j"+d.j]
			
				if (node) {
					var chain = node.chain;
					
					for (var i = 0; i < chain.length; i++) {
						var array = chain[i].array;
						
						for (var j = 0; j < array.length; j++) {
							var l = array[j];
							
							if (hexData["Death"][l] || hexData["Elimination"][l]) {
								var path = d3.select("path."+l);
								var elimValue = path.attr("elimValue");
								var deathValue = path.attr("deathValue");
						
								path.attr("opacity", Math.abs(elimValue - deathValue))
									.attr("fill", color(mode, "player", elimValue - 2*deathValue));
							}
							else {
								d3.select("path."+l).attr("fill", "none");
							}
						}
					}
				}
			}
		}
		else {
			var node = hexData[mode]["i"+d.i+"j"+d.j]
			
			if (node) {
				var chain = node.chain;
				
				for (var i = 0; i < chain.length; i++) {
					var array = chain[i].array;
					
					for (var j = 0; j < array.length; j++) {
						var l = array[j];
						
						if (hexData[mode][l]) {
							d3.select("path."+l)
								.attr("opacity", function(d) { return (1 - hexData[mode][l].count)})
								.attr("fill", color(mode, "player"));
						}
						else {
							d3.select("path."+l).attr("fill", "none");
						}
					}
				}
			}
		}
	}
	
	
	var topology = hexTopology(radius, width, height);

	var projection = hexProjection(radius);

	var path = d3.geoPath()
		.projection(projection);

	var svg = d3.select("#graph").append("svg")
		.attr("width" , "100%")
		.attr("height", "100%")
		
	svg.append("svg:image")
		.attr("height", 938)
		.attr("width", 1916)
		.attr("xlink:href","maps/Hanamura.jpg");	

	var container = svg.append("g").attr("class", "container").attr("transform", "translate(" + ul_x + "," + ul_y + ")");
	
	var hexes = container.append("g")
		.attr("class", "hexagon")
		.selectAll("path")
		.data(topology.objects.hexagons.geometries).enter();
		
	hexes.append("path")
		.attr("d", function(d) { return path(topojson.feature(topology, d)); })
		.attr("class", function(d) { return "i"+d.i+"j"+d.j; })
		.on("click", function(d) { console.log(d); })
		.on("mouseover", mouseOver)
		.on("mouseout", mouseOut);
		
		
	container.append("path")
		.datum(topojson.mesh(topology, topology.objects.hexagons))
		.attr("class", "mesh")
		.attr("d", path);
		

	
	d3.csv("data/"+user+"/data.csv", function(data) {
		if(!attack || !defense) {
			data = data.filter(function (d) { return d["side"] == (attack ? "Attack" : "Defense"); });
		}
		
		data.map(function(d) {
			var h = hexData[d.mode];
			var enemyH = hexData["enemy"+d.mode]
			
			var playerLoc = d["playerLocation"].split("x").map(function(b) { return parseInt(b); });
			var enemyLoc = d["enemyLocation"].split("x").map(function(b) { return parseInt(b); });
			
			var playerHex = selectHex(playerLoc[0] - ul_x, playerLoc[1] - ul_y, radius, centerVal, edgeVal);
			var enemyHex = selectHex(enemyLoc[0] - ul_x, enemyLoc[1] - ul_y, radius, centerVal, edgeVal);
			
			var links = [];
			for (var i = 0; i < enemyHex.length; i++) {
				var e = enemyHex[i]
				if (!enemyH[e.selector]) {
					enemyH[e.selector] = {count: 1};
				}
				enemyH[e.selector].count *= e.count;
				
				links.push(e.selector);
				
			}
			
			for(var i = 0; i < playerHex.length; i++) {
				var p = playerHex[i];
				if (!h[p.selector]) {
					h[p.selector] = {count: 1, chain: []};
				}
				h[p.selector].chain.push({count: p.count, array: links});
				h[p.selector].count *= p.count;
			}
		});
		
		if (mode == "Hotspot") {
			var intersect = intersection(hexData["Death"], hexData["Elimination"]);
			
			for (elim in hexData["Elimination"]) {
				var value = 1 - hexData["Elimination"][elim].count
				d3.select("path."+elim)
					.attr("opacity", value)
					.attr("elimValue", value)
					.attr("fill", color(mode, "player", value))
					.classed("Elimination", true)
					.classed("Death", false);
			}
			
			
			for (death in hexData["Death"]) {
				
				var value = 1 - hexData["Death"][death].count;
				d3.select("path."+death)
					.attr("opacity", value)
					.attr("deathValue", value)
					.attr("fill", color(mode, "player", -value))
					.classed("Death", true)
					.classed("Elimination", false);
			}
			for (var i = 0; i < intersect.length; i++) {
				var x = intersect[i];
				
				var elimValue = d3.select("path."+x).attr("elimValue");
				var deathValue = d3.select("path."+x).attr("deathValue");
				var value = elimValue - 2*deathValue;
				d3.select("path."+x)
					.attr("opacity", Math.abs(elimValue - deathValue))
					.attr("fill", color(mode, "player", value));
					
				
			}
			
			
		}
		else {
			for (path in hexData[mode]) {
				d3.select("path."+path)
					.attr("opacity", 1 - hexData[mode][path].count)
					.attr("fill", color(mode, "player"));
			}
		}
	});
}

function intersection(o1, o2) {
    return Object.keys(o1).filter({}.hasOwnProperty.bind(o2));
}

function hexTopology(radius, width, height) {
	var dx = radius * 2 * Math.sin(Math.PI / 3),
		dy = radius * 1.5, // height of hex
		m = Math.ceil((height + radius) / dy) + 1, // vertical hexagon count (hide edges)
		n = Math.ceil(width / dx) + 1, // horizontal hexagon count (hide edges)
		geometries = [],
		arcs = [];
		
	for (var j = -1; j <= m; ++j) {
		for (var i = -1; i <= n; ++i) {
			var y = j * 2,
				x = (i + (j&1) / 2) * 2;
				arcs.push([[x, y-1], [1, 1]], [[x + 1, y], [0, 1]], [[x + 1 , y + 1], [-1, 1]]);
		}
	}
	
	for ( var j = 0, q = 3; j < m; ++j , q += 6) {
		for ( var i = 0; i < n; ++i, q+= 3) {
			geometries.push({
				type: "Polygon",
				arcs: [[q, q + 1, q + 2, ~(q + (n + 2 - (j & 1)) * 3), ~(q - 2), ~(q - (n + 2 + (j & 1)) * 3 + 2)]],
				fill: false,
				j: j,
				i: i
			});
		}	
	}
	
	return {
		transform: {translate: [0, 0], scale: [1, 1]},
		objects: {hexagons: {type: "GeometryCollection", geometries: geometries}},
		arcs: arcs
	};
}

function hexProjection(radius) {
	var dx = radius * 2 * Math.sin(Math.PI / 3),
		dy = radius * 1.5;
		
	return {
		stream: function(stream) {
			return {
				point: function(x, y) { stream.point(x * dx / 2, (y - (2 - (y & 1)) / 3) * dy / 2); },
				lineStart: function() { stream.lineStart(); },
				lineEnd: function() { stream.lineEnd(); },
				polygonStart: function() { stream.polygonStart(); } ,
				polygonEnd: function() { stream.polygonEnd(); }
			};
		}
	}
}

function selectHex(x, y, radius, centerVal, edgeVal) {
	 var ret = []
	 var ids = hexIndex(x,y,radius);
	 for (var i = -1; i < 2; i++) {
		for (var j = -1; j < 2; j++) {
			// HACK:
			if (isEven(ids.j - 1)) {
				if (!((i == 1 && j == -1) || (i == 1 && j == 1))) {
					ret.push({selector: "i"+(ids.i+i)+"j"+(ids.j+j), count: (!i && !j) ? centerVal : edgeVal});
				}
			} 
			else {
				if (!((i == -1 && j == -1) || (i == -1 && j == 1))) {
					ret.push({selector: "i"+(ids.i+i)+"j"+(ids.j+j), count: (!i && !j) ? centerVal : edgeVal});
				}
			}
			
		} 
	 }
	 return ret;
}

function hexIndex(x, y, radius) {
	var dx = radius * 2 * Math.sin(Math.PI / 3),
		dy = radius * 1.5;
		
	var i_a = (x - radius)/dx;
	var i_b = (x + radius)/dx;
	var j_a = (y + .5*radius)/dy;
	var j_b = (y + 2.5*radius)/dy;
	//return {i: Math.ceil(i_a), j: Math.ceil(j_a)}
	return {i: (i_a - Math.ceil(i_a)) < (i_b - Math.floor(i_b)) ? Math.ceil(i_a) : i_b >> 0, j: (j_a - Math.ceil(j_a)) < (j_b - Math.floor(j_b)) ?  Math.ceil(j_a) : j_b >> 0};
	
}

function isEven(n) {
	return n === 0 || !!(n && !(n%2));
}	