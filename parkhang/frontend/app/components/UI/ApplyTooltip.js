import React from 'react'
import ReactTooltip from 'react-tooltip'
import { FormattedMessage, injectIntl } from "react-intl";


function ApplyTooltip({children,tooltipName,format=null,effect='solid',className='',setTimer=0}) {





  return (
    <>
     <div  data-tip data-for={tooltipName}  className={className} style={{width:"100%"}}>
     {children}
     </div>
         <ReactTooltip
               id={tooltipName}  type="dark" effect={effect}>
                 {format?<FormattedMessage id={format} />:<span>{tooltipName}</span>}
                </ReactTooltip>
    </>
  )
}



export default ApplyTooltip