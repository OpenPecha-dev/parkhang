import React from 'react'
import TextsSearchContainer from "components/TextsSearch/TextsSearchContainer";
import TextListContainer from "containers/TextListContainer";
import SplitPane, { Pane } from "react-split-pane";

function Find() {
  return (
   
            <div className={{display:'flex'}}>             
             <TextsSearchContainer />
            <TextListContainer /> 
            </div>
  )
}

export default Find