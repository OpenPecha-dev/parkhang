// @flow
import * as React from "react";
import ReactDOM from "react-dom";
import { AutoSizer } from "react-virtualized/dist/es/AutoSizer";
import { List } from "react-virtualized/dist/es/List";
import lopenlinglogo from "images/lopenling_logo.png";
import Zoom from "components/utility/imageZoom";
import {
    CellMeasurer,
    CellMeasurerCache,
} from "react-virtualized/dist/es/CellMeasurer";
import "react-virtualized/styles.css";
import Text, {
    idForSegment,
    idForDeletedSegment,
    idForInsertion,
    idForPageBreak,
    idForLineBreak,
} from "./Text";
import SplitText from "lib/SplitText";
import SegmentedText from "lib/SegmentedText";
import shallowEqual from "lib/shallowEqual";
import { CONTROLS_MARGIN_LEFT } from "./AnnotationControls";
import AnnotationControlsContainer from "./AnnotationControlsContainer";
import styles from "./SplitText.css";
import annotationControlsStyles from "./AnnotationControls.css";
import controlStyles from "./AnnotationControls.css";
import _ from "lodash";
import TextSegment from "lib/TextSegment";
import Annotation, { ANNOTATION_TYPES } from "lib/Annotation";
import type { AnnotationUniqueId } from "lib/Annotation";
import Witness from "lib/Witness";
import GraphemeSplitter from "grapheme-splitter";
import classNames from "classnames";

const MIN_SPACE_RIGHT =
    parseInt(controlStyles.inlineWidth) + CONTROLS_MARGIN_LEFT;

const IMAGE_URL_PREFIX = "//iiif.bdrc.io/";
const IMAGE_URL_SUFFIX = "/full/full/0/default.jpg";
const IMAGE_START_PRE_KEY = "bdrcimg_pre";
const IMAGE_START_NUMBER_KEY = "bdrcimg_number";
const IMAGE_START_SUFFIX_KEY = "bdrcimg_suffix";

let _searchResultsCache: {
    [splitTextUniqueId: string]: {
        [searchTerm: string]: {
            [index: number]: { [position: number]: [number, number] },
        },
    },
} = {};

export type Props = {
    textListVisible: boolean,
    editMenuVisible: Boolean,
    imagesBaseUrl: string,
    splitText: SplitText,
    didSelectSegmentIds: (segmentIds: string[]) => void,
    limitWidth: boolean,
    activeAnnotation: Annotation | null,
    selectedAnnotatedSegments: Array<TextSegment | number>,
    showImages: boolean,
    annotationPositions: { [string]: Annotation[] },
    annotations: Annotation[],
    activeAnnotations: { [AnnotationUniqueId]: Annotation } | null,
    selectedSegmentId: (segmentId: string) => void,
    selectedWitness: Witness | null,
    selectedWitness2: Witness | null,
    selectedSearchResult: {
        textId: number,
        start: number,
        length: number,
    } | null,
    searchValue: string | null,
    fontSize: number,
    isSecondWindowOpen: Boolean,
    changeScrollToId: () => void,
    changeSyncIdOnClick: () => void,
    closeAnnotation: () => void,
    syncIdOnClick: Number,
    isPanelLinked: Boolean,
    isPanelVisible: Boolean,
    textAlignment: {},
    textAlignmentById: {},
    selectedWindow: Boolean,
    scrollToId: Number,
    selectedTargetRange: [],
    selectedSourceRange: [],
    searchResults: [],
    showTableContent: Boolean,
    condition: Boolean,
    MediaInterval: {},
};

export default class SplitTextComponent extends React.PureComponent<Props> {
    isSecondWindowOpen: Boolean;
    list: List | null;
    splitText: HTMLDivElement | null;
    cache: CellMeasurerCache;
    rowRenderer: (params: {
        key: string,
        index: number,
        parent: {},
        style: {},
    }) => React.Element<CellMeasurer>;
    resizeHandler: () => void;
    selectionHandler: (e: Event) => void;
    textListVisible: boolean;
    editMenuVisible: Boolean;
    activeSelection: Selection | null;
    selectedNodes: Node[] | null;
    // Whether the mouse button is down
    _mouseDown: boolean;
    _activeWitness: Witness | null;
    _didSetInitialScrollPosition: boolean;
    _filteredSelectedAnnotatedSegments: TextSegment[];
    _modifyingSelection: boolean;
    selectedTextIndex: number | null;
    splitTextRect: ClientRect | null;
    firstSelectedSegment: TextSegment | null;
    selectedElementId: string | null;
    selectedElementIds: string[] | null;
    imageWidth: number | null;
    imageHeight: number | null;
    calculatedImageHeight: number | null;
    changeScrollToId: () => void;
    changeSyncIdOnClick: () => void;
    wheelScrolling: () => void;
    closeAnnotation: () => void;
    textlines: Node[] | null;
    jump: number;
    isPanelLinked: Boolean;
    splitTextRef;
    textAlignmentById;
    scrollEvent: () => void;
    selectedWindow;
    debouncedScroll;
    targetId;
    condition;
    constructor(props: Props) {
        super(props);
        this.textAlignmentById = [];
        this.list = null;
        this.splitText = null;
        this.cache = new CellMeasurerCache({
            fixedWidth: true,
        });
        this.splitTextRef = React.createRef(null);
        this.rowRenderer = this.rowRenderer.bind(this);
        this.textListVisible = props.textListVisible;
        this.editMenuVisible = props.editMenuVisible;
        this.isPanelLinked = props.isPanelLinked;
        this.activeSelection = null;
        this.selectedNodes = null;
        this._mouseDown = false;
        this._activeWitness = null;
        this._didSetInitialScrollPosition = false;
        this._modifyingSelection = false;
        this.imageHeight = null;
        this.imageWidth = null;
        this.calculatedImageHeight = null;
        this.processProps(props);
        this.changeScrollToId = props.changeScrollToId;
        this.changeSyncIdOnClick = props.changeSyncIdOnClick;
        this.closeAnnotation = props.closeAnnotation;
        this.scrollJump = props.scrollJump;
        this.textAlignmentById = [];
        this.scrollEvent = this.scrollEvent.bind(this);
        this.selectedWindow = props.selectedWindow;
        this.condition = props.condition;
    }

    scrollEvent(e) {
        if (this.selectedWindow === 2) return null;
        if (this.selectedWindow === 1) {
            let list = [];
            let imageIdList = [];
            this.textAlignmentById.map((l) => {
                let number = document.getElementById("s_" + l.start);
                if (number) {
                    let position = number.getBoundingClientRect();
                    if (position.top > 102) {
                        list.push({
                            id: l.id,
                            start: l.start,
                            target: l.TStart,
                        });
                    }
                }
            });

            if (!_.isEmpty(list) || !_.isEmpty(imageIdList)) {
                if (this.selectedWindow === 1) {
                    this.debouncedScroll(list);
                }
            }
        }
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

    getControlsMeasurements(props: Props): {
        selectedTextIndex: number,
        firstSelectedSegment: TextSegment,
        selectedElementId: string,
        splitTextRect: ClientRect,
        selectedElementIds: string[],
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
            [startPos] =
                props.splitText.annotatedText.getPositionOfAnnotation(
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
            selectedTextIndex =
                // props.splitText.getTextIndexOfPosition(positionEnd);
                props.splitText.getTextIndexOfPosition(startPos); //to position the control on start of selection

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
                const [start] =
                    props.splitText.annotatedText.getPositionOfAnnotation(
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
                selectedElementIds: selectedElementIds,
            };
        } else {
            return null;
        }
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

    selectedListRow(props: Props): number | null {
        let row = null;
        if (props.activeAnnotation) {
            row = props.splitText.getTextIndexOfPosition(
                props.activeAnnotation.start
            );
        }
        return row;
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
        this._filteredSelectedAnnotatedSegments =
            props.selectedAnnotatedSegments.reduce(
                (acc, current: TextSegment | number) => {
                    if (current instanceof TextSegment) acc.push(current);
                    return acc;
                },
                []
            );

        const controlsMeasurements = this.getControlsMeasurements(props);
        if (controlsMeasurements) {
            this.selectedTextIndex = controlsMeasurements.selectedTextIndex;
            this.firstSelectedSegment =
                controlsMeasurements.firstSelectedSegment;
            this.splitTextRect = controlsMeasurements.splitTextRect;
            this.selectedElementId = controlsMeasurements.selectedElementId;
            this.selectedElementIds = controlsMeasurements.selectedElementIds;
        }

        if (
            props.textListVisible !== this.textListVisible ||
            props.editMenuVisible !== this.editMenuVisible
        ) {
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

    annotationsInSameLocation(anno1: Annotation, anno2: Annotation): boolean {
        if (anno1.start === anno2.start && anno1.length === anno2.length) {
            return true;
        }

        return false;
    }

    UNSAFE_componentWillReceiveProps(props: Props) {
        this.processProps(props);
    }

    scrollToIndex(startId) {
        let list = this.list;
        let selectedTextIndex =
            this.props.splitText.getTextIndexOfPosition(startId);

        setTimeout(() => {
            list.scrollToRow(selectedTextIndex);
            setTimeout(() => {
                list.scrollToPosition(list.props.scrollTop - 300);
            }, 0);
        }, 100);
    }
    componentDidMount() {
        this.resizeHandler = _.throttle(() => {
            this.calculatedImageHeight = null;
            this.updateList();
        }, 600).bind(this);
        this.processProps(this.props);

        this.debouncedScroll = _.debounce((list) => {
            if (list.length) {
                this.changeScrollToId({ id: list[0]?.start, from: 1 });
            }
        }, 1000);

        window.addEventListener("resize", this.resizeHandler);

        this.selectionHandler = _.debounce((e) => {
            this.handleSelection(e);
        }, 200).bind(this);
        setTimeout(() => {
            window.dispatchEvent(new Event("resize"));
        }, 2000);
        document.addEventListener("selectionchange", this.selectionHandler);
        document.addEventListener("mousedown", this.mouseDown.bind(this), true);
        document.addEventListener("mouseup", this.mouseUp.bind(this), true);
        this.componentDidUpdate();
    }

    componentDidUpdate(prevProps) {
        this.Alignment = this.props.textAlignment;
        this.condition = this.props.condition;
        this.scrollToId = this.props.scrollToId;
        if (!this.props.isAnnotating) {
            this.activeSelection = null;
        }

        this.textAlignmentById = this.props.textAlignmentById;
        this.selectedWindow = this.props.selectedWindow;
        this.targetId = this.props.syncIdOnClick;

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

        if (!this._didSetInitialScrollPosition && this.list) {
            const list = this.list;
            if (
                this.props.activeAnnotation ||
                this.props.selectedSearchResult
            ) {
                let selectedTextIndex = this.getSelectedTextIndex();
                setTimeout(() => {
                    list.scrollToRow(selectedTextIndex);
                    // scrollToRow often positions the annotation at the
                    // bottom of the screen, so scroll up a bit
                    setTimeout(() => {
                        list.scrollToPosition(list.props.scrollTop - 300);
                    }, 0);
                }, 100);
            }
            this._didSetInitialScrollPosition = true;
        }
        //Table Of content scrolling
        if (this.scrollToId.from == "table" && this.scrollToId.id) {
            let start = this.scrollToId.id;
            this.scrollToIndex(start);
        }

        //Video and audio alignment scrolling
        if (this.scrollToId.from == "video" && this.scrollToId.id) {
            let start = this.scrollToId.id;
            this.scrollToIndex(start);
        }

        // scroll dom with respect to window 2 scrolling
        if (
            this.selectedWindow === 2 &&
            this.scrollToId.from == 2 &&
            this.condition &&
            this.scrollToId.id !== null
        ) {
            this.textAlignmentById = this.props.textAlignmentById || [];
            if (this.Alignment) {
                let req = this.textAlignmentById.find(
                    (l) => l.TStart === this.scrollToId.id
                );

                let start = req?.start;
                if (start !== null) {
                    this.scrollToIndex(start);
                }
            }
        }

        // scroll dom with respect to window 2 click
        //for scrolling to the highlighted alignment if its outside visible DOM

        if (
            this.targetId &&
            this.scrollToId.from === "ua" &&
            this.selectedWindow === 2 &&
            this.scrollToId.id === "ua" &&
            this.condition
        ) {
            let clickIdObj = this.Alignment.alignment.find(
                (l) =>
                    this.targetId >= l.target_segment.start &&
                    this.targetId < l.target_segment.end
            );
            let startId = clickIdObj?.source_segment?.start;

            this.scrollToIndex(startId);
        }
    }
    componentWillUnmount() {
        document.removeEventListener("mousedown", this);
        document.removeEventListener("mouseup", this);
        window.removeEventListener("resize", this.resizeHandler);

        document.removeEventListener("selectionchange", this.selectionHandler);
    }

    calculateImageHeight() {
        let height = null;
        if (this.imageHeight && this.imageWidth) {
            const ratio = this.imageWidth / this.imageHeight;
            const pechaImageClass = styles.pechaImage;
            const pechaImageContainers =
                document.getElementsByClassName(pechaImageClass);
            if (pechaImageContainers.length > 0) {
                let container = pechaImageContainers[0];
                height = container.offsetWidth / ratio;
            }
        }
        return height;
    }

    getSelectedTextIndex(): number {
        let selectedTextIndex = 0;
        let startPos = null;
        if (this.props.activeAnnotation) {
            [startPos] =
                this.props.splitText.annotatedText.getPositionOfAnnotation(
                    this.props.activeAnnotation
                );
        } else if (this.props.selectedSearchResult) {
            let segment =
                this.props.splitText.annotatedText.segmentAtOriginalPosition(
                    this.props.selectedSearchResult.start
                );
            if (segment instanceof TextSegment) {
                startPos = segment.start;
            } else if (typeof segment === "number") {
                startPos = segment;
            }
        }
        if (startPos) {
            selectedTextIndex =
                this.props.splitText.getTextIndexOfPosition(startPos);
        }
        return selectedTextIndex;
    }

    getBaseAnnotation(annotation: Annotation): Annotation {
        let [start] =
            this.props.splitText.annotatedText.getPositionOfAnnotation(
                annotation
            );
        if (start === null) start = 0;
        return this.props.splitText.annotatedText.getBaseAnnotation(
            start,
            annotation.content.length
        );
    }

    render() {
        const props = this.props;
        const rowRenderer = this.rowRenderer;
        const cache = this.cache;
        const key = props.selectedWitness ? props.selectedWitness.id : 0;
        return (
            <div
                className={styles.splitText}
                ref={(div) => (this.splitText = div)}
                key={key}
            >
                <AutoSizer disableWidth>
                    {({ height }) => (
                        <List
                            id="scroller"
                            width={1}
                            ref={(list) => (this.list = list)}
                            height={height}
                            rowCount={props.splitText.texts.length}
                            rowHeight={cache.rowHeight}
                            rowRenderer={rowRenderer}
                            overscanRowCount={3}
                            deferredMeasurementCache={cache}
                            onScroll={this.scrollEvent}
                            scrollToAlignment="start"
                            containerStyle={{
                                width: "100%",
                                maxWidth: "100%",
                            }}
                            style={{
                                width: "100%",
                                paddingTop: 30,
                                paddingInline: 50,
                            }}
                        ></List>
                    )}
                </AutoSizer>
            </div>
        );
    }

    getImageUrl(pageIndex: number): string {
        if (
            !this.props.selectedWitness ||
            !this.props.selectedWitness.properties
        )
            return "";
        let witnessProperties = this.props.selectedWitness.properties;
        let prefix = witnessProperties[IMAGE_START_PRE_KEY];
        let start = witnessProperties[IMAGE_START_NUMBER_KEY];
        let suffix = witnessProperties[IMAGE_START_SUFFIX_KEY];
        let id = Number(start) + pageIndex;
        let url =
            IMAGE_URL_PREFIX + prefix + id + "." + suffix + IMAGE_URL_SUFFIX;
        return url;
    }

    getStringPositions(
        text: SegmentedText,
        string: string,
        index: number
    ): { [position: number]: [number, number] } {
        const uniqueId = this.props.splitText.annotatedText.getUniqueId();

        if (!_searchResultsCache.hasOwnProperty(uniqueId)) {
            _searchResultsCache = {
                [uniqueId]: {},
            };
        }

        if (!_searchResultsCache[uniqueId].hasOwnProperty(string)) {
            _searchResultsCache[uniqueId] = {
                [string]: {},
            };
        }

        if (_searchResultsCache[uniqueId][string].hasOwnProperty(index)) {
            return _searchResultsCache[uniqueId][string][index];
        }

        const splitter = new GraphemeSplitter();
        const content = text.getText();
        const firstSegment = text.segments[0];
        const startingPosition = firstSegment?.start;
        let positions = [];
        let position = content.indexOf(string);
        while (position !== -1) {
            positions.push(position);
            position = content.indexOf(string, position + 1);
        }

        // Position needs to be position in complete text
        let verifiedPositions: { [position: number]: [number, number] } = {};
        if (positions.length > 0) {
            const graphemes = splitter.splitGraphemes(content);
            let position = 0;
            let activePosition = null;
            for (let i = 0; i < graphemes.length; i++) {
                const grapheme = graphemes[i];
                const graphemeEnd = position + (grapheme.length - 1);
                if (activePosition !== null) {
                    let expectedEnd = activePosition + (string.length - 1);
                    if (graphemeEnd >= expectedEnd) {
                        verifiedPositions[activePosition + startingPosition] = [
                            activePosition + startingPosition,
                            graphemeEnd + startingPosition,
                        ];
                        activePosition = null;
                    }
                } else if (positions.indexOf(position) !== -1) {
                    if (string.length === grapheme.length) {
                        verifiedPositions[position + startingPosition] = [
                            position + startingPosition,
                            graphemeEnd + startingPosition,
                        ];
                    } else if (string.length > grapheme.length) {
                        activePosition = position;
                    }
                } else {
                    activePosition = null;
                }

                position += grapheme.length;
            }
        }

        _searchResultsCache[uniqueId][string][index] = verifiedPositions;

        return verifiedPositions;
    }

    rowRenderer({
        key,
        index,
        parent,
        style,
    }: {
        key: string,
        index: number,
        parent: {},
        style: {},
    }): React.Element<CellMeasurer> {
        const props = this.props;
        const cache = this.cache;
        const component = this;

        let imageUrl = "";

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
        const pechaImageClass =
            props.showImages && imageUrl ? styles.pechaImage : null;
        let containerHeight = style.height;
        let pechaStyles = {};
        if (props.showImages && pechaImageClass && this.calculatedImageHeight) {
            pechaStyles["height"] = this.calculatedImageHeight + "px";
        }
        let newStyle = {
            ...style,
            height: style.height,
            cursor: !this.props.isAnnotating ? "pointer" : "text",
        };
        return (
            <CellMeasurer
                columnIndex={0}
                parent={parent}
                rowIndex={index}
                cache={cache}
                key={key}
            >
                <div
                    key={key}
                    style={newStyle}
                    className={styles.splitTextRow}
                    ref={this.splitTextRef}
                    id={`index_${index}`}
                >
                    <div className={styles.splitTextRowContent}>
                        {props.showImages && imageUrl && (
                            <div
                                className={pechaImageClass}
                                style={pechaStyles}
                            >
                                <Zoom cl={`zoomableImage-${index}`}>
                                    <img
                                        alt="Text related Image"
                                        className={classNames([
                                            styles.image,
                                            `zoomableImage-${index}`,
                                        ])}
                                        src={imageUrl}
                                        width="100%"
                                        height="100%"
                                        loading="lazy"
                                        decoding="async"
                                        onLoad={(e) => {
                                            if (
                                                e.target &&
                                                component.imageWidth === null
                                            ) {
                                                component.imageWidth =
                                                    e.target.naturalWidth;
                                                component.imageHeight =
                                                    e.target.naturalHeight;
                                                component.calculatedImageHeight =
                                                    null;
                                                window.setTimeout(
                                                    component.updateList.bind(
                                                        component
                                                    ),
                                                    0
                                                );
                                            }
                                        }}
                                    />
                                </Zoom>
                            </div>
                        )}

                        <Text
                            segmentedText={props.splitText.texts[index]}
                            annotations={props.annotations}
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
                            changeSyncIdOnClick={this.props.changeSyncIdOnClick}
                            changeScrollToId={this.props.changeScrollToId}
                            textAlignmentById={this.props.textAlignmentById}
                            selectedSourceRange={this.props.selectedSourceRange}
                            selectedTargetRange={this.props.selectedTargetRange}
                            changeSelectedRange={this.props.changeSelectedRange}
                            condition={this.condition}
                            isPanelLinked={this.props.isPanelLinked}
                            selectedMedia={this.props.selectedMedia}
                            MediaInterval={this.props.MediaInterval}
                        />
                    </div>
                    {this.props.isAnnotating &&
                        this.selectedTextIndex === index &&
                        this.props.activeAnnotation && (
                            <AnnotationControlsContainer
                                annotationPositions={props.annotationPositions}
                                annotatedText={props.splitText.annotatedText}
                                activeAnnotation={props.activeAnnotation}
                                inline={true}
                                firstSelectedSegment={this.firstSelectedSegment}
                                splitTextRect={this.splitTextRect}
                                selectedElementId={this.selectedElementId}
                                pechaImageClass={pechaImageClass}
                                splitText={props.splitText}
                                selectedElementIds={this.selectedElementIds}
                                list={this.list}
                            />
                        )}
                </div>
            </CellMeasurer>
        );
    }
}
