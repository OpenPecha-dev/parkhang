import React, { useState, useRef, useEffect } from "react";
import styles from "./Image.css";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import classnames from 'classnames'
import Draggable from 'react-draggable';

function Image(props) {

    let [isPortraitImage, setIsPortrait] = useState(null);
    let ImageArea = useRef(null);
    let [imageSelected, SetSelected] = useState(0);
    let imageList = props.imageData.alignment || [];
    let syncId=props.syncId;
    useEffect(()=>{
       let newList= imageList.filter(d=>d.source_segment_id===syncId);
        let numberId=imageList.indexOf(newList[0])
     if(numberId>=0&& numberId<4){
        SetSelected(numberId)
     }

    },[syncId])

    const isPortrait = ({ target: img }) => {
        //this Check if the provided Image is a portrait or a landScape
        let tempHeight = img.naturalHeight;
        let tempWIdth = img.naturalWidth;
        if (tempHeight === 0 || tempWIdth === 0) return null;
        setIsPortrait(tempHeight >= tempWIdth);
    };


    function HttpUrl(data){
        if(data.includes('http')) return data
        return 'http://'+data;
    }


    return (
  
        <div className={isPortraitImage?styles.ThirdWindowPortrait:styles.ThirdWindow}>
            <div className={styles.header} >
                <div className={styles.ImageTitle}>
                    Images :
                    {/* {isPortraitImage?"portrait":"landscape"} */}
                </div>
                <button
                    data-value='previousImage'
                    onClick={() => {
                        if (imageSelected <= 0) return;
                        SetSelected((prev) => prev - 1);
                    }}
                >
                    {'<'}
                </button>
                <div className={styles.listOfImages}>
               
                 {imageList.map((list, key) => {
                    return (
                        <div
                            key={`eachImage-${key}`}
                            className={key===imageSelected?classnames(styles.eachImage,styles.selected): styles.eachImage}
                            id={`eachImage-${key}`}
                            onClick={() => SetSelected(key)}
                        >
                            <img src={HttpUrl(list.target_image_url)} alt={list} />
                        </div>
                    );
                })}
            
                </div>
       

<button
                    data-value='nextImage'
                    onClick={() => {
                        if (imageSelected >= imageList.length - 1) return;
                        SetSelected((prev) => prev + 1);
                    }}
                >
                    {'>'}
                </button>
                <div
                    className={styles.closeBtn}
                    onClick={() => props.changeMediaSelection(null)}
                >
                    x
                </div>
            </div>
            <div className={styles.imageRender} ref={ImageArea}>
                <TransformWrapper>
                    <TransformComponent>
                        <img
                            src={HttpUrl(imageList[imageSelected].target_image_url)}
                            onLoad={isPortrait}
                        />
                    </TransformComponent>
                </TransformWrapper>
            </div>

        </div>
    );
}

export default Image;
