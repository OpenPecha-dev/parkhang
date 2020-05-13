// @flow
import React from "react";
import { connect } from "react-redux";
import classnames from "classnames";
import { getUser, getActiveLocale } from "reducers";
import styles from "./Header.css";
import User from "lib/User";
import type { AppState } from "reducers";
import { FormattedMessage, injectIntl } from "react-intl";
import LocaleSwitcher from "components/LocaleSwitcher/LocaleSwitcher";
import NavigationButton from "components/UI/NavigationButton";
import AccountButton from "./AccountButton";
import AccountOverlay from "./AccountOverlay";
import { getTextListVisible, getAccountOverlayVisible } from "reducers";
import * as actions from "actions";

type LoginProps = {
    successRedirect: string,
    csrfToken: string
};

export const LoginControls = (props: LoginProps) => (
    <div className={classnames(styles.notLoggedIn, styles.controls)}>
        <form method="post" action="/discourse/login_redirect/">
            <button
                className={classnames(styles.loginButton)}
                type="submit"
            >
                <FormattedMessage id="header.login" />
            </button>
            <input type="hidden" name="csrfmiddlewaretoken" value={props.csrfToken} />
            <input type="hidden" name="success_redirect" value={props.successRedirect} />
        </form>
        <div className={classnames(styles.signUp, styles.buttonLink)}>
            <a href="/accounts/signup/">
                <FormattedMessage id="header.signUp" />
            </a>
        </div>
    </div>
);

type LoggedInControlsProps = {
    user: User,
    overlayVisible: boolean,
    accountButtonClicked: () => void
};

export const LoggedInControls = (props: LoggedInControlsProps) => (
    <div className={styles.controls}>
        <AccountButton
            name={props.user.name}
            onClick={props.accountButtonClicked}
        />
        {props.overlayVisible && (
            <AccountOverlay top={60} right={0} user={props.user} />
        )}
    </div>
);

type HeaderProps = {
    user: User,
    activeLocale: string,
    accountOverlayVisible: boolean,
    navigationButtonClicked: () => void,
    intl: { formatMessage: ({ [id: string]: string }) => string },
    accountButtonClicked: () => void,
    successRedirect: string,
    csrfToken: string
};

export const Header = (props: HeaderProps) => {
    let controls = null;
    if (props.user.isLoggedIn) {
        controls = (
            <LoggedInControls
                user={props.user}
                overlayVisible={props.accountOverlayVisible}
                accountButtonClicked={props.accountButtonClicked}
            />
        );
    } else {
        controls = <LoginControls 
                    successRedirect={props.successRedirect} 
                    csrfToken={props.csrfToken}
                    />;
    }

    let toggleTitle = props.intl.formatMessage({
        id: "header.toggleTextList"
    });

    return (
        <header className={styles.header}>
            <NavigationButton
                onClick={props.navigationButtonClicked}
                className={styles.navigationButton}
                title={toggleTitle}
            />
            <p>
                <FormattedMessage id="header.title" key={props.activeLocale} />
            </p>
            <LocaleSwitcher />
            {controls}
        </header>
    );
};

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

const HeaderContainer = connect(
    mapStateToProps,
    null,
    mergeProps
)(Header);

export default injectIntl(HeaderContainer);
