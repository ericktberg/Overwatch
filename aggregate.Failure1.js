function drawAggregate(side,map,mode) {
			
	var dataMin = Infinity,
		dataMax = 0;
			
	var svg = d3.select("#graph").append("svg")
		.attr("width", 1920)
		.attr("height", 1080);
		
	var width = svg.attr("width");
	var height = svg.attr("height");
	
	console.log(width);
		
	var container = svg.append("g").attr("id", "container");
	function click() {
		return function(d) {

			console.log(d3.select(d));
		}
	}
	
	var simulation = d3.forceSimulation()
		.force("link", d3.forceLink().id(function(d) { return d.name; }))
		.force("charge", d3.forceManyBody().strength(function(d) { return -Math.pow(nodeSize(d, dataMin, dataMax),2); }))
		.force("center", d3.forceCenter(width/2, height/2));

	function dragstarted(d) {
		if (!d3.event.active) simulation.alphaTarget(0.3).restart();
		d.fx = d.x;
		d.fy = d.y;
	}

	function dragged(d) {
		d.fx = d3.event.x;
		d.fy = d3.event.y;
	}

	function dragended(d) {
		if (!d3.event.active) simulation.alphaTarget(0);
		d.fx = null;
		d.fy = null;
	}	
	
	
	d3.csv("data/"+mode+".csv", function(data) {
		data = data.filter(function (d) { return d["Type"] == side; });
		
		var nodes = [];
		var links = [];
		/* hack a hash map */
		hash = {};
		characters.map(function(d, i) {
			nodes.push({name: d, value: 0});
			hash[d] = i;
		});
		
		data.map(function(d) {
			d.Assist = d.Assist == "" ? "Solo" : d.Assist;
			var identity = d.Character + " Identity";
			if (!hash[identity]) {
				hash[identity] = nodes.length;
				nodes.push({name: identity, value: 0});
			}
			nodes[hash[identity]].value += .1;
			nodes[hash[d.Opposing]].value += 1;
			
			var a1 = links.filter(function(b) { return b.source == identity; });
			var a2 = [];
			if (a1.length > 0) {
				a2 = a1.filter(function(b) { return b.target == d.Opposing; });
			}
			if (a2.length > 0) {
				//a2[0].value += 1;
			}
			else {
				links.push({source: identity, target: d.Opposing, value: 1, type: "Elimination"});
			}
			
			
			if(d.Assist != "Solo" && d.Assist != "Team") {
				
				var a2 = [];
				var s = hash[d.Opposing] > hash[d.Assist] ? d.Assist : d.Opposing;
				var t = hash[d.Opposing] < hash[d.Assist] ? d.Assist : d.Opposing;
				console.log(s + " " + t);
				var a1 = links.filter(function(b) { return b.source == s});
				if (a1.length > 0) {
					a2 = a1.filter(function(b) { return b.target == t });
				}
				if (a2.length > 0) {
					//console.log(s + " " + a2[0].value);
					a2[0].value += 1;
				}
				else {
					links.push({source: s, target: t, value: 1, type: "Assist"});
				}
				
			}
			
		});
			

		
		nodes.map(function(d) {
			if (d.value < dataMin) {
				dataMin = d.value;
			}
			else if (d.value > dataMax) {
				dataMax = d.value;
			}
		});
		
		var l = svg.append("g")
			.attr("class", "links")
			.selectAll("line")
			.data(links)
			.enter().append("line")
			.attr("stroke-width", function(d) { return Math.sqrt(d.value)*d.value; })
			.attr("stroke", function(d) { return d.type == "Elimination" ? "red" : "black"});
		
		var node = svg.append("g")
			.attr("class", "nodes")
			.selectAll("circle")
			.data(nodes)
			.enter().append("circle")
			.attr("class", function(d) { return d.name + " node"; })
			.attr("r", function(d) { return nodeSize(d, dataMin, dataMax); })
			.call(d3.drag()
			  .on("start", dragstarted)
			  .on("drag", dragged)
			  .on("end", dragended));
			
		node.append("title").text(function(d) { return d.name + " " + nodeSize(d, dataMin, dataMax); });

		simulation.nodes(nodes).on("tick", ticked);
		simulation.force("link").links(links);
		
		function ticked() {
		l
			.attr("x1", function(d) { return d.source.x; })
			.attr("y1", function(d) { return d.source.y; })
			.attr("x2", function(d) { return d.target.x; })
			.attr("y2", function(d) { return d.target.y; });

		node
			.attr("cx", function(d) { return d.x; })
			.attr("cy", function(d) { return d.y; });
		}
		
		
	});
}



function f(children, character) {
	children.push({"name": character, "children": []})
}

function nodeSize(d, dataMin, dataMax) {
	return (d.value - dataMin)*50/(dataMax - dataMin) + 5;	
}

function linkSize(d, dataMin, dataMax) { 

}