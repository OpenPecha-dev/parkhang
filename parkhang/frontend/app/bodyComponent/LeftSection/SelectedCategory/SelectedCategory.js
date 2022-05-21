import React, { useState } from "react";
import styles from "./SelectedCategory.css";
import TranslateButton from "../../utility/TranslateButton";
import Tab from "../../utility/Tab";
import Link from "redux-first-router-link";

function SelectedCategory(props) {
    const { onChangedActiveCategory, Textdata } = props;
    let versionData = [{ title: "working",
    language:'བོད་ཡིག',
    link:'lopenling.org',
    img:"https://cdn.exoticindia.com/images/products/thumbnails/t400x300/books-2017/nan755.jpg"  }];
    const list = Textdata?.detail?.filter(
        (el) => el.texttitle === Textdata?.activeText
    );

    const selectionlist = list[0]?.chapters?.filter(
        (el) => el.name === Textdata?.activeCategory
    );
    const tabContent = [
        { title: "selections", selectionlist },
        { title: "Version", versionData },
    ];
    return (
        <div className={styles.category}>
            <div className={styles.Title}>
                <h1>
                    <span>{Textdata.activeCategory}</span>
                </h1>
                <TranslateButton />
            </div>

            {/* <Tabs chapterData={selectionlist} versionData={versionData}/> */}

            <Tab active={0}>
                {tabContent.map((tab, idx) => (
                    <Tab.TabPane key={`Tab-${idx}`} tab={tab.title}>
                        {tab.selectionlist?.map((chapter, index) => {
                            return (
                                <div key={`selection-${index}`} className={styles.content}>
                                    <h2 className={styles.sectionHeader}>
                                        {chapter?.name}
                                    </h2>
                                    <div className={styles.ChapterContainer}>
                                        {chapter?.selection.map((select) => (
                                            <Link
                                                to="/texts/3"
                                                key={300 * Math.random()}
                                            >
                                                <div
                                                    className={styles.selection}
                                                >
                                                    {select?.id}
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                        {tab.versionData?.map((version, idx) => (
                            <div className={styles.content} key={`version-${idx}`}>
                                <div className={styles.versionHeading}>
                                    <h4>
                                        <Link to="/">{version.title}</Link>
                                    </h4>
                                    <div className={styles.versionLanguage}>
                                        {version.language}
                                    </div>
                                </div>
                                <div className={styles.versionNotes}>
                                    version Notes
                                </div>
                                <div className={styles.versionDetails}>
                                    <div className={styles.versionLinks}>
                                        <ul>
                                            <li>
                                                <a href="#">{version.link}</a>
                                            </li>
                                        </ul>
                                    </div>
                                    <div className={styles.versionImage}>
                                        <img src={version.img}/>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </Tab.TabPane>
                ))}
            </Tab>
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
