import React,{useState,useRef,useEffect} from 'react'
import styles from './ThirdWindow.css'
import HorizontalText from 'images/exampleImage/horizontalText.jpg'
import VerticalText from 'images/exampleImage/verticalText.png'
import {TransformWrapper,TransformComponent} from 'react-zoom-pan-pinch'

function ThirdWindow(props) {
    let [imagetoggle,setImagetoggle]=useState(true)
    let [isPortraitImage,setIsPortrait]=useState(null);
    let ImageArea=useRef(null);


    const isPortrait=({target:img})=>{   //this Check if the provided Image is a portrait or a landScape
      let tempHeight=img.naturalHeight
      let tempWIdth=img.naturalWidth
      if(tempHeight=== 0|| tempWIdth===0) return null;
      setIsPortrait(tempHeight>=tempWIdth);
    }

  return (
    <div className={styles.ThirdWindow}>
        <div className={styles.header}>
        <div className={styles.ImageTitle}>Images:{isPortraitImage?"protrait":"landscape"}</div>
        <div className={styles.closeBtn} onClick={()=>props.toggleImage(false)}>x</div>
        </div>
<div className={styles.imageRender} ref={ImageArea}>
<TransformWrapper >
    <TransformComponent>
    <img src={imagetoggle?HorizontalText:VerticalText } onLoad={isPortrait}/>
    </TransformComponent>
</TransformWrapper>

</div>

<div className={styles.NavigationImage}>
<button onClick={()=>setImagetoggle(prev=>!prev)}>Previous</button>
<button onClick={()=>setImagetoggle(prev=>!prev)}>Next</button>
</div>

    </div>
  )
}

export default ThirdWindow