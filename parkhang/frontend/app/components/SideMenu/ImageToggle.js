import React ,{useState,useEffect} from "react";
import ApplyTooltip from "../UI/ApplyTooltip";
import styles from "./ImageToggle.css";
import ImageIcon from "images/image.svg";
import classnames from 'classnames'

type Props = {
    showImages: boolean,
    onChange: () => void
};

const ImageToggle = (props: Props) =>{ 
    
    const [show,setShow]=useState(false);
    const handleClick=()=>{
        setShow(prev=>!prev);
    }
    useEffect(()=>{
        props.onChange(show);
    },[show])

    let classes=[styles.imageToggleclicked]
    props.showImages ? classes.push(styles.clicked):null
    
    return(
    <div className={styles.imageToggle} onClick={handleClick}>
    <ApplyTooltip tooltipName={!props.showImages?'show Image':'hide Image'} className={classnames(classes)}>
      
            <ImageIcon />
       
    </ApplyTooltip>
    </div>
)};

export default ImageToggle;
