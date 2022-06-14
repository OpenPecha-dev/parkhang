// @flow
import {
    call,
    put,
    take,
    actionChannel,
    fork,
    takeEvery,
    takeLatest,
    select,
    all,
    delay,
} from "redux-saga/effects";

import FileSaver from "file-saver";
import * as actions from "actions";
import * as reducers from "reducers";
import Witness from "lib/Witness";
import User from "lib/User";
import Annotation, { ANNOTATION_TYPES } from "lib/Annotation";
import AnnotatedText, {
    WORKING_VERSION_ANNOTATION_ID,
} from "lib/AnnotatedText";
import * as TextStore from "state_helpers/TextStore";
import { updateIntl } from "react-intl-redux";
import Cookies from "js-cookie";
import { i18n_cookie_name } from "i18n";
import { compare as tibetanCompare } from "tibetan-sort-js";
import getWitnessAnnotatedText from "reducers/getWitnessAnnotatedText";
import type { TextExporter } from "lib/TextExporter";
import PlainTextExporter from "lib/PlainTextExporter";
import DocxExporter from "lib/DocxExporter";

import * as api from "api";
import { BATCH } from "redux-batched-actions";

import * as constants from "app_constants";

import type { Saga } from "redux-saga";
import { fetchTexts } from "../api";

/**
 * Get the required delay for a failed request.
 *
 * @param {number} attempt - the number of attempts that have occurred so far
 * @return {number} The length of delay in milliseconds
 */
function getDelay(attempt) {
    let seconds = 0;
    switch (attempt) {
        case 1:
            seconds = 5;
            break;
        case 2:
            seconds = 10;
            break;
        case 3:
            seconds = 15;
            break;
        case 4:
            seconds = 30;
            break;
        case 5:
            seconds = 60;
            break;
        default:
            seconds = 120;
    }

    return seconds * 1000;
}

// Type of action used to add callbacks to the request queue.
const SAGA_REQUEST = "SAGA_REQUEST";

/**
 * Sets up a serial queue for requests using the API.
 *
 * Any actions of type SAGA_REQUEST will get processed.
 *
 * The actions needs the following properties:
 * payload: a generator function to be called
 * action: action to be given as an argument to the payload function
 *
 * Any requests failing due to a network error, e.g. the user is offline,
 * will be retried indefinitely until the request is processed. This should
 * make the app more robust in flaky network conditions.
 */
function* watchRequests() {
    const requestChan = yield actionChannel(SAGA_REQUEST);
    while (true) {
        const { payload, action } = yield take(requestChan);
        let complete = false;
        let attempts = 0;
        while (!complete) {
            try {
                yield payload(action);
                complete = true;
            } catch (e) {
                if (e.response) {
                    // if there was a valid HTTP error status code returned just fail now.
                    // e.g. returning a 4xx, 5xx.
                    console.warn("Queued request failed: %o", e);
                    complete = true;
                } else {
                    // otherwise, assume network is down and user is offline.
                    // Try again after reqDelay milliseconds.
                    attempts++;
                    const reqDelay = getDelay(attempts);
                    yield delay(reqDelay);
                }
            }
        }
    }
}

/**
 * Returns a generator function that adds callback to the SAGA_REQUEST queue.
 * @param callback
 * @return {Function}
 */
function reqAction(callback): (actions.Action) => Generator<*, *, *> {
    return function* (action: actions.Action): Generator<*, *, *> {
        yield put({
            type: SAGA_REQUEST,
            payload: callback,
            action: action,
        });
    };
}

function applyAnnotation(action: actions.AppliedAnnotationAction): Promise<*> {
    return (call(
        api.applyAnnotation,
        action.annotationId,
        action.witnessData
    ): any);
}

function* watchAppliedAnnotation() {
    yield takeEvery(
        actions.APPLIED_ANNOTATION,
        typeCalls[actions.APPLIED_ANNOTATION]
    );
}

function removeAppliedAnnotation(
    action: actions.RemovedAppliedAnnotationAction
) {
    return call(
        api.removeAppliedAnnotation,
        action.annotationId,
        action.witnessData
    );
}

function* watchRemovedAppliedAnnotation() {
    yield takeEvery(
        actions.REMOVED_APPLIED_ANNOTATION,
        typeCalls[actions.REMOVED_APPLIED_ANNOTATION]
    );
}

function removeDefaultAnnotation(
    action: actions.RemovedDefaultAnnotationAction
) {
    return call(
        api.removeDefaultAnnotation,
        action.annotationId,
        action.witnessData
    );
}

function* watchRemovedDefaultAnnotation() {
    yield takeEvery(
        actions.REMOVED_DEFAULT_ANNOTATION,
        typeCalls[actions.REMOVED_APPLIED_ANNOTATION]
    );
}

function appliedDefaultAnnotation(
    action: actions.AppliedDefaultAnnotationAction
) {
    return call(
        api.applyDefaultAnnotation,
        action.annotationId,
        action.witnessData
    );
}

function* watchAppliedDefaultAnnotation() {
    yield takeEvery(
        actions.APPLIED_DEFAULT_ANNOTATION,
        typeCalls[actions.APPLIED_DEFAULT_ANNOTATION]
    );
}

// INITIAL DATA

export function* loadTexts(): Saga<void> {
    try {
        const texts = yield call(api.fetchTexts);
        if (texts) {
            texts.sort((a: api.TextData, b: api.TextData) =>
                tibetanCompare(a.name, b.name)
            );
        }
        yield put(actions.loadedTexts(texts));
    } catch (e) {
        console.log("FAILED loadTexts! %o", e);
    }
}

function* loadSources() {
    try {
        const sources = yield call(api.fetchSources);
        yield put(actions.loadedSources(sources));
    } catch (e) {
        console.log("FAILED loadSources! %o", e);
    }
}

function* loadInitialData(): Saga<void> {
    yield all([call(loadTexts), call(loadSources)]);

    yield put(actions.loadedInitialData());
}

export function* watchLoadInitialData(): any {
    yield takeEvery(
        actions.LOAD_INITIAL_DATA,
        typeCalls[actions.LOAD_INITIAL_DATA]
    );
    yield put(actions.loadingInitialData());
}

// SELECTED TEXT

function* selectedText(action: actions.SelectedTextAction): Saga<void> {
    
    yield put(actions.loadingWitnesses(action.text));
    yield all([call(loadInitialTextData, action)]);
}

function* watchSelectedText(): Saga<void> {
    yield takeEvery(actions.SELECTED_TEXT, selectedText);
}

function* selectedText2(action: actions.SelectedTextAction): Saga<void> {
    yield put(actions.loadingWitnesses2(action.text));
    yield all([call(loadInitialTextData2, action)]);
}

function* watchSelectedText2(): Saga<void> {
    yield takeEvery(actions.SELECTED_TEXT2, selectedText2);
}

// WITNESSES

function* loadInitialTextData(action: actions.TextDataAction) {
    try {
        const witnesses = yield call(api.fetchTextWitnesses, action.text);
        yield put(actions.loadedWitnesses(action.text, witnesses));
        let workingWitnessData: api.WitnessData | null = null;
        let baseWitnessData: api.WitnessData | null = null;
        for (const witness of witnesses) {
            if (witness.is_working) {
                workingWitnessData = witness;
            }
            if (witness.is_base) {
                baseWitnessData = witness;
            }
        }
        if (workingWitnessData) {
            const workingWitness: Witness = yield (select(
                reducers.getWitness,
                workingWitnessData.id
            ): any);

            yield put(actions.loadingWitnessAnnotations(workingWitness.id));
            yield all([
                call(loadAnnotations, workingWitness.id),
                call(loadAnnotationOperations, workingWitness.id),
            ]);
            // auto-select the working witness
            yield put(
                actions.selectedTextWitness(action.text.id, workingWitness.id)
            );
        }
    } catch (e) {
        console.log("FAILED loadInitialTextData %o", e);
    }
}

function* selectedWitness(action: actions.SelectedTextWitnessAction) {
    const witnessId = action.witnessId;
    const hasLoadedAnnotations = yield select(
        reducers.hasLoadedWitnessAnnotations,
        witnessId
    );
    const hasLoadedAnnotations2 = yield select(
        reducers.hasLoadedWitnessAnnotations2,
        witnessId
    );
    if (!hasLoadedAnnotations) {
        yield call(loadWitnessAnnotations, action);
    }
    let urlAction = {
        type: actions.TEXT_URL,
        payload: {
            textId: action.textId,
            witnessId: action.witnessId,
        },
    };
    let witness = yield select(reducers.getWitness, witnessId);
    let activeAnnotation = yield select(reducers.getActiveTextAnnotation);

    if (
        activeAnnotation &&
        activeAnnotation.witness.text.id === witness.text.id
    ) {
        urlAction.payload.annotation = getAnnotationSlug(activeAnnotation);
    }
    yield put(urlAction);
}

function* watchSelectedTextWitness() {
    yield takeEvery(actions.SELECTED_WITNESS, selectedWitness);
}

// WITNESSES 2

function* loadInitialTextData2(action: actions.TextDataAction) {
    try {
        const witnesses = yield call(api.fetchTextWitnesses, action.text);

        yield put(actions.loadedWitnesses2(action.text, witnesses));
        let workingWitnessData: api.WitnessData | null = null;
        let baseWitnessData: api.WitnessData | null = null;
        for (const witness of witnesses) {
            if (witness.is_working) {
                workingWitnessData = witness;
            }
            if (witness.is_base) {
                baseWitnessData = witness;
            }
        }
        if (workingWitnessData) {
            const workingWitness: Witness = yield (select(
                reducers.getWitness2,
                workingWitnessData.id
            ): any);

            yield put(actions.loadingWitnessAnnotations2(workingWitness.id));
            yield all([
                call(loadAnnotations2, workingWitness.id),
                call(loadAnnotationOperations2, workingWitness.id),
            ]);
            // auto-select the working witness

            yield put(
                actions.selectedTextWitness2(action.text.id, workingWitness.id)
            );
        }
    } catch (e) {
        console.log("FAILED loadInitialTextData2     %o", e);
    }
}

function* selectedWitness2(action: actions.SelectedTextWitnessAction) {
    const witnessId = action.witnessId;
    const hasLoadedAnnotations2 = yield select(
        reducers.hasLoadedWitnessAnnotations2,
        witnessId
    );

    if (!hasLoadedAnnotations2) {
        yield call(loadWitnessAnnotations2, action);
    }
}

function* watchSelectedTextWitness2() {
    yield takeEvery(actions.SELECTED_WITNESS2, selectedWitness2);
}

// ANNOTATIONS

function* loadAnnotations(witnessId: number) {
    const witnessData = yield select(reducers.getWitnessData, witnessId);
    const annotations = yield call(api.fetchWitnessAnnotations, witnessData);
    yield put(actions.loadedWitnessAnnotations(witnessId, annotations));
}
function* loadAnnotations2(witnessId: number) {
    const witnessData = yield select(reducers.getWitnessData2, witnessId);
    // const annotations = yield call(api.fetchWitnessAnnotations, witnessData);

    const annotations =[]
   
    yield put(actions.loadedWitnessAnnotations2(witnessId, annotations));
}

function* loadAnnotationOperations(witnessId: number) {
    const user = yield select(reducers.getUser);
    if (user.isLoggedIn) {
        const witnessData = yield select(reducers.getWitnessData, witnessId);
        const operationsData = yield call(
            api.fetchUserAnnotationOperations,
            witnessData
        );
        yield put(
            actions.loadedWitnessAnnotationOperations(witnessId, operationsData)
        );
    } else {
        yield put(actions.loadedWitnessAnnotationOperations(witnessId, []));
    }
}
function* loadAnnotationOperations2(witnessId: number) {
    const user = yield select(reducers.getUser);
    if (user.isLoggedIn) {
        const witnessData = yield select(reducers.getWitnessData2, witnessId);
        const operationsData = yield call(
            api.fetchUserAnnotationOperations,
            witnessData
        );
        yield put(
            actions.loadedWitnessAnnotationOperations2(
                witnessId,
                operationsData
            )
        );
    } else {
        yield put(actions.loadedWitnessAnnotationOperations2(witnessId, []));
    }
}

function* loadWitnessAnnotations(action: actions.WitnessAction) {
    yield put(actions.loadingWitnessAnnotations(action.witnessId));
    yield all([
        call(loadAnnotations, action.witnessId),
        call(loadAnnotationOperations, action.witnessId),
    ]);
}

function* loadWitnessAnnotations2(action: actions.WitnessAction) {
    yield put(actions.loadingWitnessAnnotations2(action.witnessId));
    yield all([
        call(loadAnnotations2, action.witnessId),
        call(loadAnnotationOperations2, action.witnessId),
    ]);
}

function* watchLoadAnnotations() {
    yield takeEvery(actions.LOAD_WITNESS_ANNOTATIONS, loadWitnessAnnotations);
}
function* watchLoadAnnotations2() {
    yield takeEvery(actions.LOAD_WITNESS_ANNOTATIONS2, loadWitnessAnnotations2);
}

function createAnnotation(action) {
    return call(api.createAnnotation, action.annotation);
}

function* watchCreatedAnnotation() {
    yield takeEvery(
        actions.CREATED_ANNOTATION,
        typeCalls[actions.CREATED_ANNOTATION]
    );
}

function updateAnnotation(action) {
    return call(api.updateAnnotation, action.annotation);
}

function* watchUpdatedAnnotation() {
    yield takeEvery(
        actions.UPDATED_ANNOTATION,
        typeCalls[actions.UPDATED_ANNOTATION]
    );
}

function deleteAnnotation(action) {
    return call(api.deleteAnnotation, action.annotation);
}

function* watchDeletedAnnotation() {
    yield takeEvery(
        actions.DELETED_ANNOTATION,
        typeCalls[actions.DELETED_ANNOTATION]
    );
}

function createQuestion(action) {
    return call(
        api.createQuestion,
        action.annotation,
        action.title,
        action.content
    );
}

function* watchCreatedQuestion() {
    yield takeEvery(
        actions.CREATED_QUESTION,
        typeCalls[actions.CREATED_QUESTION]
    );
}

function* loadQuestion(action) {
    let isLoading = yield select(reducers.questionIsLoading, action.annotation);
    if (!isLoading) {
        yield put(actions.loadingQuestion(action.annotation));
        const results = yield call(api.getQuestion, action.annotation);
        yield put(actions.loadedQuestion(action.annotation, results));
    }
}

function* watchLoadQuestion() {
    yield takeEvery(actions.LOAD_QUESTION, typeCalls[actions.LOAD_QUESTION]);
}

function* changeActiveAnnotation(
    action: actions.ChangedActiveAnnotationAction
) {
    const selectedWitness = yield select(reducers.getSelectedTextWitness);
    let urlAction = {
        type: actions.TEXT_URL,
        payload: {
            textId: selectedWitness.text.id,
            witnessId: selectedWitness.id,
        },
    };
    if (action.annotation) {
        let annotation = action.annotation;
        let annotationSlug = getAnnotationSlug(annotation);
        urlAction.payload.annotation = annotationSlug;
    }

    yield put(urlAction);
}

function* watchChangedActiveAnnotation() {
    yield takeEvery(
        actions.CHANGED_ACTIVE_TEXT_ANNOTATION,
        typeCalls[actions.CHANGED_ACTIVE_TEXT_ANNOTATION]
    );
}

function getAnnotationSlug(annotation: Annotation): string {
    let annotationSlug = annotation.start + "-" + annotation.length;
    if (annotation.isSaved) {
        annotationSlug += "-" + annotation.uniqueId.substr(0, 8);
    }
    return annotationSlug;
}

// I18N

function* selectLocale(action: actions.Action) {
    const locale: string = String(action.payload);
    const localeData = yield select(reducers.getLocaleData, locale);

    const user: User = yield select(reducers.getUser);
    if (user.isLoggedIn) {
        yield call(api.setUserLocale, user, locale);
    }

    yield call(Cookies.set, i18n_cookie_name, locale);

    yield put(
        updateIntl({
            locale: locale,
            messages: localeData.messages,
            key: locale,
        })
    );
}

function* watchSelectedLocale() {
    yield takeEvery(actions.SELECTED_LOCALE, selectLocale);
}

// EXPORT

function* exportWitness(action: actions.ExportWitnessAction) {
    const witness = yield select(reducers.getWitness, action.witnessId);
    const format = action.format;
    const annotatedText = yield select(getWitnessAnnotatedText, witness.id);
    const text = annotatedText.textInfo;

    let extension;
    let exporter: TextExporter;
    switch (format) {
        case "docx":
            exporter = new DocxExporter();
            extension = "docx";
            break;
        case "txt":
        default:
            exporter = new PlainTextExporter();
            extension = "txt";
    }
    let filename = text.name + " - " + witness.source.name + "." + extension;

    const file = yield call(
        [exporter, exporter.export],
        annotatedText,
        filename
    );
    FileSaver.saveAs(file, filename);

    yield put(actions.exportedWitness(witness.id, format));
}

function* watchExportWitness() {
    yield takeEvery(actions.EXPORT_WITNESS, exportWitness);
}

// SEARCH

function* searchTexts(action: actions.ChangedSearchValueAction) {
    yield delay(500);
    const results = yield call(
        api.searchTexts,
        action.searchValue,
        constants.MAX_SEARCH_RESULTS
    );
    yield put(actions.updatedSearchResults(action.searchValue, results));
}

function* watchChangedSearchValue() {
    yield takeLatest(actions.CHANGED_SEARCH_VALUE, searchTexts);
}

function* searchTerm(action: actions.ChangedSearchValueAction) {
    const searchTerm = action.searchTerm;
    yield put(actions.changedSearchValue(searchTerm));
}

function* watchChangedSearchTerm() {
    yield takeLatest(actions.CHANGED_SEARCH_TERM, searchTerm);
}

function* searchedText(action: actions.SearchedTextAction) {
    const results = yield call(
        api.searchText,
        action.textId,
        action.searchValue
    );
    yield put(actions.updatedSearchResults(action.searchValue, results));
}
function* watchSearchedText() {
    yield takeLatest(actions.SEARCHED_TEXT, searchedText);
}

// SETTINGS

function* loadUserSettings(action: actions.UserAction) {
    const user = yield select(reducers.getUser);
    if (user) {
        const settings = yield call(api.fetchUserSettings, user);
        yield put(actions.loadedUserSettings(settings));
    }
}

function* watchUserLoggedIn() {
    yield takeEvery(actions.USER_LOGGED_IN, loadUserSettings);
}

function* changedTextListWidth(action: actions.ChangedTextListWidth) {
    const width = action.width;
    yield call(Cookies.set, constants.TEXT_LIST_WIDTH_COOKIE, width);
}

function* watchChangedTextListWidth() {
    yield takeLatest(actions.CHANGED_TEXT_LIST_WIDTH, changedTextListWidth);
}

function* changedShowPageImages(action: actions.ChangedShowPageImagesAction) {
    const user = yield select(reducers.getUser);
    if (user.isLoggedIn) {
        yield call(api.setUserSettings, user, {
            showPageImages: action.showPageImages,
        });
    }
}

function* watchChangedShowPageImages() {
    yield takeLatest(actions.CHANGED_SHOW_PAGE_IMAGES, changedShowPageImages);
}

function* changedTextFontSize(action: actions.ChangedTextFontSizeAction) {
    const user = yield select(reducers.getUser);
    if (user.isLoggedIn) {
        yield call(api.setUserSettings, user, {
            textFontSize: action.fontSize,
        });
    }
}

function* watchChangedTextFontSize() {
    yield takeLatest(actions.CHANGED_TEXT_FONT_SIZE, changedTextFontSize);
}

// BATCHED ACTIONS

function* dispatchedBatch(action): Saga<void> {
    const actions = action.payload;
    for (let i = 0; i < actions.length; i++) {
        const batchedAction = actions[i];
        if (typeCalls.hasOwnProperty(batchedAction.type)) {
            yield fork(typeCalls[batchedAction.type], batchedAction);
        }
    }
}

function* watchBatchedActions() {
    yield takeEvery(BATCH, dispatchedBatch);
}

// URLS
// loadedTextUrl should only be called when first loading
let _loadedTextUrl = false;
let _secondWindowTextId= null;
let _secondWindowWitnessId= null;

function* loadedTextUrl(action: actions.TextUrlAction) {
    if (_loadedTextUrl) {
        return;
    }
    _loadedTextUrl = true;
    if (action.payload.witnessId) {
        const textId = action.payload.textId;
        const witnessId = action.payload.witnessId;
        const textId2= _secondWindowTextId ? _secondWindowTextId : 125
        let textData: api.TextData;
        let textData2: api.TextData;
        do {
            textData = yield select(reducers.getText, textId, true);
            textData2= yield select(reducers.getText2,textId2,true);
            if (!textData) yield delay(100);
            if (!textData2) yield delay(100);

        } while (textData === null);
        const selectedTextAction = actions.selectedText(textData);
        const selectedTextAction2 = actions.selectedText2(textData2);

        yield put(selectedTextAction);
        yield put(selectedTextAction2);
        const selectedWitnessAction = actions.selectedTextWitness(
            textId,
            witnessId
        );
     
        const witnesses = yield call(api.fetchTextWitnesses, textData);
        yield put(actions.loadedWitnesses(textData, witnesses));

        let textWitnesses: Array<Witness> = [];
        do {
            textWitnesses = yield select(reducers.getTextWitnesses, textId);
            if (textWitnesses.length === 0) yield delay(100);
        } while (textWitnesses.length === 0);

        // Wait until the initial text witness has been selected.
        // Otherwise a race condition can happen when the initial witness
        // gets selected after the url-defined witness.
        let selectedWitnessId;
        do {
            selectedWitnessId = yield select(
                reducers.getSelectedTextWitnessId,
                textId
            );
            if (!selectedWitnessId) yield delay(100);
        } while (!selectedWitnessId);

        yield put(selectedWitnessAction);

        if (action.payload.annotation) {
            let matches = /([0-9]+)-([0-9]+)-?(.+)?/.exec(
                action.payload.annotation
            );
            let start, length, uniqueIdSegment;
            if (matches) {
                if (matches[1]) start = Number(matches[1]);
                if (matches[2]) length = Number(matches[2]);
                if (matches[3]) uniqueIdSegment = matches[3];

                if (!start || !length) return;

                let loadedAnnotations;
                let loadedAppliedAnnotations;
                do {
                    loadedAnnotations = yield select(
                        reducers.hasLoadedWitnessAnnotations,
                        witnessId
                    );
                    loadedAppliedAnnotations = yield select(
                        reducers.hasLoadedWitnessAppliedAnnotations,
                        witnessId
                    );
                    if (!loadedAnnotations || !loadedAppliedAnnotations) {
                        yield delay(100);
                    }
                } while (
                    loadedAnnotations === false ||
                    loadedAppliedAnnotations === false
                );

                let user = yield select(reducers.getUser);
                const selectedWitness = yield select(
                    reducers.getSelectedTextWitness
                );
                let workingWitness = yield select(
                    reducers.getWorkingWitness,
                    textId
                );

                let annotation;
                if (uniqueIdSegment) {
                    annotation = yield select(
                        reducers.getAnnotationWithIdFragment,
                        witnessId,
                        uniqueIdSegment
                    );
                }
                if (!annotation && user) {
                    let annotatedText = yield select(
                        TextStore.getWitnessText,
                        selectedWitness.id
                    );
                    if (annotatedText) {
                        annotation = annotatedText.getAnnotation(start, length);
                    }

                    if (!annotation) {
                        annotation = new Annotation(
                            WORKING_VERSION_ANNOTATION_ID,
                            workingWitness,
                            start,
                            length,
                            "",
                            ANNOTATION_TYPES.variant,
                            selectedWitness,
                            user
                        );
                    }
                }

                if (annotation) {
                    let changedAnnotationAction =
                        actions.changedActiveTextAnnotation(annotation);
                    yield put(changedAnnotationAction);
                }
            }
        }
    }
}
function* watchTextUrlActions() {
    yield takeEvery(actions.TEXT_URL, loadedTextUrl);
}

function* loadedTextUrl2(action){
const textId=action.payload.textId;
const textId2=action.payload.textId2;
let textData: api.TextData;
let textData2:api.TextData;
do {
    textData = yield select(reducers.getText, textId, true);
    textData2 =yield select(reducers.getText,textId2,true);
        if (!textData) yield delay(100);
        if (!textData2) yield delay(100);

} while (textData === null || textData2 === null );
const selectedTextAction = actions.selectedText(textData);
const selectedTextAction2 = actions.selectedText2(textData2);

_secondWindowTextId=textId2

yield put(selectedTextAction);
yield put(selectedTextAction2);

}

function* watchTextUrlActions2() {
    yield takeEvery(actions.TEXT_URL2, loadedTextUrl2);
}
//URL to LOAD TEXTDATA AND AUTO WITNESS
function* loadedTextIdonlyUrl(action) {
    _loadedTextUrl = true;

    if (action.payload) {
        const textId = action.payload.textId;
        let textData: api.TextData;
        do {
            textData = yield select(reducers.getText, textId, true);
            if (!textData) yield delay(100);
        } while (textData === null);

        yield put(actions.loadingWitnesses(textData));
        const witnesses = yield call(api.fetchTextWitnesses, textData);
        const selectedTextAction = actions.selectedText(textData);

        yield put(actions.loadedWitnesses(textData, witnesses));
        yield put(actions.selectedText2(textData));
        yield put(actions.loadedWitnesses2(textData, witnesses));

        for (const witness of witnesses) {
            if (witness.is_working) {
                var workingWitnessData = witness;
            }
            if (witness.is_base) {
                var baseWitnessData = witness;
            }
        }

        const selectedWitnessAction = actions.selectedTextWitness(
            textData.id,
            workingWitnessData.id
        );
        yield put(selectedTextAction);
        yield put(selectedWitnessAction);
    }
}

function* watchTextIdonlyUrlActions() {
    yield takeEvery(actions.TEXTID_ONLY_URL, loadedTextIdonlyUrl);
}

// //url /title/:title

// function* loadTextTitle(action) {
//     const changeLoaded = actions.changeIsLoaded(false);
//     yield put(changeLoaded);

//     const textdata = yield select(reducers.getTextTitle);

//     if (textdata.detail.length === 0) {
//         console.log("fetched");
//         const texts = yield call(api.fetchChapterDetail);
//         const setTextData = actions.setTextData(texts.data);
//         yield put(setTextData);
//     }

//     let { title } = action.payload;
//     const selectedTextTitle = actions.selectTextTitle(title);
//     yield put(selectedTextTitle);

//     const changeLoadedtoTrue = actions.changeIsLoaded(true);
//     yield put(changeLoadedtoTrue);
// }

// function* watchTextTitleUrlAction() {
//     yield takeEvery(actions.TEXT_TITLE, loadTextTitle);
// }


//Home

function* selectTextUrl(action) {
    _loadedTextUrl = false;
    const falseLoaded = actions.changeIsLoaded(false);
    yield put(falseLoaded);
    const noSelectedTextAction = actions.noSelectedText(null);
    yield put(noSelectedTextAction);
    const noTitleSelected = actions.selectTextTitle(null);
    yield put(noTitleSelected);
    yield delay(500);
    const textdata = yield select(reducers.getTextTitle);
    let texts;
    let setTextData;
    if (textdata.detail.length === 0) {
        try {
            texts = yield call(api.fetchChapterDetail);
        } catch (e) {
            console.log("error");
        }
        if (texts) {
            setTextData = actions.setTextData(texts.data);
        } else {
            setTextData = actions.setTextData([]);
        }
        yield put(setTextData);
    }

    const trueLoaded = actions.changeIsLoaded(true);
    yield put(trueLoaded);

    // }
}

function* watchSelectTextUrlActions() {
    yield takeEvery(actions.TEXTS, selectTextUrl);
}

//editor

function* editorUrl(action) {
    _loadedTextUrl = true;

    if (action.payload) {
        // const textId = action.payload.textId;
        const textId = 2;
        let textData: api.TextData;
        do {
            textData = yield select(reducers.getText, textId, true);
            if (!textData) yield delay(100);
        } while (textData === null);

        yield put(actions.loadingWitnesses(textData));
        yield put(actions.loadingWitnesses2(textData));

        const witnesses = yield call(api.fetchTextWitnesses, textData);
        const selectedTextAction = actions.selectedText(textData);
        const selectedTextAction2 = actions.selectedText2(textData);

        yield put(actions.loadedWitnesses(textData, witnesses));
        yield put(actions.loadedWitnesses2(textData, witnesses));

        for (const witness of witnesses) {
            if (witness.is_working) {
                var workingWitnessData = witness;
            }
            if (witness.is_base) {
                var baseWitnessData = witness;
            }
        }

        const selectedWitnessAction = actions.selectedTextWitness(
            textData.id,
            workingWitnessData.id
        );
        const selectedWitnessAction2 = actions.selectedTextWitness2(
            textData.id,
            workingWitnessData.id
        );
        yield put(selectedTextAction);
        yield put(selectedTextAction2);

        yield put(selectedWitnessAction);
        yield put(selectedWitnessAction2);
    }
}

function* watchEditorUrl() {
    yield takeEvery(actions.EDITOR, editorUrl);
}

//search

function* searchUrl(action) {
    const search = action.payload.search;
    yield put(actions.changedSearchTerm(search));
}

function* watchSearchUrl() {
    yield takeEvery(actions.SEARCH, searchUrl);
}

//notification

/**
 * Stores functions by action type.
 * Used primarily to allow batched actions to be handled
 * automatically by dispatchedBatch.
 *
 * @type {Object.<string, function>}
 */
const typeCalls: { [string]: (any) => Saga<void> } = {
    [actions.LOAD_INITIAL_DATA]: loadInitialData,
    [actions.LOAD_WITNESS_ANNOTATIONS]: loadWitnessAnnotations,
    [actions.LOAD_WITNESS_ANNOTATIONS2]: loadWitnessAnnotations2,
    [actions.APPLIED_ANNOTATION]: reqAction(applyAnnotation),
    [actions.REMOVED_APPLIED_ANNOTATION]: reqAction(removeAppliedAnnotation),
    [actions.APPLIED_DEFAULT_ANNOTATION]: reqAction(appliedDefaultAnnotation),
    [actions.REMOVED_DEFAULT_ANNOTATION]: reqAction(removeDefaultAnnotation),
    [actions.CREATED_ANNOTATION]: reqAction(createAnnotation),
    [actions.UPDATED_ANNOTATION]: reqAction(updateAnnotation),
    [actions.DELETED_ANNOTATION]: reqAction(deleteAnnotation),
    [actions.SELECTED_WITNESS]: reqAction(selectedWitness),
    [actions.SELECTED_WITNESS2]: reqAction(selectedWitness2),
    [actions.CHANGED_ACTIVE_TEXT_ANNOTATION]: changeActiveAnnotation,
    [actions.SELECTED_TEXT]: selectedText,
    [actions.SELECTED_TEXT2]: selectedText2,
    [actions.SELECTED_LOCALE]: selectLocale,
    [actions.CHANGED_TEXT_LIST_WIDTH]: changedTextListWidth,
    [actions.CHANGED_SHOW_PAGE_IMAGES]: changedShowPageImages,
    [actions.CHANGED_TEXT_FONT_SIZE]: changedTextFontSize,
    [actions.USER_LOGGED_IN]: loadUserSettings,
    [actions.TEXT_URL]: loadedTextUrl,
    [actions.TEXT_URL2]: loadedTextUrl2,
    [actions.TEXTID_ONLY_URL]: loadedTextIdonlyUrl,
    [actions.TEXTS]: selectTextUrl,
    [actions.CREATED_QUESTION]: reqAction(createQuestion),
    [actions.LOAD_QUESTION]: loadQuestion,
    [actions.EDITOR]: editorUrl,
    [actions.SEARCH]: searchUrl,
};

/** Root **/

export default function* rootSaga(): Saga<void> {
    yield all([
        call(watchLoadInitialData),
        call(watchSelectedText),
        call(watchLoadAnnotations),
        call(watchLoadAnnotations2),
        call(watchBatchedActions),
        call(watchAppliedAnnotation),
        call(watchRemovedAppliedAnnotation),
        call(watchAppliedDefaultAnnotation),
        call(watchRemovedDefaultAnnotation),
        call(watchCreatedAnnotation),
        call(watchUpdatedAnnotation),
        call(watchDeletedAnnotation),
        call(watchRequests),
        call(watchSelectedTextWitness),
        call(watchSelectedLocale),
        call(watchExportWitness),
        call(watchChangedSearchValue),
        call(watchChangedSearchTerm),
        call(watchSearchedText),
        call(watchChangedTextListWidth),
        call(watchChangedShowPageImages),
        call(watchChangedTextFontSize),
        call(watchUserLoggedIn),
        call(watchTextUrlActions),
        call(watchTextIdonlyUrlActions),
        call(watchChangedActiveAnnotation),
        call(watchCreatedQuestion),
        call(watchLoadQuestion),
        call(watchSelectTextUrlActions),
        call(watchTextUrlActions2),
        call(watchEditorUrl),
        call(watchSearchUrl),
        call(watchSelectedText2),
        call(watchSelectedTextWitness2),
    ]);
}
