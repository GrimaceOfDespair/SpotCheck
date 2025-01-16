import path from 'node:path';
import { RobotFileParser } from '../SpotCheckV0/Report/RobotFileParser';
import { ILogger } from '../SpotCheckV0/Report/ILogger';
import  { Mirror } from './Mirror';

describe('RobotFileParser', () => {
  
  let reportBase: string = '';

  beforeAll(async () => {
    reportBase = await Mirror.createMirror('../Tests/reports');
  });
  
  test('Parse robot file with screenshot in 1 test', async () => {

    // Arrange
    const parser = new RobotFileParser('../Tests/reports/output-trimmed.xml');

    // Act
    const robotReport = await parser.createDiffReport();

    // Assert
    expect(robotReport.suites.length).toBe(1);

    const [test1, test2] = robotReport.suites[0].tests;

    expect(test1).toMatchObject({
      name: 'Create_List',
      comparisonPath: 'Test_Suites.89_Sanitychecks.Listsandstaticsegments.Lists_Dashboard.png',
      failureThreshold: .01
    })

    expect(test2).toMatchObject({
      name: 'Create_List',
      comparisonPath: 'Test_Suites.89_Sanitychecks.Listsandstaticsegments.Lists_Dashboard_Without_Threshold.png',
      failureThreshold: .05
    })

  }, 30_000);

  test('Parse robot file from absolute path', async () => {

    // Arrange
    const reportFile = path.join(__dirname, '../Tests/reports/output-trimmed.xml');
    const parser = new RobotFileParser(reportFile);

    // Act
    const robotReport = await parser.createDiffReport();

    // Assert
    expect(robotReport.suites.length).toBe(1);

    const [test1, test2] = robotReport.suites[0].tests;

    expect(test1).toMatchObject({
      name: 'Create_List',
      comparisonPath: 'Test_Suites.89_Sanitychecks.Listsandstaticsegments.Lists_Dashboard.png',
      failureThreshold: .01
    })

    expect(test2).toMatchObject({
      name: 'Create_List',
      comparisonPath: 'Test_Suites.89_Sanitychecks.Listsandstaticsegments.Lists_Dashboard_Without_Threshold.png',
      failureThreshold: .05
    })

  }, 30_000);

  test('Parse robot file with baseDir', async () => {

    // Arrange
    const baseDir = path.resolve(__dirname, '../Tests/reports');
    const parser = new RobotFileParser('../Tests/reports/output.xml', baseDir);

    // Act
    const robotReport = await parser.createDiffReport();

    // Assert
    expect(robotReport.suites.length).toBe(1);

    const [test] = robotReport.suites[0].tests;

    expect(test).toMatchObject({
      name: 'Create_List',
      comparisonPath: 'Test_Suites.89_Sanitychecks.Listsandstaticsegments.Lists_Dashboard.png',
      failureThreshold: .1
    })

  }, 30_000);

  test('Parse large robot file with screenshot in 1 test', async () => {

    // Arrange
    const parser = new RobotFileParser('../Tests/reports/output.xml');

    // Act
    const robotReport = await parser.createDiffReport();

    // Assert
    expect(robotReport.suites.length).toBe(1);

    const [test] = robotReport.suites[0].tests;

    expect(test).toMatchObject({
      name: 'Create_List',
      comparisonPath: 'Test_Suites.89_Sanitychecks.Listsandstaticsegments.Lists_Dashboard.png',
      failureThreshold: .1
    })

  }, 30_000);

  test('Parse robot file with screenshots in 2 tests', async () => {

    // Arrange
    const parser = new RobotFileParser('../Tests/reports/output-two.xml');

    // Act
    const robotReport = await parser.createDiffReport();

    // Assert
    expect(robotReport.suites.length).toBe(1);

    const [test1, test2] = robotReport.suites[0].tests;

    expect(test1).toMatchObject({
      name: 'Create_List',
      comparisonPath: 'Test_Suites.89_Sanitychecks.Listsandstaticsegments.Lists_Dashboard.png',
      failureThreshold: .1
    })

    expect(test2).toMatchObject({
      name: 'Create_Other_List',
      comparisonPath: 'Test_Suites.89_Sanitychecks.Listsandstaticsegments.Lists_Other_Dashboard.png',
      failureThreshold: .05
    })

  }, 30_000);

  test('Parse robot file with logger', async () => {

    // Arrange
    let error: string[] = [];
    let info: string[] = [];
    const logger: ILogger = {
      error: (message) => error.push(message),
      info: (message) => info.push(message),
    }
    const baseDir = path.resolve(reportBase, './screenshots');
    const parser = new RobotFileParser('../Tests/reports/output-trimmed.xml', baseDir, logger);

    // Act
    await parser.createDiffReport();

    // Assert
    //expect(info[0]).toBe('Passed with 0% difference');
    expect(error[0]).toBe('Failed with 3% difference');

  }, 30_000);

  test('Parse robot file with screenshot path containing invalid characters', async () => {

    // Arrange
    const parser = new RobotFileParser('../Tests/reports/output-invalid-path.xml');

    // Act
    const robotReport = await parser.createDiffReport();

    // Assert
    expect(robotReport.suites.length).toBe(1);

    const [test] = robotReport.suites[0].tests;

    expect(test).toMatchObject({
      name: 'Create_List',
      comparisonPath: 'Test_Suites.89_Sanitychecks.Listsandstaticsegments.Lists_Dashboard.png',
      failureThreshold: .1
    })

  }, 30_000);
})