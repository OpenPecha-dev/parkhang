// @flow
import SegmentedText from "./SegmentedText";
import TextSegment from "./TextSegment";

export default function segmentTibetanText(text: string): SegmentedText {
    const dot = "་";
    const breaker = "། །";
    var symbol = "།";
    let currentSegment = "";
    let currentStart = 0;
    let count = 0;
    let textSplitData = text.split(dot);
    let r = [];
    let segments = [];
    textSplitData.forEach((text, index) => {
        count = index;
        var temp = text;
        if (text.includes(breaker)) {
            r = text.split(breaker);
            r[2] = r[1];
            r[1] = breaker;
            if (r.length > 1) {
                r.forEach((l, index) => {
                    if (index === 2) {
                        var currentSegment = l;
                        var newSegment = new TextSegment(
                            currentStart,
                            currentSegment
                        );
                        segments.push(newSegment);
                        currentStart += currentSegment.length;

                        if (!symbol.includes(currentSegment)) {
                            newSegment = new TextSegment(currentStart, dot);
                            segments.push(newSegment);
                            currentStart += 1;
                        }
                    } else {
                        var currentSegment = l;
                        const newSegment = new TextSegment(
                            currentStart,
                            currentSegment
                        );

                        segments.push(newSegment);
                        currentStart += currentSegment.length;
                    }
                });
            }
        } else {
            var currentSegment = temp;
            var newSegment = new TextSegment(currentStart, currentSegment);
            segments.push(newSegment);
            currentStart += currentSegment.length;
            if (textSplitData.length > 100) {
                //only add dot on first text load
                newSegment = new TextSegment(currentStart, dot);
                segments.push(newSegment);
                currentStart += 1;
            }
        }
    });
    if (currentSegment) {
        const newSegment = new TextSegment(currentStart, currentSegment);
        segments.push(newSegment);
    }
    return new SegmentedText(segments);
}
