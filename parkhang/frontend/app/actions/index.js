// @flow
import * as api from "api";
import Annotation, { TemporaryAnnotation } from "lib/Annotation";
import type { AnnotationUniqueId } from "lib/Annotation";
import Witness from "lib/Witness";
import type { LocalesData } from "i18n";

/** Actions types **/

// Data
export const SEARCH_TERM="SEARCH_TERM"; 

export const LOAD_INITIAL_DATA = "LOAD_INITIAL_DATA";
export const LOADING_INITIAL_DATA = "LOADING_INITIAL_DATA";
export const LOADED_INITIAL_DATA = "LOADED_INITIAL_DATA";

export const LOAD_SOURCES = "LOAD_SOURCES";
export const LOADING_SOURCES = "LOADING_SOURCES";
export const LOADED_SOURCES = "LOADED_SOURCES";

export const LOAD_TEXTS = "LOAD_TEXTS";
export const LOADING_TEXTS = "LOADING_TEXTS";
export const LOADED_TEXTS = "LOADED_TEXTS";

export const LOAD_TEXT_DATA = "LOAD_TEXT_DATA";
export const LOADING_TEXT_DATA = "LOADING_TEXT_DATA";

export const LOAD_WITNESSES = "LOAD_WITNESSES";
export const LOADING_WITNESSES = "LOADING_WITNESSES";
export const LOADED_WITNESSES = "LOADED_WITNESSES";

export const LOAD_WITNESS_ANNOTATIONS = "LOAD_WITNESS_ANNOTATIONS";
export const LOADING_WITNESS_ANNOTATIONS = "LOADING_WITNESS_ANNOTATIONS";
export const LOADED_WITNESS_ANNOTATIONS = "LOADED_WITNESS_ANNOTATIONS";
export const LOADED_WITNESS_ANNOTATION_OPERATIONS =
    "LOADED_WITNESS_ANNOTATION_OPERATIONS";
export const LOADED_WITNESS_REMOVED_ANNOTATIONS =
    "LOADED_WITNESS_REMOVED_ANNOTATIONS";

export const LOADED_TEXT_DATA = "LOADED_TEXT_DATA";

// These are intended for when the data will be saved via the server API
export const APPLIED_ANNOTATION = "text/APPLIED_ANNOTATION";
export const REMOVED_APPLIED_ANNOTATION = "text/REMOVED_APPLIED_ANNOTATION";
export const REMOVED_DEFAULT_ANNOTATION = "text/REMOVED_DEFAULT_ANNOTATION";
export const APPLIED_DEFAULT_ANNOTATION = "text/APPLIED_DEFAULT_ANNOTATION";

export const CREATED_ANNOTATION = "text/CREATED_ANNOTATION";
export const UPDATED_ANNOTATION = "text/UPDATED_ANNOTATION";
export const DELETED_ANNOTATION = "text/DELETED_ANNOTATION";
export const SAVED_ANNOTATION = "text/SAVED_ANNOTATION";

export const CREATED_QUESTION = "text/CREATED_QUESTION";
export const LOAD_QUESTION = "text/LOAD_QUESTION";
export const LOADING_QUESTION = "text/LOADING_QUESTION";
export const LOADED_QUESTION = "text/LOADED_QUESTION";

// These are for local UI changes
export const ADDED_TEMPORARY_ANNOTATION = "text/ADDED_TEMPORARY_ANNOTATION";
export const UPDATED_TEMPORARY_ANNOTATION = "text/UPDATED_TEMPORARY_ANNOTATION";
export const REMOVED_TEMPORARY_ANNOTATION = "text/REMOVED_TEMPORARY_ANNOTATION";

// UI
export const SELECTED_TEXT = "textList/SELECTED_TEXT";
export const NO_SELECTED_TEXT="textList/NO_SELECTED_TEXT";
export const CHANGED_SEARCH_VALUE = "textList/CHANGED_SEARCH_VALUE";
export const CHANGED_SEARCH_TERM = "textList/CHANGED_SEARCH_TERM";
export const SEARCHED_TEXT = "textList/SEARCHED_TEXT";
export const UPDATED_SEARCH_RESULTS = "textList/UPDATED_SEARCH_RESULTS";
export const SELECTED_SEARCH_RESULT = "textList/SELECTED_SEARCH_RESULT";
export const CHANGED_NOTIFICATION ="notification/CHANGED_NOTIFICATION"

export const SELECTED_WITNESS = "text/SELECTED_WITNESS";
export const CHANGED_SHOW_PAGE_IMAGES = "text/CHANGED_SHOW_PAGE_IMAGES";
export const CHANGED_TEXT_FONT_SIZE = "text/CHANGED_TEXT_FONT_SIZE";
export const CHANGED_TEXT_FONT_SIZE2 = "text/CHANGED_TEXT_FONT_SIZE2";

export const CHANGED_SELECTED_SEGMENT = "text/CHANGED_SELECTED_SEGMENT";
export const DESELECTED_SEGMENT = "text/DESELECTED_SEGMENT";

export const CHANGED_ACTIVE_ANNOTATION = "text/CHANGED_ACTIVE_ANNOTATION";
export const CHANGED_ACTIVE_TEXT_ANNOTATION =
    "text/CHANGED_ACTIVE_TEXT_ANNOTATION";

export const CHANGED_TEXT_LIST_VISIBLE = "textList/CHANGED_TEXT_LIST_VISIBLE";
export const CHANGED_MENU_LIST_VISIBLE = "textList/CHANGED_MENU_LIST_VISIBLE";
export const CHANGED_TEXT_LIST_WIDTH = "textList/CHANGED_TEXT_LIST_WIDTH";
export const CHANGED_MENU_LIST_WIDTH = "textList/CHANGED_MENU_LIST_WIDTH";


export const CHANGED_WITNESS_SCROLL_POSITION =
    "text/CHANGED_WITNESS_SCROLL_POSITION";

export const EXPORT_WITNESS = "text/EXPORT_WITNESS";
export const EXPORTED_WITNESS = "text/EXPORTED_WITNESS";

export const CHANGED_ACCOUNT_OVERLAY = "account/SET_ACCOUNT_OVERLAY";

// User
export const USER_LOGGED_IN = "users/USER_LOGGED_IN";
export const LOADED_USER_SETTINGS = "user/LOADED_USER_SETTINGS";

// I18N
export const UPDATE_LOCALES = "i18n/UPDATE_LOCALES";
export const SELECTED_LOCALE = "i18n/SELECT_LOCALE";

// HOMEPAGE
export const SELECT_TEXTTITLE = "title/SELECT_TEXTTITLE";
export const CHANGE_LANGUAGE = "title/CHANGE_LANGUAGE";
export const SELECT_CATEGORY ="title/SELECT_CATEGORY";
export const SELECT_CHAPTER ="title/SELECT_CHAPTER";
export const SET_TEXTDATA="title/SET_TEXTDATA";
export const IS_LOADED="title/IS_LOADED"

// URLS
export const TEXTS = "urls/textSelection";
export const TEXT_URL = "urls/TEXT";
export const USER_URL = "urls/USER";
export const TEXTID_ONLY_URL = "urls/TEXTID";
export const TEXT_TITLE ="urls/title/TEXT";
export const TEXT_CATEGORY = "urls/title/category";
export const TEXT_CHAPTER= "urls/title/category/chapter";
export const EDITOR="urls/editor";
export const SEARCH="urls/search";
/** Action creators **/

export type Action = {
    type: string,
    payload?: any
};

export type WitnessAction = Action & {
    witnessId: number
};

export type TextDataAction = Action & {
    text: api.TextData
};

export type AnnotationAction = Action & {
    annotation: Annotation
};

/* DATA */

// TEXTS

export function loadTexts(): Action {
    return {
        type: LOAD_TEXTS
    };
}

export function loadingTexts(): Action {
    return {
        type: LOADING_TEXTS
    };
}

export type TextsAction = Action & {
    texts: api.TextData[]
};

export function loadedTexts(texts: api.TextData[]): TextsAction {
    return {
        type: LOADED_TEXTS,
        texts
    };
}

// SOURCES

export function loadSources(): Action {
    return {
        type: LOAD_SOURCES
    };
}

export function loadingSources(): Action {
    return {
        type: LOADING_SOURCES
    };
}

export type LoadedSourcesAction = Action & {
    sources: api.SourceData[]
};
export function loadedSources(sources: api.SourceData[]): LoadedSourcesAction {
    return {
        type: LOADED_SOURCES,
        sources
    };
}

// INITIAL DATA

export function loadInitialData(): Action {
    return {
        type: LOAD_INITIAL_DATA
    };
}

export function loadingInitialData(): Action {
    return {
        type: LOADING_INITIAL_DATA
    };
}

export function loadedInitialData(): Action {
    return {
        type: LOADED_INITIAL_DATA
    };
}

export function loadingWitnesses(text: api.TextData): TextDataAction {
    return {
        type: LOADING_WITNESSES,
        text
    };
}

export type LoadedWitnessesAction = TextDataAction & {
    witnesses: api.WitnessData[]
};
export function loadedWitnesses(
    text: api.TextData,
    witnesses: api.WitnessData[]
) {
    return {
        type: LOADED_WITNESSES,
        text,
        witnesses
    };
}

// ANNOTATIONS

export function loadWitnessAnnotations(witnessId: number): WitnessAction {
    return {
        type: LOAD_WITNESS_ANNOTATIONS,
        witnessId
    };
}

export function loadingWitnessAnnotations(witnessId: number): WitnessAction {
    return {
        type: LOADING_WITNESS_ANNOTATIONS,
        witnessId
    };
}

export type LoadedWitnessAnnotationsAction = Action & {
    witnessId: number,
    annotations: api.AnnotationData[]
};
export function loadedWitnessAnnotations(
    witnessId: number,
    annotations: api.AnnotationData[]
): LoadedWitnessAnnotationsAction {
    return {
        type: LOADED_WITNESS_ANNOTATIONS,
        witnessId,
        annotations
    };
}

export type LoadedWitnessAnnotationOperationsAction = WitnessAction & {
    annotationOperations: api.AnnotationOperationData[]
};
export function loadedWitnessAnnotationOperations(
    witnessId: number,
    annotationOperations: api.AnnotationOperationData[]
): LoadedWitnessAnnotationOperationsAction {
    return {
        type: LOADED_WITNESS_ANNOTATION_OPERATIONS,
        witnessId,
        annotationOperations
    };
}

export type AppliedAnnotationAction = Action & {
    annotationId: AnnotationUniqueId,
    witnessData: api.WitnessData
};
export function appliedAnnotation(
    annotationId: AnnotationUniqueId,
    witnessData: api.WitnessData
): AppliedAnnotationAction {
    return {
        type: APPLIED_ANNOTATION,
        annotationId,
        witnessData: witnessData
    };
}

export type RemovedAppliedAnnotationAction = Action & {
    annotationId: AnnotationUniqueId,
    witnessData: api.WitnessData
};
export function removedAppliedAnnotation(
    annotationId: AnnotationUniqueId,
    witnessData: api.WitnessData
): RemovedAppliedAnnotationAction {
    return {
        type: REMOVED_APPLIED_ANNOTATION,
        annotationId,
        witnessData: witnessData
    };
}

export type RemovedDefaultAnnotationAction = Action & {
    annotationId: AnnotationUniqueId,
    witnessData: api.WitnessData
};
export function removedDefaultAnnotation(
    annotationId: AnnotationUniqueId,
    witnessData: api.WitnessData
): RemovedDefaultAnnotationAction {
    return {
        type: REMOVED_DEFAULT_ANNOTATION,
        annotationId,
        witnessData: witnessData
    };
}

export type AppliedDefaultAnnotationAction = Action & {
    annotationId: AnnotationUniqueId,
    witnessData: api.WitnessData
};
export function appliedDefaultAnnotation(
    annotationId: AnnotationUniqueId,
    witnessData: api.WitnessData
): AppliedDefaultAnnotationAction {
    return {
        type: APPLIED_DEFAULT_ANNOTATION,
        annotationId,
        witnessData: witnessData
    };
}

export type CreatedAnnotationAction = Action & {
    annotation: Annotation
};
/**
 * The given annotation has been created and applied.
 */
export function createdAnnotation(
    annotation: Annotation
): CreatedAnnotationAction {
    return {
        type: CREATED_ANNOTATION,
        annotation
    };
}

export type UpdatedAnnotationAction = Action & {
    annotation: Annotation
};
/**
 * The given annotation has been updated with new data.
 */
export function updatedAnnotation(
    annotation: Annotation
): UpdatedAnnotationAction {
    return {
        type: UPDATED_ANNOTATION,
        annotation
    };
}

export type DeletedAnnotationAction = Action & {
    annotation: Annotation,
    witness: Witness
};
/**
 * The given annotation has been deleted.
 */
export function deletedAnnotation(
    annotation: Annotation,
    witness: Witness
): DeletedAnnotationAction {
    return {
        type: DELETED_ANNOTATION,
        annotation,
        witness
    };
}

export type SavedAnnotationAction = Action & {
    annotation: Annotation
};
/**
 * The annotation has been succesfully saved and given a
 * valid id.
 */
export function savedAnnotation(annotation: Annotation): SavedAnnotationAction {
    return {
        type: SAVED_ANNOTATION,
        annotation
    };
}

export type CreatedQuestionAction = Action & {
    annotation: Annotation,
    title: string,
    content: string
};
/**
 * The given annotation has been created and applied.
 */
export function createdQuestion(
    annotation: Annotation,
    title: string,
    content: string
): CreatedQuestionAction {
    return {
        type: CREATED_QUESTION,
        annotation,
        title,
        content
    };
}

export type LoadQuestionAction = Action & {
    annotation: Annotation
};
export function loadQuestion(annotation: Annotation): LoadQuestionAction {
    return {
        type: LOAD_QUESTION,
        annotation
    };
}

export type LoadingQuestionAction = Action & {
    annotation: Annotation
};
export function loadingQuestion(annotation: Annotation): LoadingQuestionAction {
    return {
        type: LOADING_QUESTION,
        annotation
    };
}

export type LoadedQuestionAction = Action & {
    annotation: Annotation,
    data: {}
};
export function loadedQuestion(
    annotation: Annotation,
    data: {}
): LoadedQuestionAction {
    return {
        type: LOADED_QUESTION,
        annotation,
        data
    };
}

/* USER */
export type UserAction = Action & {
    userId: number,
    userName: string,
    userLocale: string
};
export function userLoggedIn(
    userId: number,
    userName: string,
    userLocale: string
): UserAction {
    return {
        type: USER_LOGGED_IN,
        userId,
        userName,
        userLocale
    };
}

export type LoadedUserSettingsAction = Action & {
    settings: api.UserSettings
};
export function loadedUserSettings(
    settings: api.UserSettings
): LoadedUserSettingsAction {
    return {
        type: LOADED_USER_SETTINGS,
        settings
    };
}

/* UI */
export type noSelectedTextAction = Action & TextDataAction;
export function noSelectedText(data: api.TextData): noSelectedTextAction {
    return {
        type: NO_SELECTED_TEXT,
        data
    };
}


export type SelectedTextAction = Action & TextDataAction;
export function selectedText(text: api.TextData): SelectedTextAction {
    return {
        type: SELECTED_TEXT,
        text
    };
}



export type ChangedSearchValueAction = Action & {
    searchValue: string
};
export function changedSearchValue(
    searchValue: string
): ChangedSearchValueAction {
    return {
        type: CHANGED_SEARCH_VALUE,
        searchValue
    };
}

export type ChangedSearchTermAction = Action & {
    searchTerm: string
};
export function changedSearchTerm(
    searchTerm: string
): ChangedSearchTermAction {
    return {
        type: CHANGED_SEARCH_TERM,
        searchTerm
    };
}

export type SearchedTextAction = Action & {
    textId: number,
    searchValue: string
};
export function searchedText(
    textId: number,
    searchValue: string
): ChangedSearchValueAction {
    return {
        type: SEARCHED_TEXT,
        textId,
        searchValue
    };
}

export type UpdatedSearchResultsAction = Action & {
    searchValue: string,
    searchResults: { [text_id: number]: api.TextSearchResultData }
};
export function updatedSearchResults(
    searchValue: string,
    searchResults: { [number]: api.TextSearchResultData }
): UpdatedSearchResultsAction {
    return {
        type: UPDATED_SEARCH_RESULTS,
        searchValue,
        searchResults
    };
}

export type SelectedSearchResultAction = Action & {
    textId: number | null,
    start: number | null,
    length: number | null
};
export function selectedSearchResult(
    textId: number | null,
    start: number | null,
    length: number | null
): SelectedSearchResultAction {
    return {
        type: SELECTED_SEARCH_RESULT,
        textId,
        start,
        length
    };
}

export type ChangedTextListWidth = Action & {
    width: number
};
export function changedTextListWidth(width: number): ChangedTextListWidth {
    return {
        type: CHANGED_TEXT_LIST_WIDTH,
        width
    };
}

export function changedNotification(data) {
    return {
        type: CHANGED_NOTIFICATION,
        data
    };
}

export type ChangedMenuListWidth = Action & {
    width: number
};
export function changedMenuListWidth(width: number): ChangedMenuListWidth {
    return {
        type: CHANGED_MENU_LIST_WIDTH,
        width
    };
}

export type ChangedShowPageImagesAction = Action & {
    showPageImages: boolean
};
export function changedShowPageImages(
    showPageImages: boolean
): ChangedShowPageImagesAction {
    return {
        type: CHANGED_SHOW_PAGE_IMAGES,
        showPageImages
    };
}

export type ChangedTextFontSizeAction = Action & {
    fontSize: number
};
export function changedTextFontSize(
    fontSize: number
): ChangedTextFontSizeAction {
    return {
        type: CHANGED_TEXT_FONT_SIZE,
        fontSize
    };
}

export type ChangedTextFontSizeAction2 = Action & {
    fontSize: number
};
export function changedTextFontSize2(
    fontSize: number
): ChangedTextFontSizeAction2 {
    return {
        type: CHANGED_TEXT_FONT_SIZE2,
        fontSize
    };
}


export type SelectedTextWitnessAction = Action & {
    witnessId: number,
    textId: number
};
export function selectedTextWitness(
    textId: number,
    witnessId: number
): SelectedTextWitnessAction {
    return {
        type: SELECTED_WITNESS,
        textId,
        witnessId
    };
}

export type AddedTemporaryAnnotationAction = Action & {
    annotation: TemporaryAnnotation,
    isActive: boolean
};
export function addedTemporaryAnnotation(
    annotation: TemporaryAnnotation,
    isActive: boolean
): AddedTemporaryAnnotationAction {
    return {
        type: ADDED_TEMPORARY_ANNOTATION,
        annotation,
        isActive
    };
}

export type RemovedTemporaryAnnotationAction = Action & {
    annotation: TemporaryAnnotation
};
export function removedTemporaryAnnotation(
    annotation: TemporaryAnnotation
): RemovedTemporaryAnnotationAction {
    return {
        type: REMOVED_TEMPORARY_ANNOTATION,
        annotation
    };
}

export type ChangedActiveAnnotationAction = Action & {
    annotation: Annotation | null
};

export function changedActiveAnnotation(
    annotation: Annotation | null
): ChangedActiveAnnotationAction {
    return {
        type: CHANGED_ACTIVE_ANNOTATION,
        annotation
    };
}

export function changedActiveTextAnnotation(
    annotation: Annotation | null
): ChangedActiveAnnotationAction {
    return {
        type: CHANGED_ACTIVE_TEXT_ANNOTATION,
        annotation
    };
}

export type ChangedTextListVisibleAction = Action & {
    isVisible: boolean
};
export function changedTextListVisible(
    isVisible: boolean
): ChangedTextListVisibleAction {
    return {
        type: CHANGED_TEXT_LIST_VISIBLE,
        isVisible
    };
}


export type ChangedMenuListVisibleAction = Action & {
    isVisible: boolean
};
export function changedMenuListVisible(
    isVisible: boolean
): ChangedMenuListVisibleAction {
    return {
        type: CHANGED_MENU_LIST_VISIBLE,
        isVisible
    };
}

export type ChangedWitnessScrollPositionAction = Action & {
    witnessId: number,
    scrollPosition: number
};

export function changedWitnessScrollPosition(
    witnessId: number,
    scrollPosition: number
): ChangedWitnessScrollPositionAction {
    return {
        type: CHANGED_WITNESS_SCROLL_POSITION,
        witnessId,
        scrollPosition
    };
}

export type ExportWitnessAction = Action & {
    witnessId: number,
    format: string
};

export function exportWitness(
    witnessId: number,
    format: string
): ExportWitnessAction {
    return {
        type: EXPORT_WITNESS,
        witnessId,
        format
    };
}

export function exportedWitness(
    witnessId: number,
    format: string
): ExportWitnessAction {
    return {
        type: EXPORTED_WITNESS,
        witnessId,
        format
    };
}

export type ChangedAccountOverlayAction = Action & {
    isVisible: boolean
};
export function changedAccountOverlay(
    isVisible: boolean
): ChangedAccountOverlayAction {
    return {
        type: CHANGED_ACCOUNT_OVERLAY,
        isVisible
    };
}

/* I18N */
export type UpdateLocalesAction = {
    type: string,
    payload: LocalesData
};

export function updateLocales(locales: LocalesData): UpdateLocalesAction {
    return {
        type: UPDATE_LOCALES,
        payload: locales
    };
}

export function selectedLocale(locale: string): Action {
    return {
        type: SELECTED_LOCALE,
        payload: locale
    };
}

/* URLS */
export type TextUrlAction = {
    type: string,
    payload: {
        textId: number,
        witnessId?: number,
        annotation?: string
    }
};


export function enteredUrl(url: TextUrlAction) {
    return {
        type: TEXT_URL,
        payload: {}
    };
}


export function selectTextTitle(textTitle:string){
   
    return {
        type:SELECT_TEXTTITLE,
        payload:textTitle
    }
}

export function selectActiveCategory(selectedCategory){
  
    return {
        type:SELECT_CATEGORY,
        payload:selectedCategory
    }
}

export function selectActiveChapter(selectedChapter){
    return {
        type:SELECT_CHAPTER,
        payload:selectedChapter
    }
}

export function changeLanguage(selectedLanguage){
    return {
        type:CHANGE_LANGUAGE,
        payload:selectedLanguage
    }
}

export function setTextData(originData){
    return {
        type:SET_TEXTDATA,
        payload:originData
    }
}

export function changeIsLoaded(loaded){
    return {
        type:IS_LOADED,
        payload:loaded
    }
}

export function searchTerm(data){
    return {
      type:SEARCH_TERM,
      payload:data
    }
}