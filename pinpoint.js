// (c) 2012 Michael Aufreiter, MapBox
// Pinpoint.js is freely distributable under the BSD license.

(function(window){

  // Initial Setup
  // -------------

  var Pinpoint = window.Pinpoint = function(map, options) {
    var that = this;
    this.pins = {};
    this.editor = new Proper();

    function tpl(name, data) {
      return _.template($('script[name='+name+']').html(), data);
    }

    function initPin(pin) {
      var $el = $('#' + pin.id);

      if (pin.name) $el.find('.name').html(pin.name);
      if (pin.descr) $el.find('.descr').html(pin.descr);


      function init() {
        // Delete pin handler`
        $el.find('.remove-pin').unbind().bind('click', function() {
          return that.removePin(pin.id);
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
            options.update(that.pins);
          });

           $el.find('.controls').removeClass('activated');
        });

        // Editor for pin description
        that.$descr = $el.find('.descr').unbind();

        that.$descr.click(function() {
          that.editor.activate(that.$descr, {
            placeholder: '<p>Enter Description&hellip;</p>',
            controlsTarget: $el.find('.controls')
          });

          that.editor.bind('changed', function() {
            pin.descr = that.editor.content();
            options.update(that.pins);
          });

          $el.find('.controls').addClass('activated');
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

    this.addPin = function(lat, lng, name, descr) {
      var pin = {
        id: map._container.id + _.uniqueId('_pin_'),
        name: name,
        descr: descr
      };

      that.pins[pin.id] = pin;
      pin.marker = new L.Marker(new L.LatLng(lat, lng), { draggable: true });
      map.addLayer(pin.marker);
      pin.marker.bindPopup(tpl('pinpoint_annotation', pin)).openPopup();
      options.update(that.pins);
    }

    this.removePin = function(pin) {
      var pin = this.pins[pin];
      map.removeLayer(pin.marker);
      delete that.pins[pin.id];
      options.update(that.pins);
    };

    this.getPins = function() {
      return that.pins;
    }
  };

})(window);
