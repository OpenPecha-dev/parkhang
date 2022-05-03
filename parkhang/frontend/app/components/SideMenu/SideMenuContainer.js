// @flow
import React from "react";
import { connect } from "react-redux";
import { getUser, getActiveLocale } from "reducers";
import User from "lib/User";
import type { AppState } from "reducers";
import { getTextListVisible, getAccountOverlayVisible , getMenuListVisible } from "reducers";
import * as actions from "actions";
import SideMenu from "./SideMenu";

const mapStateToProps = (state: AppState): { user: User } => {
    const user = getUser(state);
    const activeLocale = getActiveLocale(state);
    const successRedirect = document.location.pathname;
    // TODO: move global CSRF_TOKEN into redux
    const csrfToken = CSRF_TOKEN;

    return {
        user: user,
        activeLocale: activeLocale,
        textListIsVisible: getTextListVisible(state),
        menuListIsVisible: getMenuListVisible(state),
        accountOverlayVisible: getAccountOverlayVisible(state),
        successRedirect: successRedirect,
        csrfToken: csrfToken
    };
};

const mergeProps = (stateProps, dispatchProps, ownProps) => {
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
        }
    };
};

const SideMenuContainer = connect(
    mapStateToProps,
    null,
    mergeProps
)(SideMenu);

export default SideMenuContainer;
