// @flow
import React from "react";
import { connect } from "react-redux";
import TextDetail from "./TextDetail";
import * as actions from "actions";
import * as reducers from "reducers";
import AnnotatedText from "lib/AnnotatedText";
import _ from "lodash";
import * as TextStore2 from "state_helpers/TextStore2";


const DISMISS_CONTROLS_ON_CLICK = true;

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
        let [startPos, length] = annotatedText.getPositionOfAnnotation(
            annotation
        );
        if (startPos == null) {
            continue;
        }
        if (length === 0) {
            if (annotation.isInsertion) {
                // group with any active insertions at the same position
                const activeKey = getInsertionKey(annotation);
                const activeInsertionPositions = activeInsertions[activeKey];
                if (activeInsertionPositions) {
                    activeInsertionPositions.map(pos =>
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

const mapStateToProps = (state: AppState): {} => {
    let selectedWitness= {};
    let annotatedText = null;
    let workingWitness;
    let textFontSize = reducers.getTextFontSize2(state);
   let selectedText = reducers.getSelectedText2(state);
   let annotationPositions = {};
   let annotations = [];
    if (selectedText) {
        workingWitness = reducers.getWorkingWitness2(state, selectedText.id);
        let selectedWitnessId = reducers.getSelectedTextWitnessId2(
            state,
            selectedText.id
        );
        if (selectedWitnessId) {
            selectedWitness =reducers.getWitness2(state, selectedWitnessId);
        }
        if (!selectedWitness) {
            selectedWitness = workingWitness;
        }
   
    }
     annotatedText = TextStore2.getWitnessText(state, selectedWitness.id);
     const loading = state.data2.loadingWitnesses

     if (annotatedText) {
        annotationPositions = getAnnotationPositions(
            annotatedText,
            (Object.values(annotations): any)
        );

    }

    return {
        text: selectedText,
        textFontSize,
        annotatedText,
        selectedWitness,
        loading: loading,
        annotationPositions
    };
   
};


const mergeProps = (stateProps, dispatchProps, ownProps) => {
    const { annotatedText, annotationPositions } = stateProps;
    const { dispatch } = dispatchProps;

const isDeletion = id => {
    return id.indexOf("ds2_") !== -1;
};
const isInsertion = id => {
    return id.indexOf("i2_") !== -1;
};
const isPageBreak = id => {
    return id.indexOf("p2_") !== -1;
};

const isLineBreak = id => {
    return id.indexOf("l2_") !== -1;
};

const idFromSegmentId = id => {
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
        let [start, textLength] = annotatedText.getPositionOfAnnotation(
            longestAvailable
        );
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

    // dispatch(actions.changedActiveTextAnnotation(activeAnnotation));
};

return {
    ...ownProps,
    ...stateProps,
    onChangedFontSize: (fontSize: number) => {
        dispatch(actions.changedTextFontSize(fontSize));
    },
    
    didSelectSegmentIds: segmentIds => {
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
            let textSegment = annotatedText.segmentedText.segmentAtPosition(
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
        // dispatch(changedActiveTextAnnotation(activeAnnotation));
    },
    selectedSegmentId: segmentId => {
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
        if (DISMISS_CONTROLS_ON_CLICK && stateProps.activeAnnotation) {
            const activeAnnotation = stateProps.activeAnnotation;
            if (activeAnnotation) {
                const dismissTextAnnotation = actions.changedActiveTextAnnotation(
                    null
                );
                dispatch(dismissTextAnnotation);
            }
        }
        //  else {
        //     if (
        //         isInsertion(segmentId) ||
        //         isDeletion(segmentId) ||
        //         isPageBreak(segmentId) ||
        //         isLineBreak(segmentId)
        //     ) {
        //         const length = 0;
        //         didSelectSegmentPosition(positionKey, start, length);
        //     } else {
        //         let segmentPosition = Number(idFromSegmentId(segmentId));
        //         let textSegment = annotatedText.segmentedText.segmentAtPosition(
        //             segmentPosition
        //         );
        //         if (textSegment) {
        //             didSelectSegmentPosition(
        //                 textSegment.start,
        //                 textSegment.start,
        //                 textSegment.length
        //             );
        //         }
        //     }
        // }
    },
};
}

const TextDetailContainer = connect(mapStateToProps, null,mergeProps)(
    TextDetail
);

export default TextDetailContainer;

