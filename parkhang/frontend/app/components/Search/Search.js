import React, { useRef } from "react";
import styles from "./Search.css";
import Magnifier from "images/magnifier.svg";
import classnames from "classnames";
import { injectIntl } from "react-intl";
import * as reduxroute from 'redux-first-router'

function Search(props) {
    const input=useRef();
    const history=reduxroute.history()

    const handleSubmit = (e) => {
        e.preventDefault();
        props.changeSearchTerm(input.current.value)
        history.push(`/search/${input.current.value}`);
        input.current.value=''


    };
    const handleReset = (e) => {
        input.current.value=''
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
                ref={input}
                placeholder={
                    props.intl.formatMessage({id: "leftbar.search" })
                }
            />
            <button type='reset' className={classnames(classes)} onClick={handleReset}>
                x
            </button>
        </form>
    );
}

export default injectIntl(Search);
