/*global $*/

require('./fontawesome');

window.app = {};
window.app.fn = {};

$(document).ready(function () {
    require('./map');

    $('#selectSource').on('change', function () {
        var multi = parseInt($(this).find('option:selected').data('multi')) || 0;

        window.app.fn.clearResult();
        window.app.fn.clearLocation();

        $('#inputStreet, #inputZone, #inputAddress').prop('required', false);

        if (multi === 1) {
            $('#inputStreet').prop('required', true);
            $('#inputZone').prop('required', true);
            if ($('#geocoder-form-address-multi').hasClass('d-none')) {
                $('#geocoder-form-address-multi').removeClass('d-none');
                $('#geocoder-form-address-single').addClass('d-none');
                $('#inputStreet, #inputHouseNumber, #inputZone').val('');
            }
            $('#inputStreet').focus();
        } else {
            $('#inputAddress').prop('required', true);
            if ($('#geocoder-form-address-single').hasClass('d-none')) {
                $('#geocoder-form-address-single').removeClass('d-none');
                $('#geocoder-form-address-multi').addClass('d-none');
                $('#inputAddress').val('');
            }
            $('#inputAddress').focus();
        }
    });

    $('#geocoder-form').on('submit', function (event) {
        var multi = parseInt($(this).find('option:selected').data('multi')) || 0;

        event.preventDefault();

        $('#geocoder-form button[type=submit]').prop('disabled', true);

        window.app.fn.clearResult();
        window.app.fn.clearLocation();

        var data = {
            source: $('#selectSource').val()
        };
        if (multi === 1 && !isNaN(parseInt($('#inputZone').val()))) {
            data.streetName = $('#inputStreet').val();
            data.streetNumber = $('#inputHouseNumber').val();
            data.postalCode = $('#inputZone').val();
            data.address = data.streetName + ' ' + data.streetNumber + ', ' + data.postalCode;
        } else if (multi === 1 && isNaN(parseInt($('#inputZone').val()))) {
            data.streetName = $('#inputStreet').val();
            data.streetNumber = $('#inputHouseNumber').val();
            data.locality = $('#inputZone').val();
            data.address = data.streetName + ' ' + data.streetNumber + ', ' + data.locality;
        } else {
            data.address = $('#inputAddress').val();
        }

        fetch('./geocode', {
            body: JSON.stringify(data),
            credentials: 'same-origin',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: 'post'
        }).
            then(function (response) {
                return response.json();
            }).
            then(function (data) {
                window.app.fn.process(data);
            });
    });
});

/**
 *
 */
window.app.fn.clearResult = function () {
    $('#geocoder-location').removeClass('overlay-error overlay-warning').addClass('d-none').empty();
};

/**
 *
 */
window.app.fn.displayResult = function (address, attribution) {
    $('#geocoder-location').removeClass('d-none').text(address);

    if (typeof attribution !== 'undefined' && attribution.length > 0) {
        $('#geocoder-location').append('<div class="small text-info">' + attribution + '</div>');
    }
};

/**
 *
 */
window.app.fn.process = function (data) {
    $('#geocoder-form button[type=submit]').prop('disabled', false);

    if (typeof data.features === 'undefined') {
        $('#geocoder-location').addClass('overlay-error').removeClass('d-none').html('<strong>ERROR:</strong><br>' + (data.error || 'Unknown error'));
    }
    else if (data.features.length === 0) {
        $('#geocoder-location').addClass('overlay-warning').removeClass('d-none').text('No result');
    }
    else if (data.features.length === 1) {
        window.app.fn.locate(data.features[0].geometry.coordinates[0], data.features[0].geometry.coordinates[1]);
        window.app.fn.displayResult(data.features[0].properties.formattedAddress, data.features[0].properties.attribution);
    } else {
        $('#geocoder-results').empty();
        for (var i = 0; i < data.features.length; i++) {
            var li = document.createElement('li');
            $(li).data({
                lng: data.features[i].geometry.coordinates[0],
                lat: data.features[i].geometry.coordinates[1],
                address: data.features[i].properties.formattedAddress,
                attribution: data.features[i].properties.attribution
            }).
                append(data.features[i].properties.formattedAddress).
                on('click', function () {
                    var data = $(this).data();

                    window.app.fn.locate(data.lng, data.lat);
                    window.app.fn.displayResult(data.address, data.attribution);

                    $('#geocoder-modal').modal('hide');
                });
            $('#geocoder-results').append(li);
        }
        $('#geocoder-modal').modal('show');
    }
};

/**
 *
 */
window.app.fn.reverse = function (lng, lat, zoom) {
    window.app.fn.clearResult();
    window.app.fn.clearLocation();

    $('#inputStreet, #inputHouseNumber, #inputZone').val('');
    $('#inputAddress').val('');

    fetch('./reverse', {
        body: JSON.stringify({
            lat: lat,
            lng: lng,
            source: $('#selectSource').val(),
            zoom: zoom
        }),
        credentials: 'same-origin',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        method: 'post'
    }).
        then(function (response) {
            return response.json();
        }).
        then(function (data) {
            window.app.fn.process(data);
        }).
        catch(function () {
            $('#geocoder-location').addClass('overlay-error').removeClass('d-none').html('<strong>ERROR:</strong><br>Unknow error, please contact geocoder developers.');
        });
};
