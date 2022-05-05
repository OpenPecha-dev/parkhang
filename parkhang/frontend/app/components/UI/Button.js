import React from "react";
import classnames from "classnames";
import colours from "css/colour.css";
import styles from "./Button.css";
import Accessory from "./Accessory";

export type Alignment = "left" | "center" | "right";

type Props = {
    title: string,
    color?: string,
    backgroundColor?: string,
    icon?: any,
    align?: Alignment,
    isActive?: boolean,
    accessoryType?: AccessoryType,
    onClick?: () => void,
    noBezel?: boolean,
    disabled?: boolean
};

export default class Button extends React.Component<Props> {
    render() {
        let color = this.props.color || "#ffffff";
        let bgColour = this.props.backgroundColor || colours.mainTint;
        let fontSize =this.props.fontSize || '14px'
        let classNames = this.props.noBezel
            ? [styles.buttonNoBezel]
            : [styles.button];

        if (this.props.isActive) classNames.push(styles.active);
        const className = classnames(...classNames);

        let style = {
            fontSize,
            color: color,
            backgroundColor: bgColour
        };
        if (this.props.align) style.textAlign = this.props.align;

        return (
            <button
                style={style}
                className={className}
                onClick={this.props.onClick}
                disabled={this.props.disabled}
            >
                {this.props.icon && (
                    <div className={styles.icon}>{this.props.icon}</div>
                )}
               {this.props.title &&(
                <span className={styles.title}>{this.props.title}</span>
               )
               } 
                {this.props.accessoryType && (
                    <Accessory type={this.props.accessoryType} />
                )}
            </button>
        );
    }
}
