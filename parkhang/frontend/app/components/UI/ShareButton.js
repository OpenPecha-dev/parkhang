   import React from 'react'
   import {FacebookShareButton,
    WhatsappShareButton,
    FacebookIcon,
    WhatsappIcon} from 'react-share'
    import { FormattedMessage } from "react-intl";
    import styles from './Sharebutton.css'


const ShareButton=({props})=>{

const content=props?.annotationData?.content

    return (
        <div className={styles.shareContainer} >
            <div className={styles.shareButton}>
                 <FormattedMessage id="annotation.share" />
              
                 </div>
            <FacebookShareButton
            className={styles.facebookButton}
                id="sharebutton"
                url={`https://parkhang.lopenling.org${window.location.pathname}`}
                quote={content}
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

           
             </div>
    );
}

export default ShareButton