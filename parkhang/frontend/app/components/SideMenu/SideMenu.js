import React, { useState } from "react";
import styles from "./Sidemenu.css";
import ApplyTooltip from "../UI/ApplyTooltip";
import headerStyles from "components/Header/Header.css";
import classnames from "classnames";
import AccountButton from "./AccountButton";
import AccountOverlay from "./AccountOverlay";
import User from "lib/User";
import { FormattedMessage, injectIntl } from "react-intl";
import UserIcon from "images/discourse_user.svg";
import flagsmith from "flagsmith";
import ImageToggle from "./ImageToggle";


import {
    FacebookShareButton,
    WhatsappShareButton,
    FacebookIcon,
    WhatsappIcon,
} from "react-share";
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
    onChangedFontSize?: () => void,
};

type LoggedInControlsProps = {
    user: User,
    overlayVisible: boolean,
    accountButtonClicked: () => void,
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
    csrfToken: string,
};
export const LoginControls = (props: LoginProps) => (
    <div className={classnames(styles.notLoggedIn)}>
        <ApplyTooltip tooltipName="Sign up" format="header.signUp">
            <span>
                {" "}
                <a href={SSO_SIGNUP_URL} className={styles.logo}>
                    <img src="https://pics.freeicons.io/uploads/icons/png/14636963901644666501-512.png" />
                </a>
            </span>
        </ApplyTooltip>

        <form method="post" action="/discourse/login_redirect/">
            <ApplyTooltip tooltipName="login" format="header.login">
                <button
                    style={{
                        border: "none",
                        outline: "none",
                        backgroundColor: "white",
                    }}
                    className={classnames(styles.logo)}
                    type="submit"
                >
                    <UserIcon width="14" />
                </button>
            </ApplyTooltip>
            <input
                type="hidden"
                name="csrfmiddlewaretoken"
                value={props.csrfToken}
            />
            <input
                type="hidden"
                name="success_redirect"
                value={props.successRedirect}
            />
        </form>
    </div>
);



function SideMenu(props: Props) {
    const [viewShare, setViewShare] = useState(false);
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
        controls = (
            <LoginControls
                successRedirect={props.successRedirect}
                csrfToken={props.csrfToken}
            />
        );
    }

    if (flagsmith.hasFeature("toggle_filter")) {
        MenuHeight =
            "calc(100vh - " +
            headerStyles?.headerHeight +
            " - " +
            filterStyles?.filterHeight +
            " )";
    }

    const isMenuListVisible = props.menuListIsVisible;
    const textSize = props.textFontSize;
    function handleFontUp() {
        if (textSize < 30) props.onChangedFontSize(textSize + 2);
    }
    function handleFontDown() {
        if (textSize > 16) props.onChangedFontSize(textSize - 2);
    }
    async function shareClick(e) {
        let shareurl = document.getElementById("shareurl");
        shareurl.value = window.location.href;
        shareurl.select();
        document.execCommand("copy");
        setViewShare(true);
        let timer= setTimeout(() => {
            setViewShare(false);
            clearTimeout(timer)
        }, 3000);
    }
    let classes = [styles.Sidemenu];

    if (props.selectedText === null) {
        classes.push(styles.hideSideMenu);
    }
    return (
        <div
            className={classnames(classes)}
            style={{
                height: MenuHeight,
                transform: !isMenuListVisible
                    ? "translateX(100%)"
                    : "translateX(0)",
            }}
        >
            <div className={styles.editor}>
                <ApplyTooltip tooltipName="export">
                    <div
                        className={classnames([styles.exportLogo, styles.logo])}
                        onClick={props.onExport}
                    >
                        <img
                            src="https://pics.freeicons.io/uploads/icons/png/11449342931579237609-512.png"
                            alt="exportLogo"
                        ></img>
                    </div>
                </ApplyTooltip>

                <ApplyTooltip tooltipName={`Font: ${textSize + 2}`}>
                    <div
                        className={classnames(styles.fontSize, styles.logo)}
                        onClick={handleFontUp}
                    >
                        <img
                            src="https://pics.freeicons.io/uploads/icons/png/14698440671543238957-512.png"
                            alt="fontLogo"
                        ></img>
                    </div>
                </ApplyTooltip>
                <ApplyTooltip tooltipName={`Font: ${textSize - 2}`}>
                    <div
                        className={classnames(styles.fontSize, styles.logo)}
                        onClick={handleFontDown}
                    >
                        <img
                            src="https://pics.freeicons.io/uploads/icons/png/11688289221543238957-512.png"
                            alt="fontLogo"
                        ></img>
                    </div>
                </ApplyTooltip>
                {/* <ApplyTooltip tooltipName="share" format="annotation.share"> */}
                <div
                    className={classnames(styles.share, styles.logo)}
                    onClick={shareClick}
                >
                    <img
                        src="https://pics.freeicons.io/uploads/icons/png/19101184011543238918-512.png"
                        alt="sharelogo"
                    ></img>
                    <input id="shareurl" style={{ display: "none" }} />
                    <div
                        className={
                            viewShare
                                ? styles.shareContainer
                                : classnames(
                                      styles.shareContainer,
                                      styles.active
                                  )
                        }
                    >
                        <FacebookShareButton
                            url={window.location.href}
                            hashtag="#openPecha"
                            className={styles.shareButton}
                        >
                            <FacebookIcon size={16} round={true} /> 
                            <div>Facebook</div>
                        </FacebookShareButton>
                        <WhatsappShareButton
                            title="Parkhang"
                            url={window.location.href}
                            className={styles.shareButton}


                        >
                            <WhatsappIcon size={16} round={true} /> 
                            <div>Whatsapp</div>
                        </WhatsappShareButton>
                    </div>
                </div>
                {/* </ApplyTooltip> */}
            </div>
            <hr />
            {controls}
            <hr />
            <div className={styles.settings}>
                <ApplyTooltip tooltipName="settings">
                    <div className={classnames(styles.settings, styles.logo)}>
                        <img
                            src="https://pics.freeicons.io/uploads/icons/png/8670111521600623390-512.png"
                            alt="settinglogo"
                        ></img>
                    </div>
                </ApplyTooltip>
                {!props.selectedWitness?.isWorking && (
                    <ImageToggle
                        showImages={props.showPageImages}
                        onChange={props.onToggledPageImages}
                    />
                )}
            </div>
            <div>
                           </div>
        </div>
    );
}

export default SideMenu;
