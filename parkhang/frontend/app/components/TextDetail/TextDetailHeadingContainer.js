// @flow
import React from "react";
import { connect } from "react-redux";
import TextDetailHeading from "./TextDetailHeading";
import * as actions from "actions";
import * as reducers from "reducers";
import type { AppState } from "reducers";
import { getTextListVisible, getAccountOverlayVisible } from "reducers";



const mapStateToProps = (state: AppState): {} => {
    const selectedText = reducers.getSelectedText(state);
    const selectedText2 = reducers.getSelectedText2(state);
    let witnesses = [];
    let exportingWitness = false;
    let selectedWitness;
    let selectedWitness2;

    if (selectedText) {
        witnesses = reducers.getTextWitnesses(state, selectedText.id);
        const selectedWitnessId = reducers.getSelectedTextWitnessId(
            state,
            selectedText.id
        );
        if (selectedWitnessId) {
            selectedWitness = reducers.getWitness(state, selectedWitnessId);
            exportingWitness = reducers.getExportingWitness(
                state,
                selectedWitnessId
            );
        } else {
            selectedWitness = reducers.getWorkingWitness(
                state,
                selectedText.id
            );
        }
    }

    if (selectedText2) {
        witnesses = reducers.getTextWitnesses2(state, selectedText2.id);
        const selectedWitnessId2 = reducers.getSelectedTextWitnessId2(
            state,
            selectedText2.id
        );
        if (selectedWitnessId2) {
            selectedWitness2 = reducers.getWitness2(state, selectedWitnessId2);
        } else {
            selectedWitness2 = reducers.getWorkingWitness(
                state,
                selectedText2.id
            );
        }
    }

    let textFontSize = reducers.getTextFontSize(state);
    
    return {
        witnesses,
        selectedText,  
        selectedText2,   
        selectedWitness,
        selectedWitness2,
        textListIsVisible: getTextListVisible(state),
        accountOverlayVisible: getAccountOverlayVisible(state),
        textFontSize,
        isSecondWindowOpen:reducers.isSecondWindowOpen(state),
        exportingWitness,

    };
};


const mergeProps = (stateProps, dispatchProps, ownProps) => {
    const navigationButtonClicked= () => {
     dispatchProps.dispatch(
        actions.changedTextListVisible(!stateProps.textListIsVisible)
    ); 
} 

const { dispatch } = dispatchProps;
const { selectedText } = stateProps;

return {
    ...ownProps,
    ...stateProps,
    navigationButtonClicked,
    onSelectedWitness: (witness: Witness) => {
        dispatch(actions.selectedTextWitness(selectedText.id, witness.id));
    },
    onChangedFontSize: (fontSize: number) => {
        dispatch(actions.changedTextFontSize(fontSize));
    },
    onChangeWindowOpen: (data: boolean) => {
        dispatch(actions.toggleSecondWindow(data));
    },
    onExport: () => {
            dispatch(actions.exportWitness(stateProps.selectedWitness.id, "docx"));
        },
    navigationButtonClicked: () => {
            dispatch(
                actions.changedTextListVisible(!stateProps.textListIsVisible)
            );
        }
};
}

const TextDetailHeadingContainer = connect(mapStateToProps, null,mergeProps)(
    TextDetailHeading
);

export default TextDetailHeadingContainer;
