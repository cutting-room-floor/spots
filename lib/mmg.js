function mmg() {
    var l = {},
        geojson = {},
        factory = null,
        _id = 0,
        _zoom,
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

    l.enter = function(feature) {
        var elem = factory(feature);
        feature.elem = elem;
        parent.appendChild(feature.elem);
        selection[feature._id] = feature;
    };

    l.exit = function(feature) {
        parent.removeChild(feature.elem);
        delete selection[feature._id];
    };

    function clean(x) {
        var clean_features = [];
        for (var i = 0; i < geojson.features.length; i++) {
            clean_features.push({
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: geojson.features[i].geometry.coordinates
                },
                properties: geojson.features[i].properties
            });
        }
        return {
          type: "FeatureCollection",
          features: clean_features
        };
    }

    l.geojson = function(x) {
        if (!x) return clean(geojson);

        // like d3 except it sucks
        var new_selection = {};

        for (var i = 0; i < x.features.length; i++) {
            if (typeof x.features[i]._id === 'undefined') {
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
        for (var i in selection) {
            repositionFeature(selection[i]);
        }
    };

    // reposition a single marker element
    function repositionFeature(feature) {
        // remember the tile coordinate so we don't have to reproject every time
        if (!feature.coord) feature.coord = l.map.locationCoordinate({
          lat: feature.geometry.coordinates[1],
          lon: feature.geometry.coordinates[0]});
        var pos = l.map.coordinatePoint(feature.coord);
        var pos_loc = new MM.Location(
          feature.geometry.coordinates[1],
          feature.geometry.coordinates[0]);
        if (pos.x < 0) {
            pos_loc.lon += Math.ceil((left.lon - feature.location.lon) / 360) * 360;
            pos = l.map.locationPoint(pos_loc);
        } else if (pos.x > l.map.dimensions.x) {
            pos_loc.lon -= Math.ceil((feature.location.lon - right.lon) / 360) * 360;
            pos = l.map.locationPoint(pos_loc);
        }
        if (pos_loc) {
            feature.coord = l.map.locationCoordinate(pos_loc);
        }
        pos.scale = 1;
        pos.width = pos.height = 0;
        MM.moveElement(feature.elem, pos);
    }

    l.dropper = function() {

        var np = {
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [0, 0]
            },
            properties: {
                style: 'icon-0'
            }
        };

        geojson.features.push(np);

        var followMouse = function(e) {
            var pt = MM.getMousePoint(e, l.map);
            pt.x -= 10;
            pt.y -= 30;
            var loc = map.pointLocation(pt);
            np.geometry.coordinates = [loc.lon, loc.lat];
            l.geojson(geojson);
            l.draw();
        };

        MM.addEvent(l.map.parent, 'mousemove', followMouse);

        MM.addEvent(l.map.parent, 'click', function(e) {
          MM.removeEvent(l.map.parent, 'mousemove', followMouse);
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
