// @flow
import React from "react";
import { FormattedMessage, injectIntl } from "react-intl";
import User from "lib/User";
import Button from "components/UI/Button";
import styles from "./AccountOverlay.css";

type Props = {
    top: number,
    right: number,
    user: User,
    intl: { formatMessage: ({ [id: string]: string }) => string }
};

const AccountOverlay = (props: Props) => {
    let signOutTitle = props.intl.formatMessage({
        id: "header.logout"
    });

    return (
        <div
            className={styles.overlay}
            style={{
                top: props.top + "px",
                right: props.right + "px"
            }}
        >
            <h3 className={styles.username}>{props.user.name}</h3>
            <a href="/discourse/logout/">
                <Button
                    title={signOutTitle}
                    color="black"
                    backgroundColor="#bbb"
                />
            </a>
        </div>
    );
};

export default injectIntl(AccountOverlay);
