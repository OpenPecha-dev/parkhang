// @flow
import Annotation, {
    ANNOTATION_TYPES,
    AnnotationUniqueId,
} from "lib/Annotation";
import SegmentedText from "lib/SegmentedText";
import TextSegment from "lib/TextSegment";
import Witness from "lib/Witness";
import Text from "lib/Text";
import _, { update } from "lodash";

export const BASE_ANNOTATION_ID = -1;
export const WORKING_VERSION_ANNOTATION_ID = -2;

export const INSERTION_KEY = "i";
export const DELETION_KEY = "d";
export const PAGE_BREAK_KEY = "p";
export const LINE_BREAK_KEY = "l";

type Segmenter = (content: string) => TextSegment[];
type AnnotationsByUniqueId = { [id: AnnotationUniqueId]: Annotation };

export default class AnnotatedText {
    originalText: SegmentedText;
    segmenter: Segmenter | null;
    baseWitness: Witness;
    activeWitness: Witness;
    _generatedText: SegmentedText | null;
    /**
     * Each key represents the position in the original text the AnnotatedText is
     * based upon.
     *
     * First {number} index is position in current text;
     * Second {boolean} is whether original character has been deleted.
     *
     * */
    _orginalCurrentSegmentPositions: {
        [position: string | number]: [number, boolean],
    } | null;
    _currentOriginalSegmentPositions: { [position: number]: number } | null;
    _annotations: AnnotationsByUniqueId;
    _annotationsByType: { [string]: AnnotationsByUniqueId };
    _uniqueId: string | null;
    _generatedTextLength: number | null;
    _originalTextLength: number | null;
    _version: number;

    /**
     *
     * @param originalText -
     * @param [annotations]
     * @param {segmenter} [segmenter] - segments strings into TextSegments
     * @param {Witness} [baseWitness] - witness this text is originally based on
     * @param {Witness} [activeWitness] - witness this text is representing
     */
    constructor(
        originalText: SegmentedText,
        annotations: Annotation[] = [],
        segmenter: Segmenter | null = null,
        baseWitness: Witness,
        activeWitness: Witness | null = null
    ) {
        this.originalText = originalText;
        this.segmenter = segmenter;
        this.baseWitness = baseWitness;
        this.activeWitness = activeWitness ? activeWitness : baseWitness;
        /** @type {SegmentedText} */
        this._generatedText = null;
        this._orginalCurrentSegmentPositions = {};
        this._currentOriginalSegmentPositions = {};
        this._annotationsByType = {};
        this._annotations = {};
        for (let i = 0; i < annotations.length; i++) {
            this.addAnnotation(annotations[i]);
        }
        this._uniqueId = null;
        this._generatedTextLength = null;
        this._originalTextLength = null;
        this._version = 1;
    }

    get annotations(): Annotation[] {
        return (Object.values(this._annotations): any);
    }

    get textInfo(): Text {
        return this.baseWitness.text;
    }

    addAnnotation(annotation: Annotation) {
        if (!this._annotations.hasOwnProperty(annotation.uniqueId)) {
            this._annotations[annotation.uniqueId] = annotation;
            this._generatedText = null;
            if (!this._annotationsByType.hasOwnProperty(annotation.type)) {
                this._annotationsByType[annotation.type] = {};
            }
            this._annotationsByType[annotation.type][annotation.uniqueId] =
                annotation;

            this.didMutate();
        }
    }

    removeAnnotation(annotationId: AnnotationUniqueId) {
        if (this._annotations.hasOwnProperty(annotationId)) {
            const annotation = this._annotations[annotationId];
            delete this._annotations[annotationId];
            if (this._annotationsByType.hasOwnProperty(annotation.type)) {
                if (
                    this._annotationsByType[annotation.type].hasOwnProperty(
                        annotationId
                    )
                ) {
                    delete this._annotationsByType[annotation.type][
                        annotationId
                    ];
                }
            }

            this.didMutate();
        }
    }

    didMutate() {
        this.resetUniqueId();
        this._version++;
        this._orginalCurrentSegmentPositions = null;
        this._currentOriginalSegmentPositions = null;
    }

    get orginalCurrentSegmentPositions(): {
        [position: string | number]: [number, boolean],
    } {
        if (!this._generatedText || !this._orginalCurrentSegmentPositions) {
            this.regenerateText();
        }

        return this._orginalCurrentSegmentPositions || {};
    }

    get currentOriginalSegmentPositions(): { [position: number]: number } {
        if (!this._generatedText || !this._currentOriginalSegmentPositions) {
            this.regenerateText();
        }

        return this._currentOriginalSegmentPositions || {};
    }

    regenerateText(): SegmentedText {
        this._generatedText = this.generateText(
            this.originalText,
            this.variants
        );

        return this._generatedText;
    }

    get version(): number {
        return this._version;
    }

    getAnnotationsOfType(
        type: string
    ): { [AnnotationUniqueId]: Annotation } | null {
        if (this._annotationsByType.hasOwnProperty(type)) {
            return this._annotationsByType[type];
        } else {
            return null;
        }
    }

    get variants(): Annotation[] {
        let variants = this.getAnnotationsOfType(ANNOTATION_TYPES.variant);
        if (!variants) {
            variants = [];
        } else {
            variants = (Object.values(variants): any);
        }
        return variants;
    }

    get segmentedText(): SegmentedText {
        if (!this._generatedText) {
            this._generatedText = this.generateText(
                this.originalText,
                this.variants
            );
        }

        return this._generatedText;
    }

    getUniqueId() {
        if (!this._uniqueId) {
            let id = this.baseWitness.id + "-" + this.activeWitness.id + "-";
            let uniqueIds = Object.keys(this._annotations);
            uniqueIds.sort();
            for (let i = 0, len = uniqueIds.length; i < len; i++) {
                const uniqueId = uniqueIds[i];
                const annotation = this._annotations[uniqueId];
                id += annotation.uniqueId + annotation.content;
            }
            this._uniqueId = id;
        }
        return this._uniqueId;
    }

    resetUniqueId() {
        this._uniqueId = null;
    }

    getText(): string {
        return this.segmentedText.getText();
    }

    /**
     * Return list of annotations for the given position in the generated text.
     *
     * @param {number} position - position in the generated text
     * @returns {Annotation<>[]}
     */
    annotationsForPosition(position: number): Annotation[] {
        const orginalCurrentSegmentPositions =
            this.orginalCurrentSegmentPositions;
        return this.variants.filter((annotation) => {
            let start = annotation.start;
            let end = annotation.end;
            if (annotation.isInsertion) {
                start = String(start) + INSERTION_KEY;
                end = start;
            }
            if (
                !orginalCurrentSegmentPositions[String(start)] ||
                !orginalCurrentSegmentPositions[String(end)]
            ) {
                return false;
            }
            let [currentStart] = orginalCurrentSegmentPositions[String(start)];
            let [currentEnd] = orginalCurrentSegmentPositions[String(end)];

            return currentStart <= position && currentEnd >= position;
        });
    }

    /**
     * Return the starting position and length of the text segment that
     * this annotation would be contained in in the generated text.
     *
     * @return Array, first element is start, second is length
     */
    getPositionOfAnnotation(
        annotation: Annotation
    ): [number | null, number | null] {
        const orginalCurrentSegmentPositions =
            this.orginalCurrentSegmentPositions;

        let startKey = annotation.start;
        let isActive = this._annotations.hasOwnProperty(annotation.uniqueId);
        if (annotation.isInsertion && isActive) {
            // only use insertion key if it is an active annotation
            startKey = String(annotation.start) + INSERTION_KEY;
        }
        if (orginalCurrentSegmentPositions[String(startKey)] == undefined) {
            if (this.originalText.getText().length === annotation.start) {
                // if the annotation is an insertion at the end of the text
                return [this.getText().length, 0];
            } else {
                console.warn(
                    "Invalid annotation passed to getPositionOfAnnotation: %o",
                    annotation
                );
                return [null, null];
            }
        }
        const [startPos, startWasDeleted] =
            orginalCurrentSegmentPositions[String(startKey)];
        let length = null;
        if (startWasDeleted) {
            length = 0;
        } else if (annotation.isInsertion && !isActive) {
            length = 0;
        } else if (annotation.type === ANNOTATION_TYPES.pageBreak && isActive) {
            length = 0;
        } else if (annotation.type === ANNOTATION_TYPES.lineBreak && isActive) {
            length = 0;
        } else if (annotation.type === ANNOTATION_TYPES.question && isActive) {
            length = annotation.length;
        } else {
            const startSegment = this.segmentedText.segmentAtPosition(startPos);
            let endSegment;
            if (isActive || annotation.id === WORKING_VERSION_ANNOTATION_ID) {
                let contentLength = annotation.content.length;
                if (contentLength > 0) contentLength -= 1;
                endSegment = this.segmentedText.segmentAtPosition(
                    startPos + contentLength
                );
            } else {
                endSegment = this.segmentAtOriginalPosition(annotation.end);
            }
            if (
                startSegment &&
                endSegment &&
                endSegment instanceof TextSegment
            ) {
                length = startSegment.length;
                if (startSegment.end < endSegment.end) {
                    length =
                        endSegment.start +
                        endSegment.length -
                        startSegment.start;
                }
            }
        }
        return [startPos, length];
    }

    /**
     * Get an annotation pointing to the original content that
     * the given positions refer to.
     */
    getBaseAnnotation(start: number, length: number): Annotation {
        const currentOriginalSegmentPositions =
            this.currentOriginalSegmentPositions;
        let startPos = currentOriginalSegmentPositions[start];
        let origLength = 0;
        if (startPos === undefined) {
            // end of text insertion
            startPos = this.originalText.getText().length;
            origLength = 0;
        } else if (length === 0) {
            let annotations = this.annotationsForPosition(start);
            if (annotations.length > 0) {
                let annotation = annotations[0];
                if (annotation.isDeletion) {
                    startPos = annotation.start;
                    origLength = annotation.length;
                } else {
                    // Assuming we are getting this for an insertion, so want to get
                    // the original starting position.
                    startPos = currentOriginalSegmentPositions[start];
                }
            } else {
                startPos = currentOriginalSegmentPositions[start];
            }
        } else {
            for (let i = start; i < start + length; i++) {
                let annotations = this.annotationsForPosition(i);
                if (annotations.length > 0) {
                    let annotation = annotations[0];
                    if (i === start) {
                        if (annotation.isDeletion) {
                            startPos = annotation.start + annotation.length;
                        } else {
                            startPos = annotation.start;
                        }
                    } else {
                        // Only add deletion length if not at the start.
                        // Otherwise, it is assumed to be immediately before
                        // the requested position.
                        if (annotation.isDeletion) {
                            origLength += annotation.length;
                        }
                    }
                    if (annotation.isDeletion) {
                        origLength++;
                    } else {
                        origLength += annotation.length;
                        i += annotation.content.length - 1;
                    }
                } else {
                    if (i === start) {
                        startPos = currentOriginalSegmentPositions[i];
                    }
                    origLength++;
                }
            }
        }
        let content = "";
        if (origLength > 0) {
            let segments = this.originalText.segmentsInRange(
                startPos,
                origLength
            );
            content = segments.reduce((content, segment) => {
                return content + segment.text;
            }, "");
        }
        if (origLength !== content.length) {
            console.log(
                "Base annotation has different content length to length"
            );
        }
        let annotation = new Annotation(
            BASE_ANNOTATION_ID,
            this.baseWitness,
            startPos,
            origLength,
            content,
            ANNOTATION_TYPES.variant,
            this.baseWitness
        );

        return annotation;
    }

    /**
     * Get an annotation that represents the content in the generated text.
     *
     * If any annotations have been applied, it should return the applied
     * annotation.
     *
     * @param start - Start position in original text
     * @param length - Length in original text
     * @returns {Annotation}
     */
    getAnnotation(start: number, length: number): Annotation | null {
        this.segmentedText;
        let posKey = start;
        if (length === 0) posKey = start + INSERTION_KEY;
        const orginalCurrentSegmentPositions =
            this.orginalCurrentSegmentPositions;
        let [startPos, deleted] = orginalCurrentSegmentPositions[posKey];
        let annotation = null;
        if (startPos === undefined) {
        } else if (length === 0) {
            const annotations = this.annotationsForPosition(startPos);
            if (annotations.length > 0) {
                annotation = annotations[0];
            }
        } else {
            let annotations: Annotation[] = [];
            for (let i = startPos; i < startPos + length; i++) {
                annotations = annotations.concat(
                    this.annotationsForPosition(i)
                );
            }
            if (annotations.length > 0) {
                let content = "";
                let creatorUser = null;
                let creatorWitness = this.activeWitness;
                // Figure out who created the annotation
                // and set creatorUser accordingly.
                let foundVariant = null;
                for (let i = 0; i < annotations.length; i++) {
                    let foundAnnotation = annotations[i];
                    if (
                        foundAnnotation.type === ANNOTATION_TYPES.variant &&
                        foundAnnotation.id !== BASE_ANNOTATION_ID
                    ) {
                        creatorWitness = foundAnnotation.creatorWitness;
                        creatorUser = foundAnnotation.creatorUser;
                        if (!foundVariant) {
                            foundVariant = foundAnnotation;
                        } else {
                            if (
                                foundAnnotation.creatorWitness !==
                                    creatorWitness &&
                                foundAnnotation.creatorUser !== creatorUser
                            ) {
                                console.warn(
                                    "Found second variant",
                                    annotations
                                );
                            }
                        }
                    }
                }
                if (foundVariant !== null) {
                    if (
                        foundVariant.start == start &&
                        foundVariant.length >= length
                    ) {
                        annotation = foundVariant;
                    } else {
                        annotation = new Annotation(
                            null,
                            this.baseWitness,
                            start,
                            length,
                            " ",
                            ANNOTATION_TYPES.variant,
                            this.activeWitness
                        );
                        let segments = this.segmentsForAnnotation(annotation);
                        content = segments.reduce(
                            (
                                previousValue: string,
                                currentValue: TextSegment | number
                            ) => {
                                let value = previousValue;
                                if (currentValue instanceof TextSegment) {
                                    value += currentValue.text;
                                }
                                return value;
                            },
                            ""
                        );
                        annotation.content = content;
                    }
                }
            }
        }

        if (annotation == null && startPos) {
            annotation = this.getBaseAnnotation(startPos, length);
        }

        return annotation;
    }

    getContentForRange(start: number, length: number): string {
        const currentOriginalSegmentPositions =
            this.currentOriginalSegmentPositions;
        let startPos = currentOriginalSegmentPositions[start];
        let content = "";
        if (startPos === undefined) {
        } else if (length === 0) {
        } else {
            let segments: TextSegment[] = [];
            for (let i = start; i < start + length; i++) {
                let segment = this.segmentAtOriginalPosition(i);
                if (
                    segment instanceof TextSegment &&
                    segments.indexOf(segment) !== -1
                ) {
                    segments.push(segment);
                }
            }
            content = segments.reduce(
                (previousValue: string, currentValue: TextSegment) => {
                    return previousValue + currentValue.text;
                },
                ""
            );
        }

        return content;
    }

    /**
     * Return segments for the given annotation in the current version of the text
     *
     * The annotation should be referring to positions in the base text.
     *
     * @param {Annotation} annotation
     * @return {TextSegment|number[]}
     */
    segmentsForAnnotation(annotation: Annotation): Array<TextSegment | number> {
        this.segmentedText;
        let segments = [];
        let isActive = false;
        if (this._annotations.hasOwnProperty(annotation.uniqueId)) {
            isActive = true;
        }
        const orginalCurrentSegmentPositions =
            this.orginalCurrentSegmentPositions;

        if (isActive || annotation.id === WORKING_VERSION_ANNOTATION_ID) {
            let key = annotation.start;
            if (annotation.isInsertion) {
                key += INSERTION_KEY;
            }
            let [start, deleted] = orginalCurrentSegmentPositions[String(key)];
            let end = start + annotation.content.length;
            for (let i = start; i < end; i++) {
                let segment = this.segmentedText.segmentAtPosition(i);
                if (segment && segments.indexOf(segment) == -1) {
                    segments.push(segment);
                }
            }
            // check it's not an insertion at the end of the text
        } else if (
            !annotation.isInsertion ||
            annotation.start !== this._originalTextLength
        ) {
            let start = annotation.start;
            let end = annotation.end;
            let processedAnnotations = [];
            for (let i = start; i <= end; i++) {
                let segment = null;
                let [pos, deleted] = orginalCurrentSegmentPositions[String(i)];
                let posAnnotations = this.annotationsForPosition(pos);
                let longestAnnotation;
                if (posAnnotations.length > 0) {
                    for (let i = 0; i < posAnnotations.length; i++) {
                        let current = posAnnotations[i];
                        if (
                            !longestAnnotation ||
                            current.length > longestAnnotation.length
                        )
                            longestAnnotation = current;
                    }
                }

                if (deleted) {
                    segment = pos;
                } else if (annotation.isInsertion) {
                    segment = new TextSegment(pos, annotation.content);
                } else if (
                    longestAnnotation &&
                    processedAnnotations.indexOf(longestAnnotation) === -1
                ) {
                    let to = pos + longestAnnotation.content.length;
                    for (let j = pos; j < to; j++) {
                        let annoSegment =
                            this.segmentedText.segmentAtPosition(j);
                        if (
                            annoSegment &&
                            segments.indexOf(annoSegment) == -1
                        ) {
                            segments.push(annoSegment);
                        }
                    }
                    processedAnnotations.push(longestAnnotation);
                } else {
                    segment = this.segmentedText.segmentAtPosition(pos);
                }

                if (segment && segments.indexOf(segment) == -1) {
                    segments.push(segment);
                }
            }
        }
        return segments;
    }

    originalSegmentsForAnnotation(annotation: Annotation): TextSegment[] {
        return this.originalText.segmentsInRange(
            annotation.start,
            annotation.length
        );
    }

    createSegments(annotation: Annotation, start: number) {
        const deleted = annotation.content.length === 0;
        let segments = [];
        if (this.segmenter !== null && !deleted) {
            let annotationSegments = this.segmenter(annotation.content);

            let annoSegStart = start;
            for (let j = 0; j < annotationSegments.length; j++) {
                let annotationSegment = annotationSegments[j];
                annotationSegment.start = annoSegStart;
                annotationSegment._annotation = annotation;
                annoSegStart += annotationSegment.text.length;
            }
            segments = annotationSegments;
        } else {
            let annotationSegment = new TextSegment(start, annotation.content);
            annotationSegment._annotation = annotation;
            segments = [annotationSegment];
        }
        return segments;
    }

    indexOfSegment(segment: TextSegment, segments: TextSegment[]) {
        let foundSegmentIndex = -1;

        let minIndex = 0;
        let maxIndex = segments.length - 1;
        let currentIndex;
        let currentSegment;
        let position = segment.start;

        while (minIndex <= maxIndex) {
            currentIndex = ((minIndex + maxIndex) / 2) | 0;
            currentSegment = segments[currentIndex];
            const segmentEnd =
                currentSegment.start + currentSegment.text.length - 1;
            if (segmentEnd < position) {
                minIndex = currentIndex + 1;
            } else if (currentSegment.start > position) {
                maxIndex = currentIndex - 1;
            } else if (currentSegment.text !== segment.text) {
                // These should be equal, so if not just punt and use
                // indexOf instead.
                return segments.indexOf(segment);
            } else {
                return currentIndex;
            }
        }

        return foundSegmentIndex;
    }

    /**
     * Generate a new SegmentedText with the given annotations.
     */
    generateText(
        text: SegmentedText,
        annotations: Annotation[]
    ): SegmentedText {
        const segments = text.segments;
        const newSegments = segments.slice();
        let replacedSegments = {};

        for (let i = 0, len = annotations.length; i < len; i++) {
            let annotation = annotations[i];
            let targets = text.segmentsInRange(
                annotation.start,
                annotation.length
            );
            if (targets.length > 0) {
                let start = targets[0].start;
                let firstIndex = this.indexOfSegment(targets[0], newSegments);
                if (firstIndex === -1) {
                    let found = newSegments.filter(
                        (seg) => seg.start === targets[0].start
                    );
                    if (found) {
                        firstIndex = newSegments.indexOf(found[0]);
                    }
                }

                const segments = this.createSegments(annotation, start);
                if (annotation.isInsertion) {
                    newSegments.splice(firstIndex, 0, ...segments);
                } else {
                    newSegments.splice(firstIndex, targets.length, ...segments);
                }

                // store replaced segments to use when setting position below
                if (!annotation.isInsertion) {
                    replacedSegments[annotation.uniqueId] = targets;
                }
            } else {
                // Assume insertion at end of text, otherwise a target segment would exist
                const segments = this.createSegments(
                    annotation,
                    annotation.start
                );
                newSegments = newSegments.concat(segments);
                if (!annotation.isInsertion) {
                    console.warn(
                        "Annotation with missing text segments that is not an insertion: %o",
                        annotation
                    );
                }
            }
        }

        let processedSegmentAnnotations = {};
        let currentPosition = 0;
        let originalPosition = 0;
        let updatedSegments = new Array(newSegments.length);
        this._orginalCurrentSegmentPositions = {};
        this._currentOriginalSegmentPositions = {};
        for (let i = 0, len = newSegments.length; i < len; i++) {
            let segment = newSegments[i];
            if (segment._annotation) {
                const annotation = segment._annotation;
                const deleted = segment.text.length == 0;
                const replaced = replacedSegments[annotation.uniqueId];
                const alreadyProcessed = processedSegmentAnnotations[
                    segment._annotation.uniqueId
                ]
                    ? true
                    : false;

                if (!alreadyProcessed && annotation.isInsertion) {
                    this._orginalCurrentSegmentPositions[
                        String(segment.start) + INSERTION_KEY
                    ] = [currentPosition, deleted];
                    for (let j = 0; j < annotation.content.length; j++) {
                        this._currentOriginalSegmentPositions[
                            currentPosition + j
                        ] = segment.start;
                    }
                    originalPosition = segment.start;
                } else if (!alreadyProcessed && replaced) {
                    const firstReplacedSeg = replaced[0];
                    const replacedLength = replaced.reduce(
                        (length, seg) => length + seg.length,
                        0
                    );
                    for (let j = 0; j < replacedLength; j++) {
                        this._orginalCurrentSegmentPositions[
                            segment.start + j
                        ] = [currentPosition, deleted];
                    }
                    originalPosition = segment.start + replacedLength;
                    for (let m = 0; m < annotation.content.length; m++) {
                        this._currentOriginalSegmentPositions[
                            currentPosition + m
                        ] = firstReplacedSeg.start;
                    }
                }
                processedSegmentAnnotations[annotation.uniqueId] = true;
            } else {
                const segmentPos = segment.start;
                for (let j = 0; j < segment.text.length; j++) {
                    this._orginalCurrentSegmentPositions[segmentPos + j] = [
                        currentPosition + j,
                        false,
                    ];
                    this._currentOriginalSegmentPositions[currentPosition + j] =
                        segmentPos + j;
                }
                originalPosition = segment.start + segment.text.length;
            }

            segment = new TextSegment(currentPosition, newSegments[i].text);
            updatedSegments[i] = segment;
            currentPosition += segment.length;
        }
        this._generatedTextLength = currentPosition;
        this._originalTextLength = originalPosition;
        return new SegmentedText(updatedSegments);
    }

    /**
     * Get the segment in the text that would have been at the given position
     * in the original text.
     *
     * If the segment was deleted rather than just replaced, it will
     * return a number, which is the position the segment would have been
     * at in the current text.
     */
    segmentAtOriginalPosition(position: number): TextSegment | number | null {
        const orginalCurrentSegmentPositions =
            this.orginalCurrentSegmentPositions;
        let newPos, wasDeleted;
        try {
            [newPos, wasDeleted] =
                orginalCurrentSegmentPositions[String(position)];
        } catch (e) {
            console.warn(
                "Error getting orginalCurrentSegmentPositions, position: %o",
                position
            );

            return null;
        }

        if (newPos !== undefined) {
            if (wasDeleted) {
                return newPos;
            } else {
                return this.segmentedText.segmentAtPosition(newPos);
            }
        } else {
            console.warn("Could not get segment at position: %d", position);
            return null;
        }
    }

    /**
     * Get the segment of the text from the original version that
     * corresponds to the given position in the current version.
     *
     * @param Position in the current version
     * @return {TextSegment|null}
     */
    originalSegmentAtPosition(position: number) {
        const pos = this.currentOriginalSegmentPositions[position];
        if (pos !== undefined) {
            return this.originalText.segmentAtPosition(pos);
        } else {
            return null;
        }
    }
}
