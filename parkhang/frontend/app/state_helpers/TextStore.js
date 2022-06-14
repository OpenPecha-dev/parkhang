// @flow
import * as reducers from "reducers";
import type { AppState } from "reducers";
import AnnotatedText from "lib/AnnotatedText";
import Witness from "lib/Witness";
import Annotation, { ANNOTATION_TYPES } from "lib/Annotation";
import type { AnnotationUniqueId } from "lib/Annotation";
import type { AnnotationData, TextData } from "api";
import segmentTibetanText from "lib/segmentTibetanText";
import SegmentedText from "lib/SegmentedText";
import _ from "lodash";

let store: { [witnessId: number]: AnnotatedText } = {};

export const getWitnessText = (
    state: AppState,
    witnessId: number
): AnnotatedText | null => {
    let text: AnnotatedText | null = null;
    if (store.hasOwnProperty(witnessId)) {
        text = store[witnessId];
    } else {
        if (
            reducers.hasLoadedWitnessAnnotations(state, witnessId) &&
            reducers.hasLoadedWitnessAppliedAnnotations(state, witnessId)
        ) {
            text = generateAnnotatedText(state, witnessId);
            if (text) {
                store[witnessId] = text;
            }
        }
    }

    return text;
};

export const addTextAnnotation = (
    state: AppState,
    witnessId: number,
    annotation: Annotation
) => {
    const text = getWitnessText(state, witnessId);
    if (text) {
        text.addAnnotation(annotation);
    }
    // If witnessId is present, assume that getWitnessAnnotations
    // has already been called.
    if (annotationStore.hasOwnProperty(witnessId)) {
        if (
            !annotationStore[witnessId].appliedAnnotations.hasOwnProperty(
                annotation.uniqueId
            )
        ) {
            annotationStore[witnessId].appliedAnnotations[
                annotation.uniqueId
            ] = annotation;
        }
        if (
            !annotationStore[witnessId].allAnnotations.hasOwnProperty(
                annotation.uniqueId
            )
        ) {
            annotationStore[witnessId].allAnnotations[
                annotation.uniqueId
            ] = annotation;
        }
    }
};

export const removeTextAnnotation = (
    state: AppState,
    witnessId: number,
    annotationId: AnnotationUniqueId
) => {
    const text = getWitnessText(state, witnessId);
    if (text) {
        text.removeAnnotation(annotationId);
    }
    if (annotationStore.hasOwnProperty(witnessId)) {
        if (
            annotationStore[witnessId].appliedAnnotations.hasOwnProperty(
                annotationId
            )
        ) {
            delete annotationStore[witnessId].appliedAnnotations[
                annotationId
            ];
        }
    }
};

export const deleteTextAnnotation = (
    state: AppState,
    witnessId: number,
    annotationId: AnnotationUniqueId
) => {
    const text = getWitnessText(state, witnessId);
    if (text) {
        text.removeAnnotation(annotationId);
    }
    if (annotationStore.hasOwnProperty(witnessId)) {
        if (
            annotationStore[witnessId].allAnnotations.hasOwnProperty(
                annotationId
            )
        ) {
            delete annotationStore[witnessId].allAnnotations[
                annotationId
            ];
        }
        if (
            annotationStore[witnessId].appliedAnnotations.hasOwnProperty(
                annotationId
            )
        ) {
            delete annotationStore[witnessId].appliedAnnotations[
                annotationId
            ];
        }
    }
}

let annotationStore: {
    [witnessId: number]: {
        appliedAnnotations: { [AnnotationUniqueId]: Annotation },
        allAnnotations: { [AnnotationUniqueId]: Annotation }
    }
} = {};

export const getWitnessAnnotations = (
    state: AppState,
    witness: Witness,
    workingWitness: Witness
): [
    { [AnnotationUniqueId]: Annotation },
    { [AnnotationUniqueId]: Annotation }
] => {
    if (annotationStore.hasOwnProperty(witness.id)) {
        return [
            annotationStore[witness.id].appliedAnnotations,
            annotationStore[witness.id].allAnnotations
        ];
    }

    const text = witness.text;

    let workingAnnotationList = reducers.getAnnotationsForWitnessId(
        state,
        workingWitness.id
    );

    let appliedAnnotations = getActiveAnnotations(
        state,
        witness.id,
        workingWitness.id
    );

    let removedDefaultAnnotations = null;
    // Default annotations removed by the user.
    // Usually these are available when viewing
    // a non-working edition.
    let nonActiveAnnotations = {};

    if (witness.id !== workingWitness.id) {
        // If we are not viewing the working version,
        // get all the annotations created by the selected witness
        // BUT NOT BY A USER to apply to the base text.
        // User-created annotations need to be in appliedAnnotations.

        removedDefaultAnnotations = reducers.getRemovedDefaultAnnotationsForWitnessId(
            state,
            witness.id
        );

        let selectedWitnessAnnotations = {};

        for (let key in workingAnnotationList) {
            if (workingAnnotationList.hasOwnProperty(key)) {
                let annotationData = workingAnnotationList[key];
                if (
                    annotationData.creator_witness === witness.id &&
                    !removedDefaultAnnotations.hasOwnProperty(
                        annotationData.unique_id
                    )
                ) {
                    selectedWitnessAnnotations[
                        annotationData.unique_id
                    ] = annotationData;
                } else if (annotationData.creator_witness === witness.id) {
                    nonActiveAnnotations[
                        annotationData.unique_id
                    ] = annotationData;
                }
            }
        }

        let selectedWitnessAnnotationsList = annotationsMapFromData(
            state,
            selectedWitnessAnnotations
        );

        appliedAnnotations = {
            ...selectedWitnessAnnotationsList,
            ...appliedAnnotations
        };

        workingAnnotationList = selectedWitnessAnnotations;
    }

    let annotations = annotationsMapFromData(state, workingAnnotationList);
    nonActiveAnnotations = annotationsMapFromData(state, nonActiveAnnotations);
    if (Object.keys(nonActiveAnnotations).length > 0) {
        annotations = {
            ...annotations,
            ...nonActiveAnnotations
        };
    }

    annotations = {
        ...appliedAnnotations,
        ...annotations
    };

    annotations = _.pickBy(
        annotations,
        (annotation: Annotation, key: AnnotationUniqueId) => {
            return !(
                witness &&
                annotation.type === ANNOTATION_TYPES.lineBreak &&
                annotation.creatorWitness.id !== witness.id
            );
        }
    );

    // Only cache if annotations have been loaded
    if (
        reducers.hasLoadedWitnessAnnotations(state, witness.id) &&
        reducers.hasLoadedWitnessAppliedAnnotations(state, witness.id)
    ) {
        annotationStore[witness.id] = {
            appliedAnnotations: appliedAnnotations,
            allAnnotations: annotations
        };
    }

    return [appliedAnnotations, annotations];
};

const generateAnnotatedText = (
    state: AppState,
    witnessId: number
): AnnotatedText | null => {
    const witness = reducers.getWitness(state, witnessId);
    if (!witness) {
        console.warn("no witness");
        return null;
    }
    const text = witness.text;
    const workingWitness = reducers.getWorkingWitness(state, text.id);
    const baseWitness = reducers.getBaseWitness(state, text.id);
    if (!workingWitness || !baseWitness) {
        return null;
    }

    let [appliedAnnotations, availableAnnotations] = getWitnessAnnotations(
        state,
        witness,
        workingWitness
    );
    let segmentedWorkingWitness = getSegmentedWitness(workingWitness);


    let annotatedText = new AnnotatedText(
        segmentedWorkingWitness,
        (Object.values(appliedAnnotations): any),
        text => {
            return segmentTibetanText(text).segments;
        },
        workingWitness,
        witness
    );
    return annotatedText;
};

const getActiveAnnotations = (
    state: AppState,
    witnessId,
    baseWitnessId
): { [AnnotationUniqueId]: Annotation } => {
    const loadedAppliedAnnotations = reducers.hasLoadedWitnessAppliedAnnotations(
        state,
        witnessId
    );
    if (!loadedAppliedAnnotations) {
        return {};
    }
    const activeAnnotationList = reducers.getActiveAnnotationsForWitnessId(
        state,
        witnessId
    );
    if (!activeAnnotationList) {
        return {};
    }

    let activeAnnotationDataList = {};
    for (let activeAnnotationId in activeAnnotationList) {
        if (activeAnnotationList.hasOwnProperty(activeAnnotationId)) {
            let activeAnnotationData = reducers.getAnnotationData(
                state,
                baseWitnessId,
                activeAnnotationId
            );
            if (activeAnnotationData) {
                activeAnnotationDataList[
                    activeAnnotationData.unique_id
                ] = activeAnnotationData;
            }
        }
    }

    return annotationsMapFromData(state, activeAnnotationDataList);
};

const annotationsMapFromData = (
    state: AppState,
    annotationList: { [AnnotationUniqueId]: AnnotationData }
): { [AnnotationUniqueId]: Annotation } => {
    let annotations = {};
    for (let key in annotationList) {
        if (annotationList.hasOwnProperty(key)) {
            let annotationData = annotationList[key];
            let annotation = reducers.annotationFromData(state, annotationData);
            if (annotation) {
                annotations[key] = annotation;
            }
        }
    }
    return annotations;
};

// TODO: clear cache when changing texts
let _segmentedWitnesses: { [number]: SegmentedText } = {};
function getSegmentedWitness(witness: Witness): SegmentedText {
    if (!_segmentedWitnesses[witness.id]) {
        _segmentedWitnesses[witness.id] = segmentTibetanText(
            witness.content || ""
        );
    }

    return _segmentedWitnesses[witness.id];
}
