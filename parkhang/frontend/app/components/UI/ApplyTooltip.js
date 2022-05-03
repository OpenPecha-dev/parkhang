import React from 'react'
import ReactTooltip from 'react-tooltip'


function ApplyTooltip({children,tooltipName}) {




  return (
    <>
     <a data-tip data-for={tooltipName}>
     {children}
     </a>
              <ReactTooltip id={tooltipName}  type="dark" effect="solid">
                 <span>{tooltipName}</span>
                </ReactTooltip>
    </>
  )
}

export default ApplyTooltip