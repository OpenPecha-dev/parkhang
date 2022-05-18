import React from "react";
import { connect } from "react-redux";
import * as reducers from "reducers";
import * as actions from "actions";
import SelectedCategory from "./SelectedCategory";



const mapStateToProps = state => {


    return {
        title: reducers.getTranslation(state, "header.title"),
        Textdata: reducers.getTextTitle(state),
    };
};

const matchDispatchToProps = dispatch => {
    return {
        onChangedTextWidth: (width: number) => {
            dispatch(actions.changedTextListWidth(width));
        },
        onChangedActiveCategory:(category:string | null)=>{

          dispatch(actions.selectActiveCategory(category))
        
        },
        onChangeLanguage: (selectedLanguage :string)=>{
            dispatch(actions.changeLanguage(selectedLanguage));
        },
        dispatch
    };
};

const SelectCategoryContainer = connect(mapStateToProps, matchDispatchToProps)(SelectedCategory);

     

export default SelectCategoryContainer;
