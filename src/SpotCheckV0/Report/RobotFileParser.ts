import { createReadStream, writeFile } from "node:fs";
import path from 'node:path';
import sax from 'sax';
const { SaXPath } = require('saxpath');
//import { SaXPath } from 'saxpath';
import { once } from 'events';
import { IRobotSuite, IRobotTest, IRobotSuites } from "./RobotReport";
import { ReportContext } from "../ReportContext";
import { IDiffSuite, IDiffTest, IDiffTestReport } from "./DiffReport";
import { ImageProcessor } from "../ImageProcessor";
import { RobotReportRecorder } from "./RobotReportRecorder";
import { ILogger, NullLogger } from "./ILogger";

export class RobotFileParser {

    defaultThreshold: number = .05;

    private _context: ReportContext;
    private _images: ImageProcessor = new ImageProcessor();
    private _logger: ILogger;

    constructor(reportFile: string, baseDir?: string, logger?: ILogger) {
        this._context = new ReportContext(reportFile,
            baseDir ?? path.dirname(reportFile));
        this._logger = logger ?? NullLogger;
    }

    async createDiffReport(normalizePaths: boolean = true): Promise<IDiffTestReport> {

        const testSuites = await this.readTestSuites(normalizePaths);
        
        return await this.parseScreenshots(testSuites);
    }

    private async parseScreenshots(groupedSuites: IRobotSuites): Promise<IDiffTestReport> {

        const suites: IDiffSuite[] = await Promise.all(Object.entries(groupedSuites)
            .map(async ([suite, tests]) => ({
                name: suite,
                path: tests[0].source,
                tests: await Promise.all(
                    tests.map(async ({ test: name, source: specPath, imageName, imageThreshold }) => ({
                        name,
                        specPath,
                        specFilename: path.basename(specPath),
                        ...await this.getScreenshot(imageName, imageThreshold)
                    })))
            })));

        const allTests = suites.reduce((acc, suite) => acc.concat(suite.tests), <IDiffTest[]>[]);

        return {
            total: allTests.length,
            totalPassed: allTests.filter(test => test.status == 'pass').length,
            totalFailed: allTests.filter(test => test.status == 'fail').length,
            totalSuites: suites.length,
            suites
        };
    }

    private async readTestSuites(normalizePaths: boolean) {

        const reportStream = createReadStream(this._context.reportFile);
        const saxParser = sax.createStream(true);

        const suiteRecorder = new RobotReportRecorder(normalizePaths);
        const saxPath = new SaXPath(saxParser, `//test//kw[@name="Compare Snapshot"]`, suiteRecorder);
        reportStream.pipe(saxParser);

        await once(saxPath, 'end');

        let groupedSuites = suiteRecorder.getGroupedSuites();
        return groupedSuites;
    }

    async getScreenshot(imageName: string, imageThreshold: string):
        Promise<Omit<IDiffTest, "name" | "specPath" | "specFilename">> {

        const imageNameOnDisk = decodeURIComponent(imageName);
    
        const [baselinePath, comparisonPath, diffPath] =
            ['baseline', '', 'diff'].map(version =>
                ({
                    relative: this._context.resolveRelative(version, imageNameOnDisk),
                    absolute: this._context.resolveAbsolute(version, imageNameOnDisk),
                })
            );
    
        let failureThreshold = parseFloat(imageThreshold);
        if (isNaN(failureThreshold)) {
            failureThreshold = this.defaultThreshold;
        }

        this._logger.info(`Comparing '${baselinePath.absolute}' with '${comparisonPath.absolute}' with threshold ${Math.round(failureThreshold * 100)}% and writing output to ${diffPath.absolute}`);
    
        const { percentage, testFailed } = await this._images.compareImage(
            baselinePath.absolute,
            comparisonPath.absolute,
            diffPath.absolute,
            failureThreshold);

        if (testFailed) {
            this._logger.error(`Failed with ${Math.round(percentage * 100)}% difference`);
        } else {
            this._logger.info(`Passed with ${Math.round(percentage * 100)}% difference`);
        }
    
        return {
            status: testFailed ? 'fail' : 'pass',
            percentage,
            failureThreshold,
            baselinePath: baselinePath.relative,
            comparisonPath: comparisonPath.relative,
            diffPath: testFailed ? diffPath.relative : ''
        };
    }}