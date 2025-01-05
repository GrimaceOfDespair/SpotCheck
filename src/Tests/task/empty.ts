
import { TaskMockRunner } from 'azure-pipelines-task-lib/mock-run';
import * as MockToolRunner from 'azure-pipelines-task-lib/mock-toolrunner';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const taskPath: string = path.join(__dirname, '..', '..', '..', 'SpotCheckPullRequest', 'SpotCheckPullRequest.js');
const taskRunner = new TaskMockRunner(taskPath);

taskRunner.registerMock('azure-pipelines-task-lib/toolrunner', MockToolRunner);

taskRunner.run();
