import React from 'react'
import styles from './Resources.css'
import About from 'images/about-text.svg'
import Comment from 'images/notes.svg'
import Dictionaries from 'images/dictionaries.svg'
import Feedback from 'images/feedback.svg'

function Resources() {
  
    const header=(head)=><span>{head}</span>

    return (
    <div className={styles.Resources}>
       <div className={styles.ResourcesHeader}>{header('Resources')}</div>
       <div className={styles.ResourcesBody}>
           <ul>
               <li><About/>About this Text</li>
               <li><Comment/>Commentary</li>
               <li><Dictionaries/>Dictionary</li>
               <li><Feedback/>Questions</li>

           </ul>
       </div>
    </div>
  )
}

export default Resources