import { DiffReportCollector } from "../SpotCheckV0/DiffReportCollector";
import path from 'node:path';
import fs from 'node:fs';
import { RobotFileParser } from "../SpotCheckV0/Report/RobotFileParser";
import { IDiffTestReport } from "../SpotCheckV0/Report/DiffReport";
import { ILogger } from "../SpotCheckV0/Report/ILogger";

describe('DiffReportCollector', () => {

    test('Collect simple report with two passing screenshots', async () => {

        // Arrange
        const report = <IDiffTestReport>require('./reports/output-pass.json');
        const baseDir = path.join(__dirname, 'reports');

        // Act
        const collectedReportFolder = await new DiffReportCollector('output.json', 'screenshots')
            .collectReport(baseDir, report);

        // Assert
        const imageReport = path.join(collectedReportFolder, 'output.json');
        const imageReportJson = await fs.promises.readFile(imageReport, { encoding: 'utf-8' });
        
        expect(imageReportJson).toMatchSnapshot();

        const collectedImageFolder = path.join(collectedReportFolder, 'screenshots');
        const collectedImages = (await fs.promises.readdir(collectedImageFolder)).map(image =>
            path.basename(image));

        expect(collectedImages.sort()).toEqual([
            'Test_Suites.89_Sanitychecks.Listsandstaticsegments.Lists_Dashboard.png',
            'Test_Suites.89_Sanitychecks.Listsandstaticsegments.Lists_Dashboard_Without_Threshold.png',
            'baseline']);
    });

    test('Collect simple report with default path', async () => {

        // Arrange
        const report = <IDiffTestReport>require('./reports/output-pass.json');
        const baseDir = path.join(__dirname, 'reports', 'screenshots');

        // Act
        const collectedReportFolder = await new DiffReportCollector()
            .collectReport(baseDir, report);

        // Assert
        const imageReport = path.join(collectedReportFolder, 'diff-report.json');
        const imageReportJson = await fs.promises.readFile(imageReport, { encoding: 'utf-8' });

        expect(imageReportJson).toMatchSnapshot();

        const collectedImages = (await fs.promises.readdir(collectedReportFolder)).map(image =>
            path.basename(image));

        expect(collectedImages.sort()).toEqual([
            'Test_Suites.89_Sanitychecks.Listsandstaticsegments.Lists_Dashboard.png',
            'Test_Suites.89_Sanitychecks.Listsandstaticsegments.Lists_Dashboard_Without_Threshold.png',
            'baseline',
            'diff-report.json']);
    });

    test('Collect simple report without screenshot folder', async () => {

        // Arrange
        const report = <IDiffTestReport>require('./reports/output-subfolder.json');
        const baseDir = path.join(__dirname, 'reports');

        // Act
        const collectedReportFolder = await new DiffReportCollector('output.json')
            .collectReport(baseDir, report);

        // Assert
        const imageReport = path.join(collectedReportFolder, 'output.json');
        const imageReportJson = await fs.promises.readFile(imageReport, { encoding: 'utf-8' });
        
        expect(imageReportJson).toMatchSnapshot();

        const collectedImageFolder = path.join(collectedReportFolder, 'screenshots');
        const collectedImages = (await fs.promises.readdir(collectedImageFolder)).map(image =>
            path.basename(image));

        expect(collectedImages.sort()).toEqual([
            'Test_Suites.89_Sanitychecks.Listsandstaticsegments.Lists_Dashboard.png',
            'Test_Suites.89_Sanitychecks.Listsandstaticsegments.Lists_Dashboard_Without_Threshold.png',
            'baseline']);
    });

    test('Collect simple report with passing and failing screenshot with logger', async () => {

        // Arrange
        const report = <IDiffTestReport>require('./reports/output-fail.json');
        const baseDir = path.join(__dirname, 'reports');
        let error: string[] = [];
        let info: string[] = [];
        const logger: ILogger = {
            info: (message) => info.push(message),
            error: (message) => error.push(message),
        };

        // Act
        const collectedReportFolder = await new DiffReportCollector('output.json', 'screenshots', logger)
            .collectReport(baseDir, report);

        // Assert
        const imageReport = path.join(collectedReportFolder, 'output.json');
        const imageReportJson = await fs.promises.readFile(imageReport, { encoding: 'utf-8' });
        
        expect(imageReportJson).toMatchSnapshot();

        const collectedImageFolder = path.join(collectedReportFolder, 'screenshots');
        const collectedImages = (await fs.promises.readdir(collectedImageFolder)).map(image =>
            path.basename(image));

        expect(collectedImages.sort()).toEqual([
            'Test_Suites.89_Sanitychecks.Listsandstaticsegments.Lists_Dashboard.png',
            'Test_Suites.89_Sanitychecks.Listsandstaticsegments.Lists_Dashboard_Without_Threshold.png',
            'baseline']);

        expect(error).toEqual([]);
        expect(info).toEqual([
            `Writing report to ${imageReport}`,
            `Collect screenshots from ${baseDir} into ${collectedReportFolder}`
        ]);
    });
})