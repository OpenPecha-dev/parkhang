// @flow
import React from "react";
import { connect } from "react-redux";
import { getUser, getActiveLocale } from "reducers";
import User from "lib/User";
import type { AppState } from "reducers";
import { getTextListVisible, getAccountOverlayVisible , getMenuListVisible } from "reducers";
import * as actions from "actions";
import SideMenu from "./SideMenu";
import * as reducers from "reducers";

const mapStateToProps = (state: AppState): { user: User } => {
    const selectedText = reducers.getSelectedText(state);
    const user = getUser(state);
    const activeLocale = getActiveLocale(state);
    const successRedirect = document.location.pathname;
    // TODO: move global CSRF_TOKEN into redux
    const csrfToken = CSRF_TOKEN;
    let exportingWitness = false;
    let witnesses = [];
    let textFontSize = reducers.getTextFontSize(state);
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
    return {
        user: user,
        activeLocale: activeLocale,
        textListIsVisible: getTextListVisible(state),
        menuListIsVisible: getMenuListVisible(state),
        accountOverlayVisible: getAccountOverlayVisible(state),
        successRedirect: successRedirect,
        csrfToken: csrfToken,
        exportingWitness,
        witnesses,
        selectedText,
        selectedWitness,
        textFontSize,
        showPageImages

    };
};

const mergeProps = (stateProps, dispatchProps, ownProps) => {
    const { dispatch } = dispatchProps;
    return {
        ...ownProps,
        ...stateProps,
        navigationButtonClicked: () => {
            dispatchProps.dispatch(
                actions.changedTextListVisible(!stateProps.textListIsVisible)
            );
        },
        accountButtonClicked: () => {
            dispatchProps.dispatch(
                actions.changedAccountOverlay(!stateProps.accountOverlayVisible)
            );
        },
        onToggledPageImages: (showImages: boolean) => {
            dispatch(actions.changedShowPageImages(showImages));
        },
        onExport: () => {
            dispatch(actions.exportWitness(stateProps.selectedWitness.id, "docx"));
        },
        onChangedFontSize: (fontSize: number) => {
            dispatch(actions.changedTextFontSize(fontSize));
        },
        accountButtonClicked: () => {
            dispatchProps.dispatch(
                actions.changedAccountOverlay(!stateProps.accountOverlayVisible)
            );
        }

    };
};

const SideMenuContainer = connect(
    mapStateToProps,
    null,
    mergeProps
)(SideMenu);

export default SideMenuContainer;
