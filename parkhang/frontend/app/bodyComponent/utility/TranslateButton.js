import React from 'react'
import styles from './TranslateButton.css'
import { connect } from "react-redux";
import * as reducers from "reducers";
import * as actions from "actions";

const mapStateToProps = state => {
    return {
        Textdata: reducers.getTextTitle(state)
    };
};

const matchDispatchToProps = dispatch => {
    return {
        onChangeLanguage: (selectedLanguage :string)=>{
            dispatch(actions.changeLanguage(selectedLanguage));
        },
        dispatch
    };
};



function TranslateButton(props) {
   let {onChangeLanguage}=props
   let language=props.Textdata.language
    const handleLanguage=()=>{
        if(language==='en'){
        onChangeLanguage('ti')
        }
        else{
        onChangeLanguage('en')
    
        }
    }
  return (
    <div className={styles.langSelection} onClick={()=>handleLanguage()}>
                   {language==='en'?<span>E</span>:<span style={{paddingBottom:10}}>ཀ་</span>}
                </div>
  )
}


const TranslateButtonContainer = connect(mapStateToProps, matchDispatchToProps)(TranslateButton);
 export default  TranslateButtonContainer;