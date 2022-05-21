import React,{useState,useEffect} from 'react'
import styles from './Notification.css'
import classnames from 'classnames'
import { connect } from "react-redux";
import * as reducers from "reducers";
import * as actions from "actions";


function Notification(props) {
const message=props?.notification?.message;
const time=props?.notification?.time;
const type=props?.notification?.type;
    let typeOption=function(color){
        switch(color){
            case 'success': return '#07bc0c';
            case 'error': return '#e74c3c';
            case 'warning': return '#f1c40f';
            default: return '#3498db';
        }
    }

    const [show,setShow]=useState(false)
   useEffect(()=>{
   setShow(true);
   let timeout= setTimeout(()=>{
    setShow(false)
    },time)
    return ()=>clearTimeout(timeout)
},[props])
    const handleClick=()=>{
      setShow(prev=>!prev)
    props.onChangedNotification({
        message:'',
        time:null,
        type:''
    })
    }
    let classname=[styles.notificationWrapper]

    if(show) classname=[styles.notificationWrapper,styles.show]
    
  return (
    <div className={classnames(classname)} style={{backgroundColor:typeOption(type)}}>
    <div className={styles.notificationDisc}>{message}</div>
    <div className={styles.closeButton} onClick={handleClick}>x</div>
  </div>
  )
   
    
   
}


const mapStateToProps = state => {
    return {
        notification: reducers.getNotification(state)
        
    };
};
const matchDispatchToProps = dispatch => {
    return {
        onChangedNotification: (data) => {
            dispatch(actions.changedNotification(data));
        }
    };
};



export default connect(mapStateToProps,matchDispatchToProps)(Notification)