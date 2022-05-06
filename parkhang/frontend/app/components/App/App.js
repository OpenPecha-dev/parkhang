// @flow
import React,{useState,useEffect} from "react";
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

import flagsmith from 'flagsmith';
import { useFlags, useFlagsmith } from 'flagsmith/react';
import isOnline from 'helper/checkOnlineStatus'
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
    const [online,setOnline]=useState(true);
    useEffect(()=>{
window.addEventListener('online',()=>{
    setOnline(true);
});

window.addEventListener('offline',()=>{
    setOnline(false);
});
   return ()=>{
    window.removeEventListener('online')
    window.removeEventListener('offline ')
}
    },[])
    // isOnline().then(data=>setOnline(true)).catch(err=>setOnline(false));
    const flags = useFlags(['toggle_filter','navbar_parkhang','header_logo','show_sidemenu']);

   let toggle_filter = flags.toggle_filter.enabled
   let navbar_parkhang = flags.navbar_parkhang.enabled
   let header_logo=flags.header_logo.enabled
   let show_sidemenu=flags.show_sidemenu.enabled
    if(!online){
         toggle_filter = true;
         navbar_parkhang = true;
         header_logo=true;
         show_sidemenu=true;    
     }
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
    if (toggle_filter) {
        bodyHeight =
            "calc(100vh - " +
            headerStyles?.headerHeight +
            " - " +
            filterStyles?.filterHeight +
            " )";
    }
    if (!navbar_parkhang) {
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
            {navbar_parkhang && <HeaderContainer />}
            {/* {online?<p>online</p> : <p>offline</p>} */}
            {toggle_filter && <TextFilterContainer />}

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
                        {header_logo && (
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
               {show_sidemenu ? <SplitPane
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
                    </SplitPane>: <TextDetailContainer />}
                </SplitPane>
            </div>
        </div>
    );
};

export default App;
