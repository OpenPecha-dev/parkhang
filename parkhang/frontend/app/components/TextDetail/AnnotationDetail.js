// @flow
import React from "react";
import classnames from "classnames";
import { FormattedMessage } from "react-intl";
import styles from "./AnnotationDetail.css";
import type { AnnotationData } from "api";
import CheckIcon from "images/check_circle.svg";
import colours from "css/colour.css";
import { Box } from "components/UI/muiComponent";
import Share from "components/UI/ShareButton";
import Voting from "components/UI/Voting";
import AnnotationAvatar from "components/UI/AnnotationAvatar";
export type Props = {
    annotationData: AnnotationData,
    isActive: boolean,
    selectAnnotationHandler: () => void,
    isLoggedIn: boolean,
    editAnnotationHandler: () => void,
    fontSize: Number,
};
const MAXIMUM_TEXT_LENGTH = 250;

const AnnotationDetail = (props: Props) => {
    let accuracyPercentage = props.accuracy;
    let desc = (
        <p>
            &lt;
            <FormattedMessage id="annotation.delete" />
            &gt;
        </p>
    );

    let content = props.annotationData.content;

    if (content.trim() !== "") {
        if (content.length > MAXIMUM_TEXT_LENGTH) {
            content = content.substr(0, MAXIMUM_TEXT_LENGTH) + "…";
        }
        // content variable is the selected trimmed context
        desc = <p style={{ minWidth: 100, maxWidth: "30ch" }}>{content}</p>;
    }

    let classes = [styles.annotationDetail];

    if (props.isActive) {
        classes.push(styles.active);
    }

    let className = classnames(...classes);

    let name = props.annotationData.name
        ? props.annotationData.name
        : props.user.name;
    return (
        <div className={className} onClick={props.selectAnnotationHandler}>
            <Box
                className={styles.annotationHeader}
                sx={{
                    bgcolor: "secondary.light",
                    color: "texts.main",
                }}
            >
                <AnnotationAvatar name={name} />
                <div style={{ display: "flex", flexDirection: "column" }}>
                    <h3>{name}</h3>
                    {name === "པེ་ཅིན།" && (
                        <span className={styles.date}>
                            1738, month, day N/A
                        </span>
                    )}
                    {name === "སྣར་ཐང༌།" && (
                        <span className={styles.date}>
                            1742, month, day N/A
                        </span>
                    )}
                    {name === "སྡེ་དགེ" && (
                        <span className={styles.date}>
                            1744, month, day N/A
                        </span>
                    )}
                </div>
                {props.isLoggedIn && props.isActive && (
                    <button
                        style={{ display: "none" }}
                        className={styles.edit}
                        onClick={props.editAnnotationHandler}
                        id="editBtn"
                    ></button>
                )}
            </Box>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                }}
            >
                {desc}
                {/* <div style={{ float: "right" }}>{accuracyPercentage + "%"}</div> */}
            </div>
            <div className={styles.contentOptions}>
                <Voting data={props.annotationData} />
                {/* {props.isActive && (
                    <Share content={props.annotationData.content} />
                )} */}
            </div>
        </div>
    );
};

export default AnnotationDetail;
