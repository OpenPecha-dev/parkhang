import React from 'react'
import ImageComponent from './Image'
import AudioComponent from './Audio'
import VideoComponent from './Video'
import styles from './MediaOptions.css'
function MediaOptions(props) {
  if(props.selectedMedia.isImageVisible) 
  return  <ImageComponent {...props}/>
  
  return (<div className={styles.MediaOption}>
   <div className={styles.header} >
                <div className={styles.ImageTitle}>
                    Media
                    {/* {isPortraitImage?"portrait":"landscape"} */}
                </div>
                <div
                    className={styles.closeBtn}
                    onClick={() => props.changeMediaSelection(null)}
                >
                    x
                </div>
            </div>
            <div style={{marginTop:80}}>
            {props.selectedMedia.isVideoVisible && 
    <VideoComponent {...props}/>
  }
    {props.selectedMedia.isAudioVisible && 
    <AudioComponent {...props}/>
  }
            </div>
  
  </div>
  )
}

export default MediaOptions