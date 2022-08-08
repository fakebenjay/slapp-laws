var rawWidth = document.getElementById('article').offsetWidth
var w = rawWidth;
var h = rawWidth * (2 / 3);
//Define map projection
var projection = d3.geoAlbersUsa()
  .translate([w / 2, h / 2.25])
  .scale([rawWidth * 1.25]);
//Define path generator
var path = d3.geoPath()
  .projection(projection);
//Create SVG element
var svg = d3.select(".chart")
  .append("svg")
  .attr("width", w)
  .attr("height", h);
var tooltip = d3.select("#usa-map")
  .append('div')
  .style('visibility', 'hidden')
  .attr('class', 'my-tooltip')

var mapG = svg.append('g')
  .attr('class', 'map-g')
// //Create mixed texture for killed bills
// var textureOngoingUpcoming = textures.lines()
//   .orientation("diagonal")
//   .size(12)
//   .strokeWidth(4)
//   .stroke("#6ba292")
//   .background("#F9C80E");
var texturePendingSlapp = textures.lines()
  .orientation("diagonal")
  .size(12)
  .strokeWidth(4)
  .stroke("#654f6f")
  .background("#F9C80E");

// var textureCompletedOngoing = textures.lines()
//   .orientation("diagonal")
//   .size(12)
//   .strokeWidth(4)
//   .stroke("#654f6f")
//   .background("#6ba292");

// var textureCompletedOngoingUpcoming = textures.lines()
//   .orientation("diagonal")
//   .size(12)
//   .strokeWidth(4)
//   .stroke("#654f6f")
//   .background("#F9C80E");

// svg.call(textureOngoingUpcoming);
svg.call(texturePendingSlapp);
// svg.call(textureCompletedOngoing);


// var trifecta = svg.append('linearGradient')
//   .attr('id', 'trifecta')
//   .attr('gradientTransform', 'rotate(45)')

// for (let i = 0; i < 100; i++) {
//   var hex = parseInt(i / 9) === 0 || parseInt(i / 9) === 3 || parseInt(i / 9) === 6 || parseInt(i / 9) === 9 ? '#654f6f' : parseInt(i / 9) === 1 || parseInt(i / 9) === 4 || parseInt(i / 9) === 7 || parseInt(i / 9) === 10 ? '#6ba292' : '#F9C80E'
//   trifecta.append('stop')
//     .attr('offset', i + '%')
//     .attr('stop-color', hex)
//
// }

function tooltipText(values) {
  if (!values.status) {
    return `<h2>${values.state}</h2><div>There are <strong style="color:white;background-color:#e8171f;">&nbsp;no anti-SLAPP laws&nbsp;</strong> currently in effect.</div>`
  } else if (values.status === 'upepa') {
    return `<h2>${values.state}</h2><div>There is a UPEPA anti-SLAPP law <strong style="color:black;background-color:#6ba292;">&nbsp;currently in effect&nbsp;</strong>.</div>`
  } else if (values.status === 'slapp') {
    return `<h2>${values.state}</h2><div>There is a <strong style="color:white;background-color:#654f6f;">&nbsp;non-UPEPA anti-SLAPP law&nbsp;</strong> currently in effect.</div>`
  } else if (values.status === 'pending') {
    return `<h2>${values.state}</h2><div>There is a UPEPA anti-SLAPP law <strong style="color:black;background-color:#F9C80E;">&nbsp;pending&nbsp;</strong>, but <strong style="color:white;background-color:#e8171f;">&nbsp;no anti-SLAPP laws&nbsp;</strong> currently in effect.</div>`
  } else if (values.status === 'pending-slapp') {
    return `<h2>${values.state}</h2><div>There is a <strong style="color:white;background-color:#654f6f;">&nbsp;non-UPEPA anti-SLAPP law&nbsp;</strong> currently in effect and a UPEPA anti-SLAPP law <strong style="color:black;background-color:#F9C80E;">&nbsp;pending&nbsp;</strong>.</div>`
  }
}

function mouseover(d) {
  var values = d.properties.value
  var html = tooltipText(values)

  d3.select('.my-tooltip')
    .html(html)
    .attr('display', 'block')
    .style("visibility", "visible")
    .style('top', topTT)
    .style('left', leftTT)

  mapG.selectAll(`.active`)
    .style('stroke-width', 1)

  mapG.selectAll(`.active.state-${d.properties.name.toLowerCase().replace('washington ', '').replace(' ', '-').replaceAll('.', '')}`)
    .style('stroke-width', 3)
    .raise()

  if (!d.properties.value.status) {
    mapG.selectAll(`.active.state-${d.properties.name.toLowerCase().replace('washington ', '').replace(' ', '-').replaceAll('.', '')}`)
      .style('stroke', '#e8171F')
      .style('opacity', 1)
  }

  d3.selectAll('text')
    .raise()
}

function mousemove() {
  tooltip.style("visibility", "visible")
    .style("left", leftTT)
    .style("top", topTT);
}

function mouseout(d) {
  d3.select('.my-tooltip')
    .html("")
    .attr('display', 'none')
    .style("visibility", "hidden")
    .style("left", null)
    .style("top", null);

  mapG.selectAll(`.active`)
    .style('stroke-width', 1)

  mapG.selectAll('.none')
    .raise()
}

function topTT() {
  var offsetParent = document.querySelector('.chart').offsetParent
  var offY = offsetParent.offsetTop
  var cursorY = 10

  var windowWidth = window.innerWidth
  var ch = document.querySelector('.my-tooltip').clientHeight
  var cy = d3.event.pageY - offY
  var windowHeight = window.innerHeight
  if (windowWidth > 767) {
    if (ch + cy >= windowHeight) {
      return cy - (ch / 2) + "px"
    } else {
      return cy - 28 + "px"
    }
  }
}

function leftTT() {
  var offsetParent = document.querySelector('.chart').offsetParent
  var offX = offsetParent.offsetLeft
  var cursorX = 10

  var windowWidth = window.innerWidth
  var cw = document.querySelector('.my-tooltip').clientWidth
  var cx = d3.event.pageX - offX
  var bodyWidth = document.querySelector('.chart').clientWidth

  if (windowWidth > 767) {
    if (cw + cx >= bodyWidth) {
      document.querySelector('.my-tooltip').classList.remove('box-shadow-right')
      document.querySelector('.my-tooltip').classList.add('box-shadow-left')
      return cx - cw - cursorX + "px"
    } else {
      document.querySelector('.my-tooltip').classList.remove('box-shadow-left')
      document.querySelector('.my-tooltip').classList.add('box-shadow-right')
      return cx + cursorX + "px"
    }
  }
}

function color(d) {
  //Get data value
  var values = d.properties.value
  //Killed bill Washington
  if (!values) {
    return null
  }
  if (values.status === 'pending-slapp') {
    return texturePendingSlapp.url();
  } else if (values.status === 'slapp') {
    return '#654f6f'
  } else if (values.status === 'upepa') {
    return '#6ba292'
  } else if (values.status === 'pending') {
    return '#F9C80E'
  } else {
    return "#F4F4F4"
  }
}

//Load in referendum data
d3.csv("trials-data-2v26.csv")
  .then(function(data) {

    //Load in GeoJSON data
    d3.json("https://assets.law360news.com/1477000/1477869/states-10m.json")
      .then(function(json) {
        //Merge the referendum data and GeoJSON
        //Loop through once for each data value
        for (var i = 0; i < data.length; i++) {
          //Grab state name
          var dataState = data[i].state;
          //Grab legal/referendum status
          var dataObj = data[i]
          //Find the corresponding state inside the GeoJSON
          for (var j = 0; j < json.objects.states.geometries.length; j++) {
            var jsonState = json.objects.states.geometries[j].properties.name;
            if (dataState === jsonState) {
              //Copy the data value into the JSON
              json.objects.states.geometries[j].properties.value = dataObj;
              //Stop looking through the JSON
              break;
            }
          }
        }

        mapG.append("path")
          .datum(topojson.mesh(json, json.objects.states))
          .attr("d", path)
          .attr("class", "states-mesh")
          .attr('stroke-width', '1')
          .attr('stroke', 'black')
          .attr('opacity', 0.3)
          .attr('stroke-opacity', 0.3)
          .attr('fill', 'none')

        // //Textures.js causes the first element of json.objects.states to disappear
        // //This is my hacky workaround to ensure that Alabama renders
        json.objects.states.geometries.unshift("fake alabama")
        // json.objects.states.geometries.unshift("fake alaska")
        // json.objects.states.geometries.unshift("fake arizona")
        // json.objects.states.geometries.unshift("fake arkansas")


        //Bind data and create one path per GeoJSON feature
        mapG.selectAll("path")
          .data(topojson.feature(json, json.objects.states).features)
          .enter()
          .append('path')
          .attr("d", path)
          .attr('class', (d) => {
            var statusClass = !!d.properties.value.status ? ` ${d.properties.value.status.split('-').join(' ')} active` : ' none'
            var active = !!d.properties.value.status ? ' active' : ' active'
            return `state state-${d.properties.value.state.toLowerCase().replace('washington ', '').replace(' ', '-').replaceAll('.', '')}${statusClass}${active}`
          })
          .attr("fill", color)
          // .style('background-image', (d) => {
          //   if (d.properties.name === 'West Virginia') {
          //     debugger
          //   }
          // })
          .style("stroke", d => !!d.properties.value.status === true ? '#000' : '#e8171F')
          .style("stroke-width", 1)
          .style("opacity", d => 1)
          .style("stroke-opacity", 1)
        // .on("mouseover", mouseover)
        // .on('mousemove', mousemove)
        // .on("mouseout", mouseout);

        var labelW = (w / 12)
        var labelH = (h / 15)
        var smallStates = {
          'Massachusetts': 'MA',
          'Rhode Island': 'RI',
          'Connecticut': 'CT',
          'New Jersey': 'NJ',
          'Delaware': 'DE',
          'Maryland': 'MD',
          'Washington D.C.': 'DC'
        }


        mapG.selectAll("rect")
          .data(topojson.feature(json, json.objects.states).features)
          .enter()
          .append('rect')
          .attr("class", (d) => {
            if (!!d.geometry && Object.keys(smallStates).includes(d.properties.value.state)) {
              var statusClass = !!d.properties.value.status ? ` ${d.properties.value.status.split('-').join(' ')} active` : ' none'
              var active = !!d.properties.value.status ? ' active' : ''
              return `state state-${d.properties.value.state.toLowerCase().replace('washington ', '').replace(' ', '-').replaceAll('.', '')}${statusClass}${active}`
            } else {
              return 'invisible'
            }
          })
          .attr('fill', color)
          .attr('y', (d) => {
            if (!!d.geometry && Object.keys(smallStates).includes(d.properties.value.state)) {
              var placement = Object.keys(smallStates).indexOf(d.properties.name) + 1
            } else {
              var placement = 0
            }
            return (h / 4) + (placement * labelH)
          })
          .attr('x', (d) => {
            return w - (labelW * 1.25)
          })
          .attr('width', labelW)
          .attr('height', labelH)
          .style("stroke", d => !!d.properties.value && !!d.properties.value.status === true ? '#000' : '#e8171F')
          .style("stroke-width", d => !!d.properties.value && !!d.properties.value.status ? 1 : 1)
          .style("opacity", d => !!d.properties.value && !!d.properties.value.status ? 1 : 0.3)
          .style("stroke-opacity", d => !!d.properties.value && !!d.properties.value.status ? 1 : 1)

        mapG.selectAll('text')
          .data(topojson.feature(json, json.objects.states).features)
          .enter()
          .append('text')
          .text((d) => {
            if (!d.geometry || !!!d.geometry && Object.keys(smallStates).includes(d.properties.value.state)) {
              return ''
            } else {
              return smallStates[d.properties.value.state]
            }
          })
          .style("opacity", (d) => {
            if (!d.geometry || !!!d.geometry && Object.keys(smallStates).includes(d.properties.value.state)) {
              return 0
            } else {
              return !!d.properties.value.status === true ? 1 : 0.3
            }
          })
          .attr("text-anchor", "middle")
          .attr("class", (d) => {
            if (!d.geometry || !!!d.geometry && Object.keys(smallStates).includes(d.properties.value.state)) {
              return 'invisible'
            } else if (!!d.geometry && Object.keys(smallStates).includes(d.properties.value.state)) {
              var active = !!d.properties.value.status ? ' active' : ''
              return `small-label state ${d.properties.value.status}${active}`
            } else {
              return 'invisible'
            }
          })
          .attr("pointer-events", "none")
          .attr('x', (d) => {
            return w - (labelW * .75)
          })
          .attr('y', (d) => {
            if (!!d.properties.value && !!d.geometry && Object.keys(smallStates).includes(d.properties.value.state)) {
              var placement = Object.keys(smallStates).indexOf(d.properties.name) + 1
            } else {
              var placement = 0
            }
            return (h / 4) + (labelH / 1.5) + (placement * labelH)
          })
          .attr('width', labelW)
          .attr('height', labelH)
          .attr("font-family", "sans-serif")
          .attr('fill', (d) => {
            return !!d.properties.value && d.properties.value.status === 'slapp' ? 'white' : '#000'
          })

        mapG.selectAll('.invisible')
          .remove()

        mapG.selectAll('.active')
          .on("mouseover", mouseover)
          .on('mousemove', mousemove)
          .on("mouseout", mouseout);

        mapG.selectAll('.none')
          .raise()
      });

    d3.selectAll('.legend li')
      .on('mouseover touchstart', () => {
        d3.selectAll('.state.active')
          .style('opacity', .1)

        d3.selectAll(`.state.${event.target.className}`)
          .style('opacity', 1)

        if (event.target.className === 'none') {
          d3.selectAll(`.state.${event.target.className}`)
            .style('fill', '#e8171f')
            .style('stroke', 'black')


          d3.select('.legend .none div')
            .style('background-color', '#e8171f')
            .style('border', '1px solid black')
        }
      })
      .on('mouseout', () => {
        d3.selectAll('.state.active')
          .style('opacity', 1)

        d3.selectAll(`.state.none`)
          .style('fill', 'none')
          .style('stroke', '#e8171f')

        d3.select('.legend .none div')
          .style('background-color', 'transparent')
          .style('border', '1px solid #e8171f')


        mapG.selectAll('.none')
          .raise()
      })
  });