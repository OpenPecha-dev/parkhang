import styles from './TooltipCustom.css'
import React from 'react'

function TooltipCustom({children,toolname}) {
  return (
    <div className={styles.tooltip}>{children}
    <span className={styles.tooltiptext} style={{fontSize:14}}>{toolname}</span>
    </div>
  )
}

export default TooltipCustom