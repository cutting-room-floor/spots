function mmg() {
    var l = {},
        geojson = {},
        factory = null,
        _id = 0,
        selection = {},
        map;

    var parent = document.createElement('div');
    parent.style.cssText = 'position: absolute; top: 0px;' +
      'left: 0px; width: 100%; height: 100%; margin: 0; padding: 0; z-index: 0';

    function defaultFactory(feature) {
        var d = document.createElement('div');
        d.className = 'mmg-default';
        return d;
    }

    function gen_id() {
        return _id++;
    }

    function fLocation (feature) {
        // GeoJSON
        var geom = feature.geometry;
        // coerce the lat and lon values, just in case
        var lon = Number(geom.coordinates[0]),
            lat = Number(geom.coordinates[1]);
        return new MM.Location(lat, lon);
    }

    l.enter = function(feature) {
        var elem = factory(feature);
        feature.elem = elem;
        parent.appendChild(elem);
        selection[feature._id] = feature;
    };

    l.exit = function(feature) {
        parent.removeChild(feature.elem);
        delete selection[feature._id];
    };

    l.geojson = function(x) {
        if (!x) return geojson;

        var new_selection = {};

        for (var i = 0; i < x.features.length; i++) {
            if (!x.features[i]._id) {
                x.features[i]._id = gen_id();
                l.enter(x.features[i]);
            }
            new_selection[x.features[i]._id] = true;
        }

        for (var id in selection) {
            if (!(id in new_selection)) {
                l.exit(selection[id]);
            }
        }

        geojson = x;
        return l;
    };

    l.draw = function() {
    };

    l.dropper = function() {
        var np = {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [-40.0, 30.0]
          },
          properties: {
            style: 'icon-0'
          }
        };
        geojson.features.push(np);
        console.log(geojson);
        MM.addEvent(parent, 'mousemove', function(e) {
          var pt = MM.getMousePoint(e, map);
          var loc = map.pointLocation(pt);
          np.geometry.coordinates = [loc.lon, loc.lat];
          l.geojson(geojson);
        });
    };

    l.factory = function(x) {
      if (!x) return factory;
      factory = x;
      return l;
    };

    l.map = function(x) {
      if (!x) return map;
      map = x;
      return l;
    };

    l.parent = parent;

    l.factory(defaultFactory);

    return l;
}
