import { Tag } from "sax";
import { ITestContext } from "../TestContext";
import { IRobotSuites, IRobotTest } from "./RobotReport";
import { SaxParserRecorder, State } from "./SaxParserRecorder";

export class RobotReportRecorder implements SaxParserRecorder {

    tests: IRobotTest[] = [];
    isKeyword: boolean = false;
    captureScreenshot: string = '';
    plainText: boolean = false;
    testContext: ITestContext = { suiteStack: [], keyword: '', test: '' };

    getGroupedSuites(): IRobotSuites {
        return this.tests.reduce((suites, test) => {
            (suites[test.suite] = suites[test.suite] || []).push(test);
            return suites;
        }, <IRobotSuites>{});
    }

    start(state: State) {
        console.log('start');
    }

    stop(state: State) {
        console.log('stop ' + this.captureScreenshot);

        if (!this.captureScreenshot) {
            return;
        }

        const imageMatch = this.captureScreenshot
            .match(/Capturing screenshot (.*[.]png) with threshold (.*) in folder (.*)/);

        if (!imageMatch) {
            return;
        }

        const { suiteStack, test, source } = this.testContext;
        const [, imageName, imageThreshold, imageFolder] = imageMatch;

        this.tests.push({
            suite: suiteStack[suiteStack.length-1],
            test,
            source: source ?? '',
            imageName,
            imageThreshold,
            imageFolder,
        });
    }

    onOpenTag(node: Tag) {
        //console.log('open ' + node.name);

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
                break;

            case 'msg':
                this.plainText = !node.attributes['html'];
                break;
        }
    }

    onCloseTag(tag: string) {
        
        switch (tag) {
            case 'suite':
                this.testContext.suiteStack.pop();
                break;

            case 'test':
                this.testContext.test = '';
                break;

            case 'kw':
                this.isKeyword = false;
                break;
        }
    }

    onText(text: string) {
        // console.log('text ' + text);

        if (this.isKeyword && this.testContext.test) {
            this.captureScreenshot = this.plainText ? text : '';
        }
    }

    onCDATA(cdata: string) {
        //console.log('cdata ' + text);

        if (this.isKeyword) {
            this.captureScreenshot = this.plainText ? cdata : '';
        }
    }

    onOpenCDATA(tag: string) {
    }

    onCloseCDATA(tag: string) {
    }
}