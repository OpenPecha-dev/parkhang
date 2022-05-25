import React from "react";
import { shallow, configure } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import Text from "lib/Text";
import Source from "lib/Source";
import Witness from "lib/Witness";
import Annotation, {
    TemporaryAnnotation,
    ANNOTATION_TYPES
} from "lib/Annotation";
import { BASE_ANNOTATION_ID } from "lib/AnnotatedText";
import addTibetanShay from "lib/addTibetanShay";
import User, { getAnonymousUser } from "lib/User";
import AnnotationControls from "./AnnotationControls";
import AnnotationDetail from "./AnnotationDetail";
import AnnotationDetailEdit from "./AnnotationDetailEdit";

configure({ adapter: new Adapter() });

const source1 = new Source(1, "Derge");
const source2 = new Source(1, "Pecin");
const source3 = new Source(1, "Narthang");
const text = new Text(1, "དཔལ་ནག་པོ་ཆེན་པོ་ཡུམ་ཅན་གྱི་སྒྲུབ་ཐབས་ཞེས་བྱ་བ");
const baseWitness = new Witness(1, text, source1, "Test witness", true);
const otherWitness1 = new Witness(2, text, source2, null, false);
const otherWitness2 = new Witness(3, text, source3, null, false);

const anonymousUser = getAnonymousUser();
const user = new User(1, "Test User");

const baseAnnotation = new Annotation(
    BASE_ANNOTATION_ID,
    baseWitness,
    0,
    4,
    "Test",
    ANNOTATION_TYPES.variant,
    baseWitness
);
const annotation1 = new Annotation(
    1,
    baseWitness,
    0,
    4,
    "New",
    ANNOTATION_TYPES.variant,
    otherWitness1
);
const annotation2 = new Annotation(
    2,
    baseWitness,
    0,
    4,
    "New",
    ANNOTATION_TYPES.variant,
    otherWitness2
);
const temporaryAnnotation = new TemporaryAnnotation(
    baseAnnotation,
    baseWitness,
    0,
    4,
    "Newer",
    ANNOTATION_TYPES.variant,
    null,
    user
);

const extraName = [
    addTibetanShay(annotation1.getSourceName()),
    addTibetanShay(annotation2.getSourceName())
].join(" ");
const baseAnnotationData = {
    id: baseAnnotation.id,
    name: addTibetanShay(baseAnnotation.getSourceName()),
    content: baseAnnotation.content,
    annotation: baseAnnotation
};
const annotation1Data = {
    id: annotation1.id,
    name: extraName,
    content: annotation1.content,
    annotation: annotation1
};
const temporaryData = {
    id: temporaryAnnotation.id,
    name: temporaryAnnotation.getSourceName(),
    content: temporaryAnnotation.content,
    isTemporary: true,
    annotation: temporaryAnnotation
};

describe("AnnotationControls", () => {
    test("Show available variants", () => {
        const activeAnnotation = baseAnnotation;
        const availableAnnotations = [baseAnnotation, annotation1, annotation2];
        const annotationsData = [baseAnnotationData, annotation1Data];

        const controls = shallow(
            <AnnotationControls
                annotationsData={annotationsData}
                activeAnnotation={activeAnnotation}
                baseAnnotation={baseAnnotation}
                availableAnnotations={availableAnnotations}
                user={user}
                temporaryAnnotation={null}
                selectedWitness={baseWitness}
            />
        );

        const children = controls.children();
        expect(children.find(AnnotationDetail).length).toEqual(2);

        expect(children.find(AnnotationDetailEdit).length).toEqual(0);
    });
});

test("Editing annotation", () => {
    const activeAnnotation = temporaryAnnotation;
    const availableAnnotations = [
        temporaryAnnotation.basedOn,
        annotation1,
        annotation2
    ];
    const annotationsData = [
        temporaryData,
        baseAnnotationData,
        annotation1Data
    ];

    const controls = shallow(
        <AnnotationControls
            annotationsData={annotationsData}
            activeAnnotation={activeAnnotation}
            baseAnnotation={baseAnnotation}
            availableAnnotations={availableAnnotations}
            user={user}
            temporaryAnnotation={temporaryAnnotation}
            selectedWitness={baseWitness}
        />
    );

    const firstDetail = controls.childAt(1);
    expect(firstDetail.find(AnnotationDetailEdit).length).toEqual(1);

    const children = controls.children();
    expect(children.find(AnnotationDetail).length).toEqual(2);

    expect(children.find(AnnotationDetailEdit).length).toEqual(1);
});
