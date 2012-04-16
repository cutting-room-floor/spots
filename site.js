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

    var newmarker = $('<div class="icon"></div>')
      .addClass('point-icon');

    var activefeature;

    function movemarker(e) {
      newmarker.offset({
        left: e.pageX - 10,
        top: e.pageY + 20
      });
    }

    function hideonpan() {
      $('#edit-form').hide();
      activefeature = null;
    }

    function editfeature() {
      var feature = activefeature;
      var ftpx = map.locationPoint({
        lat: feature.geometry.coordinates[1],
        lon: feature.geometry.coordinates[0]
      });

      // move map to put feature at the center,
      // and in the middle but down 200px
      map.panBy(
        (map.dimensions.x / 2) - ftpx.x,
        (map.dimensions.y / 2) - ftpx.y);

      $('#edit-form').show()
        .css('bottom', ((map.dimensions.y / 2) + 20) + 'px');

      map.addCallback('panned', hideonpan);
    }

    $('#edit-form a#save').click(function() {
      if (activefeature) {
        activefeature.properties = {
          name: $('#feature-name').val(),
          description: $('#feature-description').val()
        };
      }
      $('#edit-form').hide();
      activefeature = null;
      map.removeCallback('panned', hideonpan);
      markers.geojson(gj);
    });

    $('#edit-form a#cancel').click(function() {
      $('#edit-form').hide();
      map.removeCallback('panned', hideonpan);
      activefeature = null;
    });

    $('#edit-form').show();

    function addfeature(e) {
      var start = { x: e.pageX, y: e.pageY };
      $(map.parent).one('mouseup', function(e) {
        if (Math.abs(e.pageX - start.x) < 4 &&
            Math.abs(e.pageY - start.y) < 4) {
          var px = MM.getMousePoint(e, map);
          px.y += 20;
          px.x -= 10;
          var loc = map.pointLocation(px);
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
          endadd();
          var gj = markers.geojson();
          activefeature = gj.features[gj.features.length - 1];
          editfeature(activefeature);
        }
      });
    }

    function startadd() {
      $(map.parent).append(newmarker);
      $(map.parent).mousemove(movemarker);
      $(map.parent).bind('mousedown', addfeature);
    }

    function endadd() {
      $(map.parent).unbind('mousemove', movemarker);
      $(map.parent).unbind('mousedown', addfeature);
      newmarker.remove();
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

    var gj = markers.geojson();
    activefeature = gj.features[gj.features.length - 1];
    editfeature();

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
    }, 1000);
  });
});
