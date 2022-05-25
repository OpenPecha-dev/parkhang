import React from 'react'
import styles from './Slider.css'
function Slider({max,min,initialvalue,changeSize=(r)=>console.log(r)}) {
  return (
    <div className={styles.inputRanges}> 
      <span style={{fontSize:13,top:'-5px'}}>ཀ</span>
    <input type="range" style={{width:'70%'}} className={styles.inputRange} min={min} max={max} value={initialvalue} onChange={ e => changeSize(parseInt(e.target.value))}/>
    <span style={{fontSize:18,top:'-10px'}}>ཀ</span> 
    </div>
  )
}

export default Slider