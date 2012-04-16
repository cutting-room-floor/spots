function spots(o) {
  wax.tilejson(o.tiles, function(tj) {
    var m = new MM.Map('map-' + o.id, new wax.mm.connector(tj));
    var popup = m.parent.appendChild(document.createElement('div'));
    popup.className = 'spot-popup';
    var name = popup.appendChild(document.createElement('h3'));
    var description = popup.appendChild(document.createElement('p'));
    m.zoom(o.zoom).center(o.center);

    function select(x) {
      var ftpx = m.locationPoint({
        lat: x.geometry.coordinates[1],
        lon: x.geometry.coordinates[0]
      });
      m.panBy(
        (m.dimensions.x / 2) - ftpx.x,
        (m.dimensions.y / 2) - ftpx.y);
      name.innerHTML = x.properties.name || '';
      description.innerHTML = x.properties.description || '';
      popup.style.display = 'block';
      popup.style.bottom = ((m.dimensions.y / 2) + 20) + 'px';
      popup.style.left = ((m.dimensions.x / 2) - 150) + 'px';
      m.addCallback('panned', unselect);
    }

    function unselect() {
      popup.style.display = 'none';
      m.removeCallback('panned', unselect);
    }

    m.addLayer(mmg().map(m).factory(function(x) {
      var d = document.createElement('div');
      d.className = 'place';
      var icon = d.appendChild(document.createElement('div'));
      icon.className = 'icon point-icon ' + (x.properties.style || '');
      d.onclick = d.ontouchstart = function() {
        select(x);
      };
      return d;
    }).geojson(o.geojson));
  });
}
