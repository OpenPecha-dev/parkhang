import React from "react";
import Link from "redux-first-router-link";
import styles from "./SelectedText.css";
import TranslateButton from "../../utility/TranslateButton";
import SelectedCategory from "../SelectedCategory";

function SelectedText(props) {
    const { Textdata } = props;

    const isTextPresent=Textdata?.detail?.find((el)=>{
        return el.texttitle === Textdata?.activeText
    })
    const list = Textdata?.detail?.filter(
        (el) => el.texttitle === Textdata?.activeText
    );
    let actuallist = list[0]?.chapters;
    if (Textdata.activeCategory === null && isTextPresent)
        return (
            <div className={styles.selectedText}>
   

                <div className={styles.Title}>
                    <h1>
                        <span>{Textdata.activeText}</span>
                    </h1>
                    <TranslateButton />
                </div>

                <div className={styles.category}>
                    <h2>
                        {Textdata?.category?.title}
                        <span className={styles.categoryDesc}>
                            {"(" + Textdata?.category?.description + ")"}
                        </span>
                    </h2>

                    <div className={styles.responsiveBox}>
                        <div className={styles.gridBox}>
                            {actuallist.map((list, index) => (
                                <div className={styles.gridBoxItem} key={index}>
                                    <div className={styles.navBlock}>
                                        <Link
                                            to={`/title/${Textdata?.activeText}/category/${list?.name}`}
                                            className={styles.navBlockTitle}
                                        >
                                            <span>
                                                {list?.name}
                                            </span>
                                        </Link>
                                        <div
                                            className={
                                                styles.navBlockDescription
                                            }
                                        >
                                            <span className="en" lang="en">
                                                sadfasdfasdfadf
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
               
            </div>
        );
    
    if(!isTextPresent){
        return <div>go to main page and select a proper text</div>
    }

    else return <SelectedCategory/>;
}

export default SelectedText;
