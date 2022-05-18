// @flow
import React from "react";
import classnames from "classnames";

import SplitTextComponent from "components/TextDetail/SplitText";
import Loader from "react-loader";
import AnnotationControlsContainer from "./AnnotationControlsContainer";
import SplitText from "lib/SplitText";
import Annotation from "lib/Annotation";
import Witness from "lib/Witness";
import AnnotatedText from "lib/AnnotatedText";
import lengthSplitter from "lib/text_splitters/lengthSplitter";
import positionSplitter from "lib/text_splitters/positionSplitter";

import styles from "./TextDetail.css";
import utilStyles from "css/util.css";
import type { TextData } from "api";
import TextSegment from "lib/TextSegment";
import TextDetailHeadingContainer from "./TextDetailHeadingContainer";


export type Props = {
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
    menuListIsVisible:Boolean
};

let textDetailId = 0;

class TextDetail extends React.Component<Props> {
    key: number;

    constructor() {
        super();

        this.key = textDetailId++;
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
                    textListVisible={this.props.textListVisible}
                    showImages={this.props.pageImagesVisible}
                    imagesBaseUrl={this.props.imagesBaseUrl}
                    selectedWitness={this.props.selectedWitness}
                    key={this.key}
                    selectedSearchResult={this.props.selectedSearchResult}
                    searchValue={this.props.searchValue}
                    fontSize={this.props.fontSize}
                    editMenuVisible={this.props.menuListIsVisible}
                ></SplitTextComponent>
            );
        }

        let textComponents = [textComponent];

        return (
            <div
                style={{ height: "100vh" }}
                className={classnames(
                    styles.textDetail,
                    utilStyles.flex,
                    utilStyles.flexColumn
                )}
                key={this.key}
            >
                
                <TextDetailHeadingContainer />
                <Loader loaded={!this.props.loading} />
                <div
                    className={classnames(
                        styles.textContainer,
                        utilStyles.flex
                    )}
                >
                    {!this.props.loading ? textComponents : <div />}
                </div>        
            </div>
        );
    }
}

export default TextDetail;
