import React from "react";
import styles from "./Sidemenu.css";
import ApplyTooltip from '../UI/ApplyTooltip';


import classnames from "classnames";
function SideMenu(props) {
    const isMenuListVisible = props.menuListIsVisible;

    return (
        <div
            className={styles.Sidemenu}
            style={{
                transform: !isMenuListVisible
                    ? "translateX(100%)"
                    : "translateX(0)",
            }}
        >
            <div className={styles.editor}>
              <ApplyTooltip tooltipName='export'>
                <div className={ classnames([styles.exportLogo,styles.logo])}>
                    <img
                        src="https://pics.freeicons.io/uploads/icons/png/11449342931579237609-512.png"
                        alt="exportLogo"
                    ></img>
                </div>
                </ApplyTooltip>
              <ApplyTooltip tooltipName='font size'>

                <div className={classnames(styles.fontSize,styles.logo)}>
                    <img
                        src="https://pics.freeicons.io/uploads/icons/png/14698440671543238957-512.png"
                        alt="fontLogo"
                    ></img>
                </div>
                </ApplyTooltip>
                <ApplyTooltip tooltipName='share'>

<div className={classnames(styles.share,styles.logo)}>
    <img
        src="https://pics.freeicons.io/uploads/icons/png/19101184011543238918-512.png"
        alt="fontLogo"
    ></img>
</div>
</ApplyTooltip>
            </div>
            <hr />
            <div className={styles.profile}>
            <ApplyTooltip tooltipName='profile'>
                <div className={classnames(styles.userLogo,styles.logo)}>
                    <img
                        src="https://pics.freeicons.io/uploads/icons/png/14247902841582962149-512.png"
                        alt="profilelogo"
                    ></img>
                </div>
                </ApplyTooltip>

            </div>
            <hr />
            <div className={styles.settings}>
            <ApplyTooltip tooltipName='profile'>

                <div className={classnames(styles.settings,styles.logo)}>
                    <img
                        src="https://pics.freeicons.io/uploads/icons/png/8670111521600623390-512.png"
                        alt="settinglogo"
                    ></img>
                </div>
                </ApplyTooltip>

            </div>
        </div>
    );
}

export default SideMenu;
