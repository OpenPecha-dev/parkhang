// @flow
import React from "react";
import classnames from "classnames";
import Loader from "react-loader";
import AnnotationControlsContainer from "./AnnotationControlsContainer";
import SplitText from "lib/SplitText";
import Annotation from "lib/Annotation";
import Witness from "lib/Witness";
import AnnotatedText from "lib/AnnotatedText";
import lengthSplitter from "lib/text_splitters/lengthSplitter";
import positionSplitter from "lib/text_splitters/positionSplitter";
import headerStyles from "components/Header/Header.css";
import styles from "./TextDetail.css";
import utilStyles from "css/util.css";
import type { TextData } from "api";
import TextSegment from "lib/TextSegment";
import TextDetailHeadingContainer from "./TextDetailHeadingContainer";
import {
    Box,
    ClickAwayListener,
    Divider,
    Slide,
} from "components/UI/muiComponent";
import _ from "lodash";
import TableOfContent from "./TableOfContent/TableOfContent";
import AnnotationPortal from "./AnnotationProtal";
import SplitTextComponent from "components/TextDetail/SplitText";

export type Props = {
    condition: Boolean,
    paginated: boolean,
    pageImagesVisible: boolean,
    text: TextData | null,
    loading: boolean,
    pageBreaks: number[],
    annotatedText: AnnotatedText,
    annotations: Annotation[],
    activeAnnotations: Annotation[],
    activeAnnotation: Annotation | null,
    didSelectSegmentIds: (segmentIds: string[]) => void,
    selectedSegmentId: (segmentId: string) => void,
    annotationPositions: { [string]: Annotation[] },
    selectedAnnotatedSegments: Array<TextSegment | number>,
    textListVisible: boolean,
    imagesBaseUrl: string,
    selectedWitness: Witness | null,
    selectedSearchResult: {
        textId: number,
        start: number,
        length: number,
    } | null,
    searchValue: string | null,
    fontSize: number,
    isSecondWindowOpen: Boolean,
    imageData: {},
    isPanelLinked: boolean,
    isPanelVisible: Boolean,
    changeSyncIdOnClick: () => void,
    changeScrollToId: () => void,
    changeSelectedImage: () => void,
    closeAnnotation: () => void,
    textAlignment: [],
    textAlignmentById: {},
    selectedWindow: Number,
    changeSelectedWindow: () => void,
    changeSelectedRange: [],
    scrollToId: {},
    selectedSourceRange: [],
    selectedTargetRange: [],
    searchResults: [],
    changeShowTableContent: () => void,
    showTableContent: Boolean,
    imageScrollId: {},
    MediaInterval: {},
    isAnnotating: Boolean,
};

let textDetailId = 0;

class TextDetail extends React.Component<Props> {
    key: number;
    ref;
    selectedWindow;
    constructor() {
        super();
        this.key = textDetailId++;
        this.ref = React.createRef();
        this.selectedWindow = null;
    }

    mouseEnter() {
        if (this.selectedWindow === 2 && this.props.text.name)
            this.props.changeSelectedWindow(1);
    }
    componentDidMount() {
        this.ref.current.addEventListener(
            "mouseenter",
            this.mouseEnter.bind(this)
        );
    }
    componentDidUpdate() {
        this.selectedWindow = this.props.selectedWindow;
    }

    render() {
        let text = {
            name: "",
        };
        if (this.props.text) {
            text = this.props.text;
        }
        let inlineControls = false;
        let textComponent = null;
        let splitText = null;
        if (
            !this.props.annotatedText ||
            !this.props.text ||
            this.props.loading
        ) {
            textComponent = <div key={this.key} />;
        } else {
            let limitWidth = false;
            let splitter;
            if (this.props.paginated) {
                splitter = positionSplitter(this.props.pageBreaks);
            } else {
                splitter = lengthSplitter(1000, /^།[\s]+(?!།[\s]+)/, 2, 5);
            }
            splitText = new SplitText(this.props.annotatedText, splitter);

            inlineControls = true;
            textComponent = (
                <SplitTextComponent
                    splitText={splitText}
                    annotations={this.props.annotations}
                    activeAnnotations={this.props.activeAnnotations}
                    activeAnnotation={this.props.activeAnnotation}
                    limitWidth={limitWidth}
                    didSelectSegmentIds={this.props.didSelectSegmentIds}
                    selectedSegmentId={this.props.selectedSegmentId}
                    annotationPositions={this.props.annotationPositions}
                    selectedAnnotatedSegments={
                        this.props.selectedAnnotatedSegments
                    }
                    isAnnotating={this.props.isAnnotating}
                    syncIdOnClick={this.props.syncIdOnClick}
                    textListVisible={this.props.textListVisible}
                    showImages={this.props.pageImagesVisible}
                    imagesBaseUrl={this.props.imagesBaseUrl}
                    selectedWitness={this.props.selectedWitness}
                    key={this.key}
                    selectedSearchResult={this.props.selectedSearchResult}
                    searchValue={this.props.searchValue}
                    fontSize={this.props.fontSize}
                    isSecondWindowOpen={this.props.isSecondWindowOpen}
                    changeScrollToId={this.props.changeScrollToId}
                    changeSyncIdOnClick={this.props.changeSyncIdOnClick}
                    imageData={this.props.imageData}
                    isPanelLinked={this.props.isPanelLinked}
                    selectedImage={this.props.selectedImage}
                    changeSelectedImage={this.props.changeSelectedImage}
                    closeAnnotation={this.props.closeAnnotation}
                    textAlignment={this.props.textAlignment}
                    textAlignmentById={this.props.textAlignmentById}
                    isPanelVisible={this.props.isPanelVisible}
                    scrollToId={this.props.scrollToId}
                    selectedWindow={this.selectedWindow}
                    selectedSourceRange={this.props.selectedSourceRange}
                    selectedTargetRange={this.props.selectedTargetRange}
                    changeSelectedRange={this.props.changeSelectedRange}
                    searchResults={this.props.searchResults}
                    showTableContent={this.props.showTableContent}
                    selectedText={this.props.text}
                    condition={this.props.condition}
                    selectedMedia={this.props.selectedMedia}
                    MediaInterval={this.props.MediaInterval}
                />
            );
        }
        let textComponents = [textComponent];
        return (
            <Box
                sx={{
                    bgcolor: "heading.main",
                    color: "texts.main",
                }}
                className={classnames(
                    styles.textDetail,
                    utilStyles.flex,
                    utilStyles.flexColumn
                )}
                key={this.key}
                ref={this.ref}
            >
                <TextDetailHeadingContainer />
                <Divider />
                <Loader loaded={!this.props.loading} zIndex={5} />
                <Box
                    style={{
                        display: "flex",
                        height: "100%",
                        width: "100%",
                    }}
                >
                    <Box
                        className={classnames(
                            styles.textContainer,
                            utilStyles.flex
                        )}
                    >
                        {!this.props.loading ? textComponents : <div />}
                    </Box>

                    <Slide
                        direction="left"
                        in={this.props.showTableContent}
                        container={this.ref.current}
                        unmountOnExit
                        mountOnEnter
                    >
                        <Box
                            sx={{
                                position: "absolute",
                                height: "100%",
                                minWidth: "50%",
                                right: 0,
                            }}
                        >
                            <TableOfContent />
                        </Box>
                    </Slide>
                </Box>
                <AnnotationPortal />
            </Box>
        );
    }
}

export default TextDetail;
