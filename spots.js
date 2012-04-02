// (c) 2012 Michael Aufreiter, MapBox
// Spot is freely distributable under the BSD license.

(function(window){

// Spots
// ------------

var collections = {};

collections["spots"] = {
  
  // New Spots
  // -------------------

  enter: function(spots) {
    var that = this;
    spots.each(function(spot, key, index) {
      var spot = $(_.template($('script[name=nav_spot]').html(), {
        spot: spot,
        active: that.activeSpot === spot
      })).css('left', spot.pos.x)
         .css('bottom', -70)
         .appendTo($('.spots-navigation'));

    });
    _.delay(this.collections["spots"].update, 200, spots)
  },

  // Existing Spots
  // -------------------

  update: function(spots) {
    spots.each(function(spot) {
      $('#'+spot.id)
       .css('left', spot.pos.x)
       .css('bottom', 10)
    });
  },

  // Removed Spots
  // -------------------

  exit: function(spots) {
    spots.each(function(item) {
      $('#'+item.id).remove();
    });
  }
};



var Spots = window.Spots = Dance.Performer.extend({

  collections: collections,

  events: {
    'change .name': '_updateData',
    'change .descr': '_updateData',
    'click .spots-navigation .spot': '_gotoSpot',
    'click .remove-spot': '_removeSpot'
  },

  _removeSpot: function(e) {
    var spot = this.spots.get($(e.currentTarget).parent().attr('data-id'));
    this.map.removeLayer(spot.marker);
    this.spots.del(spot.id);
    this.activeSpot = null;
    this.trigger('update', this.spots);
    this.render();
    return false;
  },

  _gotoSpot: function(e) {
    this.gotoSpot(this.spots.get($(e.currentTarget).attr('data-id')));
  },

  _updateData: function(e) {
    this.activeSpot.name = this.$('.name').val();
    this.activeSpot.descr = this.$('.descr').val();
  },


  // Contructor
  // -------------------

  initialize: function(options) {
    this.map = options.map;
    this.spots = new Data.Hash();
    this.data["spots"] = this.spots;
    this.activeSpot = null;

    // Restore saved spots
    options.spots.each(_.bind(function(s, id) {
      this.addSpot(s.latitude, s.longitude, s.name, s.descr, id, true);
    }, this));

    this.activeSpot = this.spots.first();
    this.registerMapEvents();
    this.registerKeyBindings();
  },


  // Calculating layout
  // -------------------

  layout: function(property) {
    this.data["spots"].each(function(spot, key, index) {
      spot.pos = {
        x: index*100,
      };
    });
  },

  // Jump to Spot
  // -------------------

  gotoSpot: function(spot) {
    this.activeSpot = spot;
    this.render();
    this.map.setView(new L.LatLng(spot.latitude, spot.longitude), 15);
  },

  // Jump to next Spot
  // -------------------

  nextSpot: function() {
    if (!this.activeSpot) return this.gotoSpot(this.spots.first());
    var currentIndex = this.spots.index(this.activeSpot.id);
    this.gotoSpot(this.spots.at((currentIndex + 1) % this.spots.length));
  },

  // Jump to previous Spot
  // -------------------

  prevSpot: function() {
    if (!this.activeSpot) return this.gotoSpot(this.spots.last());
    var currentIndex = this.spots.index(this.activeSpot.id);
    if (currentIndex<=0) return this.gotoSpot(this.spots.last());
    this.gotoSpot(this.spots.at((currentIndex - 1) % this.spots.length));
  },

  // Add a new spot
  // -------------------

  addSpot: function(lat, lng, name, descr, id, silent) {
    var spot = {
      id: id ? id : this.map._container.id + _.uniqueId('_spot_'),
      name: name || 'Untitled',
      descr: descr || 'Undescribed.' ,
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
      this.render();
      this.trigger('update', this.spots);
    }
    
    function click(e) {
      this.activeSpot = spot;
      this.render();
    }

    spot.marker.on('drag', _.bind(drag, this));
    spot.marker.on('click', _.bind(click, this));
    this.map.addLayer(spot.marker);

    if (!silent) this.trigger('update', this.spots);
    return spot;
  },


  // Keyboard navigation - a pleasure
  // -------------------

  registerKeyBindings: function() {
    $(document)
      .keydown('right', _.bind(function() { this.nextSpot(); this.render(); }, this))
      .keydown('left',  _.bind(function() { this.prevSpot(); this.render(); }, this))
      .keydown('esc',  _.bind(function() { this.activeSpot = null; this.render(); }, this));
  },


  // Register Map Events
  // -------------------

  registerMapEvents: function() {
    var that = this;
    var clickCount = 0;
    // Add new spot, every time the map gets clicked
    this.map.on('click', function(e) {
      if (that.activeSpot) { }

      clickCount += 1;
      if (clickCount <= 1) {
        _.delay(function() {
          if (clickCount <= 1) {
            that.activeSpot = that.addSpot(e.latlng.lat, e.latlng.lng);
            that.render();
          }
          clickCount = 0;
        }, 300);
      }
    });
  },

  // Render the beast
  // -------------------

  render: function() {
    this.layout();
    this.refresh();

    this.$('.spots-navigation .spot.active').removeClass('active');
    if (this.activeSpot) {
      this.$('.spot-details').replaceWith(_.template($('script[name=spot]').html(), {
        spot: this.activeSpot
      }));
      this.$('#'+ this.activeSpot.id).addClass('active');
    } else {
      this.$('.spot-details').empty();
    }
    return this;
  }
});

})(window);
