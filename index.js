const svg = d3.select("svg").on("touchmove mousemove", moved);
const width = window.innerWidth;
const height = window.innerHeight;

const sites = d3.range(100).map(d => [Math.random() * width, Math.random() * height]);

const voronoi = d3.voronoi().extent([
  [-1, -1],
  [width + 1, height + 1]
]);

let polygon = svg
  .append("g")
  .attr("class", "polygons")
  .selectAll("path")
  .data(voronoi.polygons(sites))
  .enter()
  .append("path")
  .call(redrawPolygon);

let link = svg
  .append("g")
  .attr("class", "links")
  .selectAll("line")
  .data(voronoi.links(sites))
  .enter()
  .append("line")
  .call(redrawLink);

let site = svg
  .append("g")
  .attr("class", "sites")
  .selectAll("circle")
  .data(sites)
  .enter()
  .append("circle")
  .attr("r", 2.5)
  .call(redrawSite);

function moved() {
  sites[0] = d3.mouse(this);
  redraw();
}

function redraw() {
  const diagram = voronoi(sites);
  polygon = polygon.data(diagram.polygons()).call(redrawPolygon);
  link = link.data(diagram.links());
  link.exit().remove();
  link = link.enter().append("line").merge(link).call(redrawLink);
  site = site.data(sites).call(redrawSite);
}

function redrawPolygon(polygon) {
  polygon.attr("d", d => (d ? "M" + d.join("L") + "Z" : null));
}

function redrawLink(link) {
  link
    .attr("x1", d => d.source[0])
    .attr("y1", d => d.source[1])
    .attr("x2", d => d.target[0])
    .attr("y2", d => d.target[1]);
}

function redrawSite(site) {
  site.attr("cx", d => d[0]).attr("cy", d => d[1]);
}
