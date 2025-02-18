import path from 'node:path';

export class ReportContext {
    constructor(reportFile: string, baseDir: string) {

        const absoluteReportFile = path.isAbsolute(reportFile)
            ? reportFile
            : path.join(__dirname, '/', reportFile);

        this.reportFile = absoluteReportFile;
        this.basePath = path.dirname(absoluteReportFile);
        this.baseName = path.basename(absoluteReportFile, '.xml');
        this.reportJson = path.join(this.basePath, `${this.baseName}.json`);
        this._baseDir = baseDir;
    }

    resolveRelative(version: string, image: string): string {
        return [version, image]
            .filter(_ => _)
            .join('/');
    }

    resolveAbsolute(version: string, image: string): string {
        return [this._baseDir, version, image]
            .filter(_ => _)
            .join('/');
    }

    reportFile: string;
    basePath: string;
    baseName: string;
    reportJson: string;
    private _baseDir: string;
}