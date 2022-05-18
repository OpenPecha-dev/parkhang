import React, { useState } from "react";
import styles from "./Tabs.css";
import classnames from "classnames";
import Link from "redux-first-router-link";
function Tabs({ chapterData, versionData }) {
    const [toggleState, setToggleState] = useState(1);

    const toggleTab = (index) => {
        setToggleState(index);
    };
    return (
        <div className={styles.container}>
            <div className={styles.bloc_tabs}>
                <div
                    className={
                        toggleState === 1
                            ? classnames(styles.tabs, styles.active_tabs)
                            : styles.tabs
                    }
                    onClick={() => toggleTab(1)}
                >
                    Contents
                </div>
                <div
                    className={
                        toggleState === 2
                            ? classnames(styles.tabs, styles.active_tabs)
                            : styles.tabs
                    }
                    onClick={() => toggleTab(2)}
                >
                    Version
                </div>
            </div>

            <div className={styles.content_tabs}>
                <div
                    className={
                        toggleState === 1
                            ? classnames(styles.content, styles.active_content)
                            : styles.content
                    }
                >
                    {chapterData?.map((chapter,index) =>{ 
            
                               
                      return (
                          <div key={20 * Math.random()}>
                              <h2 className={styles.sectionHeader}>
                                  {chapter?.name}
                              </h2>
                              <div className={styles.ChapterContainer}>
                                  {chapter?.selection.map((select) =>
                                      <Link to="/texts/3"  key={300*Math.random()}>
                                      <div
                                            className={styles.selection}  >
                                            {select?.id}
                                        </div>
                                        </Link>
                                       )}
                              </div>
                          </div>
                      );
                              
                    }
                    )}
                </div>

                <div
                    className={
                        toggleState === 2
                            ? classnames(styles.content, styles.active_content)
                            : styles.content
                    }
                >
                    <h2>{versionData?.title}</h2>
                    <hr />
                  <div className={styles.versionBlock}>

                      <div className={styles.versionHeading}>
                          <h4><Link to='/'>Title</Link></h4>
                          <div className={styles.versionLanguage}>བོད་ཡིག</div>
                      </div>
                      <div className={styles.versionNotes}>
                          version Notes
                      </div>
                       <div className={styles.versionDetails}>
                            <div className={styles.versionLinks}>
                                <ul>
                                    <li><a href="#">lopenling.org</a></li>
                                </ul>
                            </div>
                            <div className={styles.versionImage}>
                                <img src='https://cdn.exoticindia.com/images/products/thumbnails/t400x300/books-2017/nan755.jpg'/>
                            </div>
                       </div>

                  </div>

                     
                </div>
            </div>
        </div>
    );
}

export default Tabs;
