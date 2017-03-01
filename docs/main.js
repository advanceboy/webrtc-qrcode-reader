/// </// <reference path="lib/web-qrcode-reader.min.js" />
$(function (doc, ev) {
    var readerContext;
    var elScanner = document.getElementById('scanner');
    var $output = $('#output');
    var $error = $('#error');

    // zoom button handler
    $('#dropdownMenuZoom ~ ul > li > a[data-value]').click(function (ev) {
        if (readerContext !== undefined) {
            readerContext.options.zoomScale = parseInt($(ev.target).attr('data-value'));
        }
    })

    // start the captureing
    WebRtcQR.startReaderAsync(elScanner, function (success, result) {
        $error.text('');
        if (success) {
            $output.text(result);
        } else {
            $error.text(result);
        }
    }, { zoomScale: 1.0 })
        .catch(function (e) {
            $error.text(e);
            console.error(e);
        })
        .then(function (context) {
            readerContext = context;
        });
});
