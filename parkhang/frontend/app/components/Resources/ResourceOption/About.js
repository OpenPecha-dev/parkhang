import React,{useState} from 'react'
import styles from './About.css'
import classnames from 'classnames'
import { connect } from "react-redux";
import * as actions from "actions";
import * as reducers from 'reducers'

import Check from "images/checkmark.png";

function About(props) {
  const [activeSection,setActiveSection]=useState('about')
  return (
   <>
   <div className={styles.Selection}>
       <div className={activeSection==='about'?classnames(styles.Btn,styles.active):styles.Btn} onClick={()=>setActiveSection('about')}>About</div>
       <div className={activeSection==='resources'?classnames(styles.Btn,styles.active):styles.Btn}  onClick={()=>setActiveSection('resources')}>Resources</div>
   </div>
   
   <div className={styles.selected}>
     {activeSection==='about' && <SelectedAbout/>}
     {activeSection==='resources' && <SelectedResources props={props}/>}
   </div>

   </>)

}


function SelectedAbout(){
  return <>
  An application that allow users to participate in creating critical editions of texts,
   initially targeting the Tibetan language.
  </>
}


function SelectedResources({props}){
  const handleImageToggle=(data)=>{
    props.changeMediaSelection(data)
  }
  return( 
    <ul className={styles.ResourcesListed}>
      <li onClick={()=>handleImageToggle('IMAGE')} 
      >Image {
   props.selectedMedia.isImageVisible && <img src={Check}></img>
      }</li>
      <li onClick={()=>handleImageToggle('VIDEO')} 
      >Video {props.selectedMedia.isVideoVisible && <img src={Check}></img>
  }  </li>
      <li onClick={()=>handleImageToggle('AUDIO')} 
   >Audio {props.selectedMedia.isAudioVisible && <img src={Check}></img>
   }</li>

    
    </ul>
  )
}




const mapStateToProps = (state: AppState): {} => {
let selectedMedia =reducers.getMediaData(state)
  return {
    selectedMedia
  };
 
};


const mapDispatchToProps = (dispatch) => {
  const changeMediaSelection=(data)=>dispatch(actions.mediaSelection(data))
  return {
    changeMediaSelection
  }
}





export default connect(mapStateToProps,mapDispatchToProps)(About)