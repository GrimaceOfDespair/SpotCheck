import { IDiffTestReport } from "./Report/DiffReport";
import { ILogger, NullLogger } from "./Report/ILogger";
import { Temp } from "./Temp";
import fs from 'node:fs';
import path from 'node:path';

export class DiffReportCollector {

    private _reportName: string;
    private _screenshots: string;
    private _logger: ILogger;

    constructor(reportName?: string, screenshots?: string, logger?: ILogger) {
        this._reportName = reportName ?? 'diff-report.json';
        this._screenshots = screenshots ?? '';
        this._logger = logger ?? NullLogger;
    }

    async collectReport(baseDir: string, report: IDiffTestReport): Promise<string> {
        const output = await Temp.createFolder();
        const targetReport = path.join(output, this._reportName);
        
        this._logger.info(`Writing report to ${targetReport}`);

        await fs.promises.writeFile(targetReport, JSON.stringify(report));

        await this._collectScreenshots(baseDir, output, report);

        return output;
    }

    private async _collectScreenshots(source: string, target:string, report: IDiffTestReport) {

        this._logger.info(`Collect screenshots from ${source} into ${target}`);

        for (const test of report.suites.flatMap(s => s.tests)) {
            await this._copyImage(source, target, test.baselinePath);
            await this._copyImage(source, target, test.comparisonPath);
            await this._copyImage(source, target, test.diffPath);
        }
    }

    private async _copyImage(source: string, target: string, image: string) {
        if (!image) {
            return;
        }

        const sourceImage = path.join(source, this._screenshots, image);
        const targetImage = path.join(target, this._screenshots, image);
        const targetFolder = path.dirname(targetImage);

        await fs.promises.mkdir(targetFolder, { recursive: true });
        await fs.promises.copyFile(sourceImage, targetImage,);
    }
}