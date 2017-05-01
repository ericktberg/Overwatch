function drawAggregate(user, attack, defense,map,mode) {
			
	var dataMin = Infinity,
		dataMax = 0;
	var selectedNode;
	var width = window.innerWidth*.8;
	var height = window.innerHeight;
	
	function zoomed() {
		container.attr("transform", d3.event.transform);
	}
	var zoom = d3.zoom()
		.scaleExtent([1,2])
		.on("zoom", zoomed);
		
	function hovered(hover) { 
		return function(d) { 
			d3.selectAll(d.ancestors().map(function(d) { return d.node; }))
				.select("circle")
				.classed("hoverNode", hover);
		}
	}
	
	/* Create pie charts */
	var radius = 120;
	var pie = d3.pie()
		.sort(null)
		.value(function(d) { return d.value; });
	var path = d3.arc()
		.outerRadius(radius-10)
		.innerRadius(0);
	function pieChart(data) {
		
		var svg = d3.select("#selectedGraph").append("svg").attr("width", 2*radius).attr("height", 2*radius);
		var g = svg.append("g").attr("transform", "translate(" + radius + "," + radius + ")")
		var arc = g.selectAll(".arc")
			.data(pie(data))
			.enter().append("g")
			.attr("class", "arc");
		
		arc.append("path")
			.attr("d", path)
			.attr("class", function(d) { return d.data.name; });
			
		arc.append("title")
			.text(function(d) { return d.data.name; });
	}
	
	/* 	on click there is a new selected element.
		Describe the data and create a pie chart with appropriate title. */
	function clicked(d, i) {
		if (d3.event.defaultPrevented) return;
				
		if(selectedNode) {
			selectedNode.classed("selectedNode", false);
		}
		selectedNode = d3.select(d.node).select("circle");
		selectedNode.classed("selectedNode", true);
		
		switchTabs("selected");
		
		d3.select("#selectedGraph").select("svg").remove();
		
		d3.select("#selectedInfo").selectAll("text").remove();
		
		
		
		var info = d3.select("#selectedInfo");
		
		if(d.depth == 0) {
			info.append("text").attr("class", "subtitle")
				.text("Use Percentage");
		}
		else {
			var percent = Math.round(d.data.value / d.parent.data.children.reduce(function(acc, d) { return d.value + acc; }, 0) * 1000, 1) / 10

			if (mode == "Elimination") {
				if(d.depth == 1) {
					info.append("text").attr("class", "info")
						.text("You used " + d.data.name + " " + percent + "% of the time.");
					info.append("text").attr("class", "subtitle")
						.text(d.data.name + " Eliminated");
				}
				else if(d.depth == 2) {
					info.append("text").attr("class", "info")
						.text(d.parent.data.name + " Eliminated " + d.data.name + " " + percent + "% of the time.");
					
					info.append("text").attr("class", "subtitle")
						.text("Assisting Characters");
				}
				else if (d.depth == 3) {
					info.append("text").attr("class", "info")
						.text(d.data.name + " helps " + d.parent.parent.data.name + " Eliminate " + d.parent.data.name + " " + percent + "% of the time.");
				}
			} 
			else if (mode == "Death") {
				if(d.depth == 1) {
					info.append("text").attr("class", "info")
						.text("You used " + d.data.name + " " + percent + "% of the time.");
					info.append("text").attr("class", "subtitle")
						.text(d.data.name + " Died to");
				}
				else if(d.depth == 2) {
					info.append("text").attr("class", "info")
						.text(d.parent.data.name + " was Eliminated by " + d.data.name + " " + percent + "% of the time.");
					
					info.append("text").attr("class", "subtitle")
						.text("Assisting Characters");
				}
				else if (d.depth == 3) {
					info.append("text").attr("class", "info")
						.text(d.data.name + " helped " + d.parent.data.name + " Eliminate " + d.parent.parent.data.name + " " + percent + "% of the time.");
				}
			}
				
		}
		if (d.depth < 3) {
			pieChart(d.data.children);
		}
	}
		
	var svg = d3.select("#graph").append("svg")
		.attr("width", width)
		.attr("height", height)
		.call(zoom);
		
	var container = svg.append("g").attr("id", "container")
	zoom.translateBy(svg, width*.25, height/2 - 300);
			
	
	var pack = d3.pack()
		.size([600, 600])
		.padding(10);
		
	d3.csv("data/"+user+"/data.csv", function(data) {
		if(!attack || !defense) {
			data = data.filter(function (d) { return (d["side"] == (attack ? "Attack" : "Defense"))});
		}
		data = data.filter(function (d) { return  d["mode"] == mode; });
		
		var nodes = {name: mode, children: []};
		
		data.map(function(d) {
					
			var node = nodes;
			var array = nodes.children;
			var idx;
			
			idx = f(d.playerCharacter, array, 2);
			node = node.children[idx];
			array = node.children;
			node.value += 1;
			
			idx = f(d.opposingCharacter, array, 1);
			node = node.children[idx];
			array = node.children;
			node.value += 1;
			
			d.assistCharacter = d.assistCharacter == "" ? "Solo" : d.assistCharacter;
			idx = f(d.assistCharacter, array, 0);
			node = node.children[idx];
			array = node.children;
			node.value += 1;
		});
		
		function f(n, array, d) { 
			var idx; 
			
			array.map(function(d,i) { if(d.name == n) idx = i; })
			if(idx == undefined) {
				idx = array.length;
				array.push({name: n, value: 0, children: [], depth: d});
			}
			
			return idx;
		}
		
		function sortRecursive(array) {
			if (array.length > 0) {
				array = array.sort(function(a,b) { return b.value - a.value; })
				array.map(function(d) {
					sortRecursive(d.children)
				});
			}
			else {
				return;
			}
		}
		
		sortRecursive(nodes.children);
			
		var root = d3.hierarchy(nodes)
			.sum(function(d) { return d.value; })
			
		dataMin = 1;
		dataMax = root.value;
		
		pack(root);
		
		var node = container.selectAll(".node")
			.data(root.descendants().filter(function(d) { return d.data.name != "Solo" && d.data.name != "Team"; }))
			.enter().append("g")
			.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
			.each(function(d) { d.node = this; })
			.on("mouseover", hovered(true))
			.on("mouseout", hovered(false))
			.on("click", clicked);
		
		node.append("title").text(function(d) { return d.data.name + " " + d.data.value; });
		
		node.append("circle")
			.attr("class", function(d) { return d.data.name + " node" })
			.attr("r", function(d) { return d.r; })
	});
	
	var legend = d3.select("#legend").append("svg");
	
	legend.selectAll("text")
		.data(characters)
		.enter().append("text")
		.attr("x", function(d, i) { return 0; })
		.attr("y", function(d,i) { return i*50; })
		.text(function(d) { return d; });
	
}