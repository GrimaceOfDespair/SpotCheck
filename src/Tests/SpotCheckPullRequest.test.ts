import * as assert from 'assert';
import { TaskMockRunner } from 'azure-pipelines-task-lib/mock-run';
import { MockTestRunner } from './MockTestRunner';
import * as MockToolRunner from 'azure-pipelines-task-lib/mock-toolrunner';
import path from 'node:path';

describe('SpotCheckPullRequest Suite', function () {

  function createTestRunner(test: string) {
    const testPath: string = path.join(__dirname, 'task', test);
    const taskJsonPath: string = path.join(__dirname, '..', 'SpotCheckPullRequest', 'task.json');
    return new MockTestRunner(testPath, taskJsonPath);
  }

  test('Run without arguments', async () => {

      const testRunner = createTestRunner('Empty.ts');

      await testRunner.runAsync();

      expect(testRunner.stderr).toBe('');
      expect(testRunner.errorIssues).toEqual(['Input required: input']);
      expect(testRunner.warningIssues).toEqual([]);

  }, 30 * 1000);

  test('Run without PullRequest', async () => {

    const testRunner = createTestRunner('NoPullRequest.ts');

    await testRunner.runAsync();

    console.log(testRunner.stdout);

    expect(testRunner.stderr).toBe('');
    expect(testRunner.errorIssues).toEqual([]);
    expect(testRunner.warningIssues).toEqual(['No pull request found to update']);
    expect(testRunner.isUploaded('screenshots'));

}, 30 * 1000);
})
