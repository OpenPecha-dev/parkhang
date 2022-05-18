import React, { useState } from "react";
import styles from "./Search.css";
import Magnifier from "images/magnifier.svg";
import classnames from "classnames";
import { injectIntl } from "react-intl";

function Search(props) {
    const [input, setInput] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(input);
        setInput("");
    };
    const handleReset = (e) => {
        setInput("");
    };
    let classes = [styles.reset];
    if (input !== "") {
        classes.push(styles.active);
    }
    return (
        <form className={styles.Search} onSubmit={handleSubmit}>
            <button className={styles.submit} type="submit">
                <Magnifier />
            </button>
            <input
                type="text"
                value={input}
                placeholder={
                    props.intl.formatMessage({id: "leftbar.search" })
                }
                onChange={(e) => setInput(e.target.value)}
            />
            <button className={classnames(classes)} onClick={handleReset}>
                x
            </button>
        </form>
    );
}

export default injectIntl(Search);
