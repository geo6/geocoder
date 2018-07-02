import 'ol/ol.css';

import {
    Feature,
    Map,
    View
} from 'ol';
import {
    defaults as ControlDefaults,
    Attribution,
    ScaleLine
} from 'ol/control';
import {
    Point
} from 'ol/geom';
import {
    Tile as TileLayer,
    Vector as VectorLayer
} from 'ol/layer';
import {
    OSM as OSMSource,
    Vector as VectorSource
} from 'ol/source';
import {
    ATTRIBUTION as OSMSourceAttribution
} from 'ol/source/OSM';
import {
    fromLonLat,
    toLonLat
} from 'ol/proj';
import {
    Circle,
    RegularShape,
    Stroke,
    Style
} from 'ol/style';

window.app.location = new Feature({});

window.app.locationLayer = new VectorLayer({
    source: new VectorSource({}),
    style: [
        new Style({
            image: new Circle({
                fill: null,
                radius: 25,
                stroke: new Stroke({color: 'black', width: 10})
            })
        }),
        new Style({
            image: new Circle({
                fill: null,
                radius: 25,
                stroke: new Stroke({color: 'white', width: 5})
            })
        }),
        new Style({
            image: new RegularShape({
                angle: 0,
                fill: null,
                points: 4,
                radius: 5,
                radius2: 0,
                stroke: new Stroke({color: 'black', width: 2})
            })
        })
    ]
});

window.app.map = new Map({
    controls: ControlDefaults({attribution: false}).extend([new Attribution({collapsible: false}), new ScaleLine()]),
    layers: [
        new TileLayer({
            source: new OSMSource({
                attributions: [OSMSourceAttribution, 'Tiles courtesy of <a href="https://geo6.be/" target="_blank">GEO-6</a>'],
                url: 'https://tile.geo6.be/osmbe' + (window.app.locale === 'fr' || window.app.locale === 'nl' ? '-' + window.app.locale : '') + '/{z}/{x}/{y}.png',
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
    var coordinates = toLonLat(event.map.getCoordinateFromPixel(event.pixel));
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
    window.app.location.setGeometry(new Point(fromLonLat([lng, lat])));
    window.app.locationLayer.getSource().addFeature(window.app.location);

    window.app.map.getView().animate({
        center: window.app.location.getGeometry().getCoordinates(),
        duration: 1000,
        zoom: 18
    });
};
