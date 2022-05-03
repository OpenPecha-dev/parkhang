// @flow
import { combineReducers } from "redux";
import dataReducers, * as data from "./data";
import uiReducers, * as ui from "./ui";
import userReducers, * as user from "./user";
import * as actions from "actions";
import * as api from "api";
import Annotation, {
    ANNOTATION_TYPES,
    TemporaryAnnotation
} from "lib/Annotation";
import type { AnnotationUniqueId } from "lib/Annotation";
import Witness from "lib/Witness";
import Source from "lib/Source";
import Text from "lib/Text";
import type { WitnessData, AnnotationData, TextData } from "api";
import { appliedOp, removedOp } from "api";
import type { TextSearchResultData } from "api";
import User from "lib/User";
import Question from "lib/Question";

// i18n
import { intlReducer } from "react-intl-redux";
import localesReducers, * as locales from "./locales";
import type { LocaleData, LocalesData } from "i18n";

function createReducer(
    initialState: {},
    handlers
): (state: {}, action: actions.Action) => {} {
    return function reducer(state = initialState, action: actions.Action) {
        if (handlers.hasOwnProperty(action.type)) {
            return handlers[action.type](state, action);
        } else {
            return state;
        }
    };
}

export const dataReducer = createReducer(data.initialDataState, dataReducers);
export const uiReducer = createReducer(ui.initialUIState, uiReducers);
export const userReducer = createReducer(user.initialUserState, userReducers);
export const localesReducer = createReducer(
    locales.initialLocalesState,
    localesReducers
);

export type AppState = {
    data: data.DataState,
    ui: ui.UIState,
    user: user.UserState,
    intl: { locale: string, messages: { [string]: string } },
    locales: locales.LocaleState
};

/* Selectors */

// i18n
export const getLocales = (state: AppState): locales.LocalesList => {
    return locales.getLocales(state.locales);
};

export const getLocaleData = (
    state: AppState,
    locale: string
): LocaleData | null => {
    return locales.getLocaleData(state.locales, locale);
};

export const getActiveLocale = (state: AppState): string => {
    return locales.getActiveLocale(state.locales);
};

export const getTranslation = (
    state: AppState,
    translateId: string,
    defaultTranslation?: string
): string => {
    let translation = defaultTranslation || translateId;
    if (state.intl.messages.hasOwnProperty(translateId)) {
        translation = state.intl.messages[translateId];
    }

    return translation;
};

// user

/**
 * Get the current user.
 *
 * If not logged in, it will be anonymousUser
 * @param state
 * @return {User}
 */
export const getUser = (state: AppState): User => {
    return user.getUser(state.user);
};

// ui

export const getSelectedText = (state: AppState): TextData | null => {
   
    return ui.getSelectedText(state.ui);
};

export const getSelectedTextWitnessId = (
    state: AppState,
    textId: number
): number | null => {
    return ui.getSelectedTextWitnessId(state.ui, textId);
};

export const getSelectedTextWitness = (state: AppState): Witness | null => {
    const text = getSelectedText(state);
    let witness = null;
    if (text) {
        const selectedWitnessId = getSelectedTextWitnessId(state, text.id);
        if (selectedWitnessId) {
            witness = getWitness(state, selectedWitnessId);
        }
    }

    return witness;
};

export const showPageImages = (state: AppState): boolean => {
    return ui.showPageImages(state.ui);
};

export const getActiveAnnotation = (
    state: AppState,
    witnessId?: number
): Annotation | null => {
    return ui.getActiveAnnotation(state.ui, witnessId);
};

export const getActiveTextAnnotation = (
    state: AppState,
    textId?: number
): Annotation | null => {
    return ui.getActiveTextAnnotation(state.ui, textId);
};

export const getTextListVisible = (state: AppState): boolean => {
    return ui.getTextListVisible(state.ui);
};
export const getMenuListVisible = (state: AppState): boolean => {
    return ui.getMenuListVisible(state.ui);
};

export const getTextListWidth = (state: AppState): number => {
    return ui.getTextListWidth(state.ui);
};

export const getTemporaryAnnotations = (
    state: AppState,
    witnessId: number,
    start: number,
    length: number,
    type: string | null = null
): TemporaryAnnotation[] => {
    return ui.getTemporaryAnnotations(state.ui, witnessId, start, length, type);
};

export const getScrollPosition = (
    state: AppState,
    witnessId: number
): number | null => {
    return ui.getScrollPosition(state.ui, witnessId);
};

export const getExportingWitness = (
    state: AppState,
    witnessId: number
): boolean => {
    return ui.getExportingWitness(state.ui, witnessId);
};

export const getSearchValue = (state: AppState): string => {
    return ui.getSearchValue(state.ui);
};

export const getSelectedSearchResult = (
    state: AppState
): null | { textId: number, start: number, length: number } => {
    return ui.getSelectedSearchResult(state.ui);
};

export const getAccountOverlayVisible = (state: AppState): boolean => {
    return ui.getAccountOverlayVisible(state.ui);
};

export const getTextFontSize = (state: AppState): number => {
    return ui.getTextFontSize(state.ui);
};

// data

export const getText = (
    state: AppState,
    textId: number,
    asData: boolean = false
): Text | TextData | null => {
    return data.getText(state.data, textId, asData);
};

export const getSources = (state: AppState): Source[] => {
    return data.getSources(state.data);
};

export const getSource = (state: AppState, sourceId: number): Source | null => {
    return data.getSource(state.data, sourceId);
};

export const getWitness = (
    state: AppState,
    witnessId: number
): Witness | null => {
    return data.getWitness(state.data, witnessId);
};

export const getWitnessData = (
    state: AppState,
    witnessId: number
): WitnessData | null => {
    return data.getWitnessData(state.data, witnessId);
};

export const getTextWitnesses = (
    state: AppState,
    textId: number
): Witness[] => {
    return data.getTextWitnesses(state.data, textId);
};

export const getBaseWitness = (
    state: AppState,
    textId: number
): Witness | null => {
    return data.getBaseWitness(state.data, textId);
};

export const getWorkingWitness = (
    state: AppState,
    textId: number
): Witness | null => {
    return data.getWorkingWitness(state.data, textId);
};

export const hasLoadedWitness = (
    state: AppState,
    witnessId: number
): boolean => {
    return state.data.witnessesById.hasOwnProperty(witnessId);
};

export const hasLoadedWitnessAnnotations = (
    state: AppState,
    witnessId: number
): boolean => {
    return state.data["witnessAnnotationsById"].hasOwnProperty(witnessId);
};

export const hasLoadedWitnessAppliedAnnotations = (
    state: AppState,
    witnessId: number
): boolean => {
    let hasLoaded = false;
    if (state.data.witnessAnnotationOperationsById.hasOwnProperty(witnessId)) {
        if (
            state.data.witnessAnnotationOperationsById[
                witnessId
            ].hasOwnProperty(appliedOp)
        ) {
            hasLoaded = true;
        }
    }
    // return state.data["witnessActiveAnnotationsById"].hasOwnProperty(witnessId);
    return hasLoaded;
};

export const getAnnotationsForWitnessId = (
    state: AppState,
    witnessId: number,
    annotationType?: string,
    creatorWitnessId?: number
): { [AnnotationUniqueId]: AnnotationData } => {
    return data.getAnnotationsForWitnessId(
        state.data,
        witnessId,
        annotationType,
        creatorWitnessId
    );
};

export const getActiveAnnotationsForWitnessId = (
    state: AppState,
    witnessId: number
): { [AnnotationUniqueId]: AnnotationUniqueId } => {
    return data.getActiveAnnotationsForWitnessId(state.data, witnessId);
};

export const getRemovedDefaultAnnotationsForWitnessId = (
    state: AppState,
    witnessId: number
): { [AnnotationUniqueId]: AnnotationUniqueId } => {
    return data.getRemovedDefaultAnnotationsForWitnessId(state.data, witnessId);
};

export const annotationFromData = (
    state: AppState,
    annotationData: AnnotationData
): Annotation | null => {
    let annotation = data.annotationFromData(state.data, annotationData);
    if (annotation && annotation.creatorUser) {
        const creatorUser = annotation.creatorUser;
        const user = getUser(state);
        if (user.id === creatorUser.id) {
            annotation.creatorUser = user;
        }
    }

    return annotation;
};

export const annotationsFromData = (
    state: AppState,
    annotationList: { [string]: AnnotationData } | null
): Annotation[] => {
    return data.annotationsFromData(state.data, annotationList);
};

export const dataFromWitness = (witness: Witness): WitnessData => {
    return data.dataFromWitness(witness);
};

export const getAnnotationData = (
    state: AppState,
    witnessId: number,
    annotationId: AnnotationUniqueId
): AnnotationData | null => {
    return data.getAnnotationData(state.data, witnessId, annotationId);
};

export const getAnnotation = (
    state: AppState,
    witnessId: number,
    annotationId: AnnotationUniqueId
): Annotation | null => {
    return data.getAnnotation(state.data, witnessId, annotationId);
};

export const getAnnotationWithIdFragment = (
    state: AppState,
    witnessId: number,
    annotationUniqueIdFragment: string
): Annotation | null => {
    return data.getAnnotationWithIdFragment(
        state.data,
        witnessId,
        annotationUniqueIdFragment
    );
};

export const annotationOriginallyUserCreated = (
    state: AppState,
    witnessId: number,
    annotationId: AnnotationUniqueId
): boolean => {
    return data.annotationOriginallyUserCreated(
        state.data,
        witnessId,
        annotationId
    );
};

export const getSearchResults = (
    state: AppState,
    searchTerm: string
): { [number]: api.TextSearchResultData } | null => {
    return data.getSearchResults(state.data, searchTerm);
};

export const questionIsLoading = (
    state: AppState,
    annotation: Annotation
): boolean => {
    return data.questionIsLoading(state.data, annotation);
};

export const getQuestions = (
    state: AppState,
    questionId: AnnotationUniqueId
): Question[] | null => {
    return data.getQuestions(state.data, questionId);
}

// Root

export const allReducers = {
    data: dataReducer,
    ui: uiReducer,
    user: userReducer,
    intl: intlReducer,
    locales: localesReducer
};

const rootReducer = combineReducers(allReducers);

export default rootReducer;
