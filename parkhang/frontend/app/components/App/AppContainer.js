import React from "react";
import { connect } from "react-redux";
import * as reducers from "reducers";
import * as actions from "actions";
import App from "components/App";
import { withLDProvider } from 'launchdarkly-react-client-sdk';

let user;

const mapStateToProps = state => {
    if(!state.user.userId===-1){
        user=state.user
    }
    return {
        title: reducers.getTranslation(state, "header.title"),
        textListIsVisible: reducers.getTextListVisible(state),
        menuListIsVisible: reducers.getMenuListVisible(state),
        textListWidth: reducers.getTextListWidth(state),
        menuListWidth: reducers.getMenuListWidth(state),
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
        onChangedMenuWidth: (width: number) => {
            dispatch(actions.changedMenuListWidth(width));
        },
        onChangedMenuListVisible: (isVisible: boolean) => {
            dispatch(actions.changedMenuListVisible(isVisible));
        },
        dispatch
    };
};

const AppContainer = connect(mapStateToProps, matchDispatchToProps)(App);

const environmentID= process.env.NODE_ENV==='development'?'6269293a03fba314f6ecebb5':'6269293a03fba314f6ecebb6';
     

export default withLDProvider({
    clientSideID:environmentID,
    user: {
        "key": "example_user",
        "name": "Example user",
        "email": "User@example.com"
    }
  })(AppContainer);
