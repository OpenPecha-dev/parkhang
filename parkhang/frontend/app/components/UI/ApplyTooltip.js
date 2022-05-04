import React from 'react'
import ReactTooltip from 'react-tooltip'
import { FormattedMessage, injectIntl } from "react-intl";


function ApplyTooltip({children,tooltipName,format=null}) {




  return (
    <>
     <div data-tip data-for={tooltipName} >
     {children}
     </div>
              <ReactTooltip id={tooltipName}  type="dark" effect="solid">
                 {format?<FormattedMessage id={format} />:<span>{tooltipName}</span>}
                </ReactTooltip>
    </>
  )
}

export default ApplyTooltip