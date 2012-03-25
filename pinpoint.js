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

    function makeEditable(pin) {
      // Editor for pin name
      that.$name = $('#' + pin.id + ' .name').unbind();

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
      });

      // Editor for pin description
      that.$descr = $('#' + pin.id + ' .descr').unbind();
      
      that.$descr.click(function() {
        that.editor.activate(that.$descr, {
          placeholder: 'Enter Description',
          controlsTarget: $('#sheet_editor_controls')
        });

        that.editor.bind('changed', function() {
          pin.descr = that.editor.content();
          options.update();
        });
      });
    }

    function addPin(lat, lng) {
      var pin = {
        id: map._container.id + _.uniqueId('_pin_'),
        name: "",
        descr: ""
      };

      that.pins[pin.id] = pin;
      pin.marker = new L.Marker(new L.LatLng(lat, lng), { draggable: true });
      map.addLayer(pin.marker);
      pin.marker.bindPopup(tpl('pinpoint_annotation', pin)).openPopup();
    }

    function removePin(id) {
      // TODO: implement
    }

    // Add new pin, every time the map gets clicked
    map.on('click', function(e) { 
      console.log(e);
      addPin(e.latlng.lat, e.latlng.lng);
    });

    // Initialize popup
    map.on('popupopen', function(e) {
      makeEditable(that.pins[$(e.popup._container).find('.pin').attr('id')]);
    });

    // Expose public API
    // -------------

    this.getPins = function() {
      return that.pins;
    }
  };

})(window);