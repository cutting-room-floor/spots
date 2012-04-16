function spots(o) {
  wax.tilejson(o.tiles, function(tj) {
    var m = new MM.Map('map-' + o.id, new wax.mm.connector(tj));
    m.zoom(o.zoom).center(o.center);

    m.addLayer(mmg().map(m).factory(function(x) {
      var d = document.createElement('div');
      d.className = 'place';
      var icon = d.appendChild(document.createElement('div'));
      icon.className = 'icon point-icon ' + (x.properties.style || '');
      return d;
    }).geojson(o.geojson));
  });
}
