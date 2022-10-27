// @flow
import React from "react";
import { connect } from "react-redux";
import Annotation, { ANNOTATION_TYPES } from "lib/Annotation";
import type { AnnotationUniqueId } from "lib/Annotation";
import Source, { WORKING_VERSION_SOURCE_NAME } from "lib/Source";
import Witness from "lib/Witness";
import Text from "lib/Text";
import TextSegment from "lib/TextSegment";
import type { AppState } from "reducers";
import type { AnnotationData, TextData } from "api";
import {
    WORKING_VERSION_ANNOTATION_ID,
    INSERTION_KEY,
    DELETION_KEY,
    PAGE_BREAK_KEY,
    LINE_BREAK_KEY,
} from "lib/AnnotatedText";
import TextDetail from "components/TextDetail";
import {
    changedActiveAnnotation,
    changedActiveTextAnnotation,
    changedWitnessScrollPosition,
} from "actions";
import {
    showPageImages,
    getAnnotationsForWitnessId,
    getActiveAnnotationsForWitnessId,
    getActiveAnnotation,
    getActiveTextAnnotation,
    getBaseWitness,
    getWorkingWitness,
    getSelectedText,
    annotationFromData,
    getAnnotationData,
    getUser,
    getTextListVisible,
    getSelectedTextWitnessId,
    getTextWitnesses,
    getWitness,
    hasLoadedWitnessAnnotations,
    getRemovedDefaultAnnotationsForWitnessId,
    hasLoadedWitnessAppliedAnnotations,
    getScrollPosition,
    getSelectedSearchResult,
    getSearchValue,
    getTextFontSize,
    isSecondWindowOpen,
    isPanelVisible,
    getSelectedSourceRange,
    getSelectedTargetRange,
    getSearchResults,
    getShowTableContent,
    getMediaInterval,
} from "reducers";
import * as reducers from "reducers";
import _ from "lodash";

import AnnotatedText from "lib/AnnotatedText";
import segmentTibetanText from "lib/segmentTibetanText";
import SegmentedText from "lib/SegmentedText";
import * as actions from "actions";
import * as constants from "app_constants";
import * as TextStore from "state_helpers/TextStore";

const DISMISS_CONTROLS_ON_CLICK = false;
function getInsertionKey(annotation) {
    return [annotation.start, annotation.length].join("-");
}

let _posAnnotatedText;
let _posAnnotations;
let _positions;
let _posVersion;
const getAnnotationPositions = (
    annotatedText: AnnotatedText,
    annotations: Annotation[]
): { [string]: Annotation[] } => {
    if (
        annotatedText === _posAnnotatedText &&
        annotations === _posAnnotations &&
        annotatedText.version === _posVersion
    ) {
        return _positions;
    }

    let positions = {};
    let activeInsertions = {};

    for (let i = 0; i < annotations.length; i++) {
        let annotation = annotations[i];
        let [startPos, length] =
            annotatedText.getPositionOfAnnotation(annotation);
        if (startPos == null) {
            continue;
        }
        if (length === 0) {
            if (annotation.isInsertion) {
                // group with any active insertions at the same position
                const activeKey = getInsertionKey(annotation);
                const activeInsertionPositions = activeInsertions[activeKey];
                if (activeInsertionPositions) {
                    activeInsertionPositions.map((pos) =>
                        positions[pos].push(annotation)
                    );
                    continue;
                }
                startPos = INSERTION_KEY + startPos;
            }
            if (annotation.isDeletion && annotation.length > 0) {
                // active deletion
                startPos = DELETION_KEY + startPos;
            }
            if (annotation.type === ANNOTATION_TYPES.pageBreak) {
                startPos = PAGE_BREAK_KEY + startPos;
            }
            if (annotation.type === ANNOTATION_TYPES.lineBreak) {
                startPos = LINE_BREAK_KEY + startPos;
            }
            if (positions[startPos] === undefined) {
                positions[startPos] = [];
            }
            if (positions[startPos].indexOf(annotation) === -1) {
                positions[startPos].push(annotation);
            }
        } else {
            let annotationPositions = [];
            for (let j = startPos; j < startPos + length; j++) {
                if (positions[j] === undefined) {
                    positions[j] = [];
                }
                if (positions[j].indexOf(annotation) === -1) {
                    positions[j].push(annotation);
                }
                annotationPositions.push(j);
            }
            // Store the positions this annotation is displayed at.
            // This can then be used later to group with inactive insertions
            if (annotation.isInsertion) {
                const key = getInsertionKey(annotation);
                activeInsertions[key] = annotationPositions;
            }
        }
    }

    _posAnnotatedText = annotatedText;
    _posAnnotations = annotations;
    _positions = positions;
    _posVersion = annotatedText.version;
    return positions;
};

let _selectedWitness = null;

const mapStateToProps = (state) => {
    const user = getUser(state);
    const loading =
        state.data.loadingWitnesses || state.data.loadingAnnotations;
    const textListVisible = getTextListVisible(state);
    const textAlignmentById = reducers.getTextAlignmentById(state);

    if (loading) {
        return {
            text: null,
            witnesses: null,
            baseWitness: null,
            annotations: null,
            loading: loading,
            paginated: null,
            pageImagesVisible: true,
            annotatedText: null,
            selectedAnnotatedSegments: null,
            annotationPositions: null,
            activeAnnotations: null,
            activeAnnotation: null,
            user: user,
            textListVisible,
            fontSize: constants.DEFAULT_TEXT_FONT_SIZE,
            textAlignmentById,
        };
    }

    const selectedText = getSelectedText(state);
    let witnesses = {};
    let workingWitness;
    let baseWitness;
    if (selectedText) {
        workingWitness = getWorkingWitness(state, selectedText.id);
        baseWitness = getBaseWitness(state, selectedText.id);
    }
    let selectedSearchResult = getSelectedSearchResult(state);
    let annotationPositions = {};
    let annotations = [];
    let annotatedText = null;
    let activeAnnotation = getActiveTextAnnotation(state);
    let selectedAnnotatedSegments = [];
    let appliedAnnotations = {};
    let pageBreaks = [];
    let imagesBaseUrl = "";
    let selectedWitness;
    let searchValue = getSearchValue(state);
    // Whether to show the text's page images
    let paginated = false;
    let pageImagesVisible = false;
    let fontSize = getTextFontSize(state);
    if (
        workingWitness &&
        selectedText &&
        state.data.witnessAnnotationsById.hasOwnProperty(workingWitness.id)
    ) {
        witnesses = getTextWitnesses(state, selectedText.id);
        let selectedWitnessId = getSelectedTextWitnessId(
            state,
            selectedText.id
        );
        if (selectedWitnessId) {
            selectedWitness = getWitness(state, selectedWitnessId);
        }
        if (!selectedWitness) {
            selectedWitness = workingWitness;
            selectedWitnessId = workingWitness.id;
        }

        if (selectedWitness.id !== workingWitness.id) {
            paginated = true;
            pageImagesVisible = showPageImages(state);
        }

        annotatedText = TextStore.getWitnessText(state, selectedWitness.id);

        [appliedAnnotations, annotations] = TextStore.getWitnessAnnotations(
            state,
            selectedWitness,
            workingWitness
        );

        if (annotatedText) {
            annotationPositions = getAnnotationPositions(
                annotatedText,
                (Object.values(annotations): any)
            );
        }

        // Get the segments that are part of the current active annotation.
        // These are used by Text to highlight the currently selected segment.
        if (activeAnnotation && annotatedText) {
            // If we've just switched witnesses, make sure we select the
            // correct part of the text by getting a new annotation.
            if (
                !_selectedWitness ||
                _selectedWitness.id !== selectedWitness.id
            ) {
                activeAnnotation = annotatedText.getAnnotation(
                    activeAnnotation.start,
                    activeAnnotation.length
                );
            }
            if (activeAnnotation) {
                selectedAnnotatedSegments =
                    annotatedText.segmentsForAnnotation(activeAnnotation);
            }
        }
        if (selectedWitness && baseWitness && annotatedText) {
            var selectedWitnessAnnotaion =
                state.data.witnessAnnotationsById[selectedWitness.id];
            let newArray = Object.values(selectedWitnessAnnotaion);
            let witnessPageBreaks = newArray;
            // annotatedText.getAnnotationsOfType(
            //     ANNOTATION_TYPES.pageBreak
            // ) || {};

            let basePageBreaks = null;
            if (selectedWitness.id !== baseWitness.id) {
                basePageBreaks = getAnnotationsForWitnessId(
                    state,
                    workingWitness.id,
                    ANNOTATION_TYPES.pageBreak,
                    baseWitness.id
                );
            }
            pageBreaks = getPageBreaks(witnessPageBreaks, basePageBreaks);

            for (let i = 0, len = pageBreaks.length; i < len; i++) {
                let position = pageBreaks[i];
                let segment = annotatedText.segmentAtOriginalPosition(position);
                if (segment instanceof TextSegment) {
                    pageBreaks[i] = segment.start;
                } else if (segment instanceof Number) {
                    pageBreaks[i] = segment;
                }
            }

            if (paginated) {
                imagesBaseUrl =
                    "/static/images/texts/" +
                    selectedText.name +
                    "/" +
                    selectedWitness.source.name +
                    "/";
            }
        }
    }
    _selectedWitness = selectedWitness;
    const scrollToId = reducers.getScrollToId(state);
    const isPanelLinked = reducers.isPanelLinked(state);

    const textAlignment = reducers.getTextAlignment(state);
    const syncIdOnClick = reducers.getSyncIdOnClick(state);
    const selectedWindow = reducers.getSelectedWindow(state);
    const selectedWitness2 = reducers.getSelectedTextWitness2(state);
    let Media = reducers.getMediaData(state);
    const isSecondWindowOpen = reducers.isSecondWindowOpen(state);
    const condition = reducers.getConditionForAlignment(state);
    return {
        text: selectedText,
        witnesses: witnesses,
        workingWitness: workingWitness,
        baseWitness: baseWitness,
        annotations: annotations,
        loading: loading,
        paginated: paginated,
        pageImagesVisible: pageImagesVisible,
        annotatedText: annotatedText,
        selectedAnnotatedSegments: selectedAnnotatedSegments,
        annotationPositions: annotationPositions,
        activeAnnotations: { ...appliedAnnotations },
        activeAnnotation: activeAnnotation,
        pageBreaks: pageBreaks,
        imagesBaseUrl: imagesBaseUrl,
        user: user,
        textListVisible,
        selectedWitness,
        selectedSearchResult,
        searchValue,
        fontSize,
        isSecondWindowOpen,
        isAnnotating: reducers.isAnnotating(state),
        textAlignment,
        textAlignmentById,
        scrollToId,
        syncIdOnClick,
        selectedWindow,
        selectedSourceRange: getSelectedSourceRange(state),
        selectedTargetRange: getSelectedTargetRange(state),
        searchResults: getSearchResults(state, searchValue),
        showTableContent: getShowTableContent(state),
        selectedMedia: Media,
        MediaInterval: getMediaInterval(state),
        condition: condition && isPanelLinked && isSecondWindowOpen,
        isPanelLinked,
    };
};

const mergeProps = (stateProps, dispatchProps, ownProps) => {
    const { dispatch } = dispatchProps;
    const { annotatedText, annotationPositions } = stateProps;

    const didSelectSegmentPosition = (segmentPosition, start, length) => {
        let segmentAnnotations = annotationPositions[segmentPosition];
        let segmentVariants = [];
        let segmentPageBreaks = [];
        let segmentLineBreaks = [];
        if (segmentAnnotations) {
            segmentVariants = segmentAnnotations.filter(
                (annotation: Annotation) =>
                    annotation.type === ANNOTATION_TYPES.variant
            );
            segmentPageBreaks = segmentAnnotations.filter(
                (annotation: Annotation) =>
                    annotation.type === ANNOTATION_TYPES.pageBreak
            );
            segmentLineBreaks = segmentAnnotations.filter(
                (annotation: Annotation) =>
                    annotation.type === ANNOTATION_TYPES.lineBreak
            );
        }
        let activeAnnotations = _.intersectionWith(
            segmentVariants.concat(segmentPageBreaks, segmentLineBreaks),
            annotatedText.annotations,
            (a, b) => a.toString() == b.toString()
        );
        let activeAnnotation = null;
        if (activeAnnotations.length > 0) {
            // get any active annotations
            activeAnnotation = activeAnnotations[0];
        } else if (segmentVariants && segmentVariants.length > 0) {
            // get base text annotation for longest annotation highlighted in text
            let longestAvailable = getLongestAnnotation(segmentVariants);
            let [start, textLength] =
                annotatedText.getPositionOfAnnotation(longestAvailable);
            if (longestAvailable && longestAvailable.isInsertion) {
                textLength = 0;
            }
            activeAnnotation = annotatedText.getBaseAnnotation(
                start,
                textLength
            );
        } else {
            // get base annotation of just the segment
            activeAnnotation = annotatedText.getBaseAnnotation(start, length);
        }

        dispatch(changedActiveTextAnnotation(activeAnnotation));
    };

    const isInsertion = (id) => {
        return id.indexOf("i_") !== -1;
    };

    const isDeletion = (id) => {
        return id.indexOf("ds_") !== -1;
    };

    const isPageBreak = (id) => {
        return id.indexOf("p_") !== -1;
    };

    const isLineBreak = (id) => {
        return id.indexOf("l_") !== -1;
    };

    const idFromSegmentId = (id) => {
        let start = 0;
        if (isInsertion(id)) {
            start = id.substr(2);
        } else if (isDeletion(id)) {
            start = id.substr(3);
        } else {
            start = id.substr(2);
        }

        return start;
    };

    return {
        ...stateProps,
        ...ownProps,
        didSelectSegmentIds: (segmentIds) => {
            if (segmentIds.length === 0) {
                return;
            }
            let segmentAnnotations = [];
            let segments = [];
            for (let segmentId of segmentIds) {
                if (isDeletion(segmentId) || isInsertion(segmentId)) {
                    continue;
                }

                let segmentPosition = idFromSegmentId(segmentId);
                let textSegment =
                    annotatedText.segmentedText.segmentAtPosition(
                        segmentPosition
                    );
                segments.push(textSegment);
                const annotations = annotationPositions[textSegment.start];
                if (annotations) {
                    segmentAnnotations = segmentAnnotations.concat(annotations);
                }
            }
            segmentAnnotations = _.uniqWith(
                segmentAnnotations,
                (a, b) => a.toString() == b.toString()
            );

            let activeAnnotations = _.intersectionWith(
                segmentAnnotations,
                annotatedText.annotations,
                (a, b) => a.toString() == b.toString()
            );

            const range = getSegmentsRange(
                segments,
                activeAnnotations,
                segmentAnnotations,
                stateProps.annotatedText
            );
            if (!range) {
                console.warn(
                    "No range for selected segment ids: %o",
                    segmentIds
                );
                return;
            }
            const baseAnnotation = annotatedText.getBaseAnnotation(
                range.start,
                range.length
            );
            let activeAnnotation = null;
            if (range.annotation) {
                activeAnnotation = range.annotation;
            } else if (activeAnnotations.length > 0) {
                const content = annotatedText.segmentedText
                    .segmentsInRange(range.start, range.length)
                    .reduce((content, segment) => content + segment.text, "");
                // TODO: test this when editing non-working edition.
                // Check if getTextWorkingWitness works as required
                if (!stateProps.selectedWitness) {
                    console.log(
                        "no stateProps.selectedWitness: %o",
                        stateProps.selectedWitness
                    );
                }
                activeAnnotation = new Annotation(
                    WORKING_VERSION_ANNOTATION_ID,
                    getTextWorkingWitness(stateProps.text),
                    baseAnnotation.start,
                    baseAnnotation.length,
                    content,
                    ANNOTATION_TYPES.variant,
                    stateProps.selectedWitness,
                    stateProps.user
                );
            } else {
                activeAnnotation = baseAnnotation;
            }
            dispatch(changedActiveTextAnnotation(activeAnnotation));
        },
        selectedSegmentId: (segmentId) => {
            let start = idFromSegmentId(segmentId);
            let positionKey = start;
            if (isInsertion(segmentId)) {
                positionKey = INSERTION_KEY + start;
            } else if (isDeletion(segmentId)) {
                positionKey = DELETION_KEY + start;
            } else if (isPageBreak(segmentId)) {
                positionKey = PAGE_BREAK_KEY + start;
            } else if (isLineBreak(segmentId)) {
                positionKey = LINE_BREAK_KEY + start;
            }

            let segmentAnnotations = annotationPositions[positionKey];
            if (
                (DISMISS_CONTROLS_ON_CLICK && stateProps.activeAnnotation) ||
                segmentId === ""
            ) {
                const activeAnnotation = stateProps.activeAnnotation;

                if (activeAnnotation) {
                    const dismissTextAnnotation =
                        actions.changedActiveTextAnnotation(null);
                    dispatch(dismissTextAnnotation);
                }
            } else {
                if (
                    isInsertion(segmentId) ||
                    isDeletion(segmentId) ||
                    isPageBreak(segmentId) ||
                    isLineBreak(segmentId)
                ) {
                    const length = 0;
                    didSelectSegmentPosition(positionKey, start, length);
                } else {
                    let segmentPosition = Number(idFromSegmentId(segmentId));
                    let textSegment =
                        annotatedText.segmentedText.segmentAtPosition(
                            segmentPosition
                        );
                    if (textSegment) {
                        didSelectSegmentPosition(
                            textSegment.start,
                            textSegment.start,
                            textSegment.length
                        );
                    }
                }
            }
        },
        changeScrollToId: (payload) =>
            dispatch(actions.changeScrollToId(payload)),
        changeSyncIdOnClick: (payload) =>
            dispatch(actions.changeSyncIdOnClick(payload)),
        changeSelectedImage: (payload) => {
            dispatch(actions.selectImage(payload));
        },
        changeSelectedWindow: (payload) => {
            dispatch(actions.changeSelectedWindow(payload));
        },
        changeSelectedRange: (payload) => {
            dispatch(actions.changeSelectedRange(payload));
        },
        changeShowTableContent: (payload) => {
            dispatch(actions.showTableContent(payload));
        },
        closeAnnotation: () => {
            const dismissTextAnnotation =
                actions.changedActiveTextAnnotation(null);
            dispatch(dismissTextAnnotation);
        },
    };
};

const getPageBreaks = (
    witnessPageBreaks: { [AnnotationUniqueId]: Annotation },
    basePageBreaks: { [AnnotationUniqueId]: AnnotationData } | null
): number[] => {
    let witnessStarts = [];
    _.forIn(witnessPageBreaks, (o) => witnessStarts.push(o.start));
    witnessStarts = witnessStarts.sort((a, b) => a - b);
    if (!basePageBreaks) {
        return witnessStarts;
    }

    let baseStarts = [];
    _.forIn(basePageBreaks, (o) => baseStarts.push(o.start));
    baseStarts = baseStarts.sort((a, b) => a - b);
    if (witnessStarts.length === 0) {
        return baseStarts;
    }

    // Only add page breaks if witness has < 90% of base witness breaks.
    // Editions often have differing numbers of words per page so can't
    // be 100%.
    const threshold = 0.9;
    if (witnessStarts.length / baseStarts.length < threshold) {
        let lastWitnessPageStart = witnessStarts[witnessStarts.length - 1];
        for (let i = 0, len = baseStarts.length; i < len; i++) {
            let start = baseStarts[i];
            if (start > lastWitnessPageStart) witnessStarts.push(start);
        }
    }
    return witnessStarts;
};

const getTextWorkingWitness = (textData: TextData): Witness => {
    const source = new Source(
        WORKING_VERSION_ANNOTATION_ID,
        WORKING_VERSION_SOURCE_NAME
    );
    const text = new Text(textData.id, textData.name);
    const witness = new Witness(
        WORKING_VERSION_ANNOTATION_ID,
        text,
        source,
        "",
        false
    );

    return witness;
};

const getSegmentsRange = (
    segments: TextSegment[],
    activeAnnotations: Annotation[],
    annotations: Annotation[],
    annotatedText: AnnotatedText
): { start: number, length: number, annotation: Annotation | null } | null => {
    if (segments.length === 0) {
        return null;
    }
    let first = segments[0];
    let last = segments[segments.length - 1];

    let start = first.start;
    let end = last.end;

    let startAnnotation = null;
    let endAnnotation = null;
    for (let i = 0; i < annotations.length; i++) {
        const annotation = annotations[i];
        let annotationStart,
            annotationLength,
            annotationEnd = null;
        [annotationStart, annotationLength] =
            annotatedText.getPositionOfAnnotation(annotation);

        if (activeAnnotations.indexOf(annotation) !== -1) {
            if (annotationStart && annotationStart < start) {
                start = annotationStart;
                startAnnotation = annotation;
            }

            annotationEnd = annotationStart + annotationLength - 1;

            if (annotationEnd && annotationEnd > end) {
                end = annotationEnd;
                endAnnotation = annotationEnd;
            }
        } else {
            // For inactive annotions - we want to select the whole
            // length of text the annotation refers to.
            annotationEnd = annotationStart + annotationLength - 1;
            if (annotationEnd > end) {
                end = annotationEnd;
            }
        }
    }

    // Set if the whole range is encompassed by a single annotation
    let rangeAnnotation = null;
    if (startAnnotation && endAnnotation && startAnnotation === endAnnotation) {
        rangeAnnotation = startAnnotation;
    }

    return {
        start: start,
        length: end - start + 1,
        annotation: rangeAnnotation,
    };
};

const getLongestAnnotation = (annotations: Annotation[]): Annotation | null => {
    let longest = null;
    for (let i = 0; i < annotations.length; i++) {
        let annotation = annotations[i];
        if (!longest) {
            longest = annotation;
        } else {
            if (annotation.length > longest.length) {
                longest = annotation;
            }
        }
    }
    return longest;
};

const TextDetailContainer = connect(
    mapStateToProps,
    null,
    mergeProps
)(TextDetail);

export default TextDetailContainer;
