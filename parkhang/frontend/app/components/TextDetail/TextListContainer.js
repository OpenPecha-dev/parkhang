// @flow
import React from "react";
import { connect } from "react-redux";
import TextList from "./TextList";
import * as actions from "actions";
import { getSelectedText } from "reducers";
import type { AppState } from "reducers";
import * as api from "api";
import * as reducers from "reducers";
import { batchActions } from "redux-batched-actions";

const mapStateToProps = (state: AppState) => {
    const searchValue = reducers.getSearchValue(state);
    const searchResults = reducers.getSearchResults(state, searchValue);
    const selectedSearchResult = reducers.getSelectedSearchResult(state);
    // TODO: display search results or spinner depending on when anything
    // returned

    let searching = false;
    let texts = state.data.texts;
    if (searchValue.length > 0) {
        if (searchResults === null) {
            searching = true;
            texts = [];
        } else {
            texts = texts.filter(text => searchResults.hasOwnProperty(text.id));
        }
    }

    return {
        texts: texts,
        selectedText: getSelectedText(state),
        searchTerm: searchValue,
        searchResults,
        selectedSearchResult,
        searching
    };
};

const mapDispatchToProps = dispatch => {
    return {
        onSelectedText: (text: api.TextData) => {
            dispatch(actions.selectedText(text));
        }
        
    };
};

const TextListContainer = connect(mapStateToProps, mapDispatchToProps)(
    TextList
);

export default TextListContainer;
