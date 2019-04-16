// @flow
import * as React from "react";
import classnames from "classnames";
import { AutoSizer } from "react-virtualized/dist/es/AutoSizer";
import {
    CellMeasurer,
    CellMeasurerCache
} from "react-virtualized/dist/es/CellMeasurer";
import "react-virtualized/styles.css"; // only needs to be imported once
import { List } from "react-virtualized/dist/es/List";
import * as api from "api";
import GraphemeSplitter from "grapheme-splitter";
import addTibetanShay from "lib/addTibetanShay";
import styles from "./TextList.css";
import Loader from "react-loader";

type Props = {
    selectedText: api.TextData,
    texts: api.TextData[],
    onSelectedText: (text: api.TextData) => void,
    onSelectedSearchResult: (
        text: api.TextData,
        start: number,
        length: number,
        selectedText: api.TextData
    ) => void,
    searchTerm: string,
    searchResults: { [number]: api.TextSearchResultData },
    selectedSearchResult: null | {
        textId: number,
        start: number,
        length: number
    },
    searching: boolean
};

const DEFAULT_ROW_HEIGHT = 60;

class TextList extends React.Component<Props> {
    list: List | null;
    cache: CellMeasurerCache;
    rowRenderer: (params: {
        key: string,
        index: number,
        parent: {},
        style: {}
    }) => React.Element<CellMeasurer>;

    constructor(props: Props) {
        super(props);
        this.cache = new CellMeasurerCache({
            fixedWidth: true,
            defaultHeight: DEFAULT_ROW_HEIGHT,
            minHeight: DEFAULT_ROW_HEIGHT
        });
        this.rowRenderer = this.rowRenderer.bind(this);
    }

    componentDidUpdate(prevProps: Props): void {
        this.cache.clearAll();
        if (this.list) this.list.forceUpdateGrid();
    }

    rowRenderer({
        key,
        index,
        parent,
        style
    }: {
        key: string,
        index: number,
        parent: {},
        style: {}
    }): React.Element<CellMeasurer> {
        const selectedText = this.props.selectedText;
        const selectedTextId = selectedText ? selectedText.id : -1;
        const selectedSearchResult = this.props.selectedSearchResult;
        const texts = this.props.texts;
        const onSelectedText = this.props.onSelectedText;
        const onSelectedSearchResult = this.props.onSelectedSearchResult;
        const searchTerm = this.props.searchTerm;
        const splitter = new GraphemeSplitter();
        const searchResults = this.props.searchResults;

        let className = styles.textListRow;
        const text = texts[index];
        if (text.id === selectedTextId) {
            className = classnames(className, styles.selectedRow);
        }
        let name = addTibetanShay(text.name);
        let textSearchResults = [];

        if (searchTerm.length > 0) {
            const graphemes = splitter.splitGraphemes(name);
            const start = name.indexOf(searchTerm);
            const end = start + searchTerm.length;
            let position = 0;
            let foundGraphemes = "";
            if (start > -1) {
                for (let i = 0; i < graphemes.length; i++) {
                    let grapheme = graphemes[i];
                    if (position >= start && position < end) {
                        foundGraphemes += grapheme;
                    }
                    position += grapheme.length;
                }
            }

            if (foundGraphemes.length > 0) {
                const graphemeSpan =
                    "<span class=" +
                    styles.highlight +
                    ">" +
                    foundGraphemes +
                    "</span>";
                name = name.replace(foundGraphemes, graphemeSpan);
            }
            if (searchResults.hasOwnProperty(text.id)) {
                textSearchResults = searchResults[text.id].results;
            }
        }

        const html = {
            __html: name
        };

        const cache = this.cache;

        let textSearchResultRows = [];
        if (textSearchResults.length > 0) {
            textSearchResultRows = textSearchResults.map(result => {
                const isSelected =
                    selectedSearchResult &&
                    selectedSearchResult.textId === text.id &&
                    selectedSearchResult.start === result[0];
                const className = isSelected
                    ? styles.selectedSearchResult
                    : styles.searchResult;
                if (isSelected) {
                    // TODO: keeps getting rendered when selecting a syllable
                    console.log("got selected result: %o", result);
                }
                return (
                    <div
                        key={text.id + "_" + result[0]}
                        onClick={() => {
                            onSelectedSearchResult(
                                text,
                                result[0],
                                searchTerm.length,
                                selectedText
                            );
                        }}
                        className={className}
                    >
                        {result[1]}
                    </div>
                );
            });
        }

        return (
            <CellMeasurer
                columnIndex={0}
                key={key}
                parent={parent}
                rowIndex={index}
                cache={cache}
            >
                <div key={key} style={style} className={className}>
                    <div
                        className={styles.textName}
                        dangerouslySetInnerHTML={html}
                        onClick={() => {
                            onSelectedText(texts[index]);
                        }}
                    />
                    {textSearchResults.length > 0 && (
                        <div className={styles.searchResults}>
                            {textSearchResultRows}
                        </div>
                    )}
                </div>
            </CellMeasurer>
        );
    }

    render() {
        const texts = this.props.texts;
        let rowCount = texts.length;

        return (
            <div className={styles.textList}>
                {this.props.texts && this.props.texts.length > 0 ? (
                    <AutoSizer>
                        {({ height, width }) => (
                            <List
                                ref={list => (this.list = list)}
                                height={height}
                                rowCount={rowCount}
                                rowHeight={this.cache.rowHeight}
                                rowRenderer={this.rowRenderer}
                                width={width}
                                overscanRowCount={3}
                                deferredMeasurementCache={this.cache}
                            />
                        )}
                    </AutoSizer>
                ) : this.props.searching ? (
                    <div className={styles.textListLoader}>
                        <Loader loaded={!this.props.searching} scale={0.5} />
                        <p className={styles.searching}>Searching…</p>
                    </div>
                ) : (
                    <ul className="textList">
                        <li>(no texts)</li>
                    </ul>
                )}
            </div>
        );
    }
}

export default TextList;
