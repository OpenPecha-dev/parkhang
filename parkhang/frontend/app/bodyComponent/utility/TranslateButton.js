import React from 'react'
import styles from './TranslateButton.css'
import { connect } from "react-redux";
import * as reducers from "reducers";
import * as actions from "actions";
import Om from 'images/om.png'
const mapStateToProps = state => {
    const locales = reducers.getLocales(state);
    const activeLocale= reducers.getActiveLocale(state);
    return {
        locales: locales,
        activeLocale
    };
};

const matchDispatchToProps = dispatch => {
    return {
        onChangeLanguage: (locale :string)=>{
            dispatch(actions.selectedLocale(locale));
        },
        dispatch
    };
};



function TranslateButton(props) {
   let {onChangeLanguage}=props
   let language=props.activeLocale
    const handleLanguage=()=>{
        if(language==='bo'){
        onChangeLanguage('en')
        }
        else{
        onChangeLanguage('bo')
        }
    }
  return (
    <div className={styles.langSelection} 
    onClick={()=>handleLanguage()}
    >
{language!=='bo'?<div>A</div>:<div
style={{paddingTop:'-10px',marginTop:'-10px'}}
>ཀ</div>}

  </div>
  )
}


const TranslateButtonContainer = connect(mapStateToProps, matchDispatchToProps)(TranslateButton);
 export default  TranslateButtonContainer;