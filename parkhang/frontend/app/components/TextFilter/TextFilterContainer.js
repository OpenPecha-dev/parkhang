// @flow
import React from "react";
import { connect } from "react-redux";
import TextFilter from "./TextFilter";
import type { Props } from "./TextFilter";
import * as actions from "actions";
import { getSelectedText } from "reducers";


import {
} from "actions";
import type { AppState } from "reducers";

const mapStateToProps = (state: AppState): {} => {
    let texts = state.data.texts;
    return {
        texts,
       selectedText:getSelectedText(state)
    };
};

const mapDispatchToProps = dispatch => {
    return {
        onSelectedText: (text: api.TextData) => {
            dispatch(actions.selectedText(text));
        },
        onAuthorChange: (filterId: api.TextData)=>{
            dispatch(actions.filterText(filterId));
        }
    };
};

const TextFilterContainer = connect(mapStateToProps, mapDispatchToProps)(
    TextFilter
);

export default TextFilterContainer;
