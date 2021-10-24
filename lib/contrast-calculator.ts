interface IPosition {
    x: number;
    y: number;
}

/** 
 * @author Abdel El-medny
 * This class will be responsible for calculating the ideal text contrast for a given image in a given location
 */
export class ContrastCalculator {
    constructor() { }

    public getIdealContrast(startPoint: IPosition, endPoint: IPosition, ctx: CanvasRenderingContext2D) {
        const pixels = this.getPixelsInRect(startPoint, endPoint);

        console.log('[getIdealContrast] pixels', pixels);

        const average = this.getAverageColorInPixels(pixels, ctx);

        console.log('[getIdealContrast] average', average);

        const idealContrast = this.getContrast(average);

        return idealContrast;
    }

    private getPixelsInRect( startPoint: IPosition, endPoint: IPosition ): IPosition[] {
        const positions: IPosition[] = [];

        for (let yMin = startPoint.y; yMin <= endPoint.y; yMin++) {
            for (let xMin = startPoint.x; xMin <= endPoint.x; xMin++) {
                positions.push({
                    x: xMin,
                    y: yMin
                });
            }
        }

        return positions;
    }

    /** 
     * Gets the average color in a rectangle
     */
    private getAverageColorInPixels(
        pixels: IPosition[],
        context: CanvasRenderingContext2D
    ): [number, number, number] {

        const totalRGB = pixels.map(pixel => {
            const rgba = this.getRGBFromImage(pixel, context);

            const rgb = [rgba[0], rgba[1], rgba[2]];

            return rgb;
        })
        .reduce((prev, next) => {
            const r = prev[0] + next[0];
            const g = prev[1] + next[1];
            const b = prev[2] + next[2];
            return [r, g, b];
        });

        const averageRGB: [number, number, number] = [
            totalRGB[0] / pixels.length,
            totalRGB[1] / pixels.length,
            totalRGB[2] / pixels.length
        ];

        console.log('%c  ', `background-color: rgb(${averageRGB.join()})`);

        return averageRGB;
    }

    private getRGBFromImage(
        pixel: IPosition,
        context: CanvasRenderingContext2D
    ): Uint8ClampedArray {
        const { x, y } = pixel;
        const rgb = context.getImageData(
            x, y, 1, 1
        ).data;

        return rgb;
    }

    private getContrast(rgb: [number, number, number]): 'light' | 'dark' {
        console.log(`[getContrast] rgb=${rgb.join(',')}`);
        const [r, g, b] = rgb;

        /* 
          about half of 256. 
          Lower threshold equals more dark text on dark background
        */
        const threshold = 130;

        const red = r;
        const green = g;
        const blue = b;

        const cBrightness = (
            (red * 299) +
            (green * 587) +
            (blue * 114)
        ) / 1000;

        console.log(`[getContrast] cBrightness=${cBrightness} threshold=${threshold}`);

        if (cBrightness >= threshold) {
            return 'dark';
        } else {
            return 'light';
        };
    }
}