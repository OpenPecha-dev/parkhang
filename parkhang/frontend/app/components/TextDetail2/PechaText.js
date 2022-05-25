import React from "react";
import { AutoSizer } from "react-virtualized/dist/es/AutoSizer";
import { List } from "react-virtualized/dist/es/List";
import {
    CellMeasurer,
    CellMeasurerCache
} from "react-virtualized/dist/es/CellMeasurer";
import "react-virtualized/styles.css"; // only needs to be imported once
import Text from "./Text";
import styles from "./PechaText.css";

const cache = new CellMeasurerCache({
    fixedWidth: true
});

const PechaText = props => {
    const paginatedText = props.paginatedText;
    const pages = paginatedText.getPages();

    function rowRenderer({ key, index, parent, style }) {
        return (
            <CellMeasurer
                columnIndex={0}
                key={key}
                parent={parent}
                rowIndex={index}
                cache={cache}
            >
                <div key={key} style={style} className={styles.textPagesRow}>
                    <div className={styles.pechaImage}>
                        <div className={styles.pechaContent}>
                            <p>Page {index + 1} image</p>
                        </div>
                    </div>
                    <Text
                        segmentedText={pages[index]}
                        annotations={props.annotations}
                        activeAnnotations={props.activeAnnotations}
                        annotationPositions={props.annotationPositions}
                        selectedAnnotatedSegments={
                            props.selectedAnnotatedSegments
                        }
                    />
                </div>
            </CellMeasurer>
        );
    }

    return (
        <div className={styles.pechaText}>
            {pages.length > 0 ? (
                <AutoSizer>
                    {({ height, width }) => (
                        <List
                            height={height}
                            rowCount={pages.length}
                            rowHeight={cache.rowHeight}
                            rowRenderer={rowRenderer}
                            width={width}
                            deferredMeasurementCache={cache}
                        />
                    )}
                </AutoSizer>
            ) : (
                <ul>
                    <li>(no pages)</li>
                </ul>
            )}
        </div>
    );
};

export default PechaText;
