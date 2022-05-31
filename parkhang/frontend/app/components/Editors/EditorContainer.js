import React from 'react'
import TextsSearchContainer from "components/TextsSearch/TextsSearchContainer";
import TextListContainer from "containers/TextListContainer";
import TextListTabContainer from "components/TextList/TextListTabContainer";
import * as constants from "app_constants";
import lopenlingLogo from "images/lopenling_logo.png";
import SideMenuContainer from "../SideMenu/SideMenuContainer";
import headerStyles from "components/Header/Header.css";
import Resources from 'components/Resources'
import isMobile from 'bodyComponent/utility/isMobile'
import SplitPane, { Pane } from "react-split-pane";
import { useFlags } from 'flagsmith/react';
import styles from "./EditorContainer.css";
import classnames from "classnames";
import utilStyles from "css/util.css";
import TextSheet from './TextSheet';

const Editor=({props})=>{
   
    const flags = useFlags(['navbar_parkhang']);
   
   let navbar_parkhang = flags?.navbar_parkhang?.enabled

    let textListClassnames = [styles.listContainer];
    let bodyHeight;
    let minSize = constants.MIN_TEXT_LIST_WIDTH;
    let maxSize = constants.MAX_TEXT_LIST_WIDTH;

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
if( isMobile.any() ) return <div style={{height:'100%',width:'100wh',fontSize:30,fontWeight:"bold" ,display:'flex',placeItems:'center',margin:'0 auto'}}>please open in a PC browser</div> 
    
return (
        <div className={classnames(styles.interface, utilStyles.flex)}>
        <SplitPane
            split="vertical"
            minSize={minSize}
            maxSize={maxSize}
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
                {/* <TextsSearchContainer />
                <TextListContainer />  */}
            </div>
       {/* <SplitPane
                split="vertical"
                resizerClassName={classnames(styles.resizer)}
                minSize={"96vw"}
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
            > */}
                <TextSheet/>
                {/* <SideMenuContainer />
            </SplitPane> */}
        </SplitPane>
    </div>
    )

}

export default Editor;