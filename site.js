$(function() {
  wax.tilejson('http://a.tiles.mapbox.com/v3/mapbox.mapbox-streets.jsonp', function(tj) {
    var map = new MM.Map('map', wax.mm.connector(tj));
    map.zoom(5).center({ lat: 37, lon: -77 });

    // var geojson = {
    //   type: "FeatureCollection",
    //   features: []
    // };

    var geojson = {
      "type":"FeatureCollection",
      "features":[
        {
        "type":"Feature",
        "geometry":{
          "type":"Point",
          "coordinates":[-88, 38]
        },
        "properties": {
          "style":"icon-a"
        }
      }]
    };

    var markers = mmg().map(map).factory(function(x) {
      var d = $('<div class="place"></div>');
      $('<div class="icon"></div>').appendTo(d)
      .addClass('point-icon')
      .addClass(x.properties.style).click(function(e) {
        editpoint(x);
      });
      return d[0];
    }).geojson(geojson);

    function editpoint(x) {
      $(x.elem).empty()
        .append($('#point-select'))
        .append($('#edit-form').show());
      $('#point-select .point-icon').click(function() {
        x.properties.style = $(this).attr('title');
      });
    }

    map.addLayer(markers);

    $('#add-point').click(function() {
        markers.dropper();
    });

    for (var letter = 0; letter < 4; letter++) {
      var place = $('<div></div>').appendTo('#point-select')
        .addClass('point-icon')
        .addClass('icon-' + String.fromCharCode(letter + 97))
        .attr('title', 'icon-' + String.fromCharCode(letter + 97));
    }

    window.setInterval(function() {
      // TODO: fix in IE
      var embed = '<script>(function(){\nvar geojson=' +
          JSON.stringify(markers.geojson()) +
          '})()</script>';
      $('#embed').val(embed);
    });
  });
});
