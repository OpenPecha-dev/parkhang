import React,{useState} from 'react'
import TextDetailContainer from "components/TextDetail/TextDetailContainer";
import TextDetailContainer2 from "components/TextDetail2/TextDetailContainer";
import { connect } from "react-redux";
import * as reducers from "reducers";


function TextSheet(props) {

  return (
      <div style={{display:'flex',width:'100%'}}>
    <TextDetailContainer />
   {props.isSecondWindowOpen && <TextDetailContainer2 />}
      </div>
  )
}






const mapStateToProps = (state: AppState): { user: User } => {
 
  const isSecondWindowOpen=reducers.isSecondWindowOpen(state);
  return {
    isSecondWindowOpen,
  };
};


const mergeProps = (stateProps, dispatchProps, ownProps) => {
 
const { dispatch } = dispatchProps;

return {
    ...ownProps,
    ...stateProps,
  
};
}
const TextSheetContainer=connect(mapStateToProps, null,mergeProps)(
  TextSheet
);

export default  TextSheetContainer;