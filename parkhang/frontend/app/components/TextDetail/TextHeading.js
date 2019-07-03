// @flow
import React from "react";
import addTibetanShay from "lib/addTibetanShay";
import styles from "./TextHeading.css";
import TabBar from "./TabBar";
import Witness from "lib/Witness";
import type { TextData } from "api";
import ExportControl from "./ExportControl";
import Loader from "react-loader";
import ImageToggle from "./ImageToggle";

export type Props = {
    witnesses: Witness[],
    selectedText: TextData,
    selectedWitness: Witness,
    exportingWitness: boolean,
    showPageImages: boolean,
    onToggledPageImages: () => void,
    onSelectedWitness: () => void,
    onExport?: () => void
};

const TextHeading = (props: Props) => {
    let name = "";
    if (props.selectedText && props.selectedText.name) {
        name = addTibetanShay(props.selectedText.name);
    }
    return (
        <div className={styles.headingContainer}>
            <div className={styles.topRow}>
                <h2 className={styles.textHeading}>{name}</h2>

                {props.selectedWitness &&
                    !props.exportingWitness && (
                        <React.Fragment>
                            <div className={styles.controls}>
                                {!props.selectedWitness.isWorking && (
                                    <ImageToggle
                                        showImages={props.showPageImages}
                                        onChange={props.onToggledPageImages}
                                    />
                                )}
                            </div>
                            <ExportControl onClick={props.onExport} />
                        </React.Fragment>
                    )}

                <div className={styles.textHeadingloader}>
                    <Loader loaded={!props.exportingWitness} scale={0.5} />
                </div>
            </div>
            <TabBar
                witnesses={props.witnesses}
                activeWitness={props.selectedWitness}
                onSelectedWitness={props.onSelectedWitness}
            />
        </div>
    );
};

export default TextHeading;
