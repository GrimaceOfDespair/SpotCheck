import { MockTestRunner } from './MockTestRunner';
import path from 'node:path';

describe('SpotCheckPullRequest Suite', function () {

  function createTestRunner(test: string) {
    const testPath: string = path.join(__dirname, 'task', test);
    const taskJsonPath: string = path.join(__dirname, '..', 'SpotCheckPullRequest', 'task.json');
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

  test('Input failing report for PullRequest without thread', async () => {

    const testRunner = createTestRunner('FailWithoutThread.ts');

    await testRunner.runAsync();

    console.log(testRunner.stdout);

    expect(testRunner.stderr).toBe('');
    expect(testRunner.errorIssues).toEqual([]);
    expect(testRunner.warningIssues).toEqual([]);
    expect(testRunner.isUploaded('screenshots'));

  }, 30 * 1000);
})
