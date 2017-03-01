webrtc-qrcode-reader
====================

## About

This is a JavaScript library to create a QRCode reader for WebRTC compatible browser.

## Demo

See a demo: [https://advanceboy.github.io/webrtc-qrcode-reader/](https://advanceboy.github.io/webrtc-qrcode-reader/)

## Usage

1. Include `jsqrcode-combined.min.js` and `webrtc-qrcode-reader.min.js` in the `lib` directory.
1. Create a `<div>` element with a size you want to show.
    ```
    <div style="width: 480px; height: 480px;" id="scanner"></div>
    ```
1. Call the `WebRtcQR.startReaderAsync` function on the div element.
    ```
    WebRtcQR.startReaderAsync(document.getElementById('scanner');, function (success, result) {
        if (success) {
            // do something when code is read
        } else {
            // show scan errors
        }
    }, { zoomScale: 1.0 })
        .catch(function (e) {
            // show initialize video streaming errors
        })
        .then(function (context) {
            // you got the QRCode reader context.
        });
    ```
    * callback function will be called on each scanning.
    * The Promise instance signs that the initialize of video streaming was succeed or not.
1. You can configure scanning the through readerContext instance got from the Promise onFulfilled callback.


### Options

* `scanInterval`
    * scanning interval. default: 250(ms)
* `zoomScale`
    * zoom scaling. default: 1.0
    * This parameter needs to be between 1.0 and 4.0.
    * You can change this parameter after starting the scanning through `options` property of the ReaderContext.
* `decodeSize`
    * The temporary canvas size used in decoding. defailt: 480


## LICENSE

### This Project

See `LICENSE` file.

### jsqrcode

See the license notice implemented in the source code (`jsqrcode-combined.min.js`).
