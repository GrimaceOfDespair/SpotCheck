import * as MockToolRunner from 'azure-pipelines-task-lib/mock-toolrunner';
import { createMockRunner, getPath } from './Runner';
import { Mirror } from '../Mirror';
import path from 'node:path';

const taskRunner = createMockRunner();
const mirror = await Mirror.createMirror('reports');

taskRunner.setInput('input', path.resolve(mirror, 'output-trimmed.xml'));
taskRunner.setInput('baseDir', path.resolve(mirror, 'screenshots'));
taskRunner.setInput('type', 'robot');

taskRunner.registerMock('azure-pipelines-task-lib/toolrunner', MockToolRunner);

taskRunner.run();
