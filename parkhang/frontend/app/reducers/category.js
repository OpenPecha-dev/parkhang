// @flow
import * as actions from "actions";


export const initialCategoryState = {
    detail:[],
    activeText: null,
    activeCategory:null,
    activeChapter:null,
    language:'en',
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


function selectActiveCategory(
    state,
    action
){
    const category = action.payload;
if(state.activeText!==null)  return {
        ...state,
         activeCategory: category
    };

    return {
        ...state
    }

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

function selectActiveChapter(
    state,
    action
){
    const chapter = action.payload;
if(state.activeText!==null && state.category!==null)  return {
        ...state,
         activeChapter: chapter
    };

    return {
        ...state
    }

}


export function changeLanguage(state,action){
    return {
        ...state,
        language:action.payload
    }
}


const categoryReducers = {
    [actions.SELECT_TEXTTITLE]: selectTextTitle,
    [actions.CHANGE_LANGUAGE]: changeLanguage,
    [actions.SELECT_CATEGORY]: selectActiveCategory,
    [actions.SELECT_CHAPTER]: selectActiveChapter,
    [actions.SET_TEXTDATA]: selecteTextData,
    [actions.IS_LOADED]:changeIsLoaded
};


export const getTextTitleData = (state) => {
    return state;
};

export default categoryReducers;

