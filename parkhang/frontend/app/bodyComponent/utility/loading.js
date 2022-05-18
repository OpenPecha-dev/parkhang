import React from "react";
import ReactLoading from "react-loading";


const Loading=(props)=>{
  let visible:boolean
  visible=props.visible

    return visible ? <ReactLoading type='cubes'color='gray'/>:null


}

export default Loading