 function drawPoints(user, attack, defense, map, mode) {
	function mouseOver() { 
		return function(d, i) { 
			d3.selectAll(".Avatar").filter(function (d,u) { return u == i; }).attr("r",function (d) { return 10; });
			d3.selectAll(".Opposing").filter(function (d,u) { return u == i; }).attr("width", 15).attr("height", 15);
		}
	}

	function mouseOut() { 
		return function(d, i) { 
			d3.selectAll(".Avatar").filter(function (d,u) { return u == i; }).attr("r",function (d) { return 7.5; });
			d3.selectAll(".Opposing").filter(function (d,u) { return u == i; }).attr("width", 10).attr("height", 10)
		}
	}
	
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
		
	var container = svg.append("g").attr("id","container");
		
	d3.csv("data/"+user+"/data.csv", function(data) {
		if(!attack || !defense) {
			data = data.filter(function (d) { return d["side"] == (attack ? "Attack" : "Defense"); });
		}
		data = data.filter(function (d) { return  d["mode"] == mode; });
				
		var first = container.selectAll(".node")
			.data(data)
			.enter().append("g")
			.attr("transform", function(d) {
				var res = d["playerLocation"].split("x");
				return "translate(" + res[0] + "," + res[1] + ")";
			})
			.each(function(d) { d.node = this; })
			.on("mouseover", mouseOver())
			.on("mouseout", mouseOut());
			
		var second = container.selectAll("node")
			.data(data)
			.enter().append("g")
			.attr("transform", function(d) {
				var res = d["enemyLocation"].split("x");
				return "translate(" + (res[0] - 5)+ "," + (res[1] - 5) + ")";
			})
			.on("mouseover", mouseOver())
			.on("mouseout", mouseOut());
			
		first.append("circle")
			.attr("r", function(d) { return 7.5; })
			.attr("class", function(d) { return "Avatar " + d["playerCharacter"] })
			;
			
		second.append("rect")
			.attr("height", function(d) { return 10; })
			.attr("width", function(d) { return 10; })
			.attr("class", function(d) { return "Opposing " + d["opposingCharacter"] });
	});

	container.append("svg:image")
		.attr("height", 938)
		.attr("width", 1916)
		.attr("xlink:href","maps/Hanamura.jpg");
}
