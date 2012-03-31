// (c) 2012 Michael Aufreiter, MapBox
// Spot is freely distributable under the BSD license.

(function(window){

var Spots = window.Spots = Dance.Performer.extend({

  events: {
    'change .name': '_updateData',
    'change .descr': '_updateData',
    'click .spots .spot': '_gotoSpot',
    'click .remove-spot': '_removeSpot'
  },

  _removeSpot: function(e) {
    var spot = this.spots.get($(e.currentTarget).parent().attr('id'));
    this.map.removeLayer(spot.marker);
    this.spots.del(spot.id);
    this.trigger('update', this.spots);
    this.showOverview();
    return false;
  },

  _gotoSpot: function(e) {
    var spot = this.spots.get($(e.currentTarget).attr('data-id'));
    this.showSpot(spot);
    this.map.setView(new L.LatLng(spot.latitude, spot.longitude), 15);
  },

  _updateData: function() {
    this.activeSpot.name = this.$('.name').val();
    this.activeSpot.descr = this.$('.descr').val();
  },

  initialize: function(options) {
    this.map = options.map;
    this.spots = new Data.Hash();
    this.activeSpot = null;

    // Restore saved spots
    options.spots.each(_.bind(function(s, id) {
      this.addSpot(s.latitude, s.longitude, s.name, s.descr, id, true);
    }, this));

    this.registerMapEvents();    
  },

  showOverview: function() {
    this.activeSpot = null;
    this.$('.spot-details').empty();
    this.$('.spots-navigation').html(_.template($('script[name=overview]').html(), {
      spots: this.spots
    }));
  },

  showSpot: function(spot) {
    this.activeSpot = spot;
    this.$('.spot-details').replaceWith(_.template($('script[name=spot]').html(), {
      spot: spot
    }));
  },

  // Add a new spot
  // -------------------

  addSpot: function(lat, lng, name, descr, id, silent) {
    var spot = {
      id: id ? id : this.map._container.id + _.uniqueId('_spot_'),
      name: name,
      descr: descr,
      latitude: lat,
      longitude: lng
    };

    this.spots.set(spot.id, spot);
    spot.marker = new L.Marker(new L.LatLng(lat, lng), { draggable: true });

    // Update when dragged.
    function drag(e) {
      var pos = e.target._latlng;
      spot.latitude = pos.lat;
      spot.longitude = pos.lng;
      this.trigger('update', this.spots);
    }
    
    function click(e) {
      this.showSpot(spot);
    }

    spot.marker.on('drag', _.bind(drag, this));
    spot.marker.on('click', _.bind(click, this));

    this.map.addLayer(spot.marker);
    
    this.showSpot(spot);

    if (!silent) this.trigger('update', this.spots);
    return spot;
  },

  // Register Map Events
  // -------------------

  registerMapEvents: function() {
    var that = this;
    var clickCount = 0;
    // Add new spot, every time the map gets clicked
    this.map.on('click', function(e) {
      if (that.activeSpot) return that.showOverview();

      clickCount += 1;
      if (clickCount <= 1) {

        _.delay(function() {
          if (clickCount <= 1) {
            var spot = that.addSpot(e.latlng.lat, e.latlng.lng);
            that.showOverview();
          }
          clickCount = 0;
        }, 300);
      }
    });
  },

  render: function() {
    this.showOverview();
    return this;
  }
});

})(window);
