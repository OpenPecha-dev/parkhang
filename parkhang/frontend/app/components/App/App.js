// @flow
import React from "react";
import { connect } from "react-redux";
import classnames from "classnames";
import SplitPane, { Pane } from "react-split-pane";
import HeaderContainer from "components/Header";
import TextsSearchContainer from "components/TextsSearch/TextsSearchContainer";
import TextListContainer from "containers/TextListContainer";
import TextDetailContainer from "components/TextDetail/TextDetailContainer";
import TextFilterContainer from "components/TextFilter/TextFilterContainer";
import TextListTabContainer from "components/TextList/TextListTabContainer";
import type { AppState } from "reducers";
import * as actions from "actions";
import * as constants from "app_constants";
import lopenlingLogo from "images/lopenling_logo.png";

import styles from "./App.css";
import headerStyles from "components/Header/Header.css";
import filterStyles from "components/TextFilter/TextFilter.css";
import utilStyles from "css/util.css";

import { handleKeyDown } from "../../shortcuts";
import SideMenuContainer from "../SideMenu/SideMenuContainer";
import { withLDConsumer } from "launchdarkly-react-client-sdk";

type Props = {
    title: string,
    textListIsVisible: boolean,
    menuListIsVisible: Boolean,
    textListWidth: number,
    menuListWidth: Number,
    state: AppState,
    dispatch: (action: actions.Action) => void,
    onChangedTextWidth: (width: number) => void,
    onChangedTextListVisible: (isVisible: boolean) => void,
    onChangedMenuWidth: (width: number) => void,
    onChangedMenuListVisible: (isVisible: boolean) => void,
};

function setTitle(title: string) {
    document.title = title;
}

const App = (props: Props) => {
    setTitle(props.title);

    let textListClassnames = [styles.listContainer];

    let minSize = constants.MIN_TEXT_LIST_WIDTH;
    let defaultSize = constants.DEFAULT_TEXT_LIST_WIDTH;
    let size = props.textListWidth;
    if (props.textListIsVisible) {
        textListClassnames.push(styles.showListContainer);
    } else {
        size = 0;
        textListClassnames.push(styles.hideListContainer);
    }
    let bodyHeight;
    if (props.flags.showFilterOptionParkhang) {
        bodyHeight =
            "calc(100vh - " +
            headerStyles?.headerHeight +
            " - " +
            filterStyles?.filterHeight +
            " )";
    }
    if (!props.flags.NavbarParkhang) {
        bodyHeight = "calc(100vh)";
    } else {
        bodyHeight = "calc(100vh - " + headerStyles.headerHeight + ")";
    }
    const image_location = lopenlingLogo;

    return (
        <div
            className={classnames(
                styles.container,
                utilStyles.flex,
                utilStyles.flexColumn
            )}
            onKeyDown={(e: SyntheticKeyboardEvent<*>) => {
                handleKeyDown(e, props.state, props.dispatch);
            }}
        >
            {props.flags.navbarParkhang && <HeaderContainer />}
            {props.flags.showFilterOptionParkhang && <TextFilterContainer />}

            <div className={classnames(styles.interface, utilStyles.flex)}>
                <SplitPane
                    split="vertical"
                    minSize={minSize}
                    defaultSize={defaultSize}
                    size={size}
                    paneStyle={{
                        display: "flex",
                    }}
                    style={{
                        height: bodyHeight,
                    }}
                    onDragFinished={(width: number) => {
                        if (width > 0) {
                            props.onChangedTextWidth(width);
                            if (!props.textListIsVisible) {
                                props.onChangedTextListVisible(true);
                            }
                        }
                        window.dispatchEvent(new Event("resize"));
                    }}
                >
                    <div className={classnames(...textListClassnames)}>
                        {props.flags.headerLogoTextListParkhang && (
                            <div
                                className={styles.logo}
                                style={{
                                    marginLeft: 20,
                                    marginBottom: 30,
                                }}
                            >
                                <img src={image_location} height="30" />
                            </div>
                        )}
                        <TextsSearchContainer />
                        <TextListContainer />
                    </div>
                    <SplitPane
                        split="vertical"
                        resizerClassName={classnames(styles.resizer)}
                        minSize={"80vw"}
                        maxSize={"100vw"}
                        defaultSize={props.menuListIsVisible ? "96%" : "100%"}
                        paneStyle={{
                            display: "flex",
                        }}
                        onDragFinished={(width: number) => {
                            if (width > 0) {
                                props.onChangedMenuWidth(width);
                                if (!props.textListIsVisible) {
                                    props.onChangedMenuListVisible(true);
                                }
                            }
                            window.dispatchEvent(new Event("resize"));
                        }}
                    >
                        <TextDetailContainer />
                        <SideMenuContainer />
                    </SplitPane>
                </SplitPane>
            </div>
        </div>
    );
};

export default withLDConsumer()(App);
