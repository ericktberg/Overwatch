 function drawPoints(attack, defense, map, mode) {
	function mouseOver() { 
		return function(d, i) { 
			d3.selectAll(".Avatar").filter(function (d,u) { return u == i; }).attr("r",function (d) { return 10; });
			d3.selectAll(".Opposing").filter(function (d,u) { return u == i; }).attr("width", 15).attr("height", 15);
		}
	}

	function mouseOut() { 
	console.log(d3.selectAll("rect"));
		return function(d, i) { 
			d3.selectAll(".Avatar").filter(function (d,u) { return u == i; }).attr("r",function (d) { return 7.5; });
			d3.selectAll(".Opposing").filter(function (d,u) { return u == i; }).attr("width", 10).attr("height", 10)
		}
	}
	
	function zoomed() {
	console.log("Zoom");
	container.attr("transform", d3.event.transform);
	}
	
	var zoom = d3.zoom()
	.scaleExtent([.8,3])
	.on("zoom", zoomed);
	
	var path = d3.path();
	
	var svg = d3.select("#graph").append("svg")
		.attr("width","100%")
		.attr("height","100%")
		.call(zoom);
		
	var container = svg.append("g").attr("id","container");
		
	d3.csv("data/"+mode+".csv", function(data) {
		if(!attack || !defense) {
			data = data.filter(function (d) { return d["Type"] == (attack ? "Attack" : "Defense"); });
		}
		
		
		console.log(data);
		
		var first = container.selectAll(".node")
			.data(data)
			.enter().append("g")
			.attr("transform", function(d) {
				console.log(d.Type);
				var res = d["Location " + d.Type].split("x");
				return "translate(" + res[0] + "," + res[1] + ")";
			})
			.each(function(d) { d.node = this; })
			.on("mouseover", mouseOver())
			.on("mouseout", mouseOut());
			
		var second = container.selectAll("node")
			.data(data)
			.enter().append("g")
			.attr("transform", function(d) {
				var res = d["Location " + (d.Type == "Defense" ? "Attack" : "Defense")].split("x");
				return "translate(" + (res[0] - 5)+ "," + (res[1] - 5) + ")";
			})
			.on("mouseover", mouseOver())
			.on("mouseout", mouseOut());
			
		first.append("circle")
			.attr("r", function(d) { return 7.5; })
			.attr("class", function(d) { return "Avatar " + d["Character"] })
			;
			
		second.append("rect")
			.attr("height", function(d) { return 10; })
			.attr("width", function(d) { return 10; })
			.attr("class", function(d) { return "Opposing " + d["Opposing"] });
	});

	container.append("svg:image")
		.attr("height", 938)
		.attr("width", 1916)
		.attr("xlink:href","maps/Hanamura.jpg");
}
