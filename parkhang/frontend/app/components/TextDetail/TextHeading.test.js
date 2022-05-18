import React from "react";
import { shallow, configure } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import TextHeading from "./TextHeading";
import Source from "lib/Source";
import User from "lib/User";
import Witness from "lib/Witness";

configure({ adapter: new Adapter() });

const source1 = new Source(1, "Derge");
const source2 = new Source(2, "Narthang");
const source3 = new Source(3, "Pecin");

const text = new Text(1, "དཔལ་ནག་པོ་ཆེན་པོ་ཡུམ་ཅན་གྱི་སྒྲུབ་ཐབས་ཞེས་བྱ་བ");

const userName = "Test";

test("Tabs", () => {
    const user = new User(1, userName);
    const baseWitness = new Witness(1, text, source1, "", true);
    const otherWitness = new Witness(2, text, source2);
    const anotherWitness = new Witness(3, text, source3);
    const witnesses = [baseWitness, otherWitness, anotherWitness];

    const heading = shallow(<TextHeading text={text} witnesses={witnesses} />);
});
