import { DiffReportCollector } from "../SpotCheckPullRequest/DiffReportCollector";
import path from 'node:path';
import fs from 'node:fs';
import { RobotFileParser } from "../SpotCheckPullRequest/Report/RobotFileParser";

describe('DiffReportCollector', () => {

    test('Collect simple report with two screenshots', async () => {

        // Arrange
        const report = path.join(__dirname, 'reports', 'output-trimmed.json');
        const reportFileSize = (await fs.promises.stat(report)).size;

        // Act
        const collectedReportFolder = await new DiffReportCollector('output-trimmed.json')
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
})