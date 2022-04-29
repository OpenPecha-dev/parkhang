import React from "react";
import { connect } from "react-redux";
import { withLDProvider } from 'launchdarkly-react-client-sdk';
import * as reducers from "reducers";
import * as actions from "actions";
import App from "components/App";

const mapStateToProps = state => {
    return {
        title: reducers.getTranslation(state, "header.title"),
        textListIsVisible: reducers.getTextListVisible(state),
        textListWidth: reducers.getTextListWidth(state),
        state: state
    };
};

const matchDispatchToProps = dispatch => {
    return {
        onChangedTextWidth: (width: number) => {
            dispatch(actions.changedTextListWidth(width));
        },
        onChangedTextListVisible: (isVisible: boolean) => {
            dispatch(actions.changedTextListVisible(isVisible));
        },
        dispatch
    };
};

const AppContainer = connect(mapStateToProps, matchDispatchToProps)(App);
let clientId=process.env.NODE_ENV==='development'?'6269293a03fba314f6ecebb5':'6269293a03fba314f6ecebb6';
export default withLDProvider({
    clientSideID: clientId,
    user: {
        "key": "tenkus47",
        "name": "tenkus47",
        "email": "tenkus@esukhia.org"
    }
  })(AppContainer);
