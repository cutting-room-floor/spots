$(function() {
  var m = new MM.Map('map');
  $('#username-form').submit(function() {
      var username = $('#username').val();
      wax.tilejson('http://api.tiles.mapbox.com/v2/' + username + '/maps.jsonp', function(d) {
        for (var i = 0; i < d.length; i++) {
          $('<option></option>').text(d[i].name).appendTo($('#map-select')).attr('value', d[i].id);
        }
        $('#map-select').change();
      });
      return false;
  });

  $('#map-select').change(function() {
    var tileset_id = $(this).val();
    wax.tilejson('http://a.tiles.mapbox.com/v3/' + username + '/' + tileset_id + '.jsonp', function(tj) {
      m.setLayerAt(0, new wax.mm.connector(tj));
    });
  });
});
