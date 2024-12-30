import { createReadStream, writeFile } from "node:fs";
import path from 'node:path';
import sax from 'sax';
const { SaXPath } = require('saxpath');
//import { SaXPath } from 'saxpath';
import { once } from 'events';
import { IRobotSuite, IRobotTest, IRobotSuites } from "./RobotReport";
import { ReportContext } from "../ReportContext";
import { IDiffSuite, IDiffTest, IDiffTestRun } from "./DiffReport";
import { ImageProcessor } from "../ImageProcessor";
import { RobotReportRecorder } from "./RobotReportRecorder";

export class RobotFileParser {

    ctx: ReportContext;
    images: ImageProcessor = new ImageProcessor();

    constructor(reportFile: string, baseDir?: string) {
        this.ctx = new ReportContext(reportFile, baseDir ?? path.dirname(reportFile));
    }

    async parseReport(imageFolder: string): Promise<IDiffTestRun> {

        const testSuites = await this.readTestSuites();
        
        return await this.parseScreenshots(testSuites, imageFolder);
    }

    private async parseScreenshots(groupedSuites: IRobotSuites, imageFolder: string): Promise<IDiffTestRun> {

        const suites: IDiffSuite[] = await Promise.all(Object.entries(groupedSuites)
            .map(async ([suite, tests]) => ({
                name: suite,
                path: tests[0].source,
                tests: await Promise.all(tests.map(async (test) => ({
                    name: test.test,
                    specPath: test.source,
                    specFilename: path.basename(test.source),
                    ...await this.getScreenshot(test.imageName, test.imageThreshold, imageFolder)
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

    private async readTestSuites() {

        const reportStream = createReadStream(this.ctx.reportFile);
        const saxParser = sax.createStream(true);

        const testContext = {
            suite: [],
            test: '',
            keyword: '',
        };

        const suiteRecorder = new RobotReportRecorder();
        const saxPath = new SaXPath(saxParser, `//test//kw[@name="Compare Snapshot"]`, suiteRecorder);
        reportStream.pipe(saxParser);

        await once(saxPath, 'end');

        let groupedSuites = suiteRecorder.getGroupedSuites();
        return groupedSuites;
    }

    async getScreenshot(imageName: string, imageThreshold: string, imageFolder: string):
        Promise<Omit<IDiffTest, "name" | "specPath" | "specFilename">> {

        const imageNameOnDisk = decodeURIComponent(imageName);
        const imageFolderOnDisk = decodeURIComponent(imageFolder);
        const relativeFolder = this.ctx.baseDir
            ? imageFolderOnDisk.replace(new RegExp('^' + this.ctx.baseDir + '/?'), '')
            : imageFolderOnDisk;
    
        const [baselinePath, comparisonPath, diffPath] =
            ['baseline', '', 'diff'].map(version =>
            ({
                relative: [relativeFolder, version, imageNameOnDisk].filter(Boolean).join('/'),
                absolute: [this.ctx.basePath, imageFolderOnDisk, version, imageNameOnDisk].filter(Boolean).join('/')
            }));
    
        const failureThreshold = parseFloat(imageThreshold);
    
        const { percentage, testFailed } = await this.images.compareImage(
            baselinePath.absolute,
            comparisonPath.absolute,
            diffPath.absolute,
            failureThreshold);
    
        return {
            status: testFailed ? 'fail' : 'pass',
            percentage,
            failureThreshold,
            baselinePath: baselinePath.relative,
            comparisonPath: comparisonPath.relative,
            diffPath: testFailed ? diffPath.relative : ''
        };
    }}