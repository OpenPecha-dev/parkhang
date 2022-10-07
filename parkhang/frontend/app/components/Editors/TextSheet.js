import React, { useEffect, useRef, useState } from "react";
import { connect } from "react-redux";
import * as reducers from "reducers";
import * as actions from "actions";
import MediaComponent from "components/MediaComponent";
import { batchActions } from "redux-batched-actions";
import { Box, Divider } from "@mui/material";
import Loader from "react-loader";
import ErrorBoundary from "components/ErrorBoundary/ErrorBoundary";
import SplitPane from "react-split-pane";
import styles from "./resizerStyle.css";
import classnames from "classnames";
import TextDetailContainer2 from "components/TextDetail2/TextDetailContainer";
import TextDetailContainer from "components/TextDetail/TextDetailContainer";

function TextSheet(props) {
    let editorRef = useRef(null);
 

    return (
        <Box
            ref={editorRef}
            sx={{
                display: "flex",
                flexDirection: "column",
                // bgcolor: "#d4dde5",
                width: "100%",
                height: props.bodyHeight,
                position: "relative",
            }}
        >
            {/* <SplitPane
                defaultSize={props.Media.isPanelVisible ? "35vh" : 0}
                size={props.Media.isPanelVisible ? "35vh" : 0}
                split="horizontal"
                resizerClassName={classnames(styles.Resizer, styles.horizontal)}
                resizerStyle={{
                    display: !props.Media.isPanelVisible ? "none" : "block",
                }}
            >
                {props.Media.isPanelVisible ? <MediaComponent /> : <div />} */}
            <SplitPane
                size={
                    props.isSecondWindowOpen && props.selectedText
                        ? "50%"
                        : "50vw"
                }
                style={
                    !props.isSecondWindowOpen && {
                        marginLeft: "24%",
                        marginTop:'10px',
                    }
                }
                resizerStyle={{display:!props.isSecondWindowOpen ?'none':'block'}}
                onDragFinished={(width: number) => {
                    if (width > 0) window.dispatchEvent(new Event("resize"));
                }}
            >
                <ErrorBoundary>
                    <TextDetailContainer />
                </ErrorBoundary>
                    {props.isSecondWindowOpen && props.selectedText ? (
                <ErrorBoundary>
                        <TextDetailContainer2 />
                </ErrorBoundary>

                    ):<div/>}
            </SplitPane>
            {props.Media.isPanelVisible && (
                <ErrorBoundary>
                    <MediaComponent />
                </ErrorBoundary>
            )}
            {/* </SplitPane> */}
        </Box>
    );
}

const mapStateToProps = (state: AppState): { user: User } => {
    const isSecondWindowOpen = reducers.isSecondWindowOpen(state);
    const Media = reducers.getMediaData(state);
    const selectedText = reducers.getSelectedText(state);
    return {
        selectedText,
        isSecondWindowOpen,
        Media,
    };
};

const mergeProps = (stateProps, dispatchProps, ownProps) => {
    const { dispatch } = dispatchProps;

    return {
        ...ownProps,
        ...stateProps,
    };
};
const TextSheetContainer = connect(
    mapStateToProps,
    null,
    mergeProps
)(TextSheet);

export default TextSheetContainer;
