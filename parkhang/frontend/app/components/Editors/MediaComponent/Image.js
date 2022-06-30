import React, { useState, useRef, useEffect } from "react";
import styles from "./Image.css";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import classnames from "classnames";
import Draggable from "react-draggable";
import _ from "lodash";

function Image(props) {
    let isPortraitImage = props.isImagePortrait;
    let ImageArea = useRef(null);
    let [imageSelected, SetSelected] = useState(0);
    let [hide, SetHide] = useState(false);

    let imageList = props.imageData.alignment || [];
    let imageIdList = [];
    let syncIdOnScroll = props.syncIdOnScroll;
    let syncIdOnClick = props.syncIdOnClick;

    let sourceId = parseInt(props.imageData.source);
    if (!_.isEmpty(imageList)) {
        imageIdList = imageList.map((l) => parseInt(l.source_segment.start));
    }

    useEffect(() => {
        //    if(sourceId===props.selectedText.id){
        if (imageList.length > 0) {
            let intersection = syncIdOnScroll.filter((element) =>
                imageIdList.includes(parseInt(element))
            );
            let newList = imageList.filter(
                (d) => d?.source_segment?.start === intersection[0]
            );
            let numberId = imageList.indexOf(newList[0]);
            if (numberId >= 0) {
                SetSelected(numberId);
            }
            // }
        }
    }, [syncIdOnScroll]);

    useEffect(() => {
        let ClickId = syncIdOnClick.toString().replace("s_", "");
        let temp = 1;
        imageIdList.sort().forEach((l) => {
            if (l <= ClickId) {
                temp = l;
            }
        });
        let numberId = imageIdList.indexOf(temp);
        if (numberId >= 0) {
            SetSelected(numberId);
        }
    }, [syncIdOnClick]);

    const isPortrait = ({ target: img }) => {
        //this Check if the provided Image is a portrait or a landScape
        let tempHeight = img.naturalHeight;
        let tempWIdth = img.naturalWidth;
        if (tempHeight === 0 || tempWIdth === 0) return null;
        props.changeIsImagePortrait(tempHeight >= tempWIdth);
    };

    function HttpUrl(data = "") {
        if (data.includes("http")) return data;
        return "http://" + data;
    }

    return (
        <div
            className={
                isPortraitImage
                    ? styles.ThirdWindowPortrait
                    : hide
                    ? classnames(styles.ThirdWindow, styles.hideWindow)
                    : styles.ThirdWindow
            }
        >
            {/* <div className={styles.header}>
                <div className={styles.ImageTitle}>Images :</div>
                <button
                    data-value="previousImage"
                    onClick={() => {
                        if (imageSelected <= 0) return;
                        SetSelected((prev) => prev - 1);
                    }}
                >
                    {"<"}
                </button>
                <div className={styles.listOfImages}>
                    {imageList.length > 0 &&
                        imageList.map((list, key) => {
                            return (
                                <div
                                    key={`eachImage-${key}`}
                                    className={
                                        key === imageSelected
                                            ? classnames(
                                                  styles.eachImage,
                                                  styles.selected
                                              )
                                            : styles.eachImage
                                    }
                                    id={`eachImage-${key}`}
                                    onClick={() => SetSelected(key)}
                                >
                                    <img
                                        src={HttpUrl(list.target_segment)}
                                        alt={list}
                                    />
                                </div>
                            );
                        })}
                </div>

                <button
                    data-value="nextImage"
                    onClick={() => {
                        if (imageSelected >= imageList.length - 1) return;
                        SetSelected((prev) => prev + 1);
                    }}
                >
                    {">"}
                </button>
                <div
                    className={styles.closeBtn}
                    onClick={() => props.changeMediaSelection(null)}
                >
                    x
                </div>

                {!isPortraitImage && (
                    <div
                        className={styles.hideButton}
                        onClick={() => SetHide((prev) => !prev)}
                    >
                        {hide ? "Show" : "Hide"}
                    </div>
                )}
            </div> */}
            <div className={styles.imageRender} ref={ImageArea}>
                {imageList.length > 0 && (
                    <TransformWrapper>
                        <TransformComponent>
                            <img
                                src={
                                    HttpUrl(
                                        imageList[imageSelected].target_segment
                                    ) || ""
                                }
                                alt="SyncImage"
                                onLoad={isPortrait}
                            />
                        </TransformComponent>
                    </TransformWrapper>
                )}
            </div>
        </div>
    );
}

export default Image;
