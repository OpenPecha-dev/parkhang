// @flow
import React from "react";
import { connect } from "react-redux";
import TextDetailHeading from "./TextDetailHeading";
import * as actions from "actions";
import * as reducers from "reducers";
import type { AppState } from "reducers";
import { getTextListVisible, getAccountOverlayVisible, getMenuListVisible } from "reducers";
const mapStateToProps = (state: AppState): {} => {
    const selectedText = reducers.getSelectedText(state);
return {
        selectedText,   
        textListIsVisible: getTextListVisible(state),
        menuListIsVisible: getMenuListVisible(state),
        accountOverlayVisible: getAccountOverlayVisible(state),
    };
};


const mergeProps = (stateProps, dispatchProps, ownProps) => {
    const navigationButtonClicked= () => {
     dispatchProps.dispatch(
        actions.changedTextListVisible(!stateProps.textListIsVisible)
    ); 
} 
const menuButtonClicked= () => {
    dispatchProps.dispatch(
        actions.changedMenuListVisible(!stateProps.menuListIsVisible)
    );
   
};

return {
    ...ownProps,
    ...stateProps,
    navigationButtonClicked,
    menuButtonClicked
};
}

const TextDetailHeadingContainer = connect(mapStateToProps, null,mergeProps)(
    TextDetailHeading
);

export default TextDetailHeadingContainer;
