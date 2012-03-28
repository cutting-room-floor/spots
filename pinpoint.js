// (c) 2012 Michael Aufreiter, MapBox
// Pinpoint.js is freely distributable under the BSD license.

(function(window){

  var TEMPLATE = '\
        <div class="pin" id="<%= id%>"> \
        <div><input type="text" class="name" placeholder="Enter Name"/></div> \
        <div><textarea class="descr" placeholder="Description&hellip;"></textarea></div> \
        <div><a href="#" class="remove-pin"></div> \
      </div>';

  // Initial Setup
  // -------------

  var Pinpoint = window.Pinpoint = function(map, options) {
    var that = this;
    var popupOpen = false;
    this.pins = {};

    function tpl(name, data) {
      return _.template(TEMPLATE, data);
    }

    function initPin(pin) {
      var $el = $('#' + pin.id);

      if (pin.name) $el.find('.name').val(pin.name);
      if (pin.descr) $el.find('.descr').val(pin.descr);

      $el.find('.remove-pin').unbind().bind('click', function() {
        that.removePin(pin.id);
        return false;
      });
    }

    var clickCount = 0;
    // Add new pin, every time the map gets clicked
    map.on('click', function(e) {
      if (popupOpen) return;
      clickCount += 1;
      if (clickCount <= 1) {

        _.delay(function() {
          if (clickCount <= 1) {
            that.addPin(e.latlng.lat, e.latlng.lng);
          }
          clickCount = 0;
        }, 200);
      }
    });

    // Initialize popup
    map.on('popupopen', function(e) {
      popupOpen = true;
      initPin(that.pins[$(e.popup._container).find('.pin').attr('id')]);
    });

    map.on('popupclose', function(e) {
      _.delay(function() { popupOpen = false }, 10);
    });

    // Expose public API
    // -------------

    this.addPin = function(lat, lng, name, descr, id, silent) {
      var pin = {
        id: id ? id : map._container.id + _.uniqueId('_pin_'),
        name: name,
        descr: descr,
        latitude: lat,
        longitude: lng
      };

      that.pins[pin.id] = pin;
      pin.marker = new L.Marker(new L.LatLng(lat, lng), { draggable: true });

      // Update when dragged.
      pin.marker.on('drag', function(e) {
        var pos = e.target._latlng;
        pin.latitude = pos.lat;
        pin.longitude = pos.lng;
        options.update(that.getPins());
      });

      map.addLayer(pin.marker);
      pin.marker.bindPopup(tpl('pinpoint_annotation', pin)).openPopup();
      if (!silent) options.update(that.getPins());
    };

    this.removePin = function(pin) {
      var pin = this.pins[pin];
      map.removeLayer(pin.marker);
      delete that.pins[pin.id];
      options.update(that.getPins());
    };

    this.getPins = function() {
      var pins = {};
      _.each(that.pins, function(p, key) {
        pins[key] = {
          name: p.name,
          descr: p.descr,
          latitude: p.latitude,
          longitude: p.longitude
        };
      });
      return pins;
    }

    // Restore saved pins
    _.each(options.pins, function(p, id) {
      that.addPin(p.latitude, p.longitude, p.name, p.descr, id, true);
    });
  };

})(window);
