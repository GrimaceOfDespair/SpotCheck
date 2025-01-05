import * as MockToolRunner from 'azure-pipelines-task-lib/mock-toolrunner';
import { createMockRunner, getPath } from './runner';

const taskRunner = createMockRunner();

taskRunner.setInput('input', getPath('../reports/output-pass.json'));
taskRunner.setInput('mode', 'cypress');
taskRunner.setInput('screenshotFolder', 'screenshots');

taskRunner.registerMock('azure-pipelines-task-lib/toolrunner', MockToolRunner);

taskRunner.run();
