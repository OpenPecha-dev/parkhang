// @flow
import * as React from "react";
import ReactDom from "react-dom";
import classnames from "classnames";
import AnnotationDetail from "./AnnotationDetail";
import AnnotationDetailEdit from "./AnnotationDetailEdit";
import styles from "./AnnotationControls.css";
import colours from "css/colour.css";
import User from "lib/User";
import Witness from "lib/Witness";
import Annotation, { ANNOTATION_TYPES } from "lib/Annotation";
import AnnotationControlsHeading from "./AnnotationControlsHeading";
import NoteEditor from "./NoteEditor";
import QuestionView from "./QuestionView";
import QuestionEditor from "./QuestionEditor";
import QuestionsLoading from "./QuestionsLoading";
import { FormattedMessage } from "react-intl";
import Note from "./Note";
import Button from "components/UI/Button";
import PageBreakIcon from "images/page_break_icon.svg";
import { List } from "react-virtualized/dist/es/List";
import AnnotationControlsHeader from "./AnnotationControlsHeader";
import Question from "lib/Question";
import type { AnnotationUniqueId } from "lib/Annotation";
import { Snackbar } from "components/UI/muiComponent";
export const CONTROLS_MARGIN_LEFT = 10;
export type QuestionData = {
    loading: boolean,
    questions: Question[],
};

export type Props = {
    inline: boolean,
    user: User,
    annotationsData: null,
    activeAnnotation: null,
    baseAnnotation: null,
    availableAnnotations: Annotation[] | null,
    temporaryAnnotation: null,
    inline: null,
    firstSelectedSegment: null,
    splitTextRect: ClientRect | null,
    selectedWitness: Witness,
    selectedElementId: string | null,
    selectedElementIds: string[] | null,
    pechaImageClass: string,
    notes: Annotation[],
    temporaryNotes: Annotation[],
    questions: Annotation[],
    questionsData: { [annotationId: AnnotationUniqueId]: QuestionData },
    temporaryQuestions: Annotation[],
    questionQuote: React.Element<typeof React.Component> | null,
    addNote: () => void,
    editNote: (annotation: Annotation) => void,
    saveAnnotation: (annotation: Annotation, content: string) => void,
    cancelEditAnnotation: (annotation: Annotation) => void,
    deleteAnnotation: (annotation: Annotation) => void,
    addPageBreak: () => void,
    addLineBreak: () => void,
    addQuestion: () => void,
    saveQuestion: (
        question: Annotation,
        title: string,
        content: string
    ) => void,
    list: List | null,
    closeAnnotation: () => void,
};

type AnchorPoint = "top" | "left" | "bottom" | "right";

const anchorPoints = {
    top: 1,
    left: 2,
    bottom: 3,
    right: 4,
};

class AnnotationControls extends React.Component<Props> {
    controls: HTMLDivElement | null;
    arrow: HTMLDivElement | null;
    arrowDs: HTMLDivElement | null;
    annotation: null;
    constructor(props: Props) {
        super(props);

        this.controls = null;
        this.arrow = null;
        this.arrowDs = null;
    }

    componentDidMount() {
        this.updatePosition();
    }

    componentDidUpdate() {
        // Need to delay calling this because the browser
        // may not have finished rendering when first called.

        setTimeout(this.updatePosition.bind(this), 0);
    }

    updatePosition() {
        const measurements = this.getMeasurements();
        if (
            !this.props.inline ||
            !this.controls ||
            !this.arrow ||
            !measurements
        ) {
            return;
        }
        const controls = this.controls;
        const height = controls.offsetHeight;
        const width = controls.offsetWidth;
        const arrow = this.arrow;
        const bottomGap = measurements.bottomGap;
        const offScreen = bottomGap < 0 || bottomGap > height;

        let top = measurements.top;
        const viewPortWidth = measurements.viewPortWidth || 0;
        let selectedLeft = measurements.left;
        let selectedRight = selectedLeft + measurements.width;

        arrow.style.display = "none";
        if (this.props.selectedElementIds) {
            let lines = 1;
            let prevSegmentLeft = 0;
            let lastLineLeft = 0;
            let lastLineRight = 0;
            let lastLineBottom = 0;
            for (let i = 0; i < this.props.selectedElementIds.length; i++) {
                const segmentId = this.props.selectedElementIds[i];
                const segment = document.getElementById(segmentId);
                if (segment) {
                    const segmentLeft = segment.offsetLeft;
                    const segmentRight = segmentLeft + segment.offsetWidth;
                    if (segmentLeft < prevSegmentLeft) {
                        lines++;
                        lastLineLeft = segmentLeft;
                        lastLineRight = segmentRight;
                        lastLineBottom =
                            segment.offsetTop + segment.offsetHeight;
                        selectedLeft = segmentLeft;
                        selectedRight = segmentRight;
                    } else if (segmentRight > lastLineRight) {
                        lastLineRight = segmentRight;
                        // selectedRight = segmentRight;
                    }
                    if (segmentLeft < selectedLeft) selectedLeft = segmentLeft;
                    if (segmentRight > selectedRight)
                        selectedRight = segmentRight;
                    prevSegmentLeft = segmentLeft;
                }
            }
        }
        let selectedWidth = selectedRight - selectedLeft;

        let selectedRightSide = viewPortWidth - (selectedLeft + selectedWidth);

        let anchorPoint = anchorPoints.bottom;
        let moveToSide = false;
        let moveRight = 0;
        if (!offScreen && bottomGap < height) {
            moveToSide = true;
        }
        if (
            selectedRightSide < width + 50 ||
            viewPortWidth - measurements.left < width + 50
        ) {
            moveToSide = true;
        }
        if (moveToSide) {
            arrow.className = styles.arrowLeft;
            if (selectedLeft - width - arrow.offsetWidth < 0) {
                anchorPoint = anchorPoints.right;
            } else {
                anchorPoint = anchorPoints.left;
            }
        } else {
            let controlOverhang = width / 2 - selectedWidth / 2;
            if (selectedLeft - controlOverhang < 0) {
                moveRight = Math.abs(selectedLeft - controlOverhang);
            }
            if (selectedRight + controlOverhang > viewPortWidth) {
                moveRight = viewPortWidth - (selectedRight + controlOverhang);
            }
        }

        if (anchorPoint === anchorPoints.bottom) {
            let arrowHeight = 0;
            let arrowLeft = 0;
            if (this.arrow) {
                this.arrow.className = styles.arrowTop;
                arrowLeft = width / 2 - this.arrow.offsetWidth / 2 - moveRight;
                if (arrowLeft < 0) arrowLeft = 0;
                this.arrow.style.left = arrowLeft + "px";
                arrowHeight = this.arrow.offsetHeight;
                this.arrow.style.top = 0 - arrowHeight + "px";
            }
            // controls.style.top = top + measurements.height + arrowHeight + "px";
            controls.style.top = top - measurements.height - 15 + "px";
            // controls.style.left =
            // selectedLeft + selectedWidth / 2 - width / 2 + moveRight + "px";
            controls.style.left = measurements.left + "px";
        } else if (moveToSide) {
            arrow.className = styles.arrowRight;
            let arrowHeight = arrow.offsetHeight;
            let controlsTop = measurements.top - measurements.height - 15;
            if (
                measurements.top +
                    measurements.height +
                    bottomGap -
                    controlsTop <
                height
            ) {
                controlsTop =
                    measurements.top + measurements.height + bottomGap - height;
            }
            if (anchorPoint === anchorPoints.left) {
                // left side of selection

                arrow.style.left = width - 2 + "px";
                controls.style.left =
                    selectedLeft - width / 2 - arrow.offsetWidth + "px";
            } else {
                // right-side of selection
                arrow.className = styles.arrowLeft;
                arrow.style.left = -arrow.offsetWidth + "px";
                controls.style.left =
                    selectedLeft +
                    selectedWidth -
                    width / 2 +
                    arrow.offsetWidth +
                    "px";

                // controls.style.right = 0 + "px";
            }
            arrow.style.top =
                measurements.top -
                controlsTop +
                measurements.height / 2 -
                arrowHeight / 2 +
                "px";

            controls.style.top = controlsTop + "px";
        } else {
            controls.style.top = top + "px";
        }
    }

    getMeasurements(): {
        top: number,
        textTop: number,
        rowTop: number,
        left: number,
        width: number,
        height: number,
        topGap: number,
        bottomGap: number,
        viewPortWidth: number | null,
    } | null {
        if (!this.props.selectedElementIds) {
            return null;
        }

        const lastSelectedElementId =
            this.props.selectedElementIds[
                this.props.selectedElementIds.length - 1
            ];
        const lastElement = document.getElementById(lastSelectedElementId);
        const firstSelectedElementId = this.props.selectedElementIds[0];
        const firstElement = document.getElementById(firstSelectedElementId);

        const splitTextRect = this.props.splitTextRect;
        let extraTop = 0;
        let scrollTop = 0;

        if (this.props.list) {
            scrollTop = this.props.list.Grid.state.scrollTop;
        }
        if (this.props.pechaImageClass) {
            const pechaImage = document.getElementsByClassName(
                this.props.pechaImageClass
            )[0];
            extraTop = pechaImage.offsetHeight;
        }
        if (!firstElement) {
            console.warn(
                "no valid element found in getMeasurements, elementId: %s",
                this.props.selectedElementId
            );
            return {
                top: 0,
                textTop: 0,
                rowTop: 0,
                left: 0,
                width: 1,
                height: 1,
                topGap: 0,
                bottomGap: 0,
                viewPortWidth: 1,
            };
        }
        const top = firstElement.offsetTop + extraTop;
        const textTop = firstElement.offsetTop;
        const left = firstElement.offsetLeft;
        const width = firstElement.offsetWidth;
        const height = firstElement.offsetHeight;
        let rowTop = top;

        let viewPortWidth = null;
        let topGap = 0;
        let bottomGap = 0;

        if (firstElement && splitTextRect) {
            const elRect = firstElement.getBoundingClientRect();
            topGap = splitTextRect.height - elRect.top;
        }
        if (lastElement && splitTextRect) {
            const elRect = lastElement.getBoundingClientRect();

            bottomGap =
                splitTextRect.height + splitTextRect.top - elRect.bottom;
            viewPortWidth = splitTextRect.width;
        }

        return {
            top: top,
            textTop: textTop,
            rowTop: rowTop,
            left: left,
            width: width,
            height: height,
            topGap: topGap,
            bottomGap: bottomGap,
            viewPortWidth: viewPortWidth,
        };
    }

    render() {
        const props = this.props;
        let annotations = [];
        let temporaryAnnotations = [];
        let anonymousUserMessage = null;
        let nothingSelected = null;
        const isLoggedIn = props.user.isLoggedIn;

        let breakSelected = false;
        if (
            props.activeAnnotation &&
            (props.activeAnnotation.isType(ANNOTATION_TYPES.pageBreak) ||
                props.activeAnnotation.isType(ANNOTATION_TYPES.lineBreak))
        ) {
            breakSelected = true;
        }
        // the selected word/sentence is props.anotationsData

        if (props.annotationsData) {
            props.annotationsData.map((annotationData) => {
                const randomPercentage = Math.round(Math.random() * 99) + 1;
                let isEditing = false;
                let isActive = false;
                if (annotationData.isTemporary) {
                    isEditing = true;
                    isActive = true;
                } else if (
                    !props.temporaryAnnotation &&
                    annotationData.annotation.uniqueId ==
                        props.activeAnnotation.uniqueId
                ) {
                    isActive = true;
                }

                if (isEditing) {
                    let annotationDetail = (
                        <AnnotationDetailEdit
                            annotationData={annotationData}
                            key={annotationData.annotation.uniqueId}
                            isActive={isActive}
                            saveAnnotationHandler={(content) => {
                                props.saveAnnotation(
                                    annotationData.annotation,
                                    content
                                );
                            }}
                            cancelAnnotationHandler={() => {
                                props.cancelEditAnnotation(
                                    annotationData.annotation
                                );
                            }}
                            isLoggedIn={isLoggedIn}
                            selectAnnotationHandler={() => {}}
                            editAnnotationHandler={() => {}}
                        />
                    );
                    temporaryAnnotations.push(annotationDetail);
                } else {
                    let annotationDetail = (
                        <AnnotationDetail
                            accuracy={randomPercentage}
                            annotationData={annotationData}
                            key={annotationData.annotation.uniqueId}
                            isActive={isActive}
                            user={props.user}
                            selectAnnotationHandler={() => {
                                if (isLoggedIn && !isEditing) {
                                    props.didSelectAnnotation(
                                        annotationData.annotation
                                    );
                                }
                            }}
                            editAnnotationHandler={() => {
                                if (isLoggedIn && !isEditing) {
                                    props.editAnnotation(
                                        annotationData.annotation
                                    );
                                }
                            }}
                            isLoggedIn={isLoggedIn}
                        />
                    );
                    annotations.push(annotationDetail);
                }
            }, this);
            if (!props.user.isLoggedIn) {
                // NOTE: FormattedMessage cannot take a child when using
                // the values option, so need to wrap it in a div
                anonymousUserMessage = (
                    <div className={styles.anonymousMessage}>
                        <FormattedMessage
                            id="annotations.loginMessage"
                            values={{
                                loginLink: (
                                    <a href="/accounts/login/">
                                        <FormattedMessage id="annotations.loginLink" />
                                    </a>
                                ),
                            }}
                        />
                    </div>
                );
            }
        } else {
            nothingSelected = (
                <div className={styles.nothingSelected}>Nothing Selected</div>
            );
        }

        let pageBreaksButton = null;
        let allowPageBreak = !this.props.selectedWitness.isWorking;
        let lineBreaksButton = null;
        let allowLineBreak = !this.props.selectedWitness.isWorking;
        if (isLoggedIn && !this.props.selectedWitness.isWorking) {
            let pageBreaks = [];
            let lineBreaks = [];
            if (this.props.availableAnnotations) {
                pageBreaks = this.props.availableAnnotations.filter(
                    (annotation: Annotation) =>
                        annotation.type === ANNOTATION_TYPES.pageBreak &&
                        annotation.creatorWitness.id ===
                            this.props.selectedWitness.id
                );
                lineBreaks = this.props.availableAnnotations.filter(
                    (annotation: Annotation) =>
                        annotation.type === ANNOTATION_TYPES.lineBreak &&
                        annotation.creatorWitness.id ===
                            this.props.selectedWitness.id
                );
            }

            if (pageBreaks.length > 0) {
                pageBreaksButton = (
                    <div className={styles.breakButtons}>
                        <Button
                            title="Page Break"
                            accessoryType="DELETE"
                            icon={<PageBreakIcon width={20} height={20} />}
                            onClick={() => {
                                this.props.deleteAnnotation(pageBreaks[0]);
                            }}
                            isActive={true}
                            backgroundColor={colours.activeButton}
                        />
                    </div>
                );
                allowPageBreak = false;
            }

            if (lineBreaks.length > 0) {
                lineBreaksButton = (
                    <div className={styles.breakButtons}>
                        <Button
                            title="Line Break"
                            accessoryType="DELETE"
                            icon="&#182;"
                            onClick={() => {
                                this.props.deleteAnnotation(lineBreaks[0]);
                            }}
                            isActive={true}
                            backgroundColor={colours.activeButton}
                        />
                    </div>
                );
                allowLineBreak = false;
            }

            // Can't have line break and page break in same place.
            if (!allowPageBreak) allowLineBreak = false;
            if (!allowLineBreak) allowPageBreak = false;
        }

        let tempNotes = null;
        let tempNoteIds = {};
        if (props.temporaryNotes && props.temporaryNotes.length > 0) {
            tempNotes = props.temporaryNotes.map((note: Annotation) => {
                let key = "NOTE_" + note.uniqueId;
                // The note is being edited
                if (note.basedOn) {
                    tempNoteIds[note.basedOn.uniqueId] = note.uniqueId;
                }
                return (
                    <NoteEditor
                        note={note}
                        key={key}
                        saveNote={props.saveAnnotation}
                        cancel={() => props.cancelEditAnnotation(note)}
                    />
                );
            });
        }

        let notes = null;
        if (props.notes && props.notes.length > 0) {
            // Filter out notes that are being edited
            const validNotes = props.notes.filter(
                (note: Annotation) => !tempNoteIds.hasOwnProperty(note.uniqueId)
            );
            notes = validNotes.map((note: Annotation) => {
                let key = "NOTE_" + note.uniqueId;
                return (
                    <Note
                        note={note}
                        key={key}
                        delete={this.props.deleteAnnotation}
                        edit={this.props.editNote}
                    />
                );
            });
        }

        let tempQuestions = null;
        let tempQuestionIds = {};
        if (
            props.temporaryQuestions &&
            props.temporaryQuestions.length > 0 &&
            props.questionQuote
        ) {
            tempQuestions = props.temporaryQuestions.map(
                (question: Annotation) => {
                    tempQuestionIds[question.uniqueId] = question.uniqueId;
                    let key = "QUESTION_" + question.uniqueId;

                    return (
                        <QuestionEditor
                            question={question}
                            questionQuote={props.questionQuote}
                            defaultTitle={props.selectedWitness.text.name}
                            key={key}
                            saveQuestion={props.saveQuestion}
                            cancel={() => props.cancelEditAnnotation(question)}
                        />
                    );
                }
            );
        }

        let questionLoadingIndicators = null;
        let questionViews: Array<QuestionView> = [];
        let questionsAreLoading = false;
        if (props.questions && props.questions.length > 0) {
            let questions: Question[] = [];
            for (let i = 0; i < props.questions.length; i++) {
                const question = props.questions[i];

                let isValid = !tempQuestionIds.hasOwnProperty(
                    question.uniqueId
                );
                if (isValid) {
                    if (props.questionsData.hasOwnProperty(question.uniqueId)) {
                        if (props.questionsData[question.uniqueId].loading) {
                            questionsAreLoading = true;
                        }
                        questions = questions.concat(
                            props.questionsData[question.uniqueId].questions
                        );
                    }
                }
            }
            questionViews = questions.map((question: Question, index) => {
                let key = "QUESTION_" + question.annotationUniqueId;
                return (
                    <QuestionView
                        question={question}
                        key={"question_" + question.annotationUniqueId}
                        delete={() =>
                            this.props.deleteAnnotation(
                                this.props.questions[index]
                            )
                        }
                    />
                );
            });
        }
        let questionHeading = null;
        if (questionViews.length > 0) {
            questionHeading = (
                <h3 className={styles.sectionHeading}>Questions</h3>
            );
        }

        let questionsLoading = null;
        if (questionsAreLoading) {
            questionsLoading = <QuestionsLoading />;
        }

        let allowQuestion =
            props.questions?.length === 0 &&
            props.temporaryQuestions.length === 0;

        let classes = [styles.annotationControls];
        if (props.inline) {
            classes.push(styles.inline);
        }

        let showHeader = true;
        if (anonymousUserMessage || breakSelected) showHeader = false;
        const annotationBody = ReactDom.createPortal(
            <div className={styles.annotationContent}>
                {anonymousUserMessage}
                {nothingSelected}
                {!breakSelected && annotations}
                {pageBreaksButton}
                {lineBreaksButton}
                {tempNotes}
                {notes}
                {questionHeading}
                {tempQuestions}
                {questionsLoading}
                {questionViews}
            </div>,
            document.getElementById("annotation-portal")
        );
        return (
            <div
                className={classnames(...classes)}
                style={{ maxWidth: 150 }}
                ref={(controls: HTMLDivElement | null) =>
                    (this.controls = controls)
                }
                id="annotation-control"
            >
                {showHeader && (
                    <AnnotationControlsHeader
                        addPageBreak={
                            allowPageBreak ? props.addPageBreak : null
                        }
                        addLineBreak={
                            allowLineBreak ? props.addLineBreak : null
                        }
                        addNote={
                            isLoggedIn && !tempNotes
                                ? () => props.addNote()
                                : null
                        }
                        addQuestion={allowQuestion ? props.addQuestion : null}
                        closeAnnotation={props.closeAnnotation}
                        editAnnotationHandler={() => {
                            let editBtn = document.getElementById("editBtn");
                            editBtn?.click();
                        }}
                        userLoggedIn={isLoggedIn}
                    />
                )}
                {!breakSelected && temporaryAnnotations}
                {annotationBody}
                <div
                    className={styles.arrow}
                    ref={(div) => (this.arrow = div)}
                />
            </div>
        );
    }
}

export default AnnotationControls;
