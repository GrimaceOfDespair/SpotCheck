import path from 'node:path';
import { RobotFileParser } from '../SpotCheckPullRequest/Report/RobotFileParser';

describe('RobotFileParser', () => {
  test('Parse trimmed robot file with screenshot in 1 test', async () => {

    // Arrange
    const parser = new RobotFileParser('../Tests/reports/output-trimmed.xml');

    // Act
    const robotReport = await parser.createDiffReport();

    // Assert
    expect(robotReport.suites.length).toBe(1);

    const [test1, test2] = robotReport.suites[0].tests;

    expect(test1.name).toBe('Create_List');
    expect(test1.comparisonPath).toBe('Test_Suites.89_Sanitychecks.Listsandstaticsegments.Lists_Dashboard.png');
    expect(test1.failureThreshold).toBe(.1);

    expect(test2.name).toBe('Create_List');
    expect(test2.comparisonPath).toBe('Test_Suites.89_Sanitychecks.Listsandstaticsegments.Lists_Dashboard_Without_Threshold.png');
    expect(test2.failureThreshold).toBeNaN;

  }, 30_000);

  test('Parse robot file with screenshot in 1 test', async () => {

    // Arrange
    const parser = new RobotFileParser('../Tests/reports/output.xml');

    // Act
    const robotReport = await parser.createDiffReport();

    // Assert
    expect(robotReport.suites.length).toBe(1);

    const [test] = robotReport.suites[0].tests;

    expect(test.name).toBe('Create_List');
    expect(test.comparisonPath).toBe('Test_Suites.89_Sanitychecks.Listsandstaticsegments.Lists_Dashboard.png');

  }, 30_000);

  test('Parse robot file with screenshots in 2 tests', async () => {

    // Arrange
    const parser = new RobotFileParser('../Tests/reports/output-two.xml');

    // Act
    const robotReport = await parser.createDiffReport();

    // Assert
    expect(robotReport.suites.length).toBe(1);

    const [test1, test2] = robotReport.suites[0].tests;

    expect(test1.name).toBe('Create_List');
    expect(test1.comparisonPath).toBe('Test_Suites.89_Sanitychecks.Listsandstaticsegments.Lists_Dashboard.png');
    expect(test1.failureThreshold).toBe(.1);

    expect(test2.name).toBe('Create_Other_List');
    expect(test2.comparisonPath).toBe('Test_Suites.89_Sanitychecks.Listsandstaticsegments.Lists_Other_Dashboard.png');
    expect(test2.failureThreshold).toBe(.05);

  }, 30_000);
})