import * as MockToolRunner from 'azure-pipelines-task-lib/mock-toolrunner';
import * as MockDevopsApi from './MockDevopsApi';
import { createMockRunner, getPath } from './Runner';

const taskRunner = createMockRunner();

process.env['SYSTEM_PULLREQUEST_PULLREQUESTID'] = '123';    

taskRunner.setInput('input', getPath('../reports/output-fail.json'));
taskRunner.setInput('mode', 'cypress');
taskRunner.setInput('screenshotFolder', 'screenshots');

taskRunner.registerMock('azure-pipelines-task-lib/toolrunner', MockToolRunner);
taskRunner.registerMock('azure-devops-node-api', MockDevopsApi);

MockDevopsApi.setPullRequest();

taskRunner.run();
