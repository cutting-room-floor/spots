MapBox Spots
========

[MapBox Spots](http://github.com/mapbox/spots) lets you tell a story, using maps. 
You can add an as many spots as you want, name and describe them, move them 
around and remove them when no longer needed.

![image](http://substance-assets.s3.amazonaws.com/c0/fc0e1bf26323c456c46ab6d346aa94/pinpoint.png)

Usage
--------

    var map = new L.Map('map', {
      layers: new L.TileLayer('http://a.tiles.mapbox.com/v3/mapbox.mapbox-streets/{z}/{x}/{y}.png', {}),
      center: new L.LatLng(51.505, -0.09),
      zoom: 13,
    });

    var spots = new Spots({
      el: '.spots-container',
      map: map
    });

    spots.bind('update', function(spots) {
      // store spots, anyone?
    });