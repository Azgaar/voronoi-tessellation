const svg = d3.select("svg");
const width = window.innerWidth;
const height = window.innerHeight;

const offScreen = 50;
const extentMin = [-offScreen, -offScreen];
const extentMax = [width + offScreen, height + offScreen];
const voronoi = d3.voronoi().extent([extentMin, extentMax]);

const POINTS = 100;
const trancendentals = d3.range(POINTS);
const randomSites = randomizePoints(trancendentals);
let sites = voronoi(randomSites).polygons().map(d3.polygonCentroid);

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

const RELAXITION_RATE = 0.01;
const FOCUS_RATE = 0.0001;
const RANDOMIZE_TIMEOUT = 100;
let goal = sites.slice();
let randomizedAt = 0;

function randomizePoints(trancendentals) {
  return trancendentals.map(randomizePoint);
}

function randomizePoint() {
  return [Math.random() * width, Math.random() * height];
}

function step(time) {
  if (time - randomizedAt > RANDOMIZE_TIMEOUT) {
    const pointToUpdate = Math.floor(Math.random() * POINTS);
    goal[pointToUpdate] = randomizePoint();
    randomizedAt = time;
  }

  sites = voronoi(sites)
    .polygons()
    .map((polygon, index) => {
      const [x0, y0] = sites[index];
      const [goalX, goalY] = goal[index];
      const [cx, cy] = d3.polygonCentroid(polygon);

      const x1 = x0 + (cx - x0) * RELAXITION_RATE;
      const y1 = y0 + (cy - y0) * RELAXITION_RATE;

      const x2 = x1 + (goalX - x1) * FOCUS_RATE;
      const y2 = y1 + (goalY - y1) * FOCUS_RATE;

      return [x2, y2];
    });

  redraw();
  requestAnimationFrame(step);
}

requestAnimationFrame(step);
