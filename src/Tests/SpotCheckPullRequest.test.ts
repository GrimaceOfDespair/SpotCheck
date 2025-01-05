import * as assert from 'assert';
import { TaskMockRunner } from 'azure-pipelines-task-lib/mock-run';
import { MockTestRunner } from './MockTestRunner';
import * as MockToolRunner from 'azure-pipelines-task-lib/mock-toolrunner';
import path from 'node:path';

describe('SpotCheckPullRequest Suite', function () {

  test('Run without arguments', async () => {
      const testPath: string = path.join(__dirname, 'task', 'empty.ts');
      const taskJsonPath: string = path.join(__dirname, '..', 'SpotCheckPullRequest', 'task.json');
      const testRunner = new MockTestRunner(testPath, taskJsonPath);

      await testRunner.runAsync();

      expect(testRunner.stderr).toBe('');
      expect(testRunner.errorIssues).toEqual(['Input required: input']);
  }, 30 * 1000);
})
