import React,{useState} from 'react'
import styles from './About.css'
import classnames from 'classnames'
import { connect } from "react-redux";
import * as actions from "actions";
import * as reducers from 'reducers'
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
  const handleImageToggle=()=>{
    props.toggleImage(!props.showPageImages)
  
  }
  return( 
    <ul className={styles.ResourcesListed}>
      <li onClick={handleImageToggle} style={{fontWeight:props.showPageImages && 'bold'}}>Image</li>
      <li>Video</li>
    
    </ul>
  )
}




const mapStateToProps = (state: AppState): {} => {
let showPageImages=reducers.showPageImages(state)
  return {
    showPageImages
  };
 
};


const mapDispatchToProps = (dispatch) => {
  const toggleImage=(data)=>dispatch(actions.changedShowPageImages(data))
  return {
    toggleImage
  }
}





export default connect(mapStateToProps,mapDispatchToProps)(About)