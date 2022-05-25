import React from "react";
import styles from "./AddButton.css";

type Props = {
    title?: string,
    onClick?: () => void
};

const AddButton = (props: Props) => {
    return (
        <div className={styles.button} title={props.title} onClick={props.onClick}>
            +
        </div>
    );
};

export default AddButton;
