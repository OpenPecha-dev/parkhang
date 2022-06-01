// @flow
import React,{useTransition} from "react";
import styles from "./TextsSearch.css";

import { injectIntl } from "react-intl";
import Button from "components/UI/Button";
import SearchIcon from "images/search.svg";

type Props = {
    searchValue: string,
    searchChanged: (searchTerm: string) => void,
    selectedSearchOption?: (e: SyntheticEvent<HTMLSelectElement>) => void,
    minimiseButtonClicked: () => void,
    intl: { formatMessage: ({ [id: string]: string }) => string },
    searchTerm:string
};

const TextsSearch = (props: Props) => {
    let textInput: { current: null | HTMLInputElement } = React.createRef();
    const [ispending,startTransition]=useTransition()

    const initiateSearch = (e: SyntheticEvent<HTMLElement>) => {
        e.preventDefault();   
        if (textInput.current instanceof HTMLInputElement) {
        
            const searchTerm = textInput.current.value;
            startTransition(()=>{
                props.searchChanged(searchTerm);
            })
        }


    };

      const handleChange=(e)=>{
          startTransition(()=>{
            props.searchChanged(e.target.value)
          })
      }
    return (
        <div className={styles.textsSearchContainer}>
            <div className={styles.textsSearch}>
                <form onSubmit={initiateSearch}>
                    <input
                    onChange={handleChange}
                        style={{outline:'none'}}
                        type="text"
                        id="textSearchInput"
                        placeholder={
                    props.searchTerm ? props.searchTerm : props.intl.formatMessage({
                            id: "leftbar.search"
                        })
                    }
                        ref={textInput}
                    />
                    <Button
                    backgroundColor='#35BF5C'
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

export default injectIntl(TextsSearch);
