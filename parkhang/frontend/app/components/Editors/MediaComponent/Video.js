import React, { useRef, useEffect, useState,useCallback } from "react";
import ReactPlayer from "react-player";
import _ from "lodash";
import styles from './Video.css'


function toHMS(seconds) {
    var date = new Date(null);
    date.setSeconds(seconds);
    return date.toISOString().substr(11, 8);
}
function toSec(hms='') {
    var a = hms.split(":"); // split it at the colons
    // minutes are worth 60 seconds. Hours are worth 60 minutes.
    var seconds = +a[0] * 60 * 60 + +a[1] * 60 + +a[2];
    return seconds
}
function calTimeToSeek(maxValue,currentTime){
     let i=toSec(currentTime)/maxValue;
     return parseFloat(i);
}

function Video(props) {
    const VideoData = props.videoData.alignment || [];
    const url= props.videoData.url || '';
    const sourceId=parseInt(props.videoData.source);
    let VideoIdList= []
    let newList=['0']
    const syncId=props.syncId;
    if(!_.isEmpty(VideoData)){
      VideoIdList=VideoData.map(l=>l.source_segment) 
}
    useEffect(() => {
        
        // if(sourceId===props.selectedText.id)
        // {
            let intersection = syncId.filter(element => VideoIdList.includes(element));
            newList= VideoData.filter(d=>d.source_segment===intersection[0]);
            jumpTime(newList[0]?.target_segment.start)
        // }

    }, [syncId]);



    const videoRef = useRef();
    const [state, setState] = useState({
        seeking: false,
        played: 0,
        duration: 0,
    });

  const jumpTime=useCallback((time)=> {
        let newData=calTimeToSeek(state.duration,time);
        videoRef.current.seekTo(parseFloat(newData));
    },[state])

    return (
        <div style={{ width: "100%" }}>
            <ReactPlayer
                url={url}
                ref={videoRef}
                width="100%"
                controls={true}
                onDuration={(duration) =>
                    setState({ ...state, duration:duration })
                }
                playing={true}
                
            />
             <h2 className={styles.timelineHeading}>List of timeline alignment </h2>
            <ol >
               {
                VideoData.map((list,i)=>
                    <li key={i+'key'}
                    className={styles.Timeline}
                    onClick={()=>jumpTime(list.target_segment.start)}>
                        {list.target_segment.start}
                    </li>)
               }
            </ol>
        </div>
    );
}

export default Video;
