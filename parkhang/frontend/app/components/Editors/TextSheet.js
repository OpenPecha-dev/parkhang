import React from 'react'
import TextDetailContainer from "components/TextDetail/TextDetailContainer";
import TextDetailContainer2 from "components/TextDetail2/TextDetailContainer";

function TextSheet() {
  return (
      <div style={{display:'flex',width:'100%'}}>
    <TextDetailContainer />
    <TextDetailContainer2 />
      </div>
  )
}

export default TextSheet