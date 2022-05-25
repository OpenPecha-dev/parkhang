// @flow
import React,{useState,useEffect} from "react";
import classnames from "classnames";
import { FormattedMessage,injectIntl } from "react-intl";
import styles from "./SelectVersion.css";
import Witness from "lib/Witness";

export type Props = {
    witnesses: Witness[],
    activeWitness: Witness | null,
    onSelectedWitness: (witness: Witness) => void
};

const SelectVersion=(props:Props)=> {
    const [temp,setTemp]=useState(0);
    let witnesses;
    let tabs = [];
    let classes=[styles.selectOptions];
    if (props.witnesses) {
        witnesses = props.witnesses.map(witness => witness);
        classes = [styles.tab];
        witnesses.sort((a, b) => {
            if (a.isWorking) {
                return -1;
            }
            if (b.isWorking) {
                return 1;
            }
            if (a.isBase) {
                return -1;
            }
            if (b.isBase) {
                return 1;
            }
            return 0;
        });
    }

    useEffect(()=>{
        if(props.witnesses.length>0){
            props.onSelectedWitness(witnesses[temp])
        }
    },[temp])

    return <select onChange={(e)=>setTemp(e.target.value)} className={styles.selectVersion}>
        {witnesses.map((witness,key)=>{
               if (witness === props.activeWitness) classes.push(styles.selected);
               let tabName = witness.source.name;
               if (witness.isWorking) {
                tabName = (
                   props.intl.locale==='en'?"working":'མཉམ་འབྲེལ་པར་མ།'
                ) }
                return (<option key={`versionSelect-${key}`} value={key} className={classes}>
                    {tabName} 
                </option>)}
                )
    }
    </select>;
}

export default injectIntl(SelectVersion)