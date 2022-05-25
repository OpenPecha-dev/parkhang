import React from "react";
import styles from "./AnswerView.css";
import controlStyles from "./AnnotationControls.css";
import buttonStyles from "./Button.css";
import Annotation from "lib/Annotation";
import Answer from "lib/Answer";
import { FormattedMessage, FormattedDate } from "react-intl";
import classnames from "classnames";

type Props = {
    answer: Answer
};

export default class AnswerView extends React.Component<Props> {
    render() {
        return (
            <div className={styles.answer}>
                <p
                    className={controlStyles.text}
                    dangerouslySetInnerHTML={{
                        __html: this.props.answer.content
                    }}
                />
                <p className={controlStyles.subTitle}>
                    <FormattedMessage id="question.answeredBy" />{" "}
                    {this.props.answer.name},{" "}
                    <FormattedDate value={this.props.answer.created} />
                </p>
            </div>
        );
    }
}
