/*
MIT License

Copyright (c) 2017 advanceboy

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

https://github.com/advanceboy/webrtc-qrcode-reader
*/

declare namespace qrcode {
    export var imagedata: ImageData | null;
    export var width: number;
    export var height: number;
    export var debug: boolean;
    export var callback: (result: string) => void | null | undefined;
    export var result: string | null | undefined;
    export function decode(): string;
    export function decode(src: string): string;
    export function process(ctx: CanvasRenderingContext2D): string;
}

namespace WebRtcQR {
    export async function startReaderAsync(target: Element, readingResultCallback: (success: boolean, result: string) => void, options: ReaderOptions = {}, constraints: MediaStreamConstraints = { video: { facingMode: 'environment' }, audio: false }) {
        // validate arguments
        let optionsImpl = fillDefualtsToOptions(options);
        if (!(1.0 <= optionsImpl.zoomScale && optionsImpl.zoomScale <= 4.0)) {
            console.log("'zoomScale' argument needs to be between 1.0 and 4.0.");
            optionsImpl.zoomScale = 1.0;
        }
        if (constraints && constraints.video != null) {
            if (typeof constraints.video !== "boolean" && constraints.video.width == null) {
                constraints.video.width = optionsImpl.decodeSize * 4;
            }
        }

        // start the capturing
        let canvasWidth:number, canvasHeight: number;
        canvasWidth = canvasHeight = optionsImpl.decodeSize;
        target.insertAdjacentHTML('beforeend', '<video style="display:none;"></video>');
        target.insertAdjacentHTML('beforeend', `<canvas width="${canvasWidth}px" height="${canvasHeight}px" style="display:none;"></canvas>`);
        target.insertAdjacentHTML('beforeend', '<canvas style="display:block;"></canvas>');
        let video = target.childNodes[target.childNodes.length - 3] as HTMLVideoElement;
        let canvasTmp = target.childNodes[target.childNodes.length - 2] as HTMLCanvasElement;
        let canvasOut = target.childNodes[target.childNodes.length - 1] as HTMLCanvasElement;
        let canvasTmpContext = canvasTmp.getContext('2d') as CanvasRenderingContext2D;
        let canvasOutContext = canvasOut.getContext('2d') as CanvasRenderingContext2D;

        // call getUserMedia as async
        let stream = await navigator.mediaDevices.getUserMedia(constraints);
        video.src = window.URL.createObjectURL(stream);
        video.play();

        // initialize status
        let readerContext = new ReaderContext();
        readerContext.options = optionsImpl;
        readerContext.decoder = () => {
            // decoding start time
            let startTime = Date.now();
            // draw the video image to context
            let trimSideLen = Math.min(video.videoWidth, video.videoHeight) / readerContext.options.zoomScale;
            canvasTmpContext.drawImage(video
                , (video.videoWidth - trimSideLen) / 2
                , (video.videoHeight - trimSideLen) / 2
                , trimSideLen
                , trimSideLen
                , 0
                , 0
                , canvasWidth
                , canvasHeight
            );

            // decode qrcode image
            try {
                // decode
                qrcode.width = canvasWidth;
                qrcode.height = canvasHeight;
                qrcode.imagedata = canvasTmpContext.getImageData(0, 0, qrcode.width, qrcode.height);
                qrcode.result = qrcode.process(canvasTmpContext);

                // draw tagged image
                canvasTmpContext.putImageData(qrcode.imagedata, 0, 0);

                // callback
                readingResultCallback(true, qrcode.result);
            } catch (e) {
                readingResultCallback(false, e.toString());
            }

            // out view
            let targetWidth = getWidth(target), targetHeight = getHeight(target);
            canvasOut.setAttribute('width', targetWidth + 'px');
            canvasOut.setAttribute('height', targetHeight + 'px');
            let scale = Math.min(targetWidth / canvasWidth, targetHeight / canvasHeight);
            canvasOutContext.scale(scale, scale);
            canvasOutContext.drawImage(canvasTmp, (targetWidth / scale - canvasWidth) / 2, (targetHeight / scale - canvasHeight) / 2);

            // timer next decoding
            let interval = Math.max(0, readerContext.options.scanInterval - (Date.now() - startTime));
            readerContext.timeoutID = setTimeout(readerContext.decoder, interval);
        }

        // start decoding loop
        restartReader(readerContext);
        return readerContext;
    }
    export function stopReader(readerContext: ReaderContext) {
        // stop the capturing
        clearTimeout(readerContext.timeoutID);
    }
    export function restartReader(readerContext: ReaderContext) {
        // restart the capturing
        readerContext.timeoutID = setTimeout(readerContext.decoder, readerContext.options.scanInterval);
    }

    /* options */
    export interface ReaderOptions {
        scanInterval?: number;      // default: 250
        zoomScale?: number;         // default: 1.0
        decodeSize?: number;        // default: 480
    }
    interface ReaderOptionsImpl {
        scanInterval: number;
        zoomScale: number;
        decodeSize: number;
    }
    function fillDefualtsToOptions(options: ReaderOptions) : ReaderOptionsImpl {
        return {
            scanInterval:   options.scanInterval    == null ? 250 : options.scanInterval,
            zoomScale:      options.zoomScale       == null ? 1.0 : options.zoomScale,
            decodeSize:     options.decodeSize      == null ? 480 : options.decodeSize,
        };
    }

    /* context */
    export class ReaderContext {
        options: ReaderOptionsImpl;
        decoder: () => void;
        timeoutID: NodeJS.Timer;
    }

    /* helpers */
    function getWidth(el: Element): number {
        const styles = window.getComputedStyle(el);
        const width = el.getBoundingClientRect().width;
        const borderWidth1 = styles.borderLeftWidth !== null ? parseFloat(styles.borderLeftWidth) : 0;
        const borderWidth2 = styles.borderRightWidth !== null ? parseFloat(styles.borderRightWidth) : 0;
        const padding1 = styles.paddingLeft !== null ? parseFloat(styles.paddingLeft) : 0;
        const padding2 = styles.paddingRight !== null ? parseFloat(styles.paddingRight) : 0;
        return width - borderWidth1 - borderWidth2 - padding1 - padding2;
    }
    function getHeight(el: Element): number {
        const styles = window.getComputedStyle(el);
        const height = el.getBoundingClientRect().height;
        const borderWidth1 = styles.borderTopWidth !== null ? parseFloat(styles.borderTopWidth) : 0;
        const borderWidth2 = styles.borderBottomWidth !== null ? parseFloat(styles.borderBottomWidth) : 0;
        const padding1 = styles.paddingTop !== null ? parseFloat(styles.paddingTop) : 0;
        const padding2 = styles.paddingBottom !== null ? parseFloat(styles.paddingBottom) : 0;
        return height - borderWidth1 - borderWidth2 - padding1 - padding2;
    }
}
