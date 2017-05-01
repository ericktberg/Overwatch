function gridData() {
	var data = new Array()
	var xpos = 1, ypos = 1;
	var width = 10, height = 10;
	
	for (var row = 0; row < 93; row++) {
		data.push(new Array());
		
		for (var column = 0; column < 191; column++) {
			data[row].push({
				x: xpos,
				y: ypos,
				width: width,
				height: height,
				fill: "none",
				i: [],
				count: []
			})
			
			xpos += width;
		}			
		
		xpos = 1;
		ypos += height;
	}
	
	return data;
}

function fade(d,i,color,base,x,y, gridData, name) {
	/*  The center of a position (x,y) gets full value of base 
		Reference the index sent here. */
	if(x && y) {
		var el = gridData[y][x];
		el.fill = color;
		el.i.push(i);
		el.count.push(base);
	}
	
	
	for (xpos = -1; xpos <= 1; xpos++) {
		for(ypos = -1; ypos <=1; ypos++) {
			if ((ypos != 0 || xpos != 0)
			&& (y + ypos) in gridData
			&& (x + xpos) in gridData[y + ypos]) 
			{
				var count = 0;
				el = gridData[y + ypos][x + xpos];
				el.fill = color;
				if (xpos && ypos) {
					count += .25 * base;
				}
				if ((!xpos || !ypos) && xpos != ypos) {
					count += .5 * base;
				}
				
				el.i.push(i);
				el.count.push(count);
				el.class = name;

			}
		}
	}
}

function drawHeat(user, attack, defense, map, mode) {
	function zoomed() {
		container.attr("transform", d3.event.transform);
	}
	
	var zoom = d3.zoom()
	.scaleExtent([.8,3])
	.on("zoom", zoomed);
	
	
	function mouseOver() {
		return function(d) {
			d3.select(this).style("stroke", "black").style("stroke-opacity", 1);
			var indices = d.i;
			var counts = d.count;
			prevSelect = d3.selectAll(".Opposing").filter(
				function(b) {
					var check = false;
					for (x = 0; x < indices.length; x++) {
						check |= b.i.indexOf(indices[x]) != -1;
					}
					return check; 
				}).style("fill","red").style("fill-opacity", function(b) { return 2 * opacity(d) * opacity(b); });
		}
	}
	
	function mouseOut() {
		return function(d) {
			d3.select(this).style("stroke", "lightsteelblue").style("stroke-opacity", .4);
			if (prevSelect) {
				prevSelect.style("fill", "none");
				prevSelect = null;
			}
		}
		
	}
	
	var prevSelect = null;
	
	function click() {
	}
	
	function opacity(d) {
		return .4 * d.count.reduce(function(a,b) { return a + b }, 0);
	}
	
	var svg = d3.select("#graph").append("svg")
		.attr("width","100%")
		.attr("height","100%")
		.call(zoom);
		
	var container = svg.append("g").attr("id","container");
	
	container.append("svg:image")
		.attr("height", 938)
		.attr("width", 1916)
		.attr("xlink:href","maps/Hanamura.jpg");
		
		
	d3.csv("data/"+user+"/data.csv", function(data) {
		if(!attack || !defense) {
			data = data.filter(function (d) { return d["side"] == (attack ? "Attack" : "Defense"); });
		}
		data = data.filter(function (d) { return  d["mode"] == mode; });
		data = data.filter(function (d) { return hero[d["playerCharacter"]]; });
		
		
		
		var data1 = gridData();
		var data2 = gridData();
		
		var dataAvatar= data.map(function(d) { return d["playerLocation"]; }); 
		var dataOpposing = data.map(function(d) { return d["enemyLocation"]; });

		dataAvatar.map(function(d,i) { 
			var res = d.split("x").map(function(b) { return Math.floor(b/10) })
			fade(d,i,"blue",1, res[0], res[1], data1, "Heat Avatar");	
		});
		
		dataOpposing.map(function(d,i) {
			var res = d.split("x").map(function(b) { return Math.floor(b/10) })
			fade(d,i, "none", 1,res[0], res[1], data2, "Heat Opposing");
		});
		
		
		data1 = data1.map(function(p) { return p.filter(function(d) { return d.count.length > 0; }) });
		data2 = data2.map(function(p) { return p.filter(function(d) { return d.count.length > 0; }) });
				
		var row = container.append("g").selectAll(".row")
			.data(data1)
			.enter().append("g")
			.attr("class","row");
			
		var column = row.selectAll(".square")
			.data(function (d) { return d; })
			.enter().append("rect")
			.attr("class", "square")
			.attr("x", function(d) { return d.x; })
			.attr("y", function(d) { return d.y; })
			.attr("width", function(d) { return d.width; })
			.attr("height", function(d) { return d.height; })
			.style("stroke-width", ".5px")
			.style("stroke", "lightsteelblue")
			.style("fill", function(d) { return d.fill; })
			.style("fill-opacity", function(d) { 
				return opacity(d);
			})
			.attr("stroke-opacity", .4)
			.attr("class", "Avatar")
			.on("mouseover", mouseOver())
			.on("mouseout", mouseOut())
			.on("click", click())
			.attr("pointer-events", "fill");
			
		var row1 = container.append("g").selectAll(".row")
			.data(data2)
			.enter().append("g")
			.attr("class","row");
			
		var column1 = row1.selectAll(".square")
			.data(function (d) { return d; })
			.enter().append("rect")
			.attr("class", "square")
			.attr("x", function(d) { return d.x; })
			.attr("y", function(d) { return d.y; })
			.attr("width", function(d) { return d.width; })
			.attr("height", function(d) { return d.height; })
			.style("stroke-width", ".5px")
			.style("fill", function(d) { return d.fill; })
			.style("fill-opacity", function(d) { 
				return .4 * d.count.reduce(function(a,b) { return a + b }, 0);
			})
			.attr("class", "Opposing")
			.attr("pointer-events", "none");

		
	});
}

function compare(user, attack, defense, map, mode) {
	
	
	
}

function drawHotspots(user, attack, defense, map) {
function zoomed() {
		container.attr("transform", d3.event.transform);
	}
	
	var zoom = d3.zoom()
	.scaleExtent([.8,3])
	.on("zoom", zoomed);
	
	
	var prevSelect = null;

	function opacity(d) {
		return .4 * d.count.reduce(function(a,b) { return a + b }, 0);
	}
	
	var svg = d3.select("#graph").append("svg")
		.attr("width","100%")
		.attr("height","100%")
		.call(zoom);
		
	var container = svg.append("g").attr("id","container");
	
	container.append("svg:image")
		.attr("height", 938)
		.attr("width", 1916)
		.attr("xlink:href","maps/Hanamura.jpg");
	
	svg.append("g").attr("class", "slider")
		.attr("transform", "translate(" + 600 + "," + 700 + ")"); 
		
		
	d3.csv("data/"+user+"/data.csv", function(data) {
		if(!attack || !defense) {
			data = data.filter(function (d) { return d["side"] == (attack ? "Attack" : "Defense"); });
		}
		data = data.filter(function (d) { return hero[d["playerCharacter"]]; });
			
		var elims = data.filter(function(d) { return d["mode"] == "Elimination" }).map(function(d) { return d["playerLocation"]; });
		var deaths = data.filter(function (d) { return d["mode"] == "Death" }).map(function(d) { return d["playerLocation"]; });
			
		var elimGrid = gridData();
		var deathGrid = gridData();

		elims.map(function(d,i) { 
			var res = d.split("x").map(function(b) { return Math.floor(b/10) })
			fade(d,i,"blue",1, res[0], res[1], elimGrid, "Heat Avatar");	
		});
		
		deaths.map(function(d,i) {
			var res = d.split("x").map(function(b) { return Math.floor(b/10) })
			fade(d,i, "none", 1,res[0], res[1], deathGrid, "Heat Opposing");
		});
		
		console.log(elims);
		console.log(elimGrid);
		
		for (i = 0; i < elimGrid.length; i++) { 
			for (j = 0; j < elimGrid[i].length; j++) {
				var e = elimGrid[i][j];
				var d = deathGrid[i][j];
				var eCount = e.count.reduce(function(a,b) { return a + b }, 0);
				var dCount = d.count.reduce(function(a,b) { return a + b }, 0);
				
				elimGrid[i][j] = {x: e.x, y: e.y, height: e.height, width: e.width, count: .5*eCount - dCount};
			}
		}
		
		elimGrid = elimGrid.map(function(p) { return p.filter(function(d) { return d.count != 0 }) });
				
		var row = container.append("g").selectAll(".row")
			.data(elimGrid)
			.enter().append("g")
			.attr("class","row");
			
		var column = row.selectAll(".square")
			.data(function (d) { return d; })
			.enter().append("rect")
			.attr("class", "square")
			.attr("x", function(d) { return d.x; })
			.attr("y", function(d) { return d.y; })
			.attr("width", function(d) { return d.width; })
			.attr("height", function(d) { return d.height; })
			.style("stroke", "none")
			.style("fill", function(d) { return d.count < 0 ? "black" : "blue" })
			.style("opacity", function(d) { return d.count < 0 ? -d.count : d.count; }); 
	});
}