$(function() {
  wax.tilejson('http://a.tiles.mapbox.com/v3/mapbox.mapbox-streets.jsonp', function(tj) {
    var map = new MM.Map('map', wax.mm.connector(tj));
    map.zoom(5).center({ lat: 37, lon: -77 });
  });
});
