import React,{useEffect, useState} from "react";
import styles from "./LeftSection.css";
import randomColor from 'randomcolor'
import Link from 'redux-first-router-link'
import SelectedText from "./SelectedText";
import TranslateButton from "../utility/TranslateButton";
import Loading from "../utility/loading";


function LeftSection(props) {
    var {Textdata}=props

if(Textdata.isLoaded) return <Loading visible={true}/>

if(Textdata.activeText===null){
    return (
        <div className={styles.LeftSection}>
            <div className={styles.Title}>
                <h1>
                    <span>Browse the Library</span>
                </h1>
                <TranslateButton/>
            </div>

            <div className={styles.readerNavCategories}>
                         {
                             Textdata?.detail?.map(pechalist=>{
                                var color = randomColor();
                                return (
                                <div className={styles.gridBoxItem} key={pechalist.id} style={{borderTop:`5px solid ${color}`}}>
                                <Link
                                    to={`/title/${pechalist?.texttitle}`}
                                    className={styles.navBlockTitle}
                                >
                                           {pechalist.texttitle}   
                                </Link>
                                <div className={styles.navBlockDescription}>
                                    {pechalist?.desc}
                                    ksjdfijaosidjfoi ajsodifjoa sidjfoia sdofijsaoidfjoiajdfoij
                            </div>
                        </div>)
                        
                             })
                         }
                         
                          
                        </div>
                 </div>
    );
                        }

                   else     {
                            return <SelectedText/>
                        }
                     

}

export default LeftSection;
