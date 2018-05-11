import 'ol/ol.css';

import Map from 'ol/map';
import Control from 'ol/control';
import Attribution from 'ol/control/attribution';
import ScaleLine from 'ol/control/scaleline';
import Feature from 'ol/feature';
import Point from 'ol/geom/point';
import TileLayer from 'ol/layer/tile';
import VectorLayer from 'ol/layer/vector';
import Proj from 'ol/proj';
import OSMSource from 'ol/source/osm';
import VectorSource from 'ol/source/vector';
import Style from 'ol/style/style';
import CircleStyle from 'ol/style/circle';
import RegularShapeStyle from 'ol/style/regularshape';
import StrokeStyle from 'ol/style/stroke';
import View from 'ol/view';

window.app.location = new Feature({});

window.app.locationLayer = new VectorLayer({
    source: new VectorSource({}),
    style: [
        new Style({
            image: new CircleStyle({
                fill: null,
                radius: 25,
                stroke: new StrokeStyle({color: 'black', width: 10})
            })
        }),
        new Style({
            image: new CircleStyle({
                fill: null,
                radius: 25,
                stroke: new StrokeStyle({color: 'white', width: 5})
            })
        }),
        new Style({
            image: new RegularShapeStyle({
                angle: 0,
                fill: null,
                points: 4,
                radius: 5,
                radius2: 0,
                stroke: new StrokeStyle({color: 'black', width: 2})
            })
        })
    ]
});

window.app.map = new Map({
    controls: Control.defaults({attribution: false}).extend([new Attribution({collapsible: false}), new ScaleLine()]),
    layers: [
        new TileLayer({
            source: new OSMSource({
                attributions: [OSMSource.ATTRIBUTION, 'Tiles courtesy of <a href="https://geo6.be/" target="_blank">GEO-6</a>'],
                url: 'https://tile.geo6.be/osmbe/{z}/{x}/{y}.png',
                maxZoom: 18
            })
        }),
        window.app.locationLayer
    ],
    target: 'map',
    view: new View({
        center: [0, 0],
        zoom: 2
    })
});
window.app.map.on('singleclick', function (event) {
    var coordinates = Proj.toLonLat(event.map.getCoordinateFromPixel(event.pixel));
    var zoom = event.map.getView().getZoom();

    window.app.fn.reverse(coordinates[0], coordinates[1], zoom);
});

/**
 *
 */
window.app.fn.clearLocation = function() {
    window.app.locationLayer.getSource().clear();
};

/**
 *
 */
window.app.fn.locate = function (lng, lat) {
    window.app.location.setGeometry(new Point(Proj.fromLonLat([lng, lat])));
    window.app.locationLayer.getSource().addFeature(window.app.location);

    window.app.map.getView().animate({
        center: window.app.location.getGeometry().getCoordinates(),
        duration: 1000,
        zoom: 18
    });
};
