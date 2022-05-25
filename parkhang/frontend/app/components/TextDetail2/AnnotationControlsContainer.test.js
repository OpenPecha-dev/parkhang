import React from "react";
import {
    mapStateToProps
} from "./AnnotationControlsContainer";
import { getAnonymousUser } from "lib/User";

test("mapStateToProps with no activeAnnotation", () => {
    const user = getAnonymousUser();
    const state = {
        data: {
            textsById: {
                1: {
                    id: 1,
                    name: "Test"
                }
            },
            witnessesById: {
                1: {
                    id: 1,
                    text: 1,
                    source: 1,
                    content: "",
                    is_base: false,
                    is_working: true,
                    revision: 1,
                    properties: null
                }
            },
            sourcesById: {
                1: {
                    id: 1,
                    name: "test",
                    is_base: true,
                    is_working: true
                }
            }
        },
        ui: {
            selectedText: {
                id: 1
            },
            selectedTextWitness: {
                1: 1
            }
        },
        user: {
            userId: user.id,
            userName: user.name
        }
    };

    expect(mapStateToProps(state, { activeAnnotation: null })).toEqual({
        annotationsData: null,
        activeAnnotation: null,
        baseAnnotation: null,
        availableAnnotations: null,
        user: user,
        temporaryAnnotation: null,
        inline: null,
        firstSelectedSegment: null,
        splitTextRect: null,
        selectedWitness: null
    });
});
