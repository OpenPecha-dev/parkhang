// @flow
import * as React from "react";
import ReactDOM from "react-dom";
import { AutoSizer } from "react-virtualized/dist/es/AutoSizer";
import { List } from "react-virtualized/dist/es/List";
import {
    CellMeasurer,
    CellMeasurerCache
} from "react-virtualized/dist/es/CellMeasurer";
import "react-virtualized/styles.css";
import Text from "./Text";
import SplitText from "lib/SplitText";
import styles from "./SplitText.css";
import _ from "lodash";
import TextSegment from "lib/TextSegment";
import Witness from "lib/Witness";
import GraphemeSplitter from "grapheme-splitter";



export type Props = {
    splitText: SplitText,
    didSelectSegmentIds: (segmentIds: string[]) => void,
    limitWidth: boolean,
    selectedAnnotatedSegments: Array<TextSegment | number>,
    selectedSegmentId: (segmentId: string) => void,
    selectedWitness: Witness | null,
    // selectedSearchResult: {
    //     textId: number,
    //     start: number,
    //     length: number
    // } | null,
    // searchValue: string | null,
    fontSize: number,
};

export default class SplitTextComponent extends React.PureComponent<Props> {
    list: List | null;
    splitText: HTMLDivElement | null;
    cache: CellMeasurerCache;
    rowRenderer: (params: {
        key: string,
        index: number,
        parent: {},
        style: {}
    }) => React.Element<CellMeasurer>;
    resizeHandler: () => void;
    selectionHandler: (e: Event) => void;
    textListVisible: boolean;
    editMenuVisible:Boolean;
    activeSelection: Selection | null;
    selectedNodes: Node[] | null;
    // Whether the mouse button is down
   
    selectedTextIndex: number | null;
    splitTextRect: ClientRect | null;
    firstSelectedSegment: TextSegment | null;
    selectedElementId: string | null;
    selectedElementIds: string[] | null;

    constructor(props: Props) {
        super(props);

        this.list = null;
        this.splitText = null;
        this.cache = new CellMeasurerCache({
            fixedWidth: true,
            defaultHeight: 300
        });
        this.rowRenderer = this.rowRenderer.bind(this);
        this.activeSelection = null;
        this.selectedNodes = null;
        this._mouseDown = false;
        this._activeWitness = null;
        this._didSetInitialScrollPosition = false;
        this._modifyingSelection = false;
        this.imageHeight = null;
        this.imageWidth = null;
        this.calculatedImageHeight = null;
        
        // this.processProps(props);
    }

    // updateList(
    //     resetCache: boolean = true,
    //     resetRows: number | number[] | null = null
    // ) {
    //     if (
    //         this.props.showImages &&
    //         !this.calculatedImageHeight &&
    //         this.imageHeight &&
    //         this.imageWidth
    //     ) {
    //         this.calculatedImageHeight = this.calculateImageHeight();
    //     }
    //     if (this.list) {
    //         const list = this.list;
    //         if (resetCache) {
    //             if (resetRows !== null) {
    //                 if (!Array.isArray(resetRows)) {
    //                     this.cache.clear(resetRows);
    //                 } else if (Array.isArray(resetRows)) {
    //                     for (let i = 0; i < resetRows.length; i++) {
    //                         let resetRow = resetRows[i];
    //                         this.cache.clear(resetRow);
    //                     }
    //                 }
    //             } else {
    //                 this.cache.clearAll();
    //                 list.measureAllRows();
    //                 list.recomputeRowHeights(0);
    //             }
    //         }
    //         list.forceUpdateGrid();
    //     }
    // }




    // shouldResetListCache(oldProps: Props, newProps: Props) {
    //     let shouldReset = false;
    //     if (
    //         oldProps.showImages !== newProps.showImages ||
    //         this.pageBreaksChanged(oldProps, newProps)
    //     ) {
    //         shouldReset = true;
    //     }

    //     return shouldReset;
    // }


    // UNSAFE_componentWillReceiveProps(props: Props) {
    //     this.processProps(props);
    // }

    // componentDidMount() {
    //     this.resizeHandler = _.throttle(() => {
    //         this.calculatedImageHeight = null;
    //         this.updateList();
    //     }, 500).bind(this);

    //     window.addEventListener("resize", this.resizeHandler);

    //     this.selectionHandler = _.debounce(e => {
    //         this.handleSelection(e);
    //     }, 200).bind(this);

    //     document.addEventListener("selectionchange", this.selectionHandler);

    //     document.addEventListener("mousedown", this.mouseDown.bind(this), true);
    //     document.addEventListener("mouseup", this.mouseUp.bind(this), true);

    //     this.processProps(this.props);
    //     this.componentDidUpdate();
    // }

    // componentDidUpdate() {
    //     if (this.selectedNodes && this.selectedNodes.length > 0) {
    //         const selectedNodes = this.selectedNodes;
    //         const selectedSegments = this.props.selectedAnnotatedSegments;
    //         setTimeout(() => {
    //             let selRange = document.createRange();
    //             let startNode = selectedNodes[0];
    //             let endNode = selectedNodes[selectedNodes.length - 1];
    //             let lastSegment = selectedSegments[selectedSegments.length - 1];
    //             if (lastSegment instanceof TextSegment) {
    //                 let lastElement = document.getElementById(
    //                     idForSegment(lastSegment)
    //                 );
    //                 if (lastElement) endNode = lastElement;
    //             }

    //             if (
    //                 startNode instanceof Element &&
    //                 endNode instanceof Element
    //             ) {
    //                 startNode = document.getElementById(startNode.id);
    //                 endNode = document.getElementById(endNode.id);
    //                 if (startNode && endNode) {
    //                     selRange.setStart(startNode, 0);
    //                     selRange.setEnd(endNode, endNode.childNodes.length);
    //                     let sel = document.getSelection();
    //                     if (sel) {
    //                         this._modifyingSelection = true;
    //                         sel.removeAllRanges();
    //                         sel.addRange(selRange);
    //                         this.selectedNodes = null;
    //                     }
    //                 }
    //             }
    //         }, 0);
    //     }

    // componentWillUnmount() {
    //     document.removeEventListener("mousedown", this);
    //     document.removeEventListener("mouseup", this);
    //     window.removeEventListener("resize", this.resizeHandler);
    //     document.removeEventListener("selectionchange", this.selectionHandler);
    // }

    

    // getSelectedTextIndex(): number {
    //     let selectedTextIndex = 0;
    //     let startPos = null;
    //     if (this.props.activeAnnotation) {
    //         [
    //             startPos
    //         ] = this.props.splitText.annotatedText.getPositionOfAnnotation(
    //             this.props.activeAnnotation
    //         );
    //     } else if (this.props.selectedSearchResult) {
    //         let segment = this.props.splitText.annotatedText.segmentAtOriginalPosition(
    //             this.props.selectedSearchResult.start
    //         );
    //         if (segment instanceof TextSegment) {
    //             startPos = segment.start;
    //         } else if (typeof segment === "number") {
    //             startPos = segment;
    //         }
    //     }
    //     if (startPos) {
    //         selectedTextIndex = this.props.splitText.getTextIndexOfPosition(
    //             startPos
    //         );
    //     }
    //     return selectedTextIndex;
    // }

  
    render() {
        const props = this.props;
        const rowRenderer = this.rowRenderer;
        const cache = this.cache;
        const key = props.selectedWitness ? props.selectedWitness.id : 0;

        return (
            <div
                className={styles.splitText}
                ref={div => (this.splitText = div)}
                key={key}
            >
                <AutoSizer>
                    {({ height, width }) => (
                        <List
                            ref={list => (this.list = list)}
                            height={height}
                            rowCount={props.splitText.texts.length}
                            rowHeight={cache.rowHeight}
                            rowRenderer={rowRenderer}
                            width={width}
                            overscanRowCount={3}
                            deferredMeasurementCache={cache}
                        >{
                            props.splitText
                        }
                        </List>
                    )}
                </AutoSizer>
            </div>
        );
    }
    // getStringPositions(
    //     text: SegmentedText,
    //     string: string,
    //     index: number
    // ): { [position: number]: [number, number] } {
    //     const uniqueId = this.props.splitText.annotatedText.getUniqueId();

    //     if (!_searchResultsCache.hasOwnProperty(uniqueId)) {
    //         _searchResultsCache = {
    //             [uniqueId]: {}
    //         };
    //     }

    //     if (!_searchResultsCache[uniqueId].hasOwnProperty(string)) {
    //         _searchResultsCache[uniqueId] = {
    //             [string]: {}
    //         };
    //     }

    //     if (_searchResultsCache[uniqueId][string].hasOwnProperty(index)) {
    //         return _searchResultsCache[uniqueId][string][index];
    //     }

    //     const splitter = new GraphemeSplitter();
    //     const content = text.getText();
    //     const firstSegment = text.segments[0];
    //     const startingPosition = firstSegment.start;
    //     let positions = [];
    //     let position = content.indexOf(string);
    //     while (position !== -1) {
    //         positions.push(position);
    //         position = content.indexOf(string, position + 1);
    //     }

    //     // Position needs to be position in complete text
    //     let verifiedPositions: { [position: number]: [number, number] } = {};
    //     if (positions.length > 0) {
    //         const graphemes = splitter.splitGraphemes(content);
    //         let position = 0;
    //         let activePosition = null;
    //         for (let i = 0; i < graphemes.length; i++) {
    //             const grapheme = graphemes[i];
    //             const graphemeEnd = position + (grapheme.length - 1);
    //             if (activePosition !== null) {
    //                 let expectedEnd = activePosition + (string.length - 1);
    //                 if (graphemeEnd >= expectedEnd) {
    //                     verifiedPositions[activePosition + startingPosition] = [
    //                         activePosition + startingPosition,
    //                         graphemeEnd + startingPosition
    //                     ];
    //                     activePosition = null;
    //                 }
    //             } else if (positions.indexOf(position) !== -1) {
    //                 if (string.length === grapheme.length) {
    //                     verifiedPositions[position + startingPosition] = [
    //                         position + startingPosition,
    //                         graphemeEnd + startingPosition
    //                     ];
    //                 } else if (string.length > grapheme.length) {
    //                     activePosition = position;
    //                 }
    //             } else {
    //                 activePosition = null;
    //             }

    //             position += grapheme.length;
    //         }
    //     }

    //     _searchResultsCache[uniqueId][string][index] = verifiedPositions;

    //     return verifiedPositions;
    // }

    rowRenderer({
        key,
        index,
        parent,
        style
    }:{
        key: string,
        index: number,
        parent: {},
        style: {}
    }): React.Element<CellMeasurer> {
        const props = this.props;
        const cache = this.cache;
        // const menuVisible=this.props.menuListIsVisible
        const component = this;
        const pechaImageClass = props.showImages ? styles.pechaImage : null;
        let imageUrl = '';

        if (
            props.selectedWitness &&
            props.selectedWitness.properties &&
            props.selectedWitness.properties.hasOwnProperty(IMAGE_START_PRE_KEY)
        ) {
            imageUrl = this.getImageUrl(index);
        }

        let searchStringPositions = {};
        let searchValue = this.props.searchValue;
        if (searchValue && searchValue.length > 0 && props.splitText) {
            searchStringPositions = this.getStringPositions(
                props.splitText.texts[index],
                searchValue,
                index
            );
        }

        let pechaStyles = {};
        let imageHeight = null;
        if (props.showImages && pechaImageClass && this.calculatedImageHeight) {
            pechaStyles["height"] = this.calculatedImageHeight + "px";
        }

        return (
            <CellMeasurer
                columnIndex={0}
                key={key}
                parent={parent}
                rowIndex={index}
                cache={cache}
            >
                <div key={key} style={style} className={styles.splitTextRow}>
                    <div className={styles.splitTextRowContent}>
                        <Text
                            segmentedText={props.splitText.texts[index]}
                            activeAnnotations={props.activeAnnotations}
                            activeAnnotation={props.activeAnnotation}
                            row={index}
                            selectedSegmentId={props.selectedSegmentId}
                            annotationPositions={props.annotationPositions}
                            selectedAnnotatedSegments={
                                this._filteredSelectedAnnotatedSegments
                            }
                            getBaseAnnotation={this.getBaseAnnotation.bind(
                                this
                            )}
                            activeWitness={this.props.selectedWitness}
                            searchValue={searchValue}
                            selectedSearchResult={
                                this.props.selectedSearchResult
                            }
                            searchStringPositions={searchStringPositions}
                            fontSize={props.fontSize}
                            // menuVisible={props.menuVisible}
                        />
                    </div>
                   
                </div>
            </CellMeasurer>
        );
    }
}
