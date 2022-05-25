import React from "react";
import styles from "./Note.css";
import Annotation from "lib/Annotation";
import FormattedDate from "react-intl";

type Props = {
    note: Annotation,
    delete?: (note: Annotation) => void,
    edit?: (note: Annotation) => void
};

export default class Note extends React.Component<Props> {
    delete() {
        if (this.props.delete) {
            this.props.delete(this.props.note);
        }
    }

    edit() {
        if (this.props.edit) {
            this.props.edit(this.props.note);
        }
    }

    render() {
        return (
            <div className={styles.note}>
                <div className={styles.header}>
                    <h4 className={styles.info}>
                        {this.props.note.creatorUser.name}
                    </h4>
                    {this.props.delete && (
                        <div
                            className={styles.delete}
                            onClick={this.delete.bind(this)}
                        >
                            &times;
                        </div>
                    )}
                </div>
                <div className={styles.content} onClick={this.edit.bind(this)}>
                    {this.props.note.content}
                </div>
            </div>
        );
    }
}
