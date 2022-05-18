// @flow
import React from "react";
import PersonIcon from "images/person.svg";
import styles from "./AccountButton.css";

type Props = {
    name: string,
    onClick: () => void
};

const AccountButton = (props: Props) => {
    return (
        <div className={styles.accountButton}>
            <PersonIcon width="24px" height="24px" onClick={props.onClick} />
        </div>
    );
};

export default AccountButton;
