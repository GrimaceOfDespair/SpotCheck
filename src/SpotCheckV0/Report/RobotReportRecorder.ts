import { Tag } from "sax";
import { ITestContext, TestStatus } from "../TestContext";
import { IRobotSuites, IRobotTest } from "./RobotReport";
import { SaxParserRecorder, State } from "./SaxParserRecorder";

export class RobotReportRecorder implements SaxParserRecorder {

    constructor(private normalizePaths: boolean) {
    }

    tests: IRobotTest[] = [];
    keywordLevel: number = 0;
    isArg: boolean = false;
    isStatus: boolean = false;
    captureScreenshot: string = '';
    plainText: boolean = false;
    testContext: ITestContext = {
        suiteStack: [],
        args: [],
        source: '',
        test: '',
        status: 'NOT RUN',
    };

    getGroupedSuites(): IRobotSuites {
        return this.tests.reduce((suites, test) => {
            (suites[test.suite] = suites[test.suite] || []).push(test);
            return suites;
        }, <IRobotSuites>{});
    }

    normalize = (screenshot: string) =>
        !this.normalizePaths
            ? screenshot
            : screenshot
                .replace(/ /g, '_')
                .replace(/\//g, '.')
                .replace(/[^-\w.]/g, '');

    start(_: State) {
    }

    stop(_: State) {
        if (!this.testContext.test || this.testContext.status != 'PASS') {
            return;
        }

        const { suiteStack, test, source } = this.testContext;
        const [ snapshot, imageThreshold ] = this.testContext.args;
        const suite = suiteStack[suiteStack.length-1];
        const stackPath = suiteStack.join('.');
        const imageName = this.normalize(`${stackPath}/${snapshot}.png`);

        this.tests.push({
            suite,
            test,
            source,
            imageName,
            imageThreshold,
        });

        this.testContext.args = [];
    }

    onOpenTag(node: Tag) {
        switch (node.name)
        {
            case 'suite':
                this.testContext.suiteStack.push(node.attributes['name']);
                this.testContext.source = node.attributes['source'];
                break;

            case 'test':
                this.testContext.test = node.attributes['name'];
                break;

            case 'kw':
                if (this.keywordLevel == 0) {
                    this.testContext.args = [];
                }
                this.keywordLevel++;
                break;

            case 'arg':
                this.isArg = true;
                break;

            case 'status':
                this.testContext.status = <TestStatus>node.attributes['status'];
                break;
        }
    }

    onCloseTag(tag: string) {
        
        switch (tag) {
            case 'suite':
                this.testContext.suiteStack.pop();
                break;

            case 'kw':
                this.keywordLevel--;
                break;

            case 'arg':
                this.isArg = false;
                break;
        }
    }

    onText(text: string) {
        if (this.keywordLevel == 1 && this.isArg) {
            this.testContext.args.push(text);
        }
    }

    /* istanbul ignore next */
    onCDATA(cdata: string) {
    }

    /* istanbul ignore next */
    onOpenCDATA(tag: string) {
    }

    /* istanbul ignore next */
    onCloseCDATA(tag: string) {
    }
}