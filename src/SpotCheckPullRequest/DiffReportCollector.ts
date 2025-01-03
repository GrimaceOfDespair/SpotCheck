import { IDiffTestReport } from "./Report/DiffReport";
import { Temp } from "./Temp";
import fs from 'node:fs';
import path from 'node:path';

export class DiffReportCollector {

    private _reportName: string;
    private _screenshots: string;

    constructor(reportName?: string, screenshots?: string) {
        this._reportName = reportName ?? 'diff-report.json';
        this._screenshots = screenshots ?? '';
    }

    async collectReportFile(reportPath: string): Promise<string> {
        const output = await Temp.createFolder();
        const targetReport = path.join(output, this._reportName);
        await fs.promises.copyFile(reportPath, targetReport);

        const reportData = await fs.promises.readFile(reportPath);
        const report = <IDiffTestReport>JSON.parse(reportData.toString());

        const baseDir = path.dirname(reportPath);
        await this._collectScreenshots(baseDir, output, report);

        return output;
    }

    async collectReport(baseDir: string, report: IDiffTestReport): Promise<string> {
        const output = await Temp.createFolder();

        await this._collectScreenshots(baseDir, output, report);

        return output;
    }

    private async _collectScreenshots(source: string, target:string, report: IDiffTestReport) {
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