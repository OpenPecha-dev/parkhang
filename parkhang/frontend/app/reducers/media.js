// @flow
import * as actions from "actions";


export const initialMediaState = {
   
    selectedMediaType:null,
    isImageVisible:null,
    isVideoVisible:null,
    isAudioVisible:null

};

function selectMedia(state,action){

    if(action.payload===null||action.payload===false){
        return {...state,
            selectedMediaType:action.payload,
            isVideoVisible:action.payload,
            isAudioVisible:action.payload,
            isImageVisible:action.payload
        }
    }


    switch (action.payload){
        case 'IMAGE' :  return {
            ...state,
            selectedMediaType:action.payload,
            isVideoVisible:false,
            isAudioVisible:false,
            isImageVisible:true
        }
        case 'VIDEO': return {
            ...state,
            selectedMediaType:action.payload,
            isVideoVisible:true,
            isAudioVisible:false,
            isImageVisible:false
        }
        case 'AUDIO':   return {
            ...state,
            selectedMediaType:action.payload,
            isVideoVisible:false,
            isAudioVisible:true,
            isImageVisible:false
        }
    }
}


const mediaReducers = {
    [actions.ACTIVATE_MEDIA]: selectMedia,
};


export const getMediaData = (state) => {
    return state;
};

export default mediaReducers;

