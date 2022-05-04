import React from "react";
import styles from "./Sidemenu.css";
import ApplyTooltip from '../UI/ApplyTooltip';
import { withLDConsumer } from 'launchdarkly-react-client-sdk';
import headerStyles from "components/Header/Header.css";
import filterStyles from "components/TextFilter/TextFilter.css";
import classnames from "classnames";
import AccountButton from "./AccountButton";
import AccountOverlay from "./AccountOverlay";
import User from "lib/User";
import { FormattedMessage, injectIntl } from "react-intl";
import UserIcon from "images/discourse_user.svg";
import LocaleSwitcher from 'components/LocaleSwitcher/LocaleSwitcher2'


export type Props = {
    user: User,
    witnesses: Witness[],
    selectedText: TextData,
    selectedWitness: Witness,
    exportingWitness: boolean,
    showPageImages: boolean,
    textFontSize: number,
    onToggledPageImages: () => void,
    onSelectedWitness: () => void,
    onChangedFontSize: () => void,
    onExport?: () => void,
    onChangedFontSize?:()=>void
};

type LoggedInControlsProps = {
    user: User,
    overlayVisible: boolean,
    accountButtonClicked: () => void
};
export const LoggedInControls = (props: LoggedInControlsProps) => (
    <div className={styles.controls}>
        <AccountButton
            name={props.user.name}
            onClick={props.accountButtonClicked}
        />
        {props.overlayVisible && (
            <AccountOverlay top={60} right={0} user={props.user} />
        )}
    </div>
);


type LoginProps = {
    successRedirect: string,
    csrfToken: string
};
export const LoginControls = (props: LoginProps) => (
    <div className={classnames(styles.notLoggedIn, styles.controls)} style={{display:"flex"
              ,flexDirection:'column',alignItems:'center',justifyContent:'flex-start',gap:10}}>
        <div className={classnames(styles.signUp, styles.buttonLink)}>
        <ApplyTooltip tooltipName='Sign up' format="header.signUp">    
            <a href={SSO_SIGNUP_URL} className={styles.logo}>
            <img src="https://pics.freeicons.io/uploads/icons/png/14636963901644666501-512.png" />
            </a>
            </ApplyTooltip>
        </div>

        <form method="post" action="/discourse/login_redirect/">
        <ApplyTooltip tooltipName='login' format="header.login">   
        <button
                style={{border:'none',outline:'none',backgroundColor:'white'}}
                className={classnames(styles.logo)}
                type="submit"
            >
                <UserIcon width="14" />
            </button>
            </ApplyTooltip>
            <input type="hidden" name="csrfmiddlewaretoken" value={props.csrfToken} />
            <input type="hidden" name="success_redirect" value={props.successRedirect} />
        </form>
    </div>
);

function SideMenu(props:Props) {
let MenuHeight;
let controls;
if (props.user.isLoggedIn) {
    controls = (
        <LoggedInControls
            user={props.user}
            overlayVisible={props.accountOverlayVisible}
            accountButtonClicked={props.accountButtonClicked}
        />
    );
} else {
    controls = 
   
     <LoginControls 
                successRedirect={props.successRedirect} 
                csrfToken={props.csrfToken}
                />
                ;
}

    if(props.flags.showFilterOptionParkhang){
     MenuHeight = "calc(100vh - "+headerStyles?.headerHeight+" - "+filterStyles?.filterHeight+" )";
        }

    const isMenuListVisible = props.menuListIsVisible;
    const textSize=props.textFontSize;
    function handleFontUp(){
        if(textSize<30)
        props.onChangedFontSize(textSize+2)
    }
    function handleFontDown(){
        if(textSize>16)
        props.onChangedFontSize(textSize-2)

    }
   async function shareClick(){
        navigator.clipboard.writeText(window.location.href);
        console.log( await navigator.clipboard.readText())
        alert('copied the link ')
    }




    return (
        <div
            className={styles.Sidemenu}
            style={{height:MenuHeight,
                transform: !isMenuListVisible
                    ? "translateX(100%)"
                    : "translateX(0)",
            }}>
            <div className={styles.editor}>
              <ApplyTooltip tooltipName='export'>
                <div className={ classnames([styles.exportLogo,styles.logo])}  onClick={props.onExport}>
                    <img
                        src="https://pics.freeicons.io/uploads/icons/png/11449342931579237609-512.png"
                        alt="exportLogo"
                    ></img>
                </div>
                </ApplyTooltip>
                
              <ApplyTooltip tooltipName={`Font: ${textSize+2}`}>

                <div className={classnames(styles.fontSize,styles.logo)} onClick={handleFontUp}>
                    <img
                        src="https://pics.freeicons.io/uploads/icons/png/14698440671543238957-512.png"
                        alt="fontLogo"
                    ></img>
                </div>
                </ApplyTooltip>
                <ApplyTooltip tooltipName={`Font: ${textSize-2}`}>

                 <div className={classnames(styles.fontSize,styles.logo)} onClick={handleFontDown}>
    <img
        src="https://pics.freeicons.io/uploads/icons/png/11688289221543238957-512.png"
        alt="fontLogo"
    ></img>
             </div> 
              </ApplyTooltip>
                <ApplyTooltip tooltipName='share' format= "annotation.share">

    <div className={classnames(styles.share,styles.logo)} onClick={shareClick}>
        <img
            src="https://pics.freeicons.io/uploads/icons/png/19101184011543238918-512.png"
            alt="fontLogo"
        ></img>
    </div>
</ApplyTooltip>
            </div>
            <hr />
                {controls}

            <hr />
            <div className={styles.settings}>
            <ApplyTooltip tooltipName='settings'>

                <div className={classnames(styles.settings,styles.logo)}>
                    <img
                        src="https://pics.freeicons.io/uploads/icons/png/8670111521600623390-512.png"
                        alt="settinglogo"
                    ></img>
                </div>
                </ApplyTooltip>
             <LocaleSwitcher />
            </div>
        </div>
    );
}


export default withLDConsumer()(SideMenu);
