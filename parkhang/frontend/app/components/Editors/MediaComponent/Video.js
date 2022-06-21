import React, { useRef, useEffect, useState } from "react";
import ReactPlayer from "react-player";
import _ from "lodash";

function Video(props) {
    const VideoData = props.videoData.alignment || [];
    const url= props.videoData.url || '';
    let VideoIdList= []
    let newList=['0']
    const syncId=props.syncId;
    if(!_.isEmpty(VideoData)){
      VideoIdList=VideoData.map(l=>l.source_segment) 
}
    useEffect(() => {
      let intersection = syncId.filter(element => VideoIdList.includes(element));
      newList= VideoData.filter(d=>d.source_segment===intersection[0]);
      
      jumpTime(newList[0]?.target_segment.start)
    }, [syncId]);



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
    const videoRef = useRef();
    const [state, setState] = useState({
        seeking: false,
        played: 0,
        duration: 0,
    });

    function jumpTime(time) {
        let newData=calTimeToSeek(state.duration,time);
        videoRef.current.seekTo(parseFloat(newData));
    }

    return (
        <div style={{ width: "100%", background: "black" }}>
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
        </div>
    );
}

export default Video;
