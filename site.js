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
      var icon = $('<div class="icon"></div>').appendTo(d)
      .addClass('point-icon')
      .addClass(x.properties.style).mousedown(function(e) {
        var start = { x: e.pageX, y: e.pageY };
        var moving = false;
        function watchmove(e) {
          if (Math.abs(e.pageX - start.x) > 3 &&
              Math.abs(e.pageY - start.y) > 3 && !moving) {
            newmarker = $(this);
            $(map.parent).bind('mousemove', movemarker);
            $(map.parent).one('mouseup', function(e) {
              $(map.parent).unbind('mousemove', movemarker);
              var px = MM.getMousePoint(e, map);
              px.y += 45;
              var loc = map.pointLocation(px);
              x.geometry.coordinates = [loc.lon, loc.lat];
            });
            moving = true;
          }
        }
        $(icon).bind('mousemove', watchmove);
        $(icon).one('mouseup', function(e) {
          if (Math.abs(e.pageX - start.x) < 3 &&
              Math.abs(e.pageY - start.y) < 3) {
            $(icon).unbind('mousemove', watchmove);
            activeid = x.properties.id;
            editfeature();
          }
        });
      });
      return d[0];
    }).geojson(geojson);

    markers.gen_id();

    map.addLayer(markers);

    wax.mm.zoomer(map).appendTo(map.parent);

    var newmarker = $('<div class="icon"></div>')
      .addClass('point-icon');

   for (var letter = 0; letter < 14; letter++) {
   var place = $('<div></div>').appendTo('#point-select')
        .addClass('point-icon')
        .addClass('icon-' + String.fromCharCode(letter + 97))
        .attr('title', 'icon-' + String.fromCharCode(letter + 97));
    }

    var activeid = 0; // for testing

    function movemarker(e) {
      newmarker.offset({
        left: e.pageX - 10,
        top: e.pageY + 20
      });
      e.stopPropagation();
    }

    function hideonpan() {
      $('#edit-form').hide();
      activefeature = -1;
    }

    /* move the map into editing mode */
    function editfeature() {
      var feature = markers.byid()[activeid];
      var ftpx = map.locationPoint({
        lat: feature.geometry.coordinates[1],
        lon: feature.geometry.coordinates[0]
      });

      map.panBy(
        ((map.dimensions.x - 280) / 2) - ftpx.x,
        (map.dimensions.y / 2) - ftpx.y + 80);

      $('#edit-form').fadeIn()
        .css('left', (((map.dimensions.x - 280) / 2) - 150) + 'px')
        .css('bottom', ((map.dimensions.y / 2) - 30) + 'px');

      $('#feature-name').val(feature.properties.name || '');
      $('#feature-description').val(feature.properties.description || '');
      $('#point-select .point-icon').removeClass('selected');
      $('#point-select .' + feature.properties.style).addClass('selected');

      map.addCallback('panned', hideonpan);
    }

    $('#point-select .point-icon').click(function() {
      $('#point-select .point-icon').removeClass('selected');
      $(this).addClass('selected');
    });

    function replacefeature(id, feature) {
      var gj = markers.geojson();
      for (var i = 0; i < gj.features.length; i++) {
        if (gj.features[i].properties.id === id) {
          gj.features[i] = feature;
        }
      }
      return gj;
    }

    /* edit form buttons =================================================== */
    $('#edit-form a#save').click(function() {
      markers.byid()[activeid].properties.name = $('#feature-name').val();
      markers.byid()[activeid].properties.description = $('#feature-description').val();

      var c = $('#point-select .selected').attr('class').split(' ');
      markers.byid()[activeid].properties.style = c[1];

      $('#edit-form').hide();
      markers.correct(true);
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
          px.y += 45;
          var loc = map.pointLocation(px);
          var gj = markers.geojson();
          activeid = markers.gen_id();
          gj.features.push({
            type: "Feature",
            geometry:{
              type: "Point",
              coordinates: [loc.lon, loc.lat]
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

    var gj = markers.geojson();
    activeid = gj.features[gj.features.length - 1].properties.id;
    editfeature();

    window.setInterval(function() {
      var embed = '';
      var scripts = [
        'http://mapbox-js.s3.amazonaws.com/spot/0.0.0/spot.js',
        'http://mapbox-js.s3.amazonaws.com/mm/1.0.0-beta1/modestmaps.min.js',
        'http://mapbox-js.s3.amazonaws.com/wax/6.0.0-beta2/wax.mm.min.js',
        'http://mapbox-js.s3.amazonaws.com/mmg/0.0.0/mmg.js'
      ];
      for (var i = 0; i < scripts.length; i++) {
          embed += '<script src="' + scripts[i] + '"></script>';
      }
      var stylesheets = [
        'http://a.tiles.mapbox.com/lib/mm/embed.css',
        'http://mapbox-js.s3.amazonaws.com/spot/0.0.0/spot.css'];

      for (var i = 0; i < stylesheets.length; i++) {
        embed += '<link rel="stylesheet" href="' + stylesheets[i] + '" />';
      }

      var id = (+new Date()).toString(16);
      embed += '<div style="height:640px;height:480px;" class="ts-map" id="map-' + id + '"></div>';
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
