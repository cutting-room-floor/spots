Pinpoint
========


Annotates maps.

Synopsis
--------

[Pinpoint](http://github.com/michael/pinpoint) lets you annotate any
maps that are support by Leaflet. You can add an as many pins as you
want, name and describe them, move them around and remove them when no
longer needed.

![image](http://substance-assets.s3.amazonaws.com/02/d9afbfbe522eeeb9f2a591c31ba102/pinpoint.png)

Usage
--------

    var map = new L.Map('map', {
      layers: new L.TileLayer('http://a.tiles.mapbox.com/v3/mapbox.mapbox-streets/{z}/{x}/{y}.png', {}),
      center: new L.LatLng(51.505, -0.09),
      zoom: 13,
    });

    var annotator = new Pinpoint(map, {
      update: function(pins) {
        console.log('your pins just got updated:' + Object.keys(pins);
      }
    });