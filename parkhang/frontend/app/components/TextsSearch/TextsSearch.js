// @flow
import React from "react";
import styles1 from "./TextsSearch.css";
import styles2 from "./TextsSearch2.css";

import { injectIntl } from "react-intl";
import Button from "components/UI/Button";
import { withLDConsumer } from 'launchdarkly-react-client-sdk';
import SearchIcon from "images/search.svg";

type Props = {
    searchValue: string,
    searchChanged: (searchTerm: string) => void,
    selectedSearchOption?: (e: SyntheticEvent<HTMLSelectElement>) => void,
    minimiseButtonClicked: () => void,
    intl: { formatMessage: ({ [id: string]: string }) => string }
};

const TextsSearch = (props: Props) => {
    let styles=props.flags.textListUiParkhang==='ui1'?styles1 : styles2;
    let textInput: { current: null | HTMLInputElement } = React.createRef();
    const initiateSearch = (e: SyntheticEvent<HTMLElement>) => {
        e.preventDefault();
        if (textInput.current instanceof HTMLInputElement) {
            const searchTerm = textInput.current.value;
            props.searchChanged(searchTerm);
        }
    };
    return (
        <div className={styles.textsSearchContainer}>
            <div className={styles.textsSearch}>
                <form onSubmit={initiateSearch}>
                    <input
                        style={{outline:'none'}}
                        type="text"
                        id="textSearchInput"
                        placeholder={props.intl.formatMessage({
                            id: "leftbar.search"
                        })}
                        ref={textInput}
                    />
                    <Button
                    backgroundColor={props.flags.textListUiParkhang==='ui2'?'#35BF5C':null}
                        onClick={initiateSearch}                    
                        title={props.intl.formatMessage({
                            id: "leftbar.search"
                        })}
                        noBezel={true}
                    />
                </form>
            </div>
        </div>
    );
};

export default injectIntl(withLDConsumer()(TextsSearch));
