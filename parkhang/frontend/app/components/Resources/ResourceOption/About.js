import React,{useState} from 'react'
import styles from './About.css'
import classnames from 'classnames'
function About() {
  const [activeSection,setActiveSection]=useState('about')
  return (
   <>
   <div className={styles.Selection}>
       <div className={activeSection==='about'?classnames(styles.Btn,styles.active):styles.Btn} onClick={()=>setActiveSection('about')}>About</div>
       <div className={activeSection==='resources'?classnames(styles.Btn,styles.active):styles.Btn}  onClick={()=>setActiveSection('resources')}>Resources</div>
   </div>
   
   <div className={styles.selected}>
     {activeSection==='about' && <SelectedAbout/>}
     {activeSection==='resources' && <SelectedResources/>}
   </div>

   </>)

}


function SelectedAbout(){
  return <>
  About
  </>
}


function SelectedResources(){
  return <>
  Resources
  </>
}





export default About