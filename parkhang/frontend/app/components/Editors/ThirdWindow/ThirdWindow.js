import React,{useState} from 'react'
import styles from './ThirdWindow.css'
import HorizontalText from 'images/exampleImage/horizontalText.jpg'
import VerticalText from 'images/exampleImage/verticalText.png'
import {TransformWrapper,TransformComponent} from 'react-zoom-pan-pinch'

function ThirdWindow(props) {
    let [imageurl,setImageurl]=useState(true)
  return (
    <div className={styles.ThirdWindow}>
        <div className={styles.header}>
        <div className={styles.ImageTitle}>Images</div>
        <div className={styles.closeBtn} onClick={()=>props.toggleImage(false)}>x</div>
        </div>
<div className={styles.imageRender}>
<TransformWrapper >
    <TransformComponent>
    <img src={imageurl ? HorizontalText:VerticalText}/>
    </TransformComponent>
</TransformWrapper>

</div>


<button onClick={()=>setImageurl(prev=>!prev)}>change</button>
    </div>
  )
}

export default ThirdWindow