import * as MockToolRunner from 'azure-pipelines-task-lib/mock-toolrunner';
import { createMockRunner } from './runner';

const taskRunner = createMockRunner();

taskRunner.registerMock('azure-pipelines-task-lib/toolrunner', MockToolRunner);

taskRunner.run();
