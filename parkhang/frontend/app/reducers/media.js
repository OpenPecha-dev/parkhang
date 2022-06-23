// @flow
import * as actions from "actions";


export type MediaState = {
    isPanelVisible:Boolean,
    isImageVisible:Boolean,
    isVideoVisible:Boolean,
    isAudioVisible:Boolean,
    isImagePortrait:Boolean,
    imageData:{},
    videoData:{},
    audioData:{}
};

export const initialMediaState:MediaState = {
    isPanelVisible:false,
    isImageVisible:false,
    isVideoVisible:false,
    isAudioVisible:false,
    isImagePortrait:false,
    imageData:{},
    videoData:{},
    audioData:{}

};

function selectMedia(state,action){

    if(action.payload===null||action.payload===false){
        return {...state,
            isPanelVisible:false,
            isVideoVisible:action.payload,
            isAudioVisible:action.payload,
            isImageVisible:action.payload
        }
    }


    switch (action.payload){
        case 'IMAGE' : 
        if(state.isImageVisible===true){
            return {...state,isImageVisible:false,
                isPanelVisible:false,
            }
        }        
        return {
            ...state,
            isPanelVisible:true,
            isVideoVisible:false,
            isAudioVisible:false,
            isImageVisible:true
        }
        case 'VIDEO': 
        if(state.isVideoVisible===true){
            return {...state,isVideoVisible:false,
                isPanelVisible:false,
            }
        }  return {
            ...state,
            isPanelVisible:true,
            isVideoVisible:true,
            isAudioVisible:false,
            isImageVisible:false
        }
        case 'AUDIO':   if(state.isAudioVisible===true){
            return {...state,isAudioVisible:false,
                isPanelVisible:false,
            }
        }    return {
            ...state,
            isVideoVisible:false,
            isPanelVisible:true,
            isAudioVisible:true,
            isImageVisible:false
        }
    }
}

function changeIsImagePortrait(state:MediaState,action):MediaState{
    return {
        ...state,
        isImagePortrait:action.payload
    }
}

function loadImageData(state: MediaState,action): MediaState {
    
    return {
        ...state,
        imageData:action.data
    };
}
function loadVideoData(state: MediaState,action): MediaState {
    
    return {
        ...state,
        videoData:action.data
    };
}

const mediaReducers = {
    [actions.ACTIVATE_MEDIA]: selectMedia,
    [actions.LOAD_IMAGE_DATA]: loadImageData,
    [actions.LOAD_VIDEO_DATA]: loadVideoData,
    [actions.IS_IMAGE_PORTRAIT]:changeIsImagePortrait

};


export const getMediaData = (state) => {
    return state;
};

export const isImagePortrait = (
    state: DataState,
)=> {
        return state.isImagePortrait;
 };

export const getImageData = (
    state: DataState,
)=> {
        return state.imageData;
 };
 export const getVideoData = (
    state: DataState,
)=> {
        return state.videoData;
 };


export default mediaReducers;

