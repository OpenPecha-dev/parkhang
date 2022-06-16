import React from 'react'
import TextDetailContainer from "components/TextDetail/TextDetailContainer";
import TextDetailContainer2 from "components/TextDetail2/TextDetailContainer";
import { connect } from "react-redux";
import * as reducers from "reducers";
import * as actions from "actions";
import ThirdWindow from './ThirdWindow/ThirdWindow';


function TextSheet(props) {

  return (<div style={{display:'flex',width:'100%',height:props.bodyHeight,overflow:'hidden'}}>
            <TextDetailContainer />
          {props.isSecondWindowOpen && <TextDetailContainer2 />}
          {props.isImageVisible && props.isSecondWindowOpen &&  <ThirdWindow toggleImage={props.toggleImage}/>}
         
      </div>)
}

const mapStateToProps = (state: AppState): { user: User } => {
 
  const isSecondWindowOpen=reducers.isSecondWindowOpen(state);
  return {
    isSecondWindowOpen,
    isImageVisible:reducers.showPageImages(state),
  };
};


const mergeProps = (stateProps, dispatchProps, ownProps) => {
 
const { dispatch } = dispatchProps;
const toggleImage=(data)=>dispatch(actions.changedShowPageImages(data))
return {
    ...ownProps,
    ...stateProps,
     toggleImage
};
}
const TextSheetContainer=connect(mapStateToProps, null,mergeProps)(
  TextSheet
);

export default  TextSheetContainer;