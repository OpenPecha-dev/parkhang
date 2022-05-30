// @flow
import React from "react";
import { connect } from "react-redux";
import TextDetail from "./TextDetail";
import * as actions from "actions";
import * as reducers from "reducers";
import AnnotatedText from "lib/AnnotatedText";
import * as TextStore2 from "state_helpers/TextStore2";


const mapStateToProps = (state: AppState): {} => {
    let selectedWitness= {};
    let annotatedText = null;
    let workingWitness;
    let textFontSize = reducers.getTextFontSize2(state);
   let selectedText = reducers.getSelectedText2(state);

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
    return {
        text: selectedText,
        textFontSize,
        annotatedText,
        selectedWitness,
        loading: loading,
    };
   
};


const mergeProps = (stateProps, dispatchProps, ownProps) => {
   
const { dispatch } = dispatchProps;

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
        dispatch(changedActiveTextAnnotation(activeAnnotation));
    }
};
}

const TextDetailContainer = connect(mapStateToProps, null,mergeProps)(
    TextDetail
);

export default TextDetailContainer;

