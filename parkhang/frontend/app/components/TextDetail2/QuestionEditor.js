import React from "react";
import styles from "./QuestionEditor.css";
import buttonStyles from "./Button.css";
import Annotation from "lib/Annotation";
import { FormattedMessage } from "react-intl";

type Props = {
    question: Annotation,
    questionQuote: React.Element<typeof React.Component>,
    defaultTitle: string,
    saveQuestion: (
        question: Annotation,
        title: string,
        content: string
    ) => void,
    cancel: () => void
};

type State = {
    content: string
};

export default class QuestionEditor extends React.Component<Props> {
    textarea: HTMLTextAreaElement | null;

    constructor(props: Props) {
        super(props);

        this.state = {
            content: props.question.content
        };
    }

    save() {
        const content = this.textarea ? this.textarea.value : "";

        this.props.saveQuestion(
            this.props.question,
            this.props.defaultTitle,
            content
        );
    }

    cancel() {
        this.props.cancel();
    }

    handleChange(e: Event) {
        const content =
            e.target instanceof HTMLTextAreaElement ? e.target.value : "";
        this.setState((prevState, props) => {
            return {
                content: content
            };
        });
    }

    render() {
        return (
            <div className={styles.editorContainer}>
                <div>{this.props.questionQuote}</div>
                <textarea
                    className={styles.textEditor}
                    ref={(textarea: HTMLTextAreaElement | null) =>
                        (this.textarea = textarea)
                    }
                    value={this.state.content}
                    onChange={this.handleChange.bind(this)}
                />
                <div className={buttonStyles.buttonContainer}>
                    <div
                        className={buttonStyles.save}
                        onClick={this.save.bind(this)}
                    >
                        <FormattedMessage id="annotation.save" />
                    </div>
                    <div
                        className={buttonStyles.cancel}
                        onClick={this.cancel.bind(this)}
                    >
                        <FormattedMessage id="annotation.cancel" />
                    </div>
                </div>
            </div>
        );
    }
}
