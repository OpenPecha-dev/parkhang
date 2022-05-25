import React from "react";
import { FormattedMessage } from "react-intl";
import { injectIntl } from "react-intl";
import styles from "./AnnotationControlsHeading.css";
import AddButton from "./AddButton";

type Props = {
    titleId: string,
    buttonOnClick?: () => void,
    buttonTitleId?: string,
    intl: { formatMessage: ({ [id: string]: string }) => string }
};

class AnnotationControlsHeading extends React.Component<Props> {
    render() {
        let button = null;
        if (this.props.buttonOnClick) {
            const title = this.props.buttonTitleId
                ? this.props.intl.formatMessage({
                      id: this.props.buttonTitleId
                  })
                : "";
            button = (
                <AddButton title={title} onClick={this.props.buttonOnClick} />
            );
        }
        return (
            <h3 className={styles.heading}>
                <span className={styles.title}>
                    <FormattedMessage id={this.props.titleId} />
                </span>
                {button && <div className={styles.button}>{button}</div>}
            </h3>
        );
    }
}

export default injectIntl(AnnotationControlsHeading);
