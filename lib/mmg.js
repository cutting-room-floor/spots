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
        d.innerHTML = '&copy;';
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

    l.correct = function(force) {
        if (_zoom !== Math.round(this.map.coordinate.zoom) || force) {
          _zoom = Math.round(this.map.coordinate.zoom);
          for (var id in selection) {
            var feature = selection[id];
            var coord = this.map.locationCoordinate(new MM.Location(
              feature.geometry.coordinates[1],
              feature.geometry.coordinates[0])).zoomTo(_zoom);

            var tx = coord.column *
                this.map.tileSize.x;
            var ty = coord.row *
                this.map.tileSize.y;

            // TODO: pass only scale or only w/h
            MM.moveElement(feature.elem, {
                x: Math.round(tx),
                y: Math.round(ty)
            });
          }
        }
    };

    l.exit = function(feature) {
        parent.removeChild(feature.elem);
        delete selection[feature._id];
    };

    l.geojson = function(x) {
        if (!x) return geojson;

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
        var theCoord = this.map.coordinate.copy(),
            zoom = Math.round(theCoord.zoom);
        scale = Math.pow(2, this.map.coordinate.zoom - zoom);
        theCoord = theCoord.zoomTo(zoom);
        var center = new MM.Point(this.map.dimensions.x/2, this.map.dimensions.y/2);

        l.correct();

        MM.moveElement(parent, {
            x: -(theCoord.column * 256) + center.x,
            y: -(theCoord.row * 256) + center.y,
            scale: scale
        });
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
        MM.addEvent(this.map.parent, 'mousemove', function(e) {
            var pt = MM.getMousePoint(e, map);
            pt.x -= 10;
            pt.y -= 20;
            var loc = map.pointLocation(pt);
            np.geometry.coordinates = [loc.lon, loc.lat];
            l.geojson(geojson);
            l.correct(true);
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
