import React from 'react'
import ReactTooltip from 'react-tooltip'
import { FormattedMessage, injectIntl } from "react-intl";


function ApplyTooltip({children,tooltipName,format=null,effect='solid'}) {




  return (
    <>
     <a  data-tip data-for={tooltipName}  >
     {children}
     </a>
              <ReactTooltip
               id={tooltipName}  type="dark" effect={effect}>
                 {format?<FormattedMessage id={format} />:<span>{tooltipName}</span>}
                </ReactTooltip>
    </>
  )
}



export default ApplyTooltip