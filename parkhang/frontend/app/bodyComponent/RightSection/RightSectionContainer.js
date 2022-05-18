import React from "react";
import { connect } from "react-redux";
import * as reducers from "reducers";
import * as actions from "actions";
import RightSection from "./RightSection";


const mapStateToProps = state => {
    return {
        Textdata: reducers.getTextTitle(state)
    };
};

const matchDispatchToProps = dispatch => {
    return {
        onChangedTextTitle:(title:string | null)=>{
          dispatch(actions.selectTextTitle(title))
        }
    };
};

const RightSectionContainer = connect(mapStateToProps, matchDispatchToProps)(RightSection);

     

export default RightSectionContainer;
