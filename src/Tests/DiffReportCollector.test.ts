import { DiffReportCollector } from "../SpotCheckPullRequest/DiffReportCollector";
import path from 'node:path';
import fs from 'node:fs';
import { RobotFileParser } from "../SpotCheckPullRequest/Report/RobotFileParser";
import { IDiffTestReport } from "../SpotCheckPullRequest/Report/DiffReport";

describe('DiffReportCollector', () => {

    test('Collect simple report from report with two screenshots', async () => {

        // Arrange
        const report = <IDiffTestReport>require('./reports/output-pass.json');
        const baseDir = path.join(__dirname, 'reports');

        // Act
        const collectedReportFolder = await new DiffReportCollector('output-pass.json', 'screenshots')
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