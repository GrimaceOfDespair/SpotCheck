import { MockTestRunner } from './MockTestRunner';
import path from 'node:path';

describe('SpotCheckV0 Suite', function () {

  function createTestRunner(test: string) {
    const testPath: string = path.join(__dirname, 'task', test);
    const taskJsonPath: string = path.join(__dirname, '..', 'SpotCheckV0', 'task.json');
    return new MockTestRunner(testPath, taskJsonPath);
  }

  test('Missing input argument', async () => {

      const testRunner = createTestRunner('NoInput.ts');

      await testRunner.runAsync();

      expect(testRunner.stderr).toBe('');
      expect(testRunner.errorIssues).toEqual(['Input required: input']);
      expect(testRunner.warningIssues).toEqual([]);

  }, 30 * 1000);

  test('Input report without PullRequest', async () => {

    const testRunner = createTestRunner('NoPullRequest.ts');

    await testRunner.runAsync();

    console.log(testRunner.stdout);

    expect(testRunner.stderr).toBe('');
    expect(testRunner.errorIssues).toEqual([]);
    expect(testRunner.warningIssues).toEqual(['No pull request found to update']);
    expect(testRunner.isUploaded('screenshots'));

  }, 30 * 1000);

  test('Robot report without PullRequest', async () => {

    const testRunner = createTestRunner('RobotReport.ts');

    await testRunner.runAsync();

    console.log(testRunner.stdout);

    expect(testRunner.stderr).toBe('');
    expect(testRunner.errorIssues).toEqual([]);
    expect(testRunner.warningIssues).toEqual(['No pull request found to update']);
    expect(testRunner.isUploaded('screenshots'));

  }, 30 * 1000);

  test('Input failing report for PullRequest without thread', async () => {

    const testRunner = createTestRunner('FailWithoutThread.ts');

    await testRunner.runAsync();

    console.log(testRunner.stdout);

    expect(testRunner.stderr).toBe('');
    expect(testRunner.errorIssues).toEqual([]);
    expect(testRunner.warningIssues).toEqual([
      "1 screenshot(s) not matching baseline (http://example.com/tfs/FakeTeam/_build/results?buildId=666&view=IgorKalders.spotcheck.spotcheck-build)",
      "E2E report contains failures"
    ]);
    expect(testRunner.isUploaded('screenshots'));
    expect(testRunner.stdOutContained('Creating new thread')).toBe(true);
    expect(testRunner.stdOutContained('E2E report contains failures')).toBe(true);

  }, 30 * 1000);

  test('Input failing report for PullRequest with existing thread', async () => {

    const testRunner = createTestRunner('FailWithThread.ts');

    await testRunner.runAsync();

    console.log(testRunner.stdout);

    expect(testRunner.stderr).toBe('');
    expect(testRunner.errorIssues).toEqual([]);
    expect(testRunner.warningIssues).toEqual([
      "1 screenshot(s) not matching baseline (http://example.com/tfs/FakeTeam/_build/results?buildId=666&view=IgorKalders.spotcheck.spotcheck-build)",
      "E2E report contains failures"
    ]);
    expect(testRunner.isUploaded('screenshots'));
    expect(testRunner.stdOutContained('Adding comment to pull request')).toBe(true);
    expect(testRunner.stdOutContained('E2E report contains failures')).toBe(true);

  }, 30 * 1000);

  test('Input passing report for PullRequest without thread', async () => {

    const testRunner = createTestRunner('PassWithoutThread.ts');

    await testRunner.runAsync();

    console.log(testRunner.stdout);

    expect(testRunner.stderr).toBe('');
    expect(testRunner.errorIssues).toEqual([]);
    expect(testRunner.warningIssues).toEqual([]);
    expect(testRunner.isUploaded('screenshots'));
    expect(testRunner.stdOutContained('E2E report contains no failures')).toBe(true);

  }, 30 * 1000);

  test('Input passing report for PullRequest with existing thread', async () => {

    const testRunner = createTestRunner('PassWithThread.ts');

    await testRunner.runAsync();

    console.log(testRunner.stdout);

    expect(testRunner.stderr).toBe('');
    expect(testRunner.errorIssues).toEqual([]);
    expect(testRunner.warningIssues).toEqual([]);
    expect(testRunner.isUploaded('screenshots'));
    expect(testRunner.stdOutContained('Close pending comments on thread')).toBe(true);

  }, 30 * 1000);

  test('Input failing report with dryrun', async () => {

    const testRunner = createTestRunner('FailSkipFeedback.ts');

    await testRunner.runAsync();

    console.log(testRunner.stdout);

    expect(testRunner.stderr).toBe('');
    expect(testRunner.errorIssues).toEqual([]);
    expect(testRunner.warningIssues).toEqual([]);
    expect(testRunner.isUploaded('screenshots'));
    expect(testRunner.stdOutContained('E2E report contains failures')).toBe(false);
    expect(testRunner.stdOutContained('Creating new thread')).toBe(false);
    expect(testRunner.stdOutContained('Adding comment to pull request')).toBe(false);

  }, 30 * 1000);
})
