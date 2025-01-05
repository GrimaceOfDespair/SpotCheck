import { TaskMockRunner } from 'azure-pipelines-task-lib/mock-run';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export function dirname() {
    const __filename = fileURLToPath(import.meta.url);
    return path.dirname(__filename);
}

export function getPath(file: string) {
    return path.join(dirname(), file);
}

export function createMockRunner() {
    const __dirname = dirname();
    const taskPath: string = path.join(__dirname, '..', '..', 'SpotCheckPullRequest', 'SpotCheckPullRequest.ts');

    process.env['SYSTEM_ACCESSTOKEN'] = 'FakeAccessToken';
    process.env['SYSTEM_TEAMFOUNDATIONCOLLECTIONURI'] = 'http://example.com/tfs/';
    process.env['SYSTEM_TEAMPROJECT'] = 'FakeTeam';
    process.env['BUILD_REPOSITORY_ID'] = 'FakeRepo';
    process.env['BUILD_BUILDID'] = '666';

    return new TaskMockRunner(taskPath);
}
