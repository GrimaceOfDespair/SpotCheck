import { Tag } from "sax";
import { ITestContext, TestStatus } from "../TestContext";
import { IRobotSuites, IRobotTest } from "./RobotReport";
import { SaxParserRecorder, State } from "./SaxParserRecorder";

export class RobotReportRecorder implements SaxParserRecorder {

    tests: IRobotTest[] = [];
    isKeyword: boolean = false;
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

    normalize(screenshot: string) {
        const normalizedScreenshot = screenshot
            .replace(/ /g, '_')
            .replace(/[^-\w.]/g, '');

        switch (normalizedScreenshot) {
            case '':
            case '.':
            case '..':
                throw new Error(`Cannot create file name from ${screenshot} as it results in ${normalizedScreenshot}`);

            default:
                return normalizedScreenshot;
        }
    }

    start(_: State) {
    }

    stop(_: State) {
        if (!this.testContext.test || this.testContext.status != 'PASS') {
            return;
        }

        const { suiteStack, test, source } = this.testContext;
        const [ snapshot, imageThreshold ] = this.testContext.args;
        const suite = suiteStack[suiteStack.length-1];
        const imageName = this.normalize([...suiteStack, snapshot, 'png'].join('.'));

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
                this.isKeyword = true;
                this.testContext.args = [];
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
                this.isKeyword = false;
                break;

            case 'arg':
                this.isArg = false;
                break;
        }
    }

    onText(text: string) {
        if (this.isKeyword && this.isArg) {
            this.testContext.args.push(text);
        }
    }

    onCDATA(cdata: string) {
    }

    onOpenCDATA(tag: string) {
    }

    onCloseCDATA(tag: string) {
    }
}