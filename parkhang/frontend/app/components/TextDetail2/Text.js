// @flow
import React from "react";
import classnames from "classnames";
import styles from "./Text.css";
import TextSegment from "lib/TextSegment";
import {
    INSERTION_KEY,
    DELETION_KEY,
    PAGE_BREAK_KEY,
    LINE_BREAK_KEY
} from "lib/AnnotatedText";
import _ from "lodash";
import SegmentedText from "lib/SegmentedText";
import Annotation from "lib/Annotation";
import Witness from "lib/Witness";
import { ANNOTATION_TYPES } from "lib/Annotation";
import type { AnnotationUniqueId } from "lib/Annotation";
import GraphemeSplitter from "grapheme-splitter";

export function idForSegment(segment: TextSegment): string {
    return "s_" + segment.start;
}

// export function idForDeletedSegment(segment: TextSegment): string {
//     return "ds_" + segment.start;
// }

// export function idForInsertion(segment: TextSegment): string {
//     return "i_" + segment.start;
// }

// export function idForPageBreak(segment: TextSegment): string {
//     return "p_" + (segment.end + 1);
// }

// export function idForLineBreak(segment: TextSegment): string {
//     return "l_" + (segment.end + 1);
// }

// export type Props = {
//     segmentedText: SegmentedText,
//     annotationPositions: { [string]: Annotation[] },
//     selectedSegmentId: (id: string) => void,
//     activeAnnotations: { [AnnotationUniqueId]: Annotation } | null,
//     getBaseAnnotation: (annotation: Annotation) => Annotation,
//     selectedAnnotatedSegments: TextSegment[],
//     row: number,
//     activeAnnotation: Annotation | null,
//     searchValue: string | null,
//     selectedSearchResult: {
//         textId: number,
//         start: number,
//         length: number
//     } | null,
//     searchStringPositions: { [position: number]: [number, number] },
//     fontSize?: number,
//     activeWitness: Witness
// };

// export type State = {
//     segmentedText: SegmentedText
// };

// import ReactDOMServer from "react-dom/server";
// import PageBreakIcon from "images/page_break_icon.svg";
// const PARA_SYMBOL = String.fromCharCode(182);
// const pageBreakIconString = ReactDOMServer.renderToStaticMarkup(
//     <PageBreakIcon />
// );

export default class Text extends React.Component<Props, State> {
    _renderedSegments: TextSegment[] | null;
    _renderedHtml: { __html: string } | null;

    constructor(props: Props) {
        super(props);

        this.state = {
            segmentedText: props.segmentedText
        };

        this._renderedSegments = null;
        this._renderedHtml = null;
    }

    UNSAFE_componentWillReceiveProps(nextProps: Props) {
        this.setState((prevState: State, props: Props) => {
            return {
                ...prevState,
                segmentedText: nextProps.segmentedText
            };
        });
    }

    annotationsForSegment(segment: TextSegment): Annotation[] {
        let annotations: Annotation[] = [];
        const foundAnnotations = this.props.annotationPositions[
            String(segment.start)
        ];
        if (foundAnnotations) {
            annotations = foundAnnotations;
        }
        const insertions =
            this.props.annotationPositions[INSERTION_KEY + segment.start] || [];
        const deletions =
            this.props.annotationPositions[DELETION_KEY + segment.start] || [];
        const pageBreaks =
            this.props.annotationPositions[
                PAGE_BREAK_KEY + (segment.end + 1)
            ] || [];
        const lineBreaks =
            this.props.annotationPositions[
                LINE_BREAK_KEY + (segment.end + 1)
            ] || [];

        return annotations.concat(
            insertions,
            deletions,
            pageBreaks,
            lineBreaks
        );
    }

    // segmentsContainSegment(segments: TextSegment[], segment: TextSegment) {
    //     for (let i = 0; i < segments.length; i++) {
    //         let listSegment = segments[i];
    //         if (
    //             listSegment.start === segment.start &&
    //             listSegment.text === segment.text
    //         ) {
    //             return true;
    //         }
    //     }
    //     return false;
    // }
    selectedElement(element: Element) {
        const selection = document.getSelection();
        
        if (selection && selection.type === "Range") {
            return;
        }
        this.props.selectedSegmentId(element.id);
    }

    generateHtml(renderProps: Props, renderState: State): { __html: string } {
       
        let segments = renderState.segmentedText.segments;
        let textLineClass = styles.textLine;
        let segmentHTML = '<p class="' + textLineClass + '">';
        if (segments.length === 0) return { __html: segmentHTML };

        const endPosition = segments[segments.length - 1].end + 1;
    


        let highlightClass = styles.highlight;
        let activeHighlightClass = styles.activeHighlight;
        let activeSearchResultEnd = null;
        for (let i = 0; i < segments.length; i++) {
            let segment = segments[i];
            let classAttribute = "";
            let classes = [];
            let selectedCurrentDeletion = false;
            let selectedCurrentPageBreak = false;
            let selectedCurrentLineBreak = false;
            let lineBreakAnnotation = false;
            let pageBreakAnnotation = null;
          

            // It's an insertion at the end of the text, which should have just been added to the html.
            // So break as we don't want anymore segment html adding.
            if (segment.start === endPosition) {
                break;
            }
            let id = null;
            if (segment.length === 0) {
                // id = idForDeletedSegment(segment);
                // classes.push(styles.removedByAnnotation);
                // if (deletionText) {
                //     segment = new TextSegment(segment.start, deletionText);
                // }
                console.log('no')
            } else {
                id = idForSegment(segment);
            }

            // if (
            //     this.segmentsContainSegment(
            //         renderProps.selectedAnnotatedSegments,
            //         segment
            //     ) ||
            //     selectedCurrentDeletion
            // ) {
            //     classes.push(styles.selectedAnnotation);
            // }

            if (classes.length > 0) {
                let className = classnames(...classes);
                classAttribute = 'class="' + className + '"';
            }

            let segmentContent = segment.text;
            // Add search result highlight if required.
            if (renderProps.searchStringPositions) {
                let segmentStart = segment.start;
                let position = segmentStart;
                segmentContent = "";

                let highlight = highlightClass;
                if (
                    renderProps.selectedSearchResult &&
                    renderProps.selectedSearchResult.start <= position &&
                    renderProps.selectedSearchResult.start +
                        renderProps.selectedSearchResult.length >
                        position
                ) {
                    highlight = activeHighlightClass;
                }

                for (let j = 0; j < segment.text.length; j++) {
                    let char = segment.text.charAt(j);
                    position = segmentStart + j;
                    if (activeSearchResultEnd) {
                        let [start, end] = activeSearchResultEnd;
                        if (j === 0) {
                            segmentContent +=
                                '<span class="' + highlight + '">';
                        }
                        if (position === end) {
                            segmentContent += char + "</span>";
                            activeSearchResultEnd = null;
                        } else if (j === segment.text.length - 1) {
                            segmentContent += char + "</span>";
                        } else {
                            segmentContent += char;
                        }
                    } else if (position in renderProps.searchStringPositions) {
                        let [start, end] = renderProps.searchStringPositions[
                            position
                        ];
                        segmentContent +=
                            '<span class="' + highlight + '">' + char;
                        if (j === segment.text.length - 1 || position === end) {
                            segmentContent += "</span>";
                        }
                        if (position < end) {
                            activeSearchResultEnd = [start, end];
                        }
                    } else {
                        segmentContent += char;
                    }
                }
            }

            segmentHTML +=
                "<span id=" +
                id +
                " key=" +
                id +
                " " +
                classAttribute +
                ">" +
                segmentContent +
                "</span>";
        }

        this._renderedSegments = segments;
        segmentHTML += "</p>";

        const html = {
            __html: segmentHTML
        };
        return html;
    }

    shouldComponentUpdate(nextProps: Props, nextState: State) {
        const renderedHtml = this.generateHtml(nextProps, nextState);
        if (this.props.fontSize !== nextProps.fontSize) {
            return true;
        } else if (
            this._renderedHtml &&
            renderedHtml.__html === this._renderedHtml.__html
        ) {
            return false;
        } else {
            this._renderedHtml = renderedHtml;
            return true;
        }
    }

    render() {
        let classes = [styles.text];
        if (this.props.row === 0) {
            classes.push(styles.textFirstRow);
        }

        // Generate HTML manually as it is much faster when
        // creating large numbers of elements, such as these spans.
        const html = this._renderedHtml
            ? this._renderedHtml
            : this.generateHtml(this.props, this.state);
        if (!this._renderedHtml) {
            this._renderedHtml = html;
        }

        return (
            <div className={styles.textContainer}>
                <div
                    className={classnames(...classes)}
                    dangerouslySetInnerHTML={html}
                    onClick={e => this.selectedElement(e.target)}
                    style={{
                        fontSize: this.props.fontSize
                    }}
                />
            </div>
        );
    }
}
