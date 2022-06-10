// @flow
import * as actions from "actions";


export const initialCategoryState = {
    detail:[],
    activeText: null,
    isloaded:false,
};

function selecteTextData(state,action){
const textData=action.payload;
return {
    ...state,
    detail:textData
}
}

function selectTextTitle(
    state,
    action
){
    const textTitle = action.payload;

    return {
        ...state,
        activeText: textTitle
    };
}



function changeIsLoaded(
    state,
    action
){
    const isloaded = action.payload;
return {
        ...state,
         isloaded
    };
}




const categoryReducers = {
    [actions.SELECT_TEXTTITLE]: selectTextTitle,
    [actions.SET_TEXTDATA]: selecteTextData,
    [actions.IS_LOADED]:changeIsLoaded
};


export const getTextTitleData = (state) => {
    return state;
};

export default categoryReducers;

