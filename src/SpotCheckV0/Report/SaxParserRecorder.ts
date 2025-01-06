import { QualifiedTag, Tag } from "sax";

export interface SaxParserRecorder {
    start(state: State): void;
    stop(state: State): void
    onOpenTag(node: Tag): void;
    onCloseTag(tag: string): void;
    onText(text: string): void;
    onOpenCDATA(tag: string): void;
    onCDATA(cdata: string): void;
    onCloseCDATA(tag: string): void;
}

export interface State {
}
