import React,{useRef,useEffect,useState} from 'react'
import ReactPlayer from 'react-player'


function Video() {

    useEffect(()=>{
     console.log(videoRef)
    },[])
    const videoRef=useRef();
    let url='https://www.youtube.com/watch?v=2MMM_ggekfE';

    const [state,setState]=useState({seeking:false,played:0});

    const handleSeekMouseDown = e => {
        setState({ seeking: true })
      }
    
    const  handleSeekChange = e => {
        setState({ played: parseFloat(e.target.value) })
      }
    
    const  handleSeekMouseUp = e => {
        setState({ seeking: false })
        videoRef.current.seekTo(parseFloat(e.target.value))
      }


  return (
<div style={{width:'100%'}}>

<ReactPlayer url={url} ref={videoRef}  width='100%' controls={true} 
 onSeek={e => console.log('onSeek', e)}
 />

<input
                    type='range' min={0} max={0.999999} step='any'
                  
                    onMouseDown={handleSeekMouseDown}
                    onChange={handleSeekChange}
                    onMouseUp={handleSeekMouseUp}
                  />
    </div>

  )
}

export default Video