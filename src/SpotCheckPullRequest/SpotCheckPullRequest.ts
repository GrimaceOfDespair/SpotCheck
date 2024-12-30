import tl = require('azure-pipelines-task-lib/task');
import { ToolRunner } from 'azure-pipelines-task-lib/toolrunner';
import { RobotFileParser } from './Report/RobotFileParser';
import path from 'node:path';

function throwExpression(errorMessage: string): never {
    throw new Error(errorMessage);
}

 (async function() {
     try {
        const input: string = tl.getInput('input', true) ?? throwExpression(`specify a report file for "input"`);
        const mode = tl.getInput('mode', false) ?? 'robot';
        const baseDir = tl.getInput('baseDir', false) ?? path.dirname(input);

        let reportFile: string;
        switch (mode) {
            case 'robot':
                reportFile = await new RobotFileParser(input, baseDir)
                    .parseReport();
                break;

            case 'cypress':
                reportFile = input;
                break;

            default:
                throw new Error(`"mode" should be "robot" or "cypress", but was "${mode}"`);
                break;
        }

        if (reportFile) {
            tl.uploadArtifact('report', reportFile, 'reportFile');
        }
     }
     catch (err:any) {
         tl.setResult(tl.TaskResult.Failed, err.message);
     }
 })();