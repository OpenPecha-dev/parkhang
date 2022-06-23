import React,{useState} from 'react'
import styles from './About.css'
import classnames from 'classnames'
import { connect } from "react-redux";
import * as actions from "actions";
import * as reducers from 'reducers'
import ImageSvg from 'images/image.svg'
import VideoSvg from 'images/video.svg'
import AudioSvg from 'images/audio.svg'
import useLocalStorage from '../../../bodyComponent/utility/useLocalStorage';
import Check from "images/checkmark.png";

function About(props) {
  const [activeSection,setActiveSection]=useLocalStorage('ResourceSelection','about')
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
  const handleMediaToggle=(data)=>{
    props.changeMediaSelection(data)
  }
  return( 
    <>
    <ul className={styles.ResourcesListed}>
      <li onClick={()=>handleMediaToggle('IMAGE')} 
      >
      <ImageSvg/>  Image {
   props.selectedMedia.isImageVisible && <img src={Check}></img>
      }</li>
      <li onClick={()=>handleMediaToggle('VIDEO')} 
      >
       <VideoSvg/>Video {props.selectedMedia.isVideoVisible && <img src={Check}></img>
  }  </li>
      <li onClick={()=>handleMediaToggle('AUDIO')} 
   >
    <AudioSvg/>Audio {props.selectedMedia.isAudioVisible && <img src={Check}></img>
   }</li>

    </ul>
<h2>Citation Lists:</h2>    
    <details>
  <summary>citation 1</summary>
  <p>
    
    this is description for citation

  </p>
</details> 
<details>
  <summary>citation 2</summary>
  <p>
    
    this is description for citation

  </p>
</details>    <details>
  <summary>citation 3</summary>
  <p>
    
    this is description for citation

  </p>
</details> 

</>
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