// @flow
import React,{useState,useEffect} from "react";
import classnames from "classnames";
import SplitPane, { Pane } from "react-split-pane";
import HeaderContainer from "components/Header";
import TextsSearchContainer from "components/TextsSearch/TextsSearchContainer";
import TextListContainer from "containers/TextListContainer";
import TextDetailContainer from "components/TextDetail/TextDetailContainer";
import TextListTabContainer from "components/TextList/TextListTabContainer";
import type { AppState } from "reducers";
import * as actions from "actions";
import * as constants from "app_constants";
import lopenlingLogo from "images/lopenling_logo.png";

import styles from "./App.css";
import headerStyles from "components/Header/Header.css";
import utilStyles from "css/util.css";

import { handleKeyDown } from "../../shortcuts";
import SideMenuContainer from "../SideMenu/SideMenuContainer";
import { useFlags } from 'flagsmith/react';

import Main from 'bodyComponent/Main'
import isOnline from 'helper/checkOnlineStatus'
import Resources from 'components/Resources'
import {useActive} from '../UI/activeHook'
import { history as his} from 'redux-first-router'
import Search from 'bodyComponent/Search'


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
    const [online,setOnline]=useState(false);
    const isActive=useActive(3000)
    const history=his();
    const path=history.location.pathname;
    const isSearchActive=path.includes('/search/');
    useEffect(()=>{
        isOnline().then(data=>setOnline(true)).catch(err=>setOnline(false))
    },[])

    let SelectedText=   props.state?.ui?.selectedText
   
    if(!SelectedText){
         setTitle('Parkhang')
     }
   
    const  flags = useFlags(['navbar_parkhang','toggle_mainpage']);
   let navbar_parkhang;
   let toggle_mainpage;
    if(online){
        
         navbar_parkhang = flags?.navbar_parkhang?.enabled
         toggle_mainpage=flags?.toggle_mainpage?.enabled
     }
     else{
        navbar_parkhang = true
        toggle_mainpage=true
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
          {isSearchActive ? <Search/> : (SelectedText !== null) ? <Editor props={props}/> : <Main/>} 
        </div>
    );
};


const Editor=({props})=>{
    const [online,setOnline]=useState(false);
    isOnline().then(data=>setOnline(true)).catch(err=>setOnline(false));
    const flags = useFlags(['navbar_parkhang']);
   
   let navbar_parkhang = true;
   if(online){
    navbar_parkhang = flags?.navbar_parkhang?.enabled
}
    let textListClassnames = [styles.listContainer];
    let bodyHeight;
    let minSize = constants.MIN_TEXT_LIST_WIDTH;
    let defaultSize = constants.DEFAULT_TEXT_LIST_WIDTH;
    let size = props.textListWidth;
    if (props.textListIsVisible) {
        textListClassnames.push(styles.showListContainer);
    } else {
        size = 0;
        textListClassnames.push(styles.hideListContainer);
    }
    if (!navbar_parkhang) {
        bodyHeight = "calc(100vh)";
    } else {
        bodyHeight = "calc(100vh - " + headerStyles.headerHeight + ")";
    }
    const image_location = lopenlingLogo;
    return (
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
             
                <Resources/>
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
    )
}


export default App;
