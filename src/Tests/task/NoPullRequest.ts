import * as MockToolRunner from 'azure-pipelines-task-lib/mock-toolrunner';
import { createMockRunner, getPath } from './runner';

const taskRunner = createMockRunner();

process.env['SYSTEM_ACCESSTOKEN'] = 'XS';
process.env['SYSTEM_TEAMFOUNDATIONCOLLECTIONURI'] = '';
process.env['SYSTEM_TEAMPROJECT'] = '';
process.env['BUILD_REPOSITORY_ID'] = '';
process.env['BUILD_BUILDID'] = '';
process.env['SYSTEM_PULLREQUEST_PULLREQUESTID'] = '';

taskRunner.setInput('input', getPath('../reports/output-trimmed.json'));
taskRunner.setInput('mode', 'cypress');
taskRunner.setInput('screenshotFolder', 'screenshots');

taskRunner.registerMock('azure-pipelines-task-lib/toolrunner', MockToolRunner);
taskRunner.registerMock('azure-devops-node-api/WebApi', {});

taskRunner.run();
