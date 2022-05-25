import React from "react";
import styles from "./QuestionView.css";
import controlStyles from "./AnnotationControls.css";
import buttonStyles from "./Button.css";
import Annotation from "lib/Annotation";
import Question from "lib/Question";
import AnswerView from "./AnswerView";
import { FormattedMessage, FormattedDate } from "react-intl";
import classnames from "classnames";
import { QUESTION_URL } from "app_constants";

type Props = {
    question: Question
};

export default class QuestionView extends React.Component<Props> {
    render() {
        const topicUrl = QUESTION_URL + this.props.question.topicId;
        let answerViews = [];
        let answers = this.props.question.answers;
        console.log(answers);
        for (let i = 0; i < answers.length; i++) {
            const answer = answers[i];
            answerViews.push(
                <AnswerView answer={answer} key={"answer_" + answer.created} />
            );
        }
        const name =
            this.props.question.name.length > 0
                ? this.props.question.name
                : this.props.question.username;

        return (
            <div className={classnames(styles.question, controlStyles.padding)}>
                <span
                    className={classnames(
                        styles.threadLink,
                        controlStyles.text
                    )}
                >
                    <a href={topicUrl} target="_blank">
                        <FormattedMessage id="question.viewThread" />
                    </a>
                </span>
                <p
                    className={controlStyles.text}
                    dangerouslySetInnerHTML={{
                        __html: this.props.question.content
                    }}
                />
                <p className={controlStyles.subTitle}>
                    {name},{" "}
                    <FormattedDate value={this.props.question.created} />
                </p>
                {answerViews}
            </div>
        );
    }
}
