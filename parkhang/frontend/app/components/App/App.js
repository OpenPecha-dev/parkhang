// @flow
import React from "react";
import { connect } from "react-redux";
import classnames from "classnames";
import SplitPane from "react-split-pane";
import { withLDConsumer } from "launchdarkly-react-client-sdk";
import HeaderContainer from "components/Header";
import TextsSearchContainer from "components/TextsSearch/TextsSearchContainer";
import TextListContainer from "containers/TextListContainer";
import TextDetailContainer from "components/TextDetail/TextDetailContainer";
import TextFilterContainer from "components/TextFilter/TextFilterContainer";
import TextListTabContainer from "components/TextList/TextListTabContainer";
import type { AppState } from "reducers";
import * as actions from "actions";
import * as constants from "app_constants";

import styles from "./App.css";
import headerStyles from "components/Header/Header.css";
import filterStyles from "components/TextFilter/TextFilter.css";
import utilStyles from "css/util.css";

import { handleKeyDown } from "../../shortcuts";

type Props = {
    title: string,
    textListIsVisible: boolean,
    textListWidth: number,
    state: AppState,
    dispatch: (action: actions.Action) => void,
    onChangedTextWidth: (width: number) => void,
    onChangedTextListVisible: (isVisible: boolean) => void
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
    if(props.flags.showFilterOptionParkhang){
     bodyHeight = "calc(100vh - "+headerStyles?.headerHeight+" - "+filterStyles?.filterHeight+" )";
     }
     else{
     bodyHeight="calc(100vh - "+headerStyles.headerHeight+")";

     }
     
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
            <HeaderContainer />
            {props.flags.showFilterOptionParkhang && <TextFilterContainer/>}
      
            <div className={classnames(styles.interface, utilStyles.flex)}>
                <SplitPane
                    split="vertical"
                    minSize={minSize}
                    defaultSize={defaultSize}
                    size={size}
                    paneStyle={{
                        display: "flex"
                    }}
                    style={{
                        height: bodyHeight
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
                        <TextsSearchContainer />
                        <TextListContainer />
                    </div>
                      <TextDetailContainer />
                </SplitPane>
            </div>
        </div>
    );
};

export default withLDConsumer()(App);
