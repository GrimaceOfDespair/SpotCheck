import path from 'node:path';

export class ReportContext {
    constructor(reportFile: string, baseDir: string, screenshotFolder: string) {

        const absoluteReportFile = path.isAbsolute(reportFile)
            ? reportFile
            : path.join(__dirname, '/', reportFile);

        this.reportFile = absoluteReportFile;
        this.basePath = path.dirname(absoluteReportFile);
        this.baseName = path.basename(absoluteReportFile, '.xml');
        this.reportJson = path.join(this.basePath, `${this.baseName}.json`);
        this._screenshotFolder = screenshotFolder;
        this._baseDir = baseDir;
    }

    resolveRelative(version: string, image: string): string {
        return path.join(this._screenshotFolder, version, image);
    }

    resolveAbsolute(version: string, image: string): string {
        return path.join(this._baseDir, this._screenshotFolder, version, image);
    }

    reportFile: string;
    basePath: string;
    baseName: string;
    reportJson: string;
    private _screenshotFolder: string;
    private _baseDir: string;
}