// @flow
import React from "react";
import { connect } from "react-redux";
import TextDetail from "./TextDetail";
import * as actions from "actions";
import * as reducers from "reducers";
import AnnotatedText from "lib/AnnotatedText";
import * as TextStore2 from "state_helpers/TextStore2";


const mapStateToProps = (state: AppState): {} => {
    let selectedWitness= {};
    let annotatedText = null;
    let workingWitness;
    let textFontSize = reducers.getTextFontSize2(state);
   let selectedText = reducers.getSelectedText2(state);

    if (selectedText) {
        workingWitness = reducers.getWorkingWitness2(state, selectedText.id);
        let selectedWitnessId = reducers.getSelectedTextWitnessId(
            state,
            selectedText.id
        );
        if (selectedWitnessId) {
            selectedWitness =reducers.getWitness(state, selectedWitnessId);
      
        }
        if (!selectedWitness) {
            selectedWitness = workingWitness;
        }
   
    }
     annotatedText = TextStore2.getWitnessText(state, selectedWitness.id);
    
    return {
        text: selectedText,
        textFontSize,
        annotatedText,
        selectedWitness,

    };
   
};


const mergeProps = (stateProps, dispatchProps, ownProps) => {
   
const { dispatch } = dispatchProps;

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

