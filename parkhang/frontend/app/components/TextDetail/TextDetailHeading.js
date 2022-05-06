import React from 'react'
import styles from './textDetailHeading.css'
import Left from 'images/left.svg'
import Tick from 'images/Tick.svg'
import ApplyTooltip from '../UI/ApplyTooltip';



type HeaderProps = {
    user: User,
    activeLocale: string,
    accountOverlayVisible: boolean,
    navigationButtonClicked: () => void,
    menuButtonClicked:()=>void
};

function TextDetailHeading(props:HeaderProps) {

    const selectedText=props?.selectedText;
    const textListIsVisible=props?.textListIsVisible;
    const menuListIsVisible=props?.menuListIsVisible;
  return (
    <div className={styles.textDetailHeading}>
        <span className={styles.leftLogo} style={{transform:!textListIsVisible?'rotate(180deg)':null}}  onClick={props.navigationButtonClicked}><Left/> </span>
       
       <div> <span className={styles.textHeadingTitle}>{selectedText?.name}</span> 
       <ApplyTooltip tooltipName={'online'}>
       <span className={styles.tick}><Tick/></span>
         </ApplyTooltip>
       </div> 
        <span className={styles.rightLogo}   style={{transform:!menuListIsVisible?'rotate(0deg)':'rotate(180deg)',marginRight:10}} onClick={props.menuButtonClicked}><Left/> </span>

        </div>
  )
}

export default TextDetailHeading