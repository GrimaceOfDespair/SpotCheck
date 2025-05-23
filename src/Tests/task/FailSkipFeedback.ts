import * as MockToolRunner from 'azure-pipelines-task-lib/mock-toolrunner';
import * as MockDevopsApi from './MockDevopsApi';
import { createMockRunner, getPath } from './Runner';

const taskRunner = createMockRunner();

process.env['SYSTEM_PULLREQUEST_PULLREQUESTID'] = '123';    

taskRunner.setInput('input', getPath('../reports/output-fail.json'));
taskRunner.setInput('baseDir', getPath('../reports/screenshots'));
taskRunner.setInput('type', 'cypress');
taskRunner.setInput('skipFeedback', 'true');

taskRunner.registerMock('azure-pipelines-task-lib/toolrunner', MockToolRunner);
taskRunner.registerMock('azure-devops-node-api', MockDevopsApi);

MockDevopsApi.setPullRequest();

taskRunner.run();
