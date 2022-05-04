   import React from 'react'
   import {FacebookShareButton,
    WhatsappShareButton,
    FacebookIcon,
    WhatsappIcon} from 'react-share'
    import { FormattedMessage } from "react-intl";
    import styles from './Sharebutton.css'

const Sharebutton=({props})=>{
    return (
        <div className={styles.shareContainer}>
            <div className={styles.shareButton}>
                 <FormattedMessage id="annotation.share" />
              
                 </div>
            <FacebookShareButton
            className={styles.facebookButton}
                id="sharebutton"
                url={`https://parkhang.lopenling.org${window.location.pathname}`}
                quote={props.annotationData.content}
                hashtag="#openPecha"
            >
                <FacebookIcon size={16} round={true} />
            </FacebookShareButton>
            <WhatsappShareButton
                className={styles.whatsappButton}
                onClick={() =>
                    console.log(
                        `https://parkhang.lopenling.org${window.location.pathname}`
                    )
                }
                title="Parkhang"
                url={`https://parkhang.lopenling.org${window.location.pathname}`}
            >
                <WhatsappIcon size={16} round={true} />
            </WhatsappShareButton>
               {/* <img onClick={ImageDownload} className={styles.downloadlogo} src="https://img.icons8.com/material-outlined/24/000000/download--v1.png"/>
                <img onClick={runClick} className={styles.downloadlogo} src="https://img.icons8.com/windows/32/000000/upload.png"/> */}
    
           
             </div>
    );
}

export default Sharebutton;