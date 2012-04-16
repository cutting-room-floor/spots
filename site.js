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
      "id": 1,
      "style": "icon-a"
    }
  }]
};

$(function() {
  wax.tilejson('http://a.tiles.mapbox.com/v3/mapbox.mapbox-streets.jsonp', function(tj) {
    var map = new MM.Map('map', wax.mm.connector(tj));
    map.zoom(5).center({ lat: 37, lon: -77 });

    var markers = mmg().map(map).factory(function(x) {
      var d = $('<div class="place"></div>');
      $('<div class="icon"></div>').appendTo(d)
      .addClass('point-icon')
      .addClass(x.properties.style).click(function(e) {
        editpoint(x);
      });
      return d[0];
    }).geojson(geojson);

    map.addLayer(markers);

    wax.mm.zoomer(map).appendTo(map.parent);

    function startadd() {
      var newmarker = $('<div class="icon"></div>')
        .addClass('point-icon');
      $(map.parent).append(newmarker);
      $(window).mousemove(function(e) {
        newmarker.offset({
          left: e.pageX - 10,
          top: e.pageY + 20
        });
      });
      $(window).click(function(e) {
        var loc = map.pointLocation(MM.getMousePoint(e, map));
        var gj = markers.geojson();
        gj.features.push({
          type:"Feature",
          geometry:{
            type:"Point",
            coordinates:[loc.lon, loc.lat]
          },
          properties: {
            style: "icon-a"
          }
        });
        markers.geojson(gj);
      });
    }

    $('#add').click(function(e) {
      e.stopPropagation();
      e.preventDefault();
      startadd();
    });

    for (var letter = 0; letter < 4; letter++) {
      var place = $('<div></div>').appendTo('#point-select')
        .addClass('point-icon')
        .addClass('icon-' + String.fromCharCode(letter + 97))
        .attr('title', 'icon-' + String.fromCharCode(letter + 97));
    }

    window.setInterval(function() {
      var embed = '';
      var scripts = [
        'http://js.mapbox.com/mm/1.0.0-beta1/modestmaps.min.js',
        'http://js.mapbox.com/wax/6.0.0-beta2/wax.mm.min.js',
        'http://js.mapbox.com/mmg/1.0.0-beta1/mmg.min.js'
      ];
      for (var i = 0; i < scripts.length; i++) {
          embed += '<script src="' + scripts[i] + '"></script>';
      }
      embed += '<script>(function(){\nvar geojson=' +
          JSON.stringify(markers.geojson()) +
          '})()</script>';
      $('#embed').val(embed);
    });
  });
});
