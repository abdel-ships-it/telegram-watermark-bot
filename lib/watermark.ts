import * as gm from 'gm';
import stream = require('stream');
import { Canvas, createCanvas, loadImage } from 'canvas';
import { ContrastCalculator } from './contrast-calculator';
import * as fs from 'fs';


export class WaterMark {

    private static PADDING = 32;

    private waterMarkPath = {
        dark: 'black-text.png',
        light:  'white-text.png'
    };


    async perform(buffer: Buffer, url: string): Promise<stream.PassThrough>  {
        const image = gm(buffer);

        let canvas: Canvas;

        const context: CanvasRenderingContext2D = await loadImage(url).then( async image => {
            canvas = createCanvas(image.width, image.height);
            const ctx = canvas.getContext('2d');
            ctx.drawImage(image, 0, 0);
            return ctx;
        });
        
        const mainImageSize = await this.getSize(image);

        const imageSurfaceArea = mainImageSize.width * mainImageSize.height;

        const waterMarkTotalSurfaceAreaPercentage = 2.2;

        const waterMarkPaddingTotalSurfaceAreaPercentage = 0.09;
        
        const padding = Math.sqrt(imageSurfaceArea * (waterMarkPaddingTotalSurfaceAreaPercentage / 100));

        const waterMarkSize = Math.sqrt(imageSurfaceArea * (waterMarkTotalSurfaceAreaPercentage / 100));

        const positions = {
            x: (mainImageSize.width - waterMarkSize) - WaterMark.PADDING,
            y: (mainImageSize.height - waterMarkSize) - WaterMark.PADDING
        };

        const contrastCalculator = new ContrastCalculator();

        const idealContrast = contrastCalculator.getIdealContrast(positions, {
            x: mainImageSize.width - WaterMark.PADDING,
            y: mainImageSize.height - WaterMark.PADDING
        }, context);

        const waterMarkPath = idealContrast === 'light' ? this.waterMarkPath.light : this.waterMarkPath.dark;

        console.log(`
        mainImageSize: ${mainImageSize.width} - ${mainImageSize.height} 
        watermark size ${waterMarkSize}
        padding: ${padding}
        waterMarkPath ${waterMarkPath}
        `);

        const imageDraw = image.draw(`gravity SouthEast image Over ${positions.x},${positions.y} ${waterMarkSize},${waterMarkSize} "./assets/${waterMarkPath}"`);

        const newStream = imageDraw.stream();
        
        return newStream;
    }

    public toBuffer(readStream: stream.Readable): Promise<Buffer> {

        const promise = new Promise<Buffer>(resolve => {
            const buffer = [];
            readStream.on('data', data => buffer.push(data));
            readStream.on('end', () => {
                const buf = Buffer.concat(buffer);

                resolve(buf);
            });
        });

        return promise;
    }

    private getSize(gmState: gm.State): Promise<gm.Dimensions> {
        return new Promise((resolve, reject) => {
            gmState.size((err, dimensions) => {
                if (err) {
                    return reject(err);
                };

                resolve(dimensions);
            });
        });
    }
}
