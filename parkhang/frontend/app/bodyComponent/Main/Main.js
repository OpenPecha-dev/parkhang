import React from 'react'
import styles from './main.css'

import LeftSection from 'bodyComponent/LeftSection'
import RightSection from 'bodyComponent/RightSection'
function Main() {
  return (
      <div className={styles.Main}>
           
           <LeftSection/>
           <RightSection/>

      </div>
  )
}

export default Main