import React from "react";
import classnames from "classnames";
import styles from "./QuestionsLoading.css";
import controlStyles from "./AnnotationControls.css";
import buttonStyles from "./Button.css";
import { FormattedMessage } from "react-intl";
import Loader from "react-loader";

export default class QuestionsLoading extends React.Component<Props> {
    render() {
        return (
            <div className={classnames(styles.loading, controlStyles.text)}>
                <Loader
                    loaded={false}
                    scale={0.25}
                    position="relative"
                    top="50%"
                    left="50%"
                    lines={9}
                    width={8}
                    length={8}
                    radius={14}
                />
                Loading questions...
            </div>
        );
    }
}
