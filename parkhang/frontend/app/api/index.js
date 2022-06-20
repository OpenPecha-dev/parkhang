// @flow
import axios from "axios";
import Annotation from "lib/Annotation";
import Witness from "lib/Witness";
import User from "lib/User";

axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.xsrfHeaderName = "X-CSRFToken";

const GET = "get";
const POST = "post";
const PUT = "put";
const DELETE = "delete";

type ReqMethod = "get" | "post" | "put" | "delete";

export type AnnotationOp = "A" | "R";
export const appliedOp: AnnotationOp = "A";
export const removedOp: AnnotationOp = "R";

let HOST = null;
export function setHost(host: string) {
    HOST = host;
}

function request(method: ReqMethod, url, data: any = null): Promise<*> {
    let req = null;
    switch (method) {
        case POST:
            req = axios.post;
            break;
        case PUT:
            req = axios.put;
            break;
        case DELETE:
            req = axios.delete;
            break;
        case GET:
        default:
            req = axios.get;
            break;
    }

    if (HOST) {
        url = HOST + url;
    }

    const promiseReq = req;
    return new Promise((resolve, reject) => {
        promiseReq(url, data)
            .then(response => {
                resolve(response.data);
            })
            .catch(error => {
                // console.dir(error);
                console.log('couldnot get the data . check connection')
                reject(error);
            });
    });
}

// USER

export class InvalidUserError extends Error {}

export function setUserLocale(
    user: User,
    locale: string
): Promise<string> | InvalidUserError {
    if (!user.isLoggedIn) {
        throw new InvalidUserError("The user is not logged in.");
    }
    const url = "/api/users/" + user.id;
    let data = {
        locale: locale
    };
    return request(PUT, url, data);
}

export type UserSettings = {
    showPageImages?: boolean,
    textFontSize?: number
};

export function fetchUserSettings(
    user: User
): Promise<UserSettings> | InvalidUserError {
    if (!user.isLoggedIn) {
        throw new InvalidUserError("The user is not logged in.");
    }
    const url = "/api/users/" + user.id + "/settings/";
    return request(GET, url);
}

export function setUserSettings(
    user: User,
    settings: UserSettings
): Promise<string> | InvalidUserError {
    if (!user.isLoggedIn) {
        throw new InvalidUserError("The user is not logged in.");
    }
    const url = "/api/users/" + user.id + "/settings/";
    return request(PUT, url, settings);
}

// GET DATA

export function fetchChapterDetail(){
  const  url="https://api.npoint.io/bf0ceeb6cdae14e09a17"
   

    return request(GET, url); 
}

export function fetchImageWithTextId(id=0){
    console.log(id);
      const  url="https://api.npoint.io/760936be2b22b5744345"
      return request(GET, url); 
  }


export type SourceData = {
    id: number,
    name: string,
    is_base: boolean,
    is_working: boolean
};
export function fetchSources(): Promise<SourceData[]> {
    const url = "/api/sources/";

    return request(GET, url);

}

export type TextData = {
    id: number,
    name: string
};
export function fetchTexts(): Promise<TextData[]> {
    const url = "/api/texts/";
    return request(GET, url);
}


export type TextSearchResultData = {
    results: [[number, string]],
    total: number,
    extra: boolean,
    loading?: boolean
};
export function searchTexts(
    searchTerm: string,
    maxResults: number = 0
): Promise<TextSearchResultData[]> {
    const url =
        "/api/texts/search/" + searchTerm + "?max_results=" + maxResults;
    return request(GET, url);
}

export function searchText(
    textId: number,
    searchTerm: string
): Promise<TextSearchResultData> {
    const url =
        "/api/texts/search/text/" +
        textId +
        "/" +
        searchTerm +
        "?max_results=" +
        0;
    return request(GET, url);
}

export type WitnessData = {
    id: number,
    content: string | null,
    is_base: boolean,
    is_working: boolean,
    revision: number,
    source: number,
    text: number,
    properties: {} | null
};
export function fetchTextWitnesses(text: TextData): Promise<WitnessData[]> {
    const url = "/api/texts/" + String(text.id) + "/witnesses/";
   
    return request(GET, url);
}

type AnnotationUniqueId = string;

export type AnnotationData = {
    id: number | null,
    content: string,
    creator_user: number | null,
    creator_witness: number,
    is_deleted: boolean,
    length: number,
    original: AnnotationUniqueId | null,
    start: number,
    type: string,
    unique_id: AnnotationUniqueId,
    witness: number,
    modified?: Date,
    is_saved?: boolean,
    name?: string
};
export function fetchWitnessAnnotations(
    witness: WitnessData,
    start?: number,
    length?: number,
    type?: string
): Promise<AnnotationData[]> {
    let url =
        "/api/texts/" +
        witness.text +
        "/witnesses/" +
        witness.id +
        "/annotations/";
    if (start && length) {
        url += start + "," + length;
    }
    if (type) {
        url += "?type=" + type;
    }
    return request(GET, url);
}

// APPLYING ANNOTATIONS

export type AnnotationOperationData = {
    id: number,
    operation: AnnotationOp,
    annotation_unique_id: AnnotationUniqueId,
    witness: number
};

function getAnnotationOperationsUrl(
    witnessData: WitnessData,
    annotationUniqueId: AnnotationUniqueId | null = null
): string {
    let url =
        "/api/texts/" +
        witnessData.text +
        "/witnesses/" +
        witnessData.id +
        "/user_annotation_operations/";
    if (annotationUniqueId) {
        url += annotationUniqueId;
    }
    return url;
}

export function fetchUserAnnotationOperations(
    witnessData: WitnessData
): Promise<AnnotationOperationData[]> {
    const url = getAnnotationOperationsUrl(witnessData);
    return request(GET, url);
}

export function applyAnnotation(
    annotationId: AnnotationUniqueId,
    witnessData: WitnessData
) {
    const url = getAnnotationOperationsUrl(witnessData);
    let data = {
        annotation_unique_id: annotationId,
        operation: appliedOp
    };
    return request(POST, url, data);
}

export function removeAppliedAnnotation(
    annotationId: AnnotationUniqueId,
    witness: WitnessData
) {
    const url = getAnnotationOperationsUrl(witness, annotationId);
    return request(DELETE, url);
}

// REMOVING DEFAULT ANNOTATIONS

export function removeDefaultAnnotation(
    annotationId: AnnotationUniqueId,
    witnessData: WitnessData
) {
    const url = getAnnotationOperationsUrl(witnessData);
    let data = {
        annotation_unique_id: annotationId,
        operation: removedOp
    };
    return request(POST, url, data);
}

// Default annotations are automatically applied,
// so the only operations present should be a removedOp.
// Therefore, we should just delete any operations related to them.
export function applyDefaultAnnotation(
    annotationId: AnnotationUniqueId,
    witnessData: WitnessData
) {
    const url = getAnnotationOperationsUrl(witnessData, annotationId);
    return request(DELETE, url);
}

// CREATING ANNOTATIONS

export function dataFromAnnotation(annotation: Annotation): AnnotationData {
    const creatorWitness = annotation.creatorWitness.id;
    const creatorUser = annotation.creatorUser
        ? annotation.creatorUser.id
        : null;

    return {
        id: annotation.id,
        unique_id: annotation.uniqueId,
        witness: annotation.witness.id,
        start: annotation.start,
        length: annotation.length,
        content: annotation.content,
        creator_witness: creatorWitness,
        creator_user: creatorUser,
        type: annotation.type,
        original: annotation.basedOn ? annotation.basedOn.uniqueId : null,
        is_deleted: false,
        is_saved: false
    };
}

function getAnnotationUrl(
    witness: Witness,
    annotation: Annotation | null = null
): string {
    let url =
        "/api/texts/" +
        witness.text.id +
        "/witnesses/" +
        witness.id +
        "/annotations/";
    if (annotation) {
        url += annotation.uniqueId;
    }
    return url;
}

export function createAnnotation(annotation: Annotation) {
    const url = getAnnotationUrl(annotation.witness);
    let data = dataFromAnnotation(annotation);
    delete data.id;
    return request(POST, url, data);
}

export function updateAnnotation(annotation: Annotation) {
    const url = getAnnotationUrl(annotation.witness, annotation);
    const data = dataFromAnnotation(annotation);
    return request(PUT, url, data);
}

export function deleteAnnotation(annotation: Annotation) {
    const url = getAnnotationUrl(annotation.witness, annotation);
    return request(DELETE, url);
}

// TODO: get default annotations

// QUESTIONS

function getQuestionUrl(
    witness: Witness,
    annotation: Annotation | null = null
): string {
    let url =
        "/api/texts/" +
        witness.text.id +
        "/witnesses/" +
        witness.id +
        "/questions/";
    if (annotation) {
        url += `${annotation.start}-${annotation.length}`;
    }

    return url;
}

export function createQuestion(
    annotation: Annotation,
    title: String,
    content: String
) {
    const url = getQuestionUrl(annotation.witness, annotation);
    let data = {
        question_title: title,
        question_content: content,
        ...dataFromAnnotation(annotation)
    };

    return request(POST, url, data);
}

export function getQuestion(annotation: Annotation) {
    const url = getQuestionUrl(annotation.witness, annotation);

    return request(GET, url);
}
