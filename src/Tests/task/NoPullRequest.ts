import * as MockToolRunner from 'azure-pipelines-task-lib/mock-toolrunner';
import { createMockRunner, getPath } from './Runner';

const taskRunner = createMockRunner();

taskRunner.setInput('input', getPath('../reports/output-pass.json'));
taskRunner.setInput('baseDir', getPath('../reports/screenshots'));
taskRunner.setInput('type', 'cypress');

taskRunner.registerMock('azure-pipelines-task-lib/toolrunner', MockToolRunner);

taskRunner.run();
