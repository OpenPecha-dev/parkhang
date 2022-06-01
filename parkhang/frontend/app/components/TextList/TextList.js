// @flow
import React from "react";
import classnames from "classnames";
import { AutoSizer } from "react-virtualized/dist/es/AutoSizer";
import {
    CellMeasurer,
    CellMeasurerCache
} from "react-virtualized/dist/es/CellMeasurer";
import "react-virtualized/styles.css"; // only needs to be imported once
import { List } from "react-virtualized/dist/es/List";
import * as api from "api";
import addTibetanShay from "lib/addTibetanShay";
import styles from "./TextList.css"
import Loader from "react-loader";
import HighlightedString from "./HighlightedString";
import ResultCount from "./ResultCount";
import LoadMore from "./LoadMore";




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
    onSearchText: (text: api.TextData, searchTerm: string) => void,
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
    componentDidMount(){
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
        const searchResults = this.props.searchResults;
        let className = styles.textListRow;

        const text = texts[index];
        if (text.id === selectedTextId) {
            className = classnames(className, styles.selectedRow);
        }
        let name = addTibetanShay(text.name);
        let nameHtml = <span className={styles.textName}>{name}</span>;
        let textSearchResults = [];
        let resultsCount = null;
        let extraRemaining = false;
        let loadingResults = false;

        if (searchTerm.length > 0) {
            nameHtml = (
                <HighlightedString
                    string={name}
                    stringClass={styles.textName}
                    highlightClass={styles.highlight}
                    searchTerm={searchTerm}
                />
            );
            if (searchResults.hasOwnProperty(text.id)) {
                textSearchResults = searchResults[text.id].results;
                extraRemaining = searchResults[text.id].extra;
                loadingResults = searchResults[text.id].loading;
                resultsCount = (
                    <ResultCount
                        count={searchResults[text.id].total}
                        extra={extraRemaining}
                    />
                );
            }
        }

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
                        <HighlightedString
                            string={result[1]}
                            highlightClass={styles.highlight}
                            searchTerm={searchTerm}
                        />
                    </div>
                );
            });
        }

        const searchText = () => {
            this.props.onSearchText(text, searchTerm);
        };
         
        return (
            <CellMeasurer
                columnIndex={0}
                key={key}
                parent={parent}
                rowIndex={index}
                cache={cache}
            >
                <div key={`listkeys-${key}`} style={style} className={className}>
                    {searchTerm && <div
                        className={styles.textNameRow}
                        onClick={() => {
                            onSelectedText(texts[index]);
                        }}
                    >
                        {nameHtml} {resultsCount}
                    </div>}
                    {textSearchResults.length > 0 && (
                        <div className={styles.searchResults}>
                            {textSearchResultRows}
                        </div>
                    )}
                    {extraRemaining && (
                        <div className={styles.loadMore} onClick={searchText}>
                            <LoadMore loading={loadingResults} />
                        </div>
                    )}
                </div>
            </CellMeasurer>
        );
    }
   findRowHeight({searchTerm}){
    return searchTerm ? null: 40;
  }
    render() {
        const texts = this.props.texts;
        let rowCount = texts.length;
        return (
            <div className={styles.textList}>
                {this.props.texts && this.props.texts.length > 0 ? (
                    <AutoSizer>
                        {({ height,width }) => (
                            <List
                                ref={list => (this.list = list)}
                                height={height}
                                rowCount={rowCount}
                                rowHeight={this.findRowHeight(this.props)||this.cache.rowHeight}
                                rowRenderer={this.rowRenderer}
                                width={width}
                                overscanRowCount={3}
                                deferredMeasurementCache={this.cache}
                           >
                           </List>
                          
                        )}
                    </AutoSizer>
                ) : this.props.searching ? (
                    <div className={styles.textListLoader}>
                        <Loader loaded={!this.props.searching} scale={0.5} />
                        <p className={styles.searching}>Searching…</p>
                    </div>
                ) : (
                    <ul className="textList" />
                )}
            </div>
        );
    }
}

export default TextList;
