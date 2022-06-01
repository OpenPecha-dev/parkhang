// @flow
import * as React from "react";
import ReactDOM from "react-dom";
import { AutoSizer } from "react-virtualized/dist/es/AutoSizer";
import { List } from "react-virtualized";
import {
    CellMeasurer,
    CellMeasurerCache
} from "react-virtualized/dist/es/CellMeasurer";
import "react-virtualized/styles.css";
import Text from "./Text";
import SplitText from "lib/SplitText";
import styles from "./SplitText.css";
import _, { split } from "lodash";
import TextSegment from "lib/TextSegment";
import Witness from "lib/Witness";
import GraphemeSplitter from "grapheme-splitter";



export type Props = {
    splitText: SplitText,
    didSelectSegmentIds: (segmentIds: string[]) => void,
    limitWidth: boolean,
    // selectedAnnotatedSegments: Array<TextSegment | number>,
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
    didSelectSegmentIds;
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
        this.rowRenderer=this.rowRenderer.bind(this)
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
    handleSelection(e: Event) {
        if (!this._modifyingSelection) {
            this.activeSelection = document.getSelection();
            if (!this._mouseDown) {
                // sometimes, this gets called after the mouseDown event handler
                this.mouseUp();
            }
        } else {
            e.stopPropagation();
            // Need to set this here. If set at callsite, the event will not
            // have time to propagate.
            this._modifyingSelection = false;
        }
    }
    
    mouseDown() {
        this._mouseDown = true;
    }

    mouseUp() {
        this._mouseDown = false;
        if (this.activeSelection) {
            let segmentIds = this.processSelection(this.activeSelection);
            if (!segmentIds) {
                segmentIds = [];
            }
            this.props.didSelectSegmentIds(segmentIds);
            this.activeSelection = null;
        }
    }
    
    processSelection(selection: Selection): string[] | null {
        if (
            selection.rangeCount === 0 ||
            selection.isCollapsed ||
            selection.type === "Caret"
        ) {
            this.selectedNodes = null;
            return null;
        }

        const range = selection.getRangeAt(0);
        const start = range.startContainer;
        const startSpan = this.getNodeSegmentSpan(start);
        if (!(startSpan && startSpan.parentNode)) {
            // If the selection is not a text segment, ignore.
            // Assuming if the first node is a non-segment, they
            // all are.
            return null;
        }

        let nodes = this.getRangeNodes(range, startSpan.parentNode);
        // Check if the selection starts after the end of a node, and
        // if so remove that node.
        if (nodes.length > 0) {
            let firstNode = nodes[0];
            if (range.startOffset === firstNode.textContent.length) {
                nodes.shift();
            }
        }

        const end = range.endContainer;
        const endSpan = this.getNodeSegmentSpan(end);
        if (!(endSpan && endSpan.parentNode)) {
            return null;
        }
        if (endSpan && startSpan.parentNode !== endSpan.parentNode) {
            // Selection is spanning Texts.
            // We assume a selection can only run across a maximum
            // of two Texts.
            nodes = nodes.concat(this.getRangeNodes(range, endSpan.parentNode));
        } else {
            // Check if the selection ends before the start of a node, and
            // if so remove that node.
            if (range.endOffset === 0) {
                nodes.pop();
            }
        }
        this.selectedNodes = nodes;
        let nodeIds = [];
        nodes.reduce((accumulator: string[], current: Node) => {
            if (current instanceof Element) {
                accumulator.push(current.id);
            }
            return accumulator;
        }, nodeIds);

        return nodeIds;
    }
    getRangeNodes(range: Range, parentNode: Node): Node[] {
        let rangeSpans = [];
        for (let i = 0, len = parentNode.childNodes.length; i < len; i++) {
            const node = parentNode.childNodes[i];
            // TODO: add polyfill for i.e.?
            // e.g. https://gist.github.com/jonathansampson/6d09bd6d2e8c22c53868aec42e66b0f9
            if (range.intersectsNode(node)) {
                rangeSpans.push(node);
            }
        }
        return rangeSpans;
    }
    getNodeSegmentSpan(node: Node): Element | null {
        let currentNode = node;
        let span = null;
        const test = /^(i|s|ds)_/;
        while (!span && currentNode.parentNode) {
            if (currentNode instanceof Element && test.test(currentNode.id)) {
                span = currentNode;
            }
            currentNode = currentNode.parentNode;
        }

        return span;
    }
    updateList(
        resetCache: boolean = true,
        resetRows: number | number[] | null = null
    ) {
        if (
            this.props.showImages &&
            !this.calculatedImageHeight &&
            this.imageHeight &&
            this.imageWidth
        ) {
            this.calculatedImageHeight = this.calculateImageHeight();
        }
        if (this.list) {
            const list = this.list;
            if (resetCache) {
                if (resetRows !== null) {
                    if (!Array.isArray(resetRows)) {
                        this.cache.clear(resetRows);
                    } else if (Array.isArray(resetRows)) {
                        for (let i = 0; i < resetRows.length; i++) {
                            let resetRow = resetRows[i];
                            this.cache.clear(resetRow);
                        }
                    }
                } else {
                    this.cache.clearAll();
                    list.measureAllRows();
                    list.recomputeRowHeights(0);
                }
            }
            list.forceUpdateGrid();
        }
    }



    processProps(props: Props) {
        let changedWitness = false;
        if (
            !this.props.selectedWitness ||
            (props.selectedWitness &&
                props.selectedWitness.id !== this.props.selectedWitness.id)
        ) {
            changedWitness = true;
            this._didSetInitialScrollPosition = false;
        }

        if (
            props.selectedSearchResult &&
            (!this.props.selectedSearchResult ||
                props.selectedSearchResult.start !==
                    this.props.selectedSearchResult.start ||
                props.selectedSearchResult.textId !==
                    this.props.selectedSearchResult.textId)
        ) {
            console.log("resetting scroll position from search result");
            this._didSetInitialScrollPosition = false;
        }

        // TODO: check if new selectedSearchResult and if so
        // set this._didSetInitialScrollPosition = false

        // make sure there's no numbers in selectedAnnotatedSegments
        // as we want to pass it to Text which only expects TextSegments
        // this._filteredSelectedAnnotatedSegments = props.selectedAnnotatedSegments.reduce(
        //     (acc, current: TextSegment | number) => {
        //         if (current instanceof TextSegment) acc.push(current);
        //         return acc;
        //     },
        //     []
        // );

        const controlsMeasurements = this.getControlsMeasurements(props);
        if (controlsMeasurements) {
            this.selectedTextIndex = controlsMeasurements.selectedTextIndex;
            this.firstSelectedSegment =
                controlsMeasurements.firstSelectedSegment;
            this.splitTextRect = controlsMeasurements.splitTextRect;
            this.selectedElementId = controlsMeasurements.selectedElementId;
            this.selectedElementIds = controlsMeasurements.selectedElementIds;
        }
   
       
        if ((props.textListVisible !== this.textListVisible) || (props.editMenuVisible !== this.editMenuVisible)) {
            setTimeout(() => {
                this.textListVisible = props.textListVisible;
                this.editMenuVisible = props.editMenuVisible;
                this.updateList(true);
            }, 500);

        
        } else {
            if (changedWitness) {
                this.updateList(true);
            } else if (this.pageBreaksChanged(this.props, props)) {
                let selectedRows = null;
                let currentSelectedRow = this.selectedListRow(this.props);
                let newSelectedRow = this.selectedListRow(props);
                if (currentSelectedRow && newSelectedRow) {
                    let firstChangedRow =
                        currentSelectedRow > newSelectedRow
                            ? newSelectedRow
                            : currentSelectedRow;

                    let splitRowTexts = this.props.splitText.texts;
                    selectedRows = [];
                    for (
                        let i = firstChangedRow, len = splitRowTexts.length;
                        i < len;
                        i++
                    ) {
                        selectedRows.push(i);
                    }
                }
                this.updateList(true, selectedRows);
            } else if (this.lineBreaksChanges(this.props, props)) {
                let selectedRow = this.selectedListRow(props);
                if (!selectedRow)
                    selectedRow = this.selectedListRow(this.props);
                let splitRowTexts = this.props.splitText.texts;
                let selectedRows = [];
                if (selectedRow !== null) {
                    for (
                        let i = selectedRow, len = splitRowTexts.length;
                        i < len;
                        i++
                    ) {
                        selectedRows.push(i);
                    }
                    this.updateList(true, selectedRows);
                }
            } else if (this.props.fontSize !== props.fontSize) {
                this.updateList(true);
            } else if (
                this.props.activeAnnotation &&
                props.activeAnnotation &&
                this.annotationsInSameLocation(
                    this.props.activeAnnotation,
                    props.activeAnnotation
                )
            ) {
                this.updateList(true, this.selectedListRow(props));
            } else {
                this.updateList(this.shouldResetListCache(this.props, props));
            }
        }
    }


    pageBreaksChanged(oldProps: Props, newProps: Props) {
        const oldTextBreaks = oldProps.splitText.getTextsFinalPositions();
        const newTextBreaks = newProps.splitText.getTextsFinalPositions();

        if (oldTextBreaks.length !== newTextBreaks.length) return true;

        return JSON.stringify(oldTextBreaks) !== JSON.stringify(newTextBreaks);
    }

    lineBreaksChanges(oldProps: Props, newProps: Props) {
        let oldActiveAnnotation = oldProps.activeAnnotation;
        let newActiveAnnotation = newProps.activeAnnotation;
        let hasChanged = false;

        if (
            oldActiveAnnotation &&
            oldActiveAnnotation.isType(ANNOTATION_TYPES.lineBreak) &&
            newProps.activeAnnotations &&
            !newProps.activeAnnotations.hasOwnProperty(
                oldActiveAnnotation.uniqueId
            )
        ) {
            hasChanged = true;
        }

        if (
            newActiveAnnotation &&
            newActiveAnnotation.isType(ANNOTATION_TYPES.lineBreak) &&
            oldProps.activeAnnotations &&
            !oldProps.activeAnnotations.hasOwnProperty(
                newActiveAnnotation.uniqueId
            )
        ) {
            hasChanged = true;
        }

        return hasChanged;
    }
    shouldResetListCache(oldProps: Props, newProps: Props) {
        let shouldReset = false;
        if (
            oldProps.showImages !== newProps.showImages ||
            this.pageBreaksChanged(oldProps, newProps)
        ) {
            shouldReset = true;
        }

        return shouldReset;
    }


    UNSAFE_componentWillReceiveProps(props: Props) {
        this.processProps(props);
    }

    componentDidMount() {
        this.resizeHandler = _.throttle(() => {
            this.calculatedImageHeight = null;
            this.updateList();
        }, 500).bind(this);

        window.addEventListener("resize", this.resizeHandler);

        this.selectionHandler = _.debounce(e => {
            this.handleSelection(e);
        }, 200).bind(this);

        document.addEventListener("selectionchange", this.selectionHandler);

        // document.addEventListener("mousedown", this.mouseDown.bind(this), true);
        // document.addEventListener("mouseup", this.mouseUp.bind(this), true);

        this.processProps(this.props);
        this.componentDidUpdate();
    }

    componentDidUpdate() {
        if (this.selectedNodes && this.selectedNodes.length > 0) {
            const selectedNodes = this.selectedNodes;
            const selectedSegments = this.props.selectedAnnotatedSegments;
            setTimeout(() => {
                let selRange = document.createRange();
                let startNode = selectedNodes[0];
                let endNode = selectedNodes[selectedNodes.length - 1];
                let lastSegment = selectedSegments[selectedSegments.length - 1];
                if (lastSegment instanceof TextSegment) {
                    let lastElement = document.getElementById(
                        idForSegment(lastSegment)
                    );
                    if (lastElement) endNode = lastElement;
                }

                if (
                    startNode instanceof Element &&
                    endNode instanceof Element
                ) {
                    startNode = document.getElementById(startNode.id);
                    endNode = document.getElementById(endNode.id);
                    if (startNode && endNode) {
                        selRange.setStart(startNode, 0);
                        selRange.setEnd(endNode, endNode.childNodes.length);
                        let sel = document.getSelection();
                        if (sel) {
                            this._modifyingSelection = true;
                            sel.removeAllRanges();
                            sel.addRange(selRange);
                            this.selectedNodes = null;
                        }
                    }
                }
            }, 0);
        }
    }

    componentWillUnmount() {
        // document.removeEventListener("mousedown", this);
        // document.removeEventListener("mouseup", this);
        window.removeEventListener("resize", this.resizeHandler);
        document.removeEventListener("selectionchange", this.selectionHandler);
    }

    

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
    getControlsMeasurements(
        props: Props
    ): {
        selectedTextIndex: number,
        firstSelectedSegment: TextSegment,
        selectedElementId: string,
        splitTextRect: ClientRect,
        selectedElementIds: string[]
    } | null {
        if (!this.splitText) {
            return null;
        }
        let splitTextComponent = this.splitText;
        let selectedTextIndex = null;
        let firstSelectedSegment = null;
        let selectedElementId = null;
        let splitTextRect = null;
        let segmentIdFunction: null | ((segment: TextSegment) => string) = null;
        let selectedElementIds = [];
        let startPos = 0;
        if (props.activeAnnotation) {
            let activeAnnotation = props.activeAnnotation;
            [startPos] = props.splitText.annotatedText.getPositionOfAnnotation(
                activeAnnotation
            );
            if (startPos === null) {
                console.warn("No startPos in getControlsMeasurements");
                return null;
            }
            if (activeAnnotation.type === ANNOTATION_TYPES.pageBreak) {
                startPos -= 1;
            }
            if (activeAnnotation.type === ANNOTATION_TYPES.lineBreak) {
                startPos -= 1;
            }

            // Index of text containing end of annotation
            let positionEnd = startPos + activeAnnotation.length;
            if (activeAnnotation.length > 0) positionEnd -= 1;
            selectedTextIndex = props.splitText.getTextIndexOfPosition(
                positionEnd
            );
            splitTextRect = splitTextComponent.getBoundingClientRect();
        }
        let selectedAnnotatedSegments = [];
        if (
            props.selectedAnnotatedSegments &&
            props.selectedAnnotatedSegments.length > 0
        ) {
            selectedAnnotatedSegments = props.selectedAnnotatedSegments;
            for (let i = 0; i < selectedAnnotatedSegments.length; i++) {
                let segment = selectedAnnotatedSegments[i];
                if (
                    firstSelectedSegment === null &&
                    segment instanceof TextSegment
                ) {
                    firstSelectedSegment = segment;
                    break;
                }
            }
            if (firstSelectedSegment) {
                if (
                    firstSelectedSegment.length === 0 &&
                    props.activeAnnotation &&
                    props.activeAnnotation.isInsertion
                ) {
                    selectedElementId = idForInsertion(firstSelectedSegment);
                    segmentIdFunction = idForInsertion;
                } else {
                    selectedElementId = idForSegment(firstSelectedSegment);
                    segmentIdFunction = idForSegment;
                }
            }
        } else if (props.activeAnnotation) {
            if (props.activeAnnotation.isDeletion) {
                let segment = new TextSegment(startPos, "");
                selectedElementId = idForDeletedSegment(segment);
                segmentIdFunction = idForDeletedSegment;
                firstSelectedSegment = segment;
                selectedAnnotatedSegments = [firstSelectedSegment];
            } else if (props.activeAnnotation.isInsertion) {
                const [
                    start
                ] = props.splitText.annotatedText.getPositionOfAnnotation(
                    props.activeAnnotation
                );
                if (start) {
                    let segment = new TextSegment(start, "");
                    selectedElementId = idForInsertion(segment);
                    segmentIdFunction = idForInsertion;
                    firstSelectedSegment = segment;
                    selectedAnnotatedSegments = [firstSelectedSegment];
                }
            } else if (
                props.activeAnnotation.type === ANNOTATION_TYPES.pageBreak
            ) {
                let segment = new TextSegment(startPos + 1, "");
                let prevSegment = new TextSegment(startPos, "");
                selectedElementId = idForPageBreak(prevSegment);
                firstSelectedSegment = segment;
                selectedAnnotatedSegments = [segment];
                selectedElementIds = [selectedElementId];
            } else if (
                props.activeAnnotation.type === ANNOTATION_TYPES.lineBreak
            ) {
                let segment = new TextSegment(startPos + 1, "");
                let prevSegment = new TextSegment(startPos, "");
                selectedElementId = idForLineBreak(prevSegment);
                firstSelectedSegment = segment;
                selectedAnnotatedSegments = [segment];
                selectedElementIds = [selectedElementId];
            }
        }
        if (segmentIdFunction) {
            for (let i = 0; i < selectedAnnotatedSegments.length; i++) {
                let segment = selectedAnnotatedSegments[i];
                if (segment instanceof TextSegment) {
                    const segmentId = segmentIdFunction(segment);
                    selectedElementIds.push(segmentId);
                }
            }
        }
        if (
            selectedTextIndex != null &&
            firstSelectedSegment &&
            selectedElementId &&
            splitTextRect
        ) {
           
            return {
                selectedTextIndex: selectedTextIndex,
                firstSelectedSegment: firstSelectedSegment,
                selectedElementId: selectedElementId,
                splitTextRect: splitTextRect,
                selectedElementIds: selectedElementIds
            };
        } else {
            return null;
        }
    }
    
    render() {
        const props = this.props;
        const rowRenderer = this.rowRenderer;
        const cache = this.cache;
        const key = props.selectedWitness ? props.selectedWitness.id : 0;
       
        return (
            <div
                className={styles.splitText2}
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
                        >
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
     

        let searchStringPositions = {};
        let searchValue = props.searchValue;
        if (searchValue && searchValue.length > 0 && props.splitText) {
            searchStringPositions = this.getStringPositions(
                props.splitText.texts[index],
                searchValue,
                index
            );
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
                            // row={index}
                            selectedSegmentId={props.selectedSegmentId}
                            // searchValue={searchValue}
                            // selectedSearchResult={
                            //     this.props.selectedSearchResult
                            // }
                            // searchStringPositions={searchStringPositions}
                            fontSize={props.fontSize}
                        />
                    </div>
                   
                </div>
            </CellMeasurer>
        );
    }

}
