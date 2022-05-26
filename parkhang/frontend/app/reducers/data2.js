// @flow
import _ from "lodash";
import arrayToObject from "lib/arrayToObject";
import * as actions from "actions";
import * as api from "api";
import Witness from "lib/Witness";
import type { SourceData, TextData, WitnessData, AnnotationData } from "api";
import Source from "lib/Source";
import Text from "lib/Text";
import User from "lib/User";
import Answer from "lib/Answer";



export type DataState = {
    texts: TextData[],
    textsById: { [number]: TextData },
    sources: SourceData[],
    sourcesById: { [number]: SourceData },
    textWitnessesById: {
        [textId: number]: { [witnessId: number]: WitnessData }
    },
    witnessesById: { [number]: WitnessData },
    witnessAnnotationsById: {
        [witnessId: number]: { [AnnotationUniqueId]: AnnotationData }
    },
    witnessAnnotationOperationsById: {
        [witnessId: number]: AnnotationOperations
    },
    loadingInitialData: boolean,
    loadedInitialData: boolean,
    loadingTexts: boolean,
    loadedTexts: boolean,
    loadingSources: boolean,
    loadedSources: boolean,
    loadingWitnesses: boolean,
    loadedWitnesses: boolean,
    loadingAnnotations: boolean,
    loadedAnnotations: boolean,
    loadedAnnotationOperations: boolean,
    searchResults: {
        [searchTerm: string]: {
            [textId: number]: api.TextSearchResultData
        }
    },
    questions: {
        [annotationId: AnnotationUniqueId]: QuestionData[]
    },
    questionsLoading: {
        [annotationId: AnnotationUniqueId]: boolean
    }
};

// Data

let _annotationCache = {};
export const initialDataState: DataState = {
    texts: [],
    textsById: {},
    sources: [],
    sourcesById: {},
    textWitnessesById: {},
    witnessesById: {},
    witnessAnnotationsById: {},
    witnessAnnotationOperationsById: {},
    loadingInitialData: false,
    loadedInitialData: false,
    loadingTexts: false,
    loadedTexts: false,
    loadingSources: false,
    loadedSources: false,
    loadingWitnesses: false,
    loadedWitnesses: false,
    loadingAnnotations: false,
    loadedAnnotations: false,
    loadedAnnotationOperations: false,
    searchResults: {},
};

function loadingInitialData(state: DataState): DataState {
    return {
        ...state,
        loadingInitialData: true,
        loadedInitialData: false
    };
}

function loadedInitialData(state: DataState): DataState {
    return {
        ...state,
        loadingInitialData: false,
        loadedInitialData: true
    };
}

function loadingTexts(state: DataState): DataState {
    return {
        ...state,
        loadingTexts: true,
        loadedTexts: false
    };
}

function loadedTexts(state: DataState, action: actions.TextsAction): DataState {
    const textsById = arrayToObject(action.texts, "id");
    return {
        ...state,
        texts: action.texts,
        textsById: textsById,
        loadingTexts: false,
        loadedTexts: true
    };
}

function loadingSources(state: DataState): DataState {
    return {
        ...state,
        loadingSources: true,
        loadedSources: false
    };
}

function loadedSources(
    state: DataState,
    action: actions.LoadedSourcesAction
): DataState {
    const sourcesById = arrayToObject(action.sources, "id");
    return {
        ...state,
        sources: action.sources,
        sourcesById: sourcesById,
        loadingSources: false,
        loadedSources: true
    };
}

function loadingWitnesses(state: DataState): DataState {
    
    return {
        ...state,
        loadingWitnesses: true,
        loadedWitnesses: false
    };
}


function loadedWitnesses2(
    state: DataState,
    action: actions.LoadedWitnessesAction
): DataState {
    const witnessesById = arrayToObject(action.witnesses, "id");
    const textWitnessesById = {
        ...state.textWitnessesById,
        [action.text.id]: witnessesById
    };
    const allWitnessesById = {
        ...state.witnessesById,
        ...witnessesById
    };
    return {
        ...state,
        textWitnessesById: textWitnessesById,
        witnessesById: allWitnessesById,
        loadingWitnesses: false,
        loadedWitnesses: true
    };
}

function loadingAnnotations(state: DataState): DataState {
    return {
        ...state,
        loadingAnnotations: true,
        loadedAnnotations: false
    };
}

function markSaved(annotations: api.AnnotationData[]) {
    for (let i = 0; i < annotations.length; i++) {
        annotations[i].is_saved = true;
    }
}

function loadedAnnotations(
    state: DataState,
    action: actions.LoadedWitnessAnnotationsAction
): DataState {
    _annotationCache = {};
    markSaved(action.annotations);
    const annotationsById = arrayToObject(action.annotations, "unique_id");
    const witnessAnnotationsById = {
        ...state.witnessAnnotationsById,
        [action.witnessId]: annotationsById
    };
    return {
        ...state,
        witnessAnnotationsById: witnessAnnotationsById,
        loadingAnnotations: !state.loadedAnnotationOperations,
        loadedAnnotations: true
    };
}

function loadedAnnotationOperations(
    state: DataState,
    action: actions.LoadedWitnessAnnotationOperationsAction
): DataState {
    let operations = {
        [api.appliedOp]: {},
        [api.removedOp]: {}
    };
    operations = action.annotationOperations.reduce(
        (
            acc: { [api.AnnotationOp]: {} },
            operationData: api.AnnotationOperationData
        ) => {
            acc[operationData.operation][operationData.annotation_unique_id] =
                operationData.annotation_unique_id;
            return acc;
        },
        operations
    );

    return {
        ...state,
        witnessAnnotationOperationsById: {
            ...state.witnessAnnotationOperationsById,
            [action.witnessId]: operations
        },
        loadingAnnotations: !state.loadedAnnotations,
        loadedAnnotationOperations: true
    };
}

function setupWitnessOperations(
    state: DataState,
    witnessId: number
): DataState {
    if (!state.witnessAnnotationOperationsById.hasOwnProperty(witnessId)) {
        state.witnessAnnotationOperationsById[witnessId] = {};
    }
    if (
        !state.witnessAnnotationOperationsById[witnessId].hasOwnProperty(
            api.appliedOp
        )
    ) {
        state.witnessAnnotationOperationsById[witnessId][api.appliedOp] = {};
    }
    if (
        !state.witnessAnnotationOperationsById[witnessId].hasOwnProperty(
            api.removedOp
        )
    ) {
        state.witnessAnnotationOperationsById[witnessId][api.removedOp] = {};
    }

    return state;
}

function appliedAnnotation(
    state: DataState,
    action: actions.AppliedAnnotationAction
): DataState {
    let annotationId = action.annotationId;
    let witness = action.witnessData;
    let witnessAnnotationOperations =
        state.witnessAnnotationOperationsById[witness.id];
    // If the annotation is already applied, don't mutate state
    if (
        witnessAnnotationOperations &&
        witnessAnnotationOperations[api.appliedOp].hasOwnProperty(annotationId)
    ) {
        return state;
    }
    if (!witnessAnnotationOperations) {
        witnessAnnotationOperations = {
            [api.appliedOp]: {},
            [api.removedOp]: {}
        };
    }

    return {
        ...state,
        witnessAnnotationOperationsById: {
            ...state.witnessAnnotationOperationsById,
            [witness.id]: {
                ...witnessAnnotationOperations,
                [api.appliedOp]: {
                    ...witnessAnnotationOperations[api.appliedOp],
                    [annotationId]: annotationId
                }
            }
        }
    };
}

function removedAppliedAnnotation(
    state: DataState,
    action: actions.RemovedAppliedAnnotationAction
): DataState {
    let annotationId = action.annotationId;
    let witness = action.witnessData;
    let witnessAnnotationOperations = {
        ...state.witnessAnnotationOperationsById[witness.id]
    };
    if (
        witnessAnnotationOperations &&
        witnessAnnotationOperations.hasOwnProperty(api.appliedOp)
    ) {
        if (
            witnessAnnotationOperations[api.appliedOp].hasOwnProperty(
                annotationId
            )
        ) {
            let appliedOps = {
                ...witnessAnnotationOperations[api.appliedOp]
            };
            delete appliedOps[annotationId];

            return {
                ...state,
                witnessAnnotationOperationsById: {
                    ...state.witnessAnnotationOperationsById,
                    [witness.id]: {
                        ...witnessAnnotationOperations,
                        [api.appliedOp]: appliedOps
                    }
                }
            };
        }
    }

    return state;
}

function removedDefaultAnnotation(
    state: DataState,
    action: actions.RemovedDefaultAnnotationAction
): DataState {
    let annotationId = action.annotationId;
    let witnessId = action.witnessData.id;
    state = setupWitnessOperations({ ...state }, witnessId);
    if (
        state.witnessAnnotationOperationsById[witnessId][
            api.appliedOp
        ].hasOwnProperty(annotationId)
    ) {
        delete state.witnessAnnotationOperationsById[witnessId][api.appliedOp][
            annotationId
        ];
    }
    return {
        ...state,
        witnessAnnotationOperationsById: {
            [witnessId]: {
                ...state.witnessAnnotationOperationsById[witnessId],
                [api.removedOp]: {
                    ...state.witnessAnnotationOperationsById[witnessId][
                        api.removedOp
                    ],
                    [annotationId]: annotationId
                }
            }
        }
    };
}

function appliedDefaultAnnotation(
    state: DataState,
    action: actions.AppliedDefaultAnnotationAction
): DataState {
    let annotationId = action.annotationId;
    let witnessId = action.witnessData.id;
    state = setupWitnessOperations({ ...state }, witnessId);
    let removeOperations = {
        ...state.witnessAnnotationOperationsById[witnessId][api.removedOp]
    };
    if (
        state.witnessAnnotationOperationsById[witnessId][
            api.removedOp
        ].hasOwnProperty(annotationId)
    ) {
        delete removeOperations[annotationId];
    }
    return {
        ...state,
        witnessAnnotationOperationsById: {
            [witnessId]: {
                ...state.witnessAnnotationOperationsById[witnessId],
                [api.removedOp]: removeOperations
            }
        }
    };
}

function createdAnnotation(
    state: DataState,
    action: actions.CreatedAnnotationAction
): DataState {
    const annotation = action.annotation;
    annotation.save();
    const annotationData = dataFromAnnotation(annotation);
    const witness = annotation.witness;

    return {
        ...state,
        witnessAnnotationsById: {
            ...state.witnessAnnotationsById,
            [witness.id]: {
                ...state.witnessAnnotationsById[witness.id],
                [annotation.uniqueId]: annotationData
            }
        }
    };
}

function updatedAnnotation(
    state: DataState,
    action: actions.UpdatedAnnotationAction
): DataState {
    const annotation = action.annotation;
    if (!annotation.isSaved) {
        console.warn("Updating annotation which is not saved: %o", action);
    }
    return createdAnnotation(state, action);
}

function deletedAnnotation(
    state,
    action: actions.DeletedAnnotationAction
): DataState {
    const annotation = action.annotation;
    if (!annotation.isSaved) {
        console.warn("Deleting annotation which is not saved: %o", action);
    }
    const witness = annotation.witness;
    let witnessAnnotations = state.witnessAnnotationsById[witness.id];
    if (witnessAnnotations) {
        witnessAnnotations = {
            ...witnessAnnotations
        };
        if (witnessAnnotations.hasOwnProperty(annotation.uniqueId)) {
            delete witnessAnnotations[annotation.uniqueId];
        }
    } else {
        witnessAnnotations = {};
    }

    return {
        ...state,
        witnessAnnotationsById: {
            ...state.witnessAnnotationsById,
            [witness.id]: witnessAnnotations
        }
    };
}

/**
 * Deletes the existing temporary annotation if it is present,
 * then adds the saved version.
 * @param state
 * @param action
 */
function savedAnnotation(
    state: DataState,
    action: actions.SavedAnnotationAction
): DataState {
    const annotation = action.annotation;
    const annotationData = dataFromAnnotation(annotation);
    const witness = annotation.witness;

    let witnessAnnotations = state.witnessAnnotationsById[witness.id];
    if (witnessAnnotations) {
        witnessAnnotations = {
            ...witnessAnnotations
        };
    } else {
        witnessAnnotations = {};
    }

    return {
        ...state,
        witnessAnnotationsById: {
            ...state.witnessAnnotationsById,
            [witness.id]: {
                ...witnessAnnotations,
                [annotation.uniqueId]: annotationData
            }
        }
    };
}
function searchedText(
    state: DataState,
    action: actions.SearchedTextAction
): DataState {

    if (
        action.searchValue in state.searchResults &&
        action.textId in state.searchResults[action.searchValue]
    ) {
        let searchResults = {
            ...state.searchResults[action.searchValue]
        };
        searchResults[action.textId] = {
            ...searchResults[action.textId],
            loading: true
        };
        return {
            ...state,
            searchResults: {
                ...state.searchResults,
                [action.searchValue]: searchResults
            }
        };
    } else {
        return state;
    }
}

function updatedSearchResults(
    state: DataState,
    action: actions.UpdatedSearchResultsAction
): DataState {
    if (action.searchValue in state.searchResults) {
        let searchResults = {
            ...state.searchResults[action.searchValue]
        };
        for (let textId in action.searchResults) {
            searchResults[textId] = action.searchResults[Number(textId)];
        }
        return {
            ...state,
            searchResults: {
                ...state.searchResults,
                [action.searchValue]: searchResults
            }
        };
    } else {
        return {
            ...state,
            searchResults: {
                ...state.searchResults,
                [action.searchValue]: action.searchResults
            }
        };
    }
}


const dataReducers = {};
dataReducers[actions.LOADING_INITIAL_DATA] = loadingInitialData;
dataReducers[actions.LOADED_INITIAL_DATA] = loadedInitialData;
dataReducers[actions.LOADING_TEXTS] = loadingTexts;
dataReducers[actions.LOADED_TEXTS] = loadedTexts;
dataReducers[actions.LOADING_SOURCES] = loadingSources;
dataReducers[actions.LOADED_SOURCES] = loadedSources;
dataReducers[actions.LOADING_WITNESSES] = loadingWitnesses;
dataReducers[actions.LOADED_WITNESSES2] = loadedWitnesses2;
dataReducers[actions.LOADING_WITNESS_ANNOTATIONS] = loadingAnnotations;
dataReducers[actions.LOADED_WITNESS_ANNOTATIONS] = loadedAnnotations;
dataReducers[
    actions.LOADED_WITNESS_ANNOTATION_OPERATIONS
] = loadedAnnotationOperations;
dataReducers[actions.APPLIED_ANNOTATION] = appliedAnnotation;
dataReducers[actions.REMOVED_APPLIED_ANNOTATION] = removedAppliedAnnotation;
dataReducers[actions.REMOVED_DEFAULT_ANNOTATION] = removedDefaultAnnotation;
dataReducers[actions.APPLIED_DEFAULT_ANNOTATION] = appliedDefaultAnnotation;
dataReducers[actions.CREATED_ANNOTATION] = createdAnnotation;
dataReducers[actions.UPDATED_ANNOTATION] = updatedAnnotation;
dataReducers[actions.DELETED_ANNOTATION] = deletedAnnotation;
dataReducers[actions.SAVED_ANNOTATION] = savedAnnotation;
dataReducers[actions.UPDATED_SEARCH_RESULTS] = updatedSearchResults;
dataReducers[actions.SEARCHED_TEXT] = searchedText;

export default dataReducers;

// Selectors

export const getText = (
    state: DataState,
    textId: number,
    asData: boolean
): Text | TextData | null => {
    const textData = state.textsById[textId];
   

    let text = null;
    if (textData) {
        if (asData) {
            text = textData;
        } else {
            text = new Text(textData.id, textData.name);
        }
    }
    return text;
};

export const getSources = (state: DataState): Source[] => {
    let sources = [];
    for (let sourceData of state.sources) {
        const source = getSource(state, sourceData.id);
        if (source) {
            sources.push(source);
        }
    }
    return sources;
};

export const getSource = (
    state: DataState,
    sourceId: number
): Source | null => {
    const sourceData = state.sourcesById[sourceId];
    let source = null;
    if (sourceData) {
        source = new Source(
            sourceData.id,
            sourceData.name,
            sourceData.is_base,
            sourceData.is_working
        );
    }
    return source;
};

// cache witnesses as they can have large content values.
const cachedWitnesses = {};
export const getWitness = (
    state: DataState,
    witnessId: number
): Witness | null => {
    if (!witnessId) {
        return null;
    }
    if (cachedWitnesses.hasOwnProperty(witnessId)) {
        return cachedWitnesses[witnessId];
    }
    const witnessData = state.witnessesById[witnessId];
    let witness = null;
    if (witnessData) {
        const source = getSource(state, witnessData.source);
        const text = getText(state, witnessData.text);
        if (text && source) {
            witness = new Witness(
                witnessData.id,
                text,
                source,
                witnessData.content,
                witnessData.is_base,
                witnessData.is_working,
                witnessData.revision,
                witnessData.properties
            );
            cachedWitnesses[witnessData.id] = witness;
        } else {
            console.warn(
                "getWitness result has no source or text for witnessId: %o",
                witnessId
            );
        }
    }

    return witness;
};

export const getWitnessData = (
    state: DataState,
    witnessId: number
): WitnessData => {
    const witnessData = state.witnessesById[witnessId];

    return witnessData;
};

export const dataFromWitness = (witness: Witness): WitnessData => {
    return {
        id: witness.id,
        content: witness.content,
        is_base: witness.isBase,
        is_working: witness.isWorking,
        revision: witness.revision,
        source: witness.source.id,
        text: witness.text.id,
        properties: witness.properties
    };
};

export const getBaseWitness = (
    state: DataState,
    textId: number
): Witness | null => {
    let baseWitness = null;
    if (state.textWitnessesById.hasOwnProperty(textId)) {
        const witnesses = state.textWitnessesById[textId];
        if (witnesses) {
            for (let witnessId of Object.keys(witnesses)) {
                const witness = witnesses[Number(witnessId)];
                if (!baseWitness || witness.is_base) {
                    baseWitness = witness;
                }
            }
            if (baseWitness) {
                baseWitness = getWitness(state, baseWitness.id);
            }
        }
    }
    return baseWitness;
};

export const getWorkingWitness = (
    state: DataState,
    textId: number
): Witness | null => {
    let workingWitness = null;
    if (state.textWitnessesById.hasOwnProperty(textId)) {
       
        const witnesses = state.textWitnessesById[textId];
        for (let witnessId of Object.keys(witnesses)) {
            const witness = witnesses[Number(witnessId)];
            if (witness.is_working) {
                workingWitness = witness;
            }
        }
        if (workingWitness) {
            workingWitness = getWitness(state, workingWitness.id);
        }
    }
    return workingWitness;
};

export const getTextWitnesses = (
    state: DataState,
    textId: number
): Witness[] => {
    let witnesses = [];
    if (state.textWitnessesById.hasOwnProperty(textId)) {
    
        const witnessesById = state.textWitnessesById[textId];
        for (let witnessId in witnessesById) {
            const witness = getWitness(state, Number(witnessId));
            if (witness) {
                witnesses.push(witness);
            }
        }
        

    }
    return witnesses;

};

export function annotationFromData(
    state: DataState,
    annotationData: api.AnnotationData
): Annotation | null {
    let witness = getWitness(state, annotationData.witness);
    if (!witness) {
        console.warn(
            "annotationFromData without valid witness, annotationData: %o",
            annotationData
        );
        return null;
    }
    let creatorWitness = null;
    let creatorUser = null;
    if (annotationData.creator_witness) {
        creatorWitness = getWitness(state, annotationData.creator_witness);
    }
    if (!creatorWitness) {
        console.warn(
            "annotationFromData without valid creator_witness, annotationData: %o",
            annotationData
        );
        return null;
    }
    if (annotationData.creator_user) {
        creatorUser = new User(annotationData.creator_user, "");
    }
    if (!annotationData.creator_witness && !annotationData.creator_user) {
        console.warn("No creator found in annotationData: %o", annotationData);
    }
    let basedOn = null;
    if (annotationData.original) {
        basedOn = getAnnotation(
            state,
            annotationData.witness,
            annotationData.original
        );
    }
    let annotation = new Annotation(
        annotationData.id,
        witness,
        annotationData.start,
        annotationData.length,
        annotationData.content,
        annotationData.type,
        creatorWitness,
        creatorUser,
        annotationData.unique_id,
        basedOn
    );
    if (annotationData.is_saved) {
        annotation.save();
    }
    if (annotationData.modified) {
        annotation.modified = annotationData.modified;
    }

    return annotation;
}

export const annotationsFromData = (
    state: DataState,
    annotationList: { [string]: AnnotationData } | null
): Annotation[] => {
    let annotations = [];
    if (annotationList) {
        for (let key in annotationList) {
            if (annotationList.hasOwnProperty(key)) {
                let annotationData = annotationList[key];
                let annotation = annotationFromData(state, annotationData);
                if (annotation) {
                    annotations.push(annotation);
                }
            }
        }
    }
    return annotations;
};

export function dataFromAnnotation(
    annotation: Annotation
): AnnotationData | null {
    if (!annotation.creatorWitness) {
        console.warn("No creatorWitness found in annotation: %o", annotation);
        return null;
    }
    return {
        id: annotation.id,
        type: annotation.type,
        witness: annotation.witness.id,
        start: annotation.start,
        length: annotation.length,
        content: annotation.content,
        creator_witness: annotation.creatorWitness.id,
        creator_user: annotation.creatorUser ? annotation.creatorUser.id : null,
        unique_id: annotation.uniqueId,
        original: annotation.basedOn ? annotation.basedOn.uniqueId : null,
        is_deleted: false,
        is_saved: annotation.isSaved
    };
}

export const getAnnotationsForWitnessId = (
    state: DataState,
    witnessId: number,
    annotationType?: string,
    creatorWitnessId?: number
): { [AnnotationUniqueId]: AnnotationData } => {
    let annotations = state.witnessAnnotationsById[witnessId];
    if (annotationType != null) {
        annotations = _.pickBy(
            annotations,
            (annotation: AnnotationData, key: string): boolean => {
                let include = annotation.type === annotationType;
                if (include && creatorWitnessId) {
                    include = annotation.creator_witness === creatorWitnessId;
                }
                return include;
            }
        );
    }

    return annotations;
};

export const getAnnotation = (
    state: DataState,
    witnessId: number,
    annotationUniqueId: AnnotationUniqueId
) => {
    const annotations = state.witnessAnnotationsById[witnessId];
    let data = annotations[annotationUniqueId];
    if (data) {
        return annotationFromData(state, data);
    } else {
        const witnessData = state.witnessesById[witnessId];
        if (witnessData) {
            const textId = witnessData.text;
            const textWitnesses = state.textWitnessesById[textId];
            if (textWitnesses) {
                for (var textWitnessId in textWitnesses) {
                    if (textWitnesses.hasOwnProperty(textWitnessId)) {
                        if (
                            state.witnessAnnotationsById.hasOwnProperty(
                                textWitnessId
                            )
                        ) {
                            data =
                                state.witnessAnnotationsById[
                                    Number(textWitnessId)
                                ][annotationUniqueId];
                            if (data) {
                                return annotationFromData(state, data);
                            }
                        }
                    }
                }
            }
        }
        return null;
    }
};

export const getAnnotationWithIdFragment = (
    state: DataState,
    witnessId: number,
    annotationUniqueIdFragment: string
): Annotation | null => {
    const annotations = state.witnessAnnotationsById[witnessId];
    let annotation = null;
    if (annotations) {
        for (let uniqueId in annotations) {
            if (uniqueId.indexOf(annotationUniqueIdFragment) === 0) {
                let annotationData = annotations[uniqueId];
                annotation = annotationFromData(state, annotationData);
                break;
            }
        }
    }
    return annotation;
};

export const getActiveAnnotationsForWitnessId = (
    state: DataState,
    witnessId: number
): { [AnnotationUniqueId]: AnnotationUniqueId } => {
    if (state.witnessAnnotationOperationsById.hasOwnProperty(witnessId)) {
        if (
            state.witnessAnnotationOperationsById[witnessId].hasOwnProperty(
                api.appliedOp
            )
        ) {
            return state.witnessAnnotationOperationsById[witnessId][
                api.appliedOp
            ];
        }
    }
    return {};
};

export const getRemovedDefaultAnnotationsForWitnessId = (
    state: DataState,
    witnessId: number
): { [AnnotationUniqueId]: AnnotationUniqueId } => {
    if (state.witnessAnnotationOperationsById.hasOwnProperty(witnessId)) {
        if (
            state.witnessAnnotationOperationsById[witnessId].hasOwnProperty(
                api.removedOp
            )
        ) {
            return state.witnessAnnotationOperationsById[witnessId][
                api.removedOp
            ];
        }
    }
    return {};
};

export const getAnnotationData = (
    state: DataState,
    witnessId: number,
    annotationUniqueId: AnnotationUniqueId
): AnnotationData | null => {
    let annotationData = null;
    const witnessAnnotations = state.witnessAnnotationsById[witnessId];
    if (witnessAnnotations) {
        annotationData = witnessAnnotations[annotationUniqueId];
    }
    return annotationData;
};

export const getAnnotationOriginalData = (
    state: DataState,
    witnessId: number,
    annotationUniqueId: AnnotationUniqueId
): AnnotationData | null => {
    let annotationData = getAnnotationData(
        state,
        witnessId,
        annotationUniqueId
    );
    if (annotationData && annotationData["original"]) {
        annotationData = getAnnotationOriginalData(
            state,
            witnessId,
            annotationData["original"]
        );
    }
    return annotationData;
};

export const annotationOriginallyUserCreated = (
    state: DataState,
    witnessId: number,
    annotationId: AnnotationUniqueId
): boolean => {
    let isUserCreated = false;
    let annotationData = getAnnotationOriginalData(
        state,
        witnessId,
        annotationId
    );
    if (annotationData && annotationData["creator_user"]) {
        isUserCreated = true;
    }

    return isUserCreated;
};

export const getSearchResults = (
    state: DataState,
    searchTerm: string
): { [number]: api.TextSearchResultData } | null => {
    if (state.searchResults.hasOwnProperty(searchTerm)) {
        return state.searchResults[searchTerm];
    } else {
        return null;
    }
};

export const questionIsLoading = (
    state: DataState,
    annotation: Annotation
): boolean => {
    if (state.questionsLoading.hasOwnProperty(annotation.uniqueId)) {
        return state.questionsLoading[annotation.uniqueId];
    } else {
        return false;
    }
};

export const getQuestions = (
    state: DataState,
    questionId: AnnotationUniqueId
): Question[] | null => {
    let questions = [];
    if (state.questions.hasOwnProperty(questionId)) {
        const questionsData = state.questions[questionId];
        if (questionsData) {
            for (let i=0; i < questionsData.length; i++) {
                const data = questionsData[i];

                const question = new Question();
                question.name = data.name;
                question.username = data.username;
                question.title = data.title;
                question.content = data.question;
                question.topicId = data.topic_id;
                question.annotationUniqueId = data.annotation_unique_id;
                question.created = data.created
                question.answers = [];
                if (data.answers.length > 0) {
                    for (let j=0; j < data.answers.length; j++) {
                        const answerData = data.answers[j];
                        const answer = new Answer();
                        answer.name = answerData.name;
                        answer.username = answerData.username;
                        answer.content = answerData.content;
                        answer.created = answerData.created;

                        question.answers.push(answer);
                    }
                }

                questions.push(question);
            }
        }
    }

    return questions;
};
