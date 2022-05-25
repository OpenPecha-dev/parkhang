// @flow
import React from "react";
import { connect, useStore } from "react-redux";
import { batchActions } from "redux-batched-actions";
import AnnotationControls from "./AnnotationControls";
import type { Props as ControlsProps } from "./AnnotationControls";
import addTibetanShay from "lib/addTibetanShay";
import * as reducers from "reducers";
import type { AppState } from "reducers";
import * as actions from "actions";
import { BASE_ANNOTATION_ID } from "lib/AnnotatedText";
import Annotation, {
    ANNOTATION_TYPES,
    TemporaryAnnotation
} from "lib/Annotation";
import type { AnnotationUniqueId } from "lib/Annotation";
import AnnotatedText from "lib/AnnotatedText";
import User from "lib/User";
import Witness from "lib/Witness";
import TextSegment from "lib/TextSegment";
import SplitText from "lib/SplitText";
import _ from "lodash";
import { changedActiveTextAnnotation } from "actions";
import ReactDOMServer from "react-dom/server";
import Question from "lib/Question";
import type { QuestionData } from "./AnnotationControls";
import {getTextFontSize} from 'reducers'

const TEMPORARY_ANNOTATION_ID = -3;
const BASE_NAME = "Working";

type AnnotationData = {
    name: string,
    content: string,
    id: AnnotationUniqueId,
    isTemporary: boolean,
    annotation: Annotation,
    userCreated: boolean
};
const getAnnotationsData = (
    annotations,
    sources,
    workingSourceName
): AnnotationData[] => {
    let annotationsData = [];
    let baseSources = sources.filter(
        source => source.isWorking || source.isBase
    );
    let baseSourceNames = baseSources.map(source => source.name);
    if (annotations) {
        let annotationsById = {};
        for (let i = 0; i < annotations.length; i++) {
            let annotation = annotations[i];
            let id = annotation.content + annotation.start;
            if (annotation.isTemporary) {
                annotationsById[TEMPORARY_ANNOTATION_ID] = {
                    name: annotation.getSourceName(),
                    content: annotation.content,
                    id: annotation.uniqueId,
                    isTemporary: true,
                    annotation: annotation
                };
                baseSourceNames = baseSourceNames.filter(
                    a => a !== annotation.getSourceName()
                );
                id = TEMPORARY_ANNOTATION_ID;
            } else if (annotationsById[id]) {
                let existingAnnotation = annotationsById[id];
                existingAnnotation.name +=
                    " " + addTibetanShay(annotation.getSourceName());
                baseSourceNames = baseSourceNames.filter(
                    a => a !== annotation.getSourceName()
                );
            } else {
                annotationsById[id] = {
                    name: addTibetanShay(annotation.getSourceName()),
                    content: annotation.content,
                    id: annotation.uniqueId,
                    userCreated: annotation.userCreated,
                    annotation: annotation
                };
                baseSourceNames = baseSourceNames.filter(
                    a => a !== annotation.getSourceName()
                );
            }
            if (
                !annotation.userCreated &&
                annotation.creatorWitness.isWorking
            ) {
                annotationsById[id].isWorking = true;
            } else {
                annotationsById[id].isWorking = false;
            }
        }
        // Make sure Working source is first
        baseSourceNames.unshift(workingSourceName);
        annotationsData = Object.keys(annotationsById).reduce((arr, key) => {
            const annotationData = annotationsById[key];
            if (annotationData.isWorking) {
                annotationData.name = baseSourceNames.reduce(
                    (prev, cur) => (prev += " " + addTibetanShay(cur, ";")),
                    ""
                );
            }
            arr.push(annotationData);
            return arr;
        }, []);
    }

    return annotationsData;
};

const getAvailableAnnotations = (
    annotatedText: AnnotatedText,
    activeAnnotation: Annotation,
    temporaryAnnotation: TemporaryAnnotation | null,
    annotationPositions: { [string]: Annotation[] }
): Annotation[] => {
    let availableAnnotations = [];
    if (
        !temporaryAnnotation ||
        activeAnnotation.naturalId !== temporaryAnnotation.naturalId
    ) {
        availableAnnotations.push(activeAnnotation);
    }
    if (temporaryAnnotation) {
        availableAnnotations.push(temporaryAnnotation);
    }
    let [start, length] = annotatedText.getPositionOfAnnotation(
        activeAnnotation
    );

    if (!start) {
        return availableAnnotations;
    }

    let end = start + length;

    let possibleAnnotations = [];

    if (activeAnnotation.isInsertion) {
        const insertionAnnotations = annotationPositions["i" + start];
        if (insertionAnnotations) {
            possibleAnnotations = possibleAnnotations.concat(
                insertionAnnotations
            );
        }
        const activeInsertionAnnotations = annotationPositions[String(start)];
        if (activeInsertionAnnotations) {
            possibleAnnotations = possibleAnnotations.concat(
                activeInsertionAnnotations
            );
        }
    } else {
        // Only include annotations if they encompass the whole annotation
        // i.e. not if activeAnnotation is a user annotation and combines
        // annotated text with normal text.
        let startAnnotations = annotationPositions[String(start)];
        let endAnnotations = annotationPositions[String(end)];

        if (startAnnotations) {
            possibleAnnotations = startAnnotations;
        }
        if (endAnnotations) {
            possibleAnnotations = possibleAnnotations.concat(endAnnotations);
        }
    }

    for (let i = 0; i < possibleAnnotations.length; i++) {
        const annotation = possibleAnnotations[i];
        if (
            annotation.start === activeAnnotation.start &&
            annotation.length === activeAnnotation.length
        ) {
            // If an annotation is being edited, there will be a temporary annotation
            // with the same natural id. If so, don't show the orignal version.
            //
            // We use natualId, as it normalises the id regardless of the original's
            // save state. e.g. Upon editing a witness variant, a new annotation will be
            // created. If the user is offline, that will not have been saved via the
            // API yet. The user could then edit this new annotation, creating a temporary
            // annotation based upon it. While this is being edited, the user could come
            // back online and the save operation will succeed. This will mean the id of
            // the temporary annotation will be different to the original edit, but naturalId
            // will be the same.
            if (
                !temporaryAnnotation ||
                annotation.naturalId !== temporaryAnnotation.naturalId
            ) {
                availableAnnotations.push(annotation);
            }
        } else if (!annotatedText.activeWitness.isWorking) {
            if (
                annotation.type === ANNOTATION_TYPES.pageBreak ||
                annotation.type === ANNOTATION_TYPES.lineBreak
            ) {
                availableAnnotations.push(annotation);
            }
        }
    }

    availableAnnotations = _.uniqWith(
        availableAnnotations,
        (a, b) => a.id === b.id
    );

    return availableAnnotations;
};

const getTemporaryAnnotation = (
    state: AppState,
    type: string,
    user: User,
    witness: Witness,
    start: number,
    length: number
): TemporaryAnnotation | null => {
    const annotations = reducers.getTemporaryAnnotations(
        state,
        witness.id,
        start,
        length,
        type
    );
    if (annotations.length > 0) {
        return annotations[0];
    } else {
        return null;
    }
};

type StateProps = ControlsProps & {
    questionsData: { [annotationId: AnnotationUniqueId]: Question[] }
};

// These are the props that are expected to be set and available in ownProps
type ContainerProps = {
    annotationPositions: { [string]: Annotation[] },
    annotatedText: AnnotatedText,
    activeAnnotation: Annotation | null,
    inline?: boolean,
    firstSelectedSegment: TextSegment,
    splitTextRect: ClientRect | null,
    splitText: SplitText | null
};

export const mapStateToProps = (state: AppState, ownProps: ContainerProps) => {
    const user = reducers.getUser(state);
    const activeAnnotation = ownProps.activeAnnotation;
    const inline = ownProps.inline;
    let selectedWitness = reducers.getSelectedTextWitness(state);
    if (!selectedWitness) {
        const selectedText = reducers.getSelectedText(state);
        if (selectedText) {
            selectedWitness = reducers.getWorkingWitness(
                state,
                selectedText.id
            );
        }
    }

    if (!activeAnnotation || !selectedWitness) {
        return {
            annotationsData: null,
            activeAnnotation: null,
            baseAnnotation: null,
            availableAnnotations: null,
            user: user,
            temporaryAnnotation: null,
            inline: null,
            firstSelectedSegment: null,
            splitTextRect: null,
            selectedWitness: null,
        };
    }

    const temporaryVariant = getTemporaryAnnotation(
        state,
        ANNOTATION_TYPES.variant,
        user,
        selectedWitness,
        activeAnnotation.start,
        activeAnnotation.length
    );

    const annotations = getAvailableAnnotations(
        ownProps.annotatedText,
        activeAnnotation,
        temporaryVariant,
        ownProps.annotationPositions
    );
    const variants = annotations.filter(
        (annotation: Annotation) => annotation.type === ANNOTATION_TYPES.variant
    );
    const sources = reducers.getSources(state);
    const workingSourceName = reducers.getTranslation(
        state,
        "annotation.workingEdition",
        BASE_NAME
    );
    let variantsData = getAnnotationsData(variants, sources, workingSourceName);

    let baseAnnotation = null;
    if (activeAnnotation.id == BASE_ANNOTATION_ID) {
        baseAnnotation = activeAnnotation;
    } else {
        const [start, length] = ownProps.annotatedText.getPositionOfAnnotation(
            activeAnnotation
        );
        if (start === null || length === null) {
            variantsData = null;
        } else {
            baseAnnotation = ownProps.annotatedText.getBaseAnnotation(
                start,
                length
            );
            const baseAnnotationData = getAnnotationsData(
                [baseAnnotation],
                sources,
                workingSourceName
            );
            variantsData = [...baseAnnotationData, ...variantsData];
        }
    }

    // make sure temporary annotation is first, then user created, then base annotation
    if (variantsData) {
        variantsData.sort((a, b) => {
            if (a.isTemporary) {
                return -1;
            } else if (b.isTemporary) {
                return 1;
            } else if (a.userCreated) {
                return -1;
            } else if (b.userCreated) {
                return 1;
            } else if (a.annotation.id && b.annotation.id) {
                return a.annotation.id - b.annotation.id;
            } else {
                return 1;
            }
        });
    }

    const notes: Array<Annotation> = annotations.filter(
        (annotation: Annotation) => annotation.type === ANNOTATION_TYPES.note
    );

    const temporaryNotes = reducers.getTemporaryAnnotations(
        state,
        selectedWitness.id,
        activeAnnotation.start,
        activeAnnotation.length,
        ANNOTATION_TYPES.note
    );

    const questionAnnotations: Array<Annotation> = annotations.filter(
        (annotation: Annotation): boolean =>
            annotation.type === ANNOTATION_TYPES.question
    );
    let questionsData = {};
    if (questionAnnotations.length > 0) {
        for (var i = 0; i < questionAnnotations.length; i++) {
            const question = questionAnnotations[i];
            questionsData[question.uniqueId] = {};
            const isLoading = reducers.questionIsLoading(state, question);
            questionsData[question.uniqueId]["loading"] = isLoading;
            const questions = reducers.getQuestions(state, question.uniqueId);
            questionsData[question.uniqueId]["questions"] = questions;
        }
    }

    const temporaryQuestions = reducers.getTemporaryAnnotations(
        state,
        selectedWitness.id,
        activeAnnotation.start,
        activeAnnotation.length,
        ANNOTATION_TYPES.question
    );

    let questionQuote = null;
    if (temporaryQuestions.length > 0) {
        const firstQuestion = temporaryQuestions[0];

        let [start, end] = ownProps.annotatedText.getPositionOfAnnotation(
            firstQuestion
        );
        if (start) {
            if (!end) {
                end = start + 1;
            }
            const [
                startText,
                mainText,
                endText
            ] = ownProps.annotatedText.segmentedText.extractTextAroundPosition(
                start,
                end,
                ["།", " "]
            );

            const linkUrl = document.location.href;
            questionQuote = (
                <blockquote>
                    {startText}
                    <a href={linkUrl}>{mainText}</a>
                    {endText}
                </blockquote>
            );
        }
    }
    let fontSize = getTextFontSize(state);

    return {
        annotationsData: variantsData,
        activeAnnotation: activeAnnotation,
        baseAnnotation: baseAnnotation,
        availableAnnotations: annotations,
        user: user,
        temporaryAnnotation: temporaryVariant,
        inline: inline,
        firstSelectedSegment: ownProps.firstSelectedSegment,
        splitTextRect: ownProps.splitTextRect,
        selectedWitness: selectedWitness,
        notes: notes,
        temporaryNotes: temporaryNotes,
        questions: questionAnnotations,
        temporaryQuestions: temporaryQuestions,
        questionsData: questionsData,
        questionQuote: questionQuote,
        fontSize
    };
};

const mergeProps = (stateProps: StateProps, dispatchProps, ownProps) => {
    const { dispatch } = dispatchProps;

    if (stateProps.questions.length > 0) {
        for (var i = 0; i < stateProps.questions.length; i++) {
            const question = stateProps.questions[i];
            let loadQuestionData = true;
            if (stateProps.questionsData.hasOwnProperty(question.uniqueId)) {
                if (
                    stateProps.questionsData[question.uniqueId].questions
                        .length > 0 ||
                    stateProps.questionsData[question.uniqueId].loading
                ) {
                    loadQuestionData = false;
                }
            }
            if (loadQuestionData) {
                dispatch(new actions.loadQuestion(question));
            }
        }
    }

    const addBreak = (
        breakType: string,
        selectBreak: boolean = false
    ): (() => void) => {
        return () => {
            const location = ownProps.activeAnnotation;

            const breakAnnotation = new Annotation(
                null,
                location.witness,
                location.end + 1,
                0,
                null,
                breakType,
                stateProps.selectedWitness,
                stateProps.user
            );
            let selectedWitnessData = reducers.dataFromWitness(
                stateProps.selectedWitness
            );

            let actionsBatch = [];

            actionsBatch.push(actions.createdAnnotation(breakAnnotation));
            actionsBatch.push(
                actions.appliedAnnotation(
                    breakAnnotation.uniqueId,
                    selectedWitnessData
                )
            );
            if (selectBreak) {
                actionsBatch.push(
                    actions.changedActiveTextAnnotation(breakAnnotation)
                );
            } else {
                actionsBatch.push(actions.changedActiveTextAnnotation(null));
            }

            dispatch(batchActions(actionsBatch));
        };
    };

    const saveAnnotation = (
        selectedAnnotation: TemporaryAnnotation,
        content: string
    ) => {
        if (!selectedAnnotation.isTemporary) {
            console.warn(
                "Tried to save a non-temporary annotation: %o",
                selectedAnnotation
            );
            return;
        }

        let selectedWitness = stateProps.selectedWitness;
        let selectedWitnessData = reducers.dataFromWitness(selectedWitness);

        const newAnnotation = new Annotation(
            selectedAnnotation.id,
            selectedAnnotation.witness,
            selectedAnnotation.start,
            selectedAnnotation.length,
            content,
            selectedAnnotation.type,
            selectedAnnotation.creatorWitness,
            stateProps.user,
            selectedAnnotation.uniqueId,
            selectedAnnotation.basedOn
        );
        newAnnotation.isSaved = selectedAnnotation.isSaved;
        let actionsBatch = [];
        let action = null;
        if (newAnnotation.isSaved) {
            action = actions.updatedAnnotation;
        } else {
            action = actions.createdAnnotation;
        }
        actionsBatch.push(action(newAnnotation));
        actionsBatch.push(
            actions.removedTemporaryAnnotation(selectedAnnotation)
        );
        // TODO: figure out what needs changing to handle note annotations
        actionsBatch.push(
            actions.appliedAnnotation(
                newAnnotation.uniqueId,
                selectedWitnessData
            )
        );
        if (newAnnotation.type === ANNOTATION_TYPES.variant) {
            actionsBatch.push(
                actions.changedActiveTextAnnotation(newAnnotation)
            );
        }
        dispatch(batchActions(actionsBatch));
    };

    return {
        ...stateProps,
        ...ownProps,
        didSelectAnnotation: (annotation: Annotation) => {
            let selectedAnnotation: Annotation | null = null;
            if (annotation.id == BASE_ANNOTATION_ID) {
                selectedAnnotation = stateProps.baseAnnotation;
            } else {
                selectedAnnotation =
                    _.find(
                        stateProps.availableAnnotations,
                        value => value.uniqueId == annotation.uniqueId
                    ) || null;
            }
            let actionsBatch = [];
            let selectedWitness = stateProps.selectedWitness;
            // let selectedWitnessData = reducers.getWitnessData(
            //     state,
            //     selectedWitness.id
            // );
            let selectedWitnessData = reducers.dataFromWitness(selectedWitness);

            if (annotation.uniqueId != stateProps.activeAnnotation.uniqueId) {
                if (selectedWitness.isWorking) {
                    if (annotation.id != BASE_ANNOTATION_ID) {
                        actionsBatch.push(
                            actions.appliedAnnotation(
                                selectedAnnotation.uniqueId,
                                selectedWitnessData
                            )
                        );
                    }
                    if (stateProps.activeAnnotation.id != BASE_ANNOTATION_ID) {
                        actionsBatch.push(
                            actions.removedAppliedAnnotation(
                                stateProps.activeAnnotation.uniqueId,
                                selectedWitnessData
                            )
                        );
                    }
                } else {
                    if (
                        stateProps.activeAnnotation.creatorWitness.id ===
                        selectedWitness.id
                    ) {
                        // Replacing a default annotation

                        // Currently selected annotation is a default
                        // annotation. So need to remove that then
                        // apply the newly selected annotation.

                        actionsBatch.push(
                            actions.removedDefaultAnnotation(
                                stateProps.activeAnnotation.uniqueId,
                                selectedWitnessData
                            )
                        );

                        if (selectedAnnotation.id !== BASE_ANNOTATION_ID) {
                            actionsBatch.push(
                                actions.appliedAnnotation(
                                    selectedAnnotation.uniqueId,
                                    selectedWitnessData
                                )
                            );
                        }
                    } else {
                        if (
                            selectedAnnotation.creatorWitness.id ===
                            selectedWitness.id
                        ) {
                            actionsBatch.push(
                                actions.appliedDefaultAnnotation(
                                    selectedAnnotation.uniqueId,
                                    selectedWitnessData
                                )
                            );
                        } else if (
                            selectedAnnotation.id !== BASE_ANNOTATION_ID
                        ) {
                            actionsBatch.push(
                                actions.appliedAnnotation(
                                    selectedAnnotation.uniqueId,
                                    selectedWitnessData
                                )
                            );
                        }

                        if (
                            stateProps.activeAnnotation.id !==
                            BASE_ANNOTATION_ID
                        ) {
                            actionsBatch.push(
                                actions.removedAppliedAnnotation(
                                    stateProps.activeAnnotation.uniqueId,
                                    selectedWitnessData
                                )
                            );
                        }
                    }
                }

                actionsBatch.push(
                    actions.changedActiveTextAnnotation(selectedAnnotation)
                );

                dispatch(batchActions(actionsBatch));
            }
        },
        editAnnotation: (selectedAnnotation: Annotation) => {
            const basedOn =
                selectedAnnotation.isWorkingAnnotation ||
                selectedAnnotation.userCreated ||
                selectedAnnotation.id === BASE_ANNOTATION_ID
                    ? null
                    : selectedAnnotation;
            const temporaryAnnotation = new TemporaryAnnotation(
                basedOn,
                selectedAnnotation.witness,
                selectedAnnotation.start,
                selectedAnnotation.length,
                selectedAnnotation.content,
                selectedAnnotation.type,
                stateProps.selectedWitness,
                stateProps.user
            );
            if (selectedAnnotation.userCreated) {
                // user annotations are updated
                temporaryAnnotation.uniqueId = selectedAnnotation.uniqueId;
                temporaryAnnotation.isSaved = selectedAnnotation.isSaved;
            }

            dispatch(
                actions.addedTemporaryAnnotation(temporaryAnnotation, true)
            );
        },
        saveAnnotation: saveAnnotation,
        cancelEditAnnotation: (selectedAnnotation: TemporaryAnnotation) => {
            if (!selectedAnnotation.isTemporary) {
                console.warn(
                    "Tried to call cancelEditAnnotation on a non-temporary annotation: %o",
                    selectedAnnotation
                );
                return;
            }

            const cancelAction = actions.removedTemporaryAnnotation(
                selectedAnnotation
            );
            dispatch(cancelAction);
        },
        deleteAnnotation: (annotation: Annotation) => {
            let selectedWitness = stateProps.selectedWitness;
            let selectedWitnessData = reducers.dataFromWitness(selectedWitness);
            let actionsBatch = [];
            if (annotation.userCreated) {
                const deleteAction = actions.deletedAnnotation(
                    annotation,
                    selectedWitness
                );
                const removeAppliedAction = actions.removedAppliedAnnotation(
                    annotation.uniqueId,
                    selectedWitnessData
                );
                actionsBatch = [deleteAction, removeAppliedAction];
            } else {
                // Assume this is a default annotation that was
                // automatically imported from external data
                const removeDefaultAnnotation = actions.removedDefaultAnnotation(
                    annotation.uniqueId,
                    selectedWitnessData
                );
                actionsBatch = [removeDefaultAnnotation];
            }

            if (stateProps.activeAnnotation.uniqueId === annotation.uniqueId) {
                actionsBatch.push(actions.changedActiveTextAnnotation(null));
            }

            dispatch(batchActions(actionsBatch));
        },
        addNote: () => {
            const activeAnnotation = ownProps.activeAnnotation;
            const temporaryAnnotation = new TemporaryAnnotation(
                null,
                activeAnnotation.witness,
                activeAnnotation.start,
                activeAnnotation.length,
                "",
                ANNOTATION_TYPES.note,
                stateProps.selectedWitness,
                stateProps.user
            );

            dispatch(
                actions.addedTemporaryAnnotation(temporaryAnnotation, true)
            );
        },
        editNote: (note: Annotation) => {
            const temporaryAnnotation = new TemporaryAnnotation(
                note,
                note.witness,
                note.start,
                note.length,
                note.content,
                ANNOTATION_TYPES.note,
                stateProps.selectedWitness,
                stateProps.user
            );

            dispatch(
                actions.addedTemporaryAnnotation(temporaryAnnotation, true)
            );
        },
        addPageBreak: addBreak(ANNOTATION_TYPES.pageBreak),
        addLineBreak: addBreak(ANNOTATION_TYPES.lineBreak),
        addQuestion: () => {
            const activeAnnotation = ownProps.activeAnnotation;
            const temporaryAnnotation = new TemporaryAnnotation(
                null,
                activeAnnotation.witness,
                activeAnnotation.start,
                activeAnnotation.length,
                "",
                ANNOTATION_TYPES.question,
                stateProps.selectedWitness,
                stateProps.user
            );

            dispatch(
                actions.addedTemporaryAnnotation(temporaryAnnotation, true)
            );
        },
        saveQuestion: (
            question: TemporaryAnnotation,
            title: string,
            content: string
        ) => {
            let [start, end] = ownProps.annotatedText.getPositionOfAnnotation(
                question
            );

            const questionQuoteText = ReactDOMServer.renderToStaticMarkup(
                stateProps.questionQuote
            );
            let questionText = questionQuoteText + content;

            saveAnnotation(question, content);
            const createdQuestionAction = actions.createdQuestion(
                question,
                title,
                questionText
            );
            dispatch(createdQuestionAction);
        }
    };
};

const AnnotationControlsContainer = connect(
    mapStateToProps,
    null,
    mergeProps
)(AnnotationControls);

export default AnnotationControlsContainer;

