// @flow
import React from "react";
import Button from "components/UI/Button";
import styles from "./AnnotationControlsHeader.css";
import PageBreakIcon from "images/page_break_icon.svg";
import NoteIcon from "images/note.svg";
import QuestionIcon from "images/question_answer.svg";
import TooltipCustom from '../UI/TooltipCustom';

type Props = {
    addPageBreak: null | (() => void),
    addLineBreak: null | (() => void),
    addNote: null | (() => void),
    addQuestion: null | (() => void)
};

class AnnotationControlsHeader extends React.Component<Props> {
    constructor() {
        super();
    }

    render() {
        const allowPageBreak = this.props.addPageBreak != null;
        const allowLineBreak = this.props.addLineBreak != null;
        return (
            <div className={styles.header}>
                <TooltipCustom toolname={'Note'}>
                <Button
                    noBezel={true}
                    icon={
                        <NoteIcon
                            width={21}
                            height={21}
                            style={{ fill: "#1A73E8" }}
                        />
                    }
                    backgroundColor='transparent'
                    accessoryType={this.props.addNote ? "ADD" : null}
                    onClick={this.props.addNote}
                    // disabled={this.props.addNote ? false : true}
                   align='center'
                /></TooltipCustom>
                <TooltipCustom toolname={'Questions'}>

                <Button
                    noBezel={true}
                    icon={
                        <QuestionIcon
                        width={21}
                        height={21}
                            style={{ fill: "#F2A41F" }}
                        />
                    }
                    accessoryType={this.props.addQuestion ? "ADD" : null}
                    onClick={this.props.addQuestion}
                    // disabled={this.props.addQuestion ? false : true}
                    align="left"
                    backgroundColor='transparent'

                />
                </TooltipCustom>

                <TooltipCustom toolname={'Line Break'}>

                <Button
                    noBezel={true}
                    color='#1E8E3E'
                    fontSize='18px'
                    icon="&#182;"
                    accessoryType={allowLineBreak ? "ADD" : null}
                    onClick={this.props.addLineBreak}
                    // disabled={!allowLineBreak}
                    align="left"
                    backgroundColor='transparent'

                />
                </TooltipCustom>

                <TooltipCustom toolname={'Page Break'}>
              
                <Button
                    noBezel={true}
                    icon={<PageBreakIcon width={21}
                    height={21} style={{fill:'darkgray'}} />}
                    accessoryType={allowPageBreak ? "ADD" : null}
                    onClick={this.props.addPageBreak}
                    // disabled={!allowPageBreak}
                    align="left"
                    backgroundColor='transparent'

                />
                </TooltipCustom>

            </div>
        );
    }
}

export default AnnotationControlsHeader;
