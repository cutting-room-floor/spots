// (c) 2012 Michael Aufreiter, MapBox
// Pinpoint.js is freely distributable under the BSD license.

(function(window){
  

  var TEMPLATE = '\
        <div class="pin" id="<%= id%>"> \
        <div class="name<%= !name ? " empty" : "" %>" title="Click to edit"><%= !name ? "Enter Name" : name %></div> \
        <div class="controls" style="height: 20px; margin-top: 10px;"></div> \
        <div class="descr<%= !descr ? " empty" : "" %>" title="Click to edit"><%= !descr ? "<p>Description&hellip;</p>" : descr %></div> \
        <div><a href="#" class="remove-pin">Remove Pin</div> \
      </div>';

  // Initial Setup
  // -------------

  var Pinpoint = window.Pinpoint = function(map, options) {
    var that = this;
    this.pins = {};
    this.editor = new Proper();

    function tpl(name, data) {
      return _.template(TEMPLATE, data);
    }

    function initPin(pin) {
      var $el = $('#' + pin.id);

      if (pin.name) $el.find('.name').html(pin.name);
      if (pin.descr) $el.find('.descr').html(pin.descr);

      function init() {
        // Delete pin handler`
        $el.find('.remove-pin').unbind().bind('click', function() {
          that.removePin(pin.id);
          return false;
        });

        // Editor for pin name
        that.$name = $el.find('.name').unbind();

        that.$name.click(function() {
          that.editor.activate(that.$name, {
            placeholder: 'Enter Name',
            markup: false,
            multiline: false
          });

          that.editor.bind('changed', function() {
            pin.name = that.editor.content();
            options.update(that.getPins());
          });

           $el.find('.controls').removeClass('activated');
        });

        // Editor for pin description
        that.$descr = $el.find('.descr').unbind();

        that.$descr.click(function() {
          that.editor.activate(that.$descr, {
            placeholder: '<p>Enter Description&hellip;</p>',
            controlsTarget: $el.find('.controls'),
            markup: false
          });

          that.editor.bind('changed', function() {
            pin.descr = that.editor.content();
            options.update(that.getPins());
          });
        });
      }

      _.delay(init, 1);
    }

    var clickCount = 0;
    // Add new pin, every time the map gets clicked
    map.on('click', function(e) {
      clickCount += 1;
      if (clickCount <= 1) {
        _.delay(function() {
          if (clickCount <= 1) that.addPin(e.latlng.lat, e.latlng.lng);
          clickCount = 0;
        }, 200);
      }
    });

    // Initialize popup
    map.on('popupopen', function(e) {
      initPin(that.pins[$(e.popup._container).find('.pin').attr('id')]);
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
    }

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
