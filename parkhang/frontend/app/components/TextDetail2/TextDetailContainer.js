// @flow
import React from "react";
import { connect } from "react-redux";
import TextDetail from "./TextDetail";
import * as actions from "actions";
import * as reducers from "reducers";



const mapStateToProps = (state: AppState): {} => {
  
    let textFontSize = reducers.getTextFontSize2(state);

    return {
        textFontSize,
    };
};


const mergeProps = (stateProps, dispatchProps, ownProps) => {
   
const { dispatch } = dispatchProps;
const { selectedText } = stateProps;

return {
    ...ownProps,
    ...stateProps,
    onChangedFontSize: (fontSize: number) => {
        dispatch(actions.changedTextFontSize(fontSize));
    }
};
}

const TextDetailContainer = connect(mapStateToProps, null,mergeProps)(
    TextDetail
);

export default TextDetailContainer;

