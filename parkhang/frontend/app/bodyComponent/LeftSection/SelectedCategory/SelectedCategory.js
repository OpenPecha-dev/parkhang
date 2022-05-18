import React,{useState} from "react";
import styles from "./SelectedCategory.css";
import TranslateButton from "../../utility/TranslateButton";
import Tabs from "../../utility/Tabs";

function SelectedCategory(props) {
    const { onChangedActiveCategory, Textdata } = props;
    let versionData={

    }
    const list = Textdata?.detail?.filter(
        (el) => el.texttitle === Textdata?.activeText
    );

   const selectionlist= list[0]?.chapters?.filter(el=>el.name===Textdata?.activeCategory)

    return (
        <div className={styles.category}>
            <div className={styles.Title}>
                <h1>
                    <span>{Textdata.activeCategory}</span>
                </h1>
                <TranslateButton />
            </div>

            <Tabs chapterData={selectionlist} versionData={versionData}/>

            <button
                onClick={() => onChangedActiveCategory(null)}
                className={styles.back}
            >
                Back
            </button>
        </div>
    );
   
}

export default SelectedCategory;
