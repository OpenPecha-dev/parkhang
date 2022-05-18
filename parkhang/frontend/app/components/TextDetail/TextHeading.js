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
import FontSize from "./FontSize";

export type Props = {
    witnesses: Witness[],
    selectedText: TextData,
    selectedWitness: Witness,
    exportingWitness: boolean,
    showPageImages: boolean,
    textFontSize: number,
    onToggledPageImages: () => void,
    onSelectedWitness: () => void,
    onChangedFontSize: () => void,
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
            <TabBar
                witnesses={props.witnesses}
                activeWitness={props.selectedWitness}
                onSelectedWitness={props.onSelectedWitness}
            />
                {props.selectedWitness && (
                    <div className={styles.controls}>
                        {!props.selectedWitness.isWorking && (
                            <ImageToggle
                                showImages={props.showPageImages}
                                onChange={props.onToggledPageImages}
                            />
                        )}
                        <FontSize
                            fontSize={props.textFontSize}
                            onChange={props.onChangedFontSize}
                        />
                        {!props.exportingWitness && (
                            <ExportControl onClick={props.onExport} />
                        )}
                         {/* <div className={styles.textHeadingloader}>
                            <Loader loaded={!props.exportingWitness} scale={0.5} />
                       </div> */}
                    </div>
                )}            
            </div>
        </div>
    );
};

export default TextHeading;
