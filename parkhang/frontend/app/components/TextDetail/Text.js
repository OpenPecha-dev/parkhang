// @flow
import React from "react";
import classnames from "classnames";
import styles from "./Text.css";
import TextSegment from "lib/TextSegment";
import {
    INSERTION_KEY,
    DELETION_KEY,
    PAGE_BREAK_KEY,
    LINE_BREAK_KEY,
} from "lib/AnnotatedText";
import _ from "lodash";
import SegmentedText from "lib/SegmentedText";
import Annotation from "lib/Annotation";
import Witness from "lib/Witness";
import { ANNOTATION_TYPES } from "lib/Annotation";
import type { AnnotationUniqueId } from "lib/Annotation";
import GraphemeSplitter from "grapheme-splitter";
import { find } from "lodash";
import { withTheme } from "@mui/styles";

export function idForSegment(segment: TextSegment): string {
    return "s_" + segment.start;
}

export function idForDeletedSegment(segment: TextSegment): string {
    return "ds_" + segment.start;
}

export function idForInsertion(segment: TextSegment): string {
    return "i_" + segment.start;
}

export function idForPageBreak(segment: TextSegment): string {
    return "p_" + (segment.end + 1);
}

export function idForLineBreak(segment: TextSegment): string {
    return "l_" + (segment.end + 1);
}

export type Props = {
    segmentedText: SegmentedText,
    annotationPositions: { [string]: Annotation[] },
    selectedSegmentId: (id: string) => void,
    activeAnnotations: { [AnnotationUniqueId]: Annotation } | null,
    getBaseAnnotation: (annotation: Annotation) => Annotation,
    selectedAnnotatedSegments: TextSegment[],
    row: number,
    activeAnnotation: Annotation | null,
    searchValue: string | null,
    selectedSearchResult: {
        textId: number,
        start: number,
        length: number,
    } | null,
    searchStringPositions: { [position: number]: [number, number] },
    fontSize?: number,
    activeWitness: Witness,
    changeSyncIdOnClick: () => void,
    changeScrollToId: () => void,
    textAlignmentById: {},
    selectedSourceRange: [],
    selectedTargetRange: [],
    MediaInterval: {},
};

export type State = {
    segmentedText: SegmentedText,
};

import ReactDOMServer from "react-dom/server";
import PageBreakIcon from "images/page_break_icon.svg";
const PARA_SYMBOL = String.fromCharCode(182);
const pageBreakIconString = ReactDOMServer.renderToStaticMarkup(
    <PageBreakIcon />
);
class Text extends React.Component<Props, State> {
    _renderedSegments: TextSegment[] | null;
    _renderedHtml: { __html: string } | null;
    textAlignmentById;
    rangeSelect;
    theme;
    constructor(props: Props) {
        super(props);
        this.textAlignmentById = [];
        this.state = {
            segmentedText: props.segmentedText,
        };
        this.textAlignmentById = this.props.textAlignmentById;
        this._renderedSegments = null;
        this._renderedHtml = null;
        this.rangeSelect = [];
        this.theme = props.theme;
    }
    UNSAFE_componentWillReceiveProps(nextProps: Props) {
        this.setState((prevState: State, props: Props) => {
            return {
                ...prevState,
                segmentedText: nextProps.segmentedText,
            };
        });
    }

    annotationsForSegment(segment: TextSegment): Annotation[] {
        let annotations: Annotation[] = [];
        const foundAnnotations =
            this.props.annotationPositions[String(segment.start)];
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

    segmentsContainSegment(segments: TextSegment[], segment: TextSegment) {
        for (let i = 0; i < segments.length; i++) {
            let listSegment = segments[i];
            if (
                listSegment.start === segment.start &&
                listSegment.text === segment.text
            ) {
                return true;
            }
        }
        return false;
    }

    selectedElement(element: Element) {
        if (element.tagName === "DIV") {
            this.props.selectedSegmentId("");
            return;
        }
        let sourceRangeSelection = [];
        let targetRangeSelection = [];
        const selection = document.getSelection();
        var clickId = parseInt(element.id.replace("s_", ""));
        this.props.changeSyncIdOnClick(clickId);
        if (element?.id.includes("s_") && this.props.condition) {
            this.props.changeScrollToId({ id: null, from: null });

            let id = parseInt(element.id.replace("s_", ""));
            let rangeUnique = find(
                this.textAlignmentById,
                (l) => id >= l.start && id < l.end
            );
            if (rangeUnique) {
                for (let i = rangeUnique.start; i < rangeUnique.end; i++) {
                    sourceRangeSelection.push(i);
                }
                for (let i = rangeUnique.TStart; i < rangeUnique.TEnd; i++) {
                    targetRangeSelection.push(i);
                }
                this.props.changeSelectedRange({
                    source: sourceRangeSelection,
                    target: targetRangeSelection,
                });
            }
        }

        if (selection && selection.type === "Range") {
            return;
        }
        this.props.selectedSegmentId(element.id);

        if (!element.id) {
            this.props.changeSelectedRange({ source: [], target: [] });
        }
    }

    generateHtml(renderProps: Props, renderState: State): { __html: string } {
        let segments = renderState.segmentedText.segments;
        let textLineClass = styles.textLine;
        let segmentHTML = '<p class="' + textLineClass + '">';
        if (segments.length === 0) return { __html: segmentHTML };

        const insertionClass = styles.insertion;
        const endPosition = segments[segments.length - 1].end + 1;
        if (renderProps.annotationPositions[INSERTION_KEY + endPosition]) {
            const endSegment = new TextSegment(endPosition, "");
            segments.push(endSegment);
        }
        if (renderProps.annotationPositions[PAGE_BREAK_KEY + endPosition]) {
            const endSegment = new TextSegment(endPosition, "");
            segments.push(endSegment);
        }
        if (renderProps.annotationPositions[LINE_BREAK_KEY + endPosition]) {
            const endSegment = new TextSegment(endPosition, "");
            segments.push(endSegment);
        }

        let activeAnnotations = renderProps.activeAnnotations || {};

        let highlightClass = styles.highlight;
        let activeHighlightClass = styles.activeHighlight;
        let activeSearchResultEnd = null;
        let processedInactiveInsertions = {};
        for (let i = 0; i < segments.length; i++) {
            let segment = segments[i];
            let classAttribute = "";
            let classes = [];
            let annotations = this.annotationsForSegment(segment);
            let deletionText = null;
            let selectedCurrentDeletion = false;
            let selectedCurrentPageBreak = false;
            let selectedCurrentLineBreak = false;
            let lineBreakAnnotation = false;
            let pageBreakAnnotation = null;

            if (annotations) {
                let activeInsertions = [];
                let inactiveInsertions = [];
                let remainingAnnotations = [];
                let activeDeletions = [];

                for (let j = 0, len = annotations.length; j < len; j++) {
                    let annotation = annotations[j];
                    if (annotation.isInsertion) {
                        if (annotation.uniqueId in activeAnnotations) {
                            activeInsertions.push(annotation);
                        } else {
                            // Only first inactive insertion at a position will
                            // be shown, so only process first one.
                            // TODO: need to check if there is an active insertion
                            // at the same place. If so, ignore inactive insertion
                            // as they should be shown in the popover.
                            const annotationKey = annotation.start;
                            if (
                                !processedInactiveInsertions.hasOwnProperty(
                                    annotationKey
                                )
                            ) {
                                inactiveInsertions.push(annotation);
                                processedInactiveInsertions[annotationKey] =
                                    annotation;
                            }
                        }
                    } else {
                        if (annotation.isDeletion) {
                            if (annotation.uniqueId in activeAnnotations) {
                                activeDeletions.push(annotation);
                            }
                        } else if (
                            annotation.type === ANNOTATION_TYPES.pageBreak &&
                            !renderProps.activeWitness.isWorking
                        ) {
                            pageBreakAnnotation = annotation;
                        } else if (
                            annotation.type === ANNOTATION_TYPES.lineBreak &&
                            !renderProps.activeWitness.isWorking
                        ) {
                            lineBreakAnnotation = annotation;
                        } else {
                            remainingAnnotations.push(annotation);
                        }
                    }
                }

                if (
                    activeInsertions.length === 0 &&
                    inactiveInsertions.length > 0
                ) {
                    const insertion = inactiveInsertions[0];
                    const insertionId = idForInsertion(segment);
                    let insertionClasses = insertionClass;
                    if (
                        renderProps.activeAnnotation &&
                        renderProps.activeAnnotation.isInsertion &&
                        renderProps.activeAnnotation.start === insertion.start
                    ) {
                        insertionClasses += " " + styles.selectedAnnotation;
                    }

                    segmentHTML +=
                        "<span id=" +
                        insertionId +
                        " key=" +
                        insertionId +
                        ' class="' +
                        insertionClasses +
                        '">' +
                        insertion.content +
                        "</span>";
                }

                if (activeDeletions.length > 0) {
                    const activeDeletion = activeDeletions[0];
                    const baseAnnotation =
                        renderProps.getBaseAnnotation(activeDeletion);
                    deletionText = baseAnnotation.content;
                    if (
                        renderProps.activeAnnotation &&
                        renderProps.activeAnnotation.isDeletion &&
                        renderProps.activeAnnotation.start ===
                            activeDeletion.start &&
                        renderProps.activeAnnotation.length ===
                            activeDeletion.length &&
                        segment.length === 0
                    ) {
                        selectedCurrentDeletion = true;
                    }
                }

                if (pageBreakAnnotation) {
                    if (
                        renderProps.activeAnnotation &&
                        renderProps.activeAnnotation.uniqueId ===
                            pageBreakAnnotation.uniqueId
                    ) {
                        selectedCurrentPageBreak = true;
                    }
                }

                if (lineBreakAnnotation) {
                    if (
                        renderProps.activeAnnotation &&
                        renderProps.activeAnnotation.uniqueId ===
                            lineBreakAnnotation.uniqueId
                    ) {
                        selectedCurrentLineBreak = true;
                    }
                }
                if (
                    remainingAnnotations.length > 0 ||
                    activeInsertions.length > 0
                ) {
                    if (remainingAnnotations.some((l) => l.type === "P")) {
                        classes.push(styles.P_annotation);
                    }
                    if (remainingAnnotations.some((l) => l.type === "Q")) {
                        var double = remainingAnnotations.filter(
                            (l) => l.type === "Q"
                        );
                        if (double.length > 1) {
                            classes.push(styles.Q_annotation_double);
                        }
                        classes.push(styles.Q_annotation);
                    }
                    if (remainingAnnotations.some((l) => l.type === "N")) {
                        classes.push(styles.N_annotation);
                    }
                    if (remainingAnnotations.some((l) => l.type === "V")) {
                        classes.push(styles.V_annotation);
                    }
                }
            }

            // It's an insertion at the end of the text, which should have just been added to the html.
            // So break as we don't want anymore segment html adding.
            if (segment.start === endPosition) {
                break;
            }

            let id = null;
            if (segment.length === 0) {
                id = idForDeletedSegment(segment);
                classes.push(styles.removedByAnnotation);
                if (deletionText) {
                    segment = new TextSegment(segment.start, deletionText);
                }
            } else {
                id = idForSegment(segment);
            }

            if (
                this.segmentsContainSegment(
                    renderProps.selectedAnnotatedSegments,
                    segment
                ) ||
                selectedCurrentDeletion
            ) {
                classes.push(styles.selectedAnnotation);
            }

            if (
                renderProps.selectedSourceRange.includes(segment.start) &&
                renderProps.condition
            ) {
                let newClass =
                    renderProps.theme.palette.mode === "light"
                        ? styles.selectedRangelight
                        : styles.selectedRangeDark;
                classes.push(newClass);
            }
            if (
                renderProps.selectedMedia.isVideoVisible &&
                renderProps.isPanelLinked
            ) {
                if (
                    renderProps.MediaInterval.source_segment &&
                    renderProps.MediaInterval.source_segment.start <
                        segment.start &&
                    renderProps.MediaInterval.source_segment.end > segment.start
                )
                    classes.push(styles.mediaInterval);
            }

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
                        let [start, end] =
                            renderProps.searchStringPositions[position];
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

            if (pageBreakAnnotation) {
                let pageBreakClasses = [styles.pageBreak];
                if (selectedCurrentPageBreak) {
                    pageBreakClasses.push(styles.selectedAnnotation);
                }
                const pageBreakClassAttribute =
                    ' class="' + pageBreakClasses.join(" ") + '" ';
                segmentHTML +=
                    "<span id=" +
                    idForPageBreak(segment) +
                    " key=" +
                    idForPageBreak(segment) +
                    pageBreakClassAttribute +
                    ">" +
                    pageBreakIconString +
                    "</span>";
            }
            if (lineBreakAnnotation) {
                let lineBreakClasses = [styles.lineBreak];
                if (selectedCurrentLineBreak) {
                    lineBreakClasses.push(styles.selectedAnnotation);
                }
                const lineBreakClassAttribute =
                    ' class="' + lineBreakClasses.join(" ") + '" ';
                segmentHTML +=
                    "<span id=" +
                    idForLineBreak(segment) +
                    " key=" +
                    idForLineBreak(segment) +
                    lineBreakClassAttribute +
                    ">" +
                    PARA_SYMBOL +
                    "</span>";

                segmentHTML += '</p><p class="' + textLineClass + '">';
            }
        }

        this._renderedSegments = segments;

        segmentHTML += "</p>";
        const html = {
            __html: segmentHTML,
        };
        return html;
    }
    shouldComponentUpdate(nextProps: Props, nextState: State) {
        this.textAlignmentById = this.props.textAlignmentById;

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
                    id="text1"
                    dangerouslySetInnerHTML={html}
                    style={{
                        fontSize: this.props.fontSize,
                        fontFamily: "var(--tibetan-fonts)",
                    }}
                    onClick={(e) => {
                        this.selectedElement(e.target);
                    }}
                />
            </div>
        );
    }
}

export default withTheme(Text);
