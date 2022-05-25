import React from "react";
import { injectIntl } from "react-intl";
import Button from "components/UI/Button";
import ExportIcon from "images/export.svg";

type Props = {
    onClick?: () => void,
    intl: { formatMessage: ({ [id: string]: string }) => string }
};

class ExportControl extends React.Component<Props> {
    render() {
        return (
            <div>
                <Button
                    icon={
                        <ExportIcon
                            style={{ fill: "#fff" }}
                            width={15}
                            height={15}
                        />
                    }
                    title={this.props.intl.formatMessage({
                        id: "header.export"
                    })}
                    onClick={this.props.onClick}
                />
            </div>
        );
    }
}

export default injectIntl(ExportControl);
