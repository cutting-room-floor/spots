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
      "style": "icon-a",
      "id": 0
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
        activeid = x.properties.id;
        editfeature();
      });
      return d[0];
    }).geojson(geojson);

    markers.gen_id();

    map.addLayer(markers);

    wax.mm.zoomer(map).appendTo(map.parent);

    var newmarker = $('<div class="icon"></div>')
      .addClass('point-icon');

    var activeid = 0; // for testing

    function movemarker(e) {
      newmarker.offset({
        left: e.pageX - 10,
        top: e.pageY + 20
      });
    }

    function hideonpan() {
      $('#edit-form').hide();
      activefeature = -1;
    }

    function editfeature() {
      var feature = markers.byid()[activeid];
      var ftpx = map.locationPoint({
        lat: feature.geometry.coordinates[1],
        lon: feature.geometry.coordinates[0]
      });

      // move map to put feature at the center,
      // and in the middle but down 200px
      map.panBy(
        ((map.dimensions.x - 280) / 2) - ftpx.x,
        (map.dimensions.y / 2) - ftpx.y);

      $('#edit-form').fadeIn()
        .css('left', (((map.dimensions.x - 280) / 2) - 150) + 'px')
        .css('bottom', ((map.dimensions.y / 2) + 20) + 'px');

      $('#feature-name').val(feature.properties.name || '');
      $('#feature-description').val(feature.properties.description || '');

      map.addCallback('panned', hideonpan);
    }

    function replacefeature(id, feature) {
      var gj = markers.geojson();
      for (var i = 0; i < gj.features.length; i++) {
        if (gj.features[i].properties.id === id) {
          gj.features[i] = feature;
        }
      }
      return gj;
    }

    $('#edit-form a#save').click(function() {
      markers.byid()[activeid].properties.name = $('#feature-name').val();
      markers.byid()[activeid].properties.description = $('#feature-description').val();
      $('#edit-form').hide();
      markers.draw();
      activeid = null;
      map.removeCallback('panned', hideonpan);
    });

    $('#edit-form a#remove').click(function() {
      $('#edit-form').hide();
      markers.rm(activeid);
      markers.draw();
      markers.correct(true);
      map.removeCallback('panned', hideonpan);
      activeid = null;
    });

    $('#edit-form a#cancel').click(function() {
      $('#edit-form').hide();
      map.removeCallback('panned', hideonpan);
      activeid = null;
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
          activeid = markers.gen_id();
          gj.features.push({
            type:"Feature",
            geometry:{
              type:"Point",
              coordinates:[loc.lon, loc.lat]
            },
            properties: {
              style: "icon-a",
              id: activeid
            }
          });
          markers.geojson(gj);
          endadd();
          editfeature();
        }
      });
    }

    function startadd() {
      $(map.parent).append(newmarker);
      $(map.parent).mousemove(movemarker);
      $(map.parent).bind('mousedown', addfeature);
    }

    function endadd() {
      newmarker.remove();
      $(map.parent).unbind('mousemove', movemarker);
      $(map.parent).unbind('mousedown', addfeature);
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
    activeid = gj.features[gj.features.length - 1].properties.id;
    editfeature();

    window.setInterval(function() {
      var embed = '';
      var scripts = [
        'http://mapbox-js.s3.amazonaws.com/spot/0.0.0/spot.js',
        'http://js.mapbox.com/mm/1.0.0-beta1/modestmaps.min.js',
        'http://js.mapbox.com/wax/6.0.0-beta2/wax.mm.min.js',
        'http://js.mapbox.com/mmg/0.0.0/mmg.js'
      ];
      for (var i = 0; i < scripts.length; i++) {
          embed += '<script src="' + scripts[i] + '"></script>';
      }
      embed += '<link rel="stylesheet" href="http://mapbox-js.s3.amazonaws.com/spot/0.0.0/spot.css" />';
      var id = (+new Date()).toString(16);
      embed += '<div style="height:640px;height:480px;" id="map-' + id + '"></div>';
      embed += '<script>(function(){';
      embed += 'spots(' + JSON.stringify({
        center: {
          lat: map.center().lat,
          lon: map.center().lon
        },
        zoom: map.zoom(),
        geojson: markers.geojson(),
        id: id,
        tiles: 'http://a.tiles.mapbox.com/v3/mapbox.mapbox-streets.jsonp'
      }) + ');';
      embed += '})()</script>';
      $('#embed').val(embed);
    }, 1000);
  });
});
