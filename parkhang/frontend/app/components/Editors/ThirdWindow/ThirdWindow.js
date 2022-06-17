import React, { useState, useRef, useEffect } from "react";
import styles from "./ThirdWindow.css";
import HorizontalText from "images/exampleImage/horizontalText.jpg";
import VerticalText from "images/exampleImage/verticalText.png";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import classnames from 'classnames'
function ThirdWindow(props) {
    let [imagetoggle, setImagetoggle] = useState(true);
    let [isPortraitImage, setIsPortrait] = useState(null);
    let ImageArea = useRef(null);
    let [imageSelected, SetSelected] = useState(0);
    let imageList =
     [{id:'0',url:HorizontalText},
     {id:'1012',url:'https://images.unsplash.com/photo-1644982648791-a010e61aa845?ixlib=rb-1.2.1&ixid=MnwxMjA3fDF8MHxlZGl0b3JpYWwtZmVlZHwxfHx8ZW58MHx8fHw%3D&auto=format&fit=crop&w=500&q=60'},
     {id:'2023',url:VerticalText},
     {id:'3019',url:'https://images.unsplash.com/photo-1655329943539-1297fbd0923f?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHw0fHx8ZW58MHx8fHw%3D&auto=format&fit=crop&w=500&q=60'}];
    let syncId=props.syncId;
    useEffect(()=>{

       let newList= imageList.filter(d=>d.id===syncId);
        let numberId=imageList.indexOf(newList[0])
     if(numberId>0&& numberId<4){
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

    return (
        <div className={styles.ThirdWindow}>
            <div className={styles.header}>
                <div className={styles.ImageTitle}>
                    Images :{/* {isPortraitImage?"portrait":"landscape"} */}
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
                {imageList.map((list, key) => {
                    return (
                        <div
                            key={`eachImage-${key}`}
                            className={key===imageSelected?classnames(styles.eachImage,styles.selected): styles.eachImage}
                            onMouseOver={() => SetSelected(key)}
                        >
                            <img src={list.url} alt={list} />
                        </div>
                    );
                })}

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
                    onClick={() => props.toggleImage(false)}
                >
                    x
                </div>
            </div>
            <div className={styles.imageRender} ref={ImageArea}>
                <TransformWrapper>
                    <TransformComponent>
                        <img
                            src={imageList[imageSelected].url}
                            onLoad={isPortrait}
                        />
                    </TransformComponent>
                </TransformWrapper>
            </div>

        </div>
    );
}

export default ThirdWindow;
