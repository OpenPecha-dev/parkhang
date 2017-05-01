import React from 'react'
import {AutoSizer, List, CellMeasurer, CellMeasurerCache} from 'react-virtualized';
import 'react-virtualized/styles.css';
import Text from './Text'
import Popover from 'components/Popover'
import AnnotationControlsContainer from './AnnotationControlsContainer'
import styles from './SplitText.css'
import textStyles from './Text.css'
import controlStyles from './AnnotationControls.css'
import _ from 'lodash'

export const CONTROLS_MARGIN_LEFT = 10;
const MIN_SPACE_RIGHT = parseInt(controlStyles.inlineWidth) + CONTROLS_MARGIN_LEFT;

export default class SplitText extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            selectedTextIndex: null,
            textPaddingRight: null,
            textWidth: null,
            firstSelectedElement: null,
            splitTextRect: null,
        };
        this.list = null;
        this.splitText = null;
        this.cache = new CellMeasurerCache({
            fixedWidth: true,
        });
        this.rowRenderer = this.rowRenderer.bind(this);
        this.resizeHandler = null;
        this.selectionHandler = null;
        this.textListVisible = props.textListVisible;
    }

    updateList() {
        if (this.list) {
            // this.cache.clearAll();
            this.list.recomputeRowHeights();
            this.list.forceUpdate();
        }
    }

    handleSelection(e) {
        const selection = document.getSelection();

        if (selection.rangeCount == 0 || selection.isCollapsed || selection.type == "Caret") {
            return;
        }

        const range = selection.getRangeAt(0);
        const start = range.startContainer;
        const startSpan = this.getNodeSegmentSpan(start);
        if (!startSpan) {
            // If the selection is not a text segment, ignore.
            // Assuming if the first node is a non-segment, they
            // all are.
            return;
        }
        let nodes = this.getRangeNodes(range, startSpan.parentNode);

        const end = range.endContainer;
        const endSpan = this.getNodeSegmentSpan(end);
        if (endSpan && startSpan.parentNode !== endSpan.parentNode) {
            // Selection is spanning Texts.
            // We assume a selection can only run across a maximum
            // of two Texts.
            nodes = nodes.concat(this.getRangeNodes(range, endSpan.parentNode));
        }

        let segmentIds = [];
        nodes.map((node) => segmentIds.push(node.id));

        this.props.didSelectSegmentIds(segmentIds);
    }

    getNodeSegmentSpan(node) {
        let currentNode = node;
        let span = null;
        while(!span && currentNode.parentNode) {
            currentNode = currentNode.parentNode;
            const test = /^(i|s|ds)_/;
            if (currentNode.id && test.test(currentNode.id)) {
                span = currentNode;
            }
        }

        return span;
    }

    getRangeNodes(range, parentNode) {
        let rangeSpans = [];
        for (let i=0, len=parentNode.childNodes.length; i < len; i++) {
            const node = parentNode.childNodes[i];
            if (range.intersectsNode(node)) {
                rangeSpans.push(node);
            }
        }
        return rangeSpans;
    }

    getTextMeasurements() {
        const paddingSide = parseInt(textStyles.paddingSide, 10);
        const containerWidth = this.splitText.offsetWidth;
        const textMaxWidth = parseInt(textStyles.maxWidth, 10);
        const extraSpace = containerWidth - (textMaxWidth + paddingSide + paddingSide);

        let paddingRight = paddingSide + 'px';
        let newTextWidth = textMaxWidth + 'px';
        if (extraSpace < (MIN_SPACE_RIGHT * 2)) {
            paddingRight = MIN_SPACE_RIGHT + 'px';
            newTextWidth = containerWidth - MIN_SPACE_RIGHT - paddingSide;
        }

        return {
            paddingRight,
            newTextWidth
        }
    }

    getControlsMeasurements(props) {
        let selectedTextIndex = null;
        let firstSelectedSegment = null;
        let splitTextRect = null;
        if (props.selectedAnnotatedSegments && props.selectedAnnotatedSegments.length > 0) {
            for (let i=0; i < props.selectedAnnotatedSegments.length; i++) {
                let segment = props.selectedAnnotatedSegments[i];
                let id = 's_' + segment.start;
                let element = document.getElementById(id);
                if (!element) {
                    continue;
                }
                if (firstSelectedSegment === null) {
                    firstSelectedSegment = segment;
                    break;
                }
            }
            selectedTextIndex = props.splitText.getTextIndexOfPosition(firstSelectedSegment.start);
            splitTextRect = this.splitText.getBoundingClientRect();
        }
        return {
            selectedTextIndex: selectedTextIndex,
            firstSelectedSegment: firstSelectedSegment,
            splitTextRect: splitTextRect
        }
    }

    updateState(props) {
        const textMeasurements = this.getTextMeasurements();
        const controlsMeasurements = this.getControlsMeasurements(props);
        this.setState((prevState, props) => {
            return {
                ...prevState,
                selectedTextIndex: controlsMeasurements.selectedTextIndex,
                textPaddingRight: textMeasurements.paddingRight,
                textWidth: textMeasurements.newTextWidth,
                firstSelectedSegment: controlsMeasurements.firstSelectedSegment,
                splitTextRect: controlsMeasurements.splitTextRect
            };
        });
    }

    componentWillReceiveProps(props) {
        this.updateList();
        if (this.splitText) {
            this.updateState(props);
        }
        if (props.textListVisible !== this.textListVisible) {
            setTimeout(() => {
                this.textListVisible = props.textListVisible;
                this.updateState(this.props);
                this.cache.clearAll();
                this.updateList();
            }, 500);
        }
    }

    componentDidMount() {
        this.resizeHandler = _.throttle(() => {
            this.cache.clearAll();
            this.updateList();
            setTimeout(() => {
                this.updateState(this.props);
            }, 200);
        }, 500).bind(this);

        window.addEventListener("resize", this.resizeHandler);

        this.selectionHandler = _.debounce((e) => {
            this.handleSelection(e);
        }, 200).bind(this);

        document.addEventListener("selectionchange", this.selectionHandler);

        if (this.splitText) {
            this.updateState(this.props);
        }
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.resizeHandler);
        document.removeEventListener("selectionchange", this.selectionHandler);
    }

    render() {
        const props = this.props;
        const rowRenderer = this.rowRenderer;
        const cache = this.cache;

        return (
            <div className={styles.splitText} ref={(div) => this.splitText = div}>
                <AutoSizer>
                    {({ height, width }) => (
                    <List
                        ref={(list) => this.list = list}
                        height={height}
                        rowCount={props.splitText.texts.length}
                        rowHeight={cache.rowHeight}
                        rowRenderer={rowRenderer}
                        width={width}
                        overscanRowCount={3}
                        deferredMeasurementCache={cache}
                    />
                    )}
                </AutoSizer>
            </div>
        );
    }

    rowRenderer({key, index, parent, style}) {
        const props = this.props;
        const cache = this.cache;

        return (
            <CellMeasurer
                columnIndex={0}
                key={key}
                parent={parent}
                rowIndex={index}
                cache={cache}
            >
                <div
                    key={key}
                    style={style}
                    className={styles.splitTextRow}
                >
                    <Text
                        segmentedText={props.splitText.texts[index]}
                        annotations={props.annotations}
                        activeAnnotations={props.activeAnnotations}
                        limitWidth={true}
                        row={index}
                        didSelectSegment={props.didSelectSegment}
                        didSelectAnnotation={props.didSelectAnnotation}
                        selectedSegmentId={props.selectedSegmentId}
                        annotationPositions={props.annotationPositions}
                        selectedAnnotatedSegments={props.selectedAnnotatedSegments}
                        textWidth={this.state.textWidth}
                        paddingRight={this.state.textPaddingRight}
                    />
                    {this.state.selectedTextIndex === index &&
                        <AnnotationControlsContainer
                                    annotationPositions={props.annotationPositions}
                                    annotatedText={props.splitText.annotatedText}
                                    activeAnnotation={props.activeAnnotation}
                                    inline={true}
                                    firstSelectedSegment={this.state.firstSelectedSegment}
                                    splitTextRect={this.state.splitTextRect}
                                />
                    }

                </div>
            </CellMeasurer>
        );
    }
}