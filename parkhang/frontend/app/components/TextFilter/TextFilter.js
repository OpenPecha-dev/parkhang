import React, { useEffect, useRef, useState } from "react";
import styles from "./TextFilter.css";
import * as api from "api";
import addTibetanShay from "lib/addTibetanShay";
import { FormattedMessage, injectIntl } from "react-intl";
import Link from "redux-first-router-link";
import { authorDetails } from "app_constants/demoAuthorData";
import TextHeadingContainer from "../TextDetail/TextHeadingContainer";
import classname from "classnames";

type Props = {
    texts: api.TextData[],
    selectedText: String,
    onSelectedText: (text: api.TextData) => void,
    onAuthorChange: (data: any) => void,
};

function TextFilter(props: Props) {
    const selectRef = useRef(null);
    useEffect(() => {
      if(selectRef?.current?.value){
         selectRef.current.value = props.selectedText?.name;
        }
    }, [props.selectedText]);

    const textData: string[] = props.texts;
    const text=props.selectedText;
    function handleChange(data) {
        var r = textData.findIndex((x) => x.name === data);
        props.onSelectedText(textData[r]);
    }

    function authorChange(e) {
        var dataId = e.target.value;
        props.onAuthorChange(dataId);
    }
    
        return (
            <div className={styles.filter_section}>
                <label>
                    <FormattedMessage id="filter.category" />
                </label>
                <select
                    ref={selectRef}
                    className={styles.category}
                    onChange={(e) => handleChange(e.target.value)}
                >
                    {textData.map((list) => (
                        <option key={list.id} value={list?.name}>
                            {addTibetanShay(list.name)}
                        </option>
                    ))}
                </select>
                <label>
                    <FormattedMessage id="filter.author" />
                </label>
                <select onChange={authorChange}>
                    {authorDetails.map((ls, i) => {
                        return (
                            <option value={ls.id} key={i}>
                                {ls.name}
                            </option>
                        );
                    })}
                </select>
                <TextHeadingContainer text={text}/>
                {/* <Breadcrumbs text={props.selectedText} /> */}
            </div>
        )
}

const Breadcrumbs = ({ text }) => {
    var breadCrumbDetail = [
        { path: "Home", link: "/", active: false },
        { path: text?.name, link: `/texts/${text?.id}`, active: true },
    ];

    return (
        <div className={styles.breadCrumbs}>
            {breadCrumbDetail.map((bread, i) => {
                var len = breadCrumbDetail.length;
                if (len === 1) return null;

                return (
                    <Link
                        to={bread.link}
                        className={classname(styles.breadLink)}
                        key={i}
                    >
                        {bread.path}{" "}
                        <span className={styles.spanArrow}>
                            {" "}
                            {i !== len - 1 ? "   / " : ""}
                        </span>
                    </Link>
                );
            })}
        </div>
    );
};

export default TextFilter;
