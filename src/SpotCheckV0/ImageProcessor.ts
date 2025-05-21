import { PNG } from 'pngjs';
import { createReadStream, createWriteStream } from "node:fs";
import path from 'node:path';
import fs from 'node:fs';
import Pixelmatch from 'pixelmatch';

export class ImageProcessor {

    private _baseDir: string;

    constructor(baseDir?: string) {
        this._baseDir = baseDir ?? __dirname;
    }

    normalize(file: string) {
        return path.isAbsolute(file)
            ? file
            : path.join(this._baseDir, '/', file);
    }

    async parseImage(image: string): Promise<PNG> {
        return new Promise((resolve, reject) => {
            const fd = createReadStream(this.normalize(image));
            fd.on('error', (error) => reject(error))
                .pipe(new PNG())
                // eslint-disable-next-line func-names
                .on('parsed', function () {
                    const that = this;
                    resolve(that);
                });
        });
    }

    async adjustCanvas(image: PNG, width: number, height: number) {
        if (image.width === width && image.height === height) {
            return image;
        };
    
        const imageAdjustedCanvas = new PNG({
            width,
            height,
            //bitDepth: image.bitDepth,
            inputHasAlpha: true,
        });
    
        PNG.bitblt(image, imageAdjustedCanvas, 0, 0, image.width, image.height, 0, 0);
    
        return imageAdjustedCanvas;
    }

    async compareImage(
        baselinePath: string,
        comparisonPath: string,
        diffPath: string,
        threshold: number) {

        let baselineImg: PNG;
        try {
            baselineImg = await this.parseImage(baselinePath);
        } catch (e) {
            return { percentage: 1, testFailed: true };
        }
        let comparisonImg: PNG;
        try {
            comparisonImg = await this.parseImage(comparisonPath);
        } catch (e) {
            return { percentage: 1, testFailed: true };
        }
        const diffImg = new PNG({
            width: Math.max(comparisonImg.width, baselineImg.width),
            height: Math.max(comparisonImg.height, baselineImg.height),
        });
    
        const baselineFullCanvas = await this.adjustCanvas(
            baselineImg,
            diffImg.width,
            diffImg.height
        );
    
        const comparisonFullCanvas = await this.adjustCanvas(
            comparisonImg,
            diffImg.width,
            diffImg.height
        );
    
        const pixelMismatchResult = Pixelmatch(
            baselineFullCanvas.data,
            comparisonFullCanvas.data,
            diffImg.data,
            diffImg.width,
            diffImg.height,
            { threshold: 0.1 }
        );
    
        const percentage = (pixelMismatchResult / diffImg.width / diffImg.height) ** 0.5;
        const testFailed = percentage > threshold;

        if (testFailed) {
            await fs.promises.mkdir(path.dirname(diffPath), { recursive: true });
            const stream = createWriteStream(
                this.normalize(diffPath)));
            diffImg.pack().pipe(stream);
            stream.end();
        }
    
        return { percentage, testFailed };
    }
}
