// @flow
import React from "react";
import { connect } from "react-redux";
import TextsSearch from "./TextsSearch";
import { changedSearchValue } from "actions";
import type { AppState } from "reducers";

const mapStateToProps = (state: AppState) => {
    return {
        searchValue: state.ui.searchValue
    };
};

const mergeProps =(stateProps: Props, dispatchProps, ownProps) => {
    const { dispatch } = dispatchProps;
    const { selectedText } = stateProps;
    return {
        searchChanged: (searchTerm: string) => {
            dispatch(changedSearchValue(searchTerm));
        }
    };
};

const TextsSearchContainer = connect(mapStateToProps,null, mergeProps)(
    TextsSearch
);

export default TextsSearchContainer;
