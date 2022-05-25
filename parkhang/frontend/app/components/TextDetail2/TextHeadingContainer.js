// @flow
import React from "react";
import { connect } from "react-redux";
import { batchActions } from "redux-batched-actions";
import TextHeading from "./TextHeading";
import type { Props } from "./TextHeading";
import {
    selectedTextWitness,
    changedActiveAnnotation,
    exportWitness,
    changedShowPageImages,
    changedTextFontSize
} from "actions";
import * as reducers from "reducers";
import Witness from "lib/Witness";
import type { AppState } from "reducers";

const mapStateToProps = (state: AppState): {} => {
    const selectedText = reducers.getSelectedText(state);
    let witnesses = [];
    let exportingWitness = false;
    let selectedWitness;
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
    let showPageImages = reducers.showPageImages(state);
    let textFontSize = reducers.getTextFontSize(state);

    return {
        witnesses,
        selectedText,
        selectedWitness,
        exportingWitness,
        showPageImages,
        textFontSize
    };
};

const mergeProps = (stateProps: Props, dispatchProps, ownProps): {} => {
    const { dispatch } = dispatchProps;
    const { selectedText } = stateProps;
    return {
        ...stateProps,
        ...ownProps,
        onToggledPageImages: (showImages: boolean) => {
            dispatch(changedShowPageImages(showImages));
        },
        onChangedFontSize: (fontSize: number) => {
            dispatch(changedTextFontSize(fontSize));
        },
        onSelectedWitness: (witness: Witness) => {
            dispatch(selectedTextWitness(selectedText.id, witness.id));
        },
        onExport: () => {
            dispatch(exportWitness(stateProps.selectedWitness.id, "docx"));
        }
    };
};

const TextHeadingContainer = connect(mapStateToProps, null, mergeProps)(
    TextHeading
);

export default TextHeadingContainer;
