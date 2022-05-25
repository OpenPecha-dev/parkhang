//@flow
import React from "react";
import Annotation from "lib/Annotation";
import styles from "./NoteEditor.css";
import buttonStyles from "./Button.css";
import { FormattedMessage } from "react-intl";

type Props = {
    note: Annotation,
    saveNote: (note: Annotation, content: string) => void,
    cancel: () => void
};

type State = {
    content: string
};

export default class NoteEditor extends React.Component<Props, State> {
    textarea: HTMLTextAreaElement | null;

    constructor(props: Props) {
        super(props);

        this.state = {
            content: props.note.content
        };
    }

    save() {
        const content = this.textarea ? this.textarea.value : "";
        this.props.saveNote(this.props.note, content);
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
