import path from 'node:path';
import { RobotFileParser } from '../SpotCheckPullRequest/Report/RobotFileParser';

describe('RobotFileParser', () => {
  test('Parse robot file with screenshots', async () => {

    const parser = new RobotFileParser('../Tests/reports/output.xml');
    const robotReport = await parser.parseReport();

    expect(robotReport.suites.length).toBe(1);

    const [test] = robotReport.suites[0].tests;

    expect(test.name).toBe('Create_List');
    expect(test.comparisonPath).toBe('screenshots/Test_Suites.89_Sanitychecks.Listsandstaticsegments_Lists_Dashboard.png');

  });
})