import { DiffReportCollector } from "../SpotCheckPullRequest/DiffReportCollector";
import path from 'node:path';
import fs from 'node:fs';
import { RobotFileParser } from "../SpotCheckPullRequest/Report/RobotFileParser";
import { IDiffTestReport } from "../SpotCheckPullRequest/Report/DiffReport";

describe('DiffReportCollector', () => {

    test('Collect simple report from file with two screenshots', async () => {

        // Arrange
        const report = path.join(__dirname, 'reports', 'output-trimmed.json');
        const reportFileSize = (await fs.promises.stat(report)).size;

        // Act
        const collectedReportFolder = await new DiffReportCollector('output-trimmed.json', 'screenshots')
            .collectReportFile(report);

        // Assert
        const collectedReport = path.join(collectedReportFolder, 'output-trimmed.json');
        const collectedReportFileSize = (await fs.promises.stat(collectedReport)).size;
        const collectedImageFolder = path.join(collectedReportFolder, 'screenshots');
        const collectedImages = (await fs.promises.readdir(collectedImageFolder)).map(image =>
            path.basename(image));

        expect(collectedReportFileSize).toBe(reportFileSize);
        expect(collectedImages.sort()).toEqual([
            'Test_Suites.89_Sanitychecks.Listsandstaticsegments.Lists_Dashboard.png',
            'Test_Suites.89_Sanitychecks.Listsandstaticsegments.Lists_Dashboard_Without_Threshold.png',
            'baseline']);
    });

    test('Collect simple report from report with two screenshots', async () => {

        // Arrange
        const baseDir = path.join(__dirname, 'reports');
        const report = <IDiffTestReport>JSON.parse(
            (await fs.promises.readFile(
                path.join(baseDir, 'output-trimmed.json'))
            ).toString());

        // Act
        const collectedReportFolder = await new DiffReportCollector('output-trimmed.json', 'screenshots')
            .collectReport(baseDir, report);

        // Assert
        const collectedImageFolder = path.join(collectedReportFolder, 'screenshots');
        const collectedImages = (await fs.promises.readdir(collectedImageFolder)).map(image =>
            path.basename(image));

        expect(collectedImages.sort()).toEqual([
            'Test_Suites.89_Sanitychecks.Listsandstaticsegments.Lists_Dashboard.png',
            'Test_Suites.89_Sanitychecks.Listsandstaticsegments.Lists_Dashboard_Without_Threshold.png',
            'baseline']);
    });
})