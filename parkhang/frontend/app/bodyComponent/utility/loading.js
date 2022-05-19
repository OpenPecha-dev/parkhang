import React from "react";
import styles from './loading.css'

const Loading=(props)=>{
  let visible:boolean
  visible=props.visible

    return visible ?<div className={styles.flex}>
    <div className={styles.shimmer}/>
    <div className={styles.shimmer}/>
    <div className={styles.shimmer}/>
    <div className={styles.shimmer}/>
    <div className={styles.shimmer}/>
    <div className={styles.shimmer}/>
    <div className={styles.shimmer}/>


    </div>:null


}

export default Loading