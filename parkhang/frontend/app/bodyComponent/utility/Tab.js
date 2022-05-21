
import React,{useState,useEffect} from 'react'
import styles from './Tab.css'
function Tab({children,active=0}) {

    const [activeTab,setActiveTab]=useState(active);
    const [tabsData,setTabsData]=useState([]);

    useEffect(()=>{
        let data=[];
        React.Children.forEach(children,element=>{
            if(!React.isValidElement(element)) return ;
            const {props:{ tab,count, children}}=element;
            data.push({tab,count,children});
        })

        setTabsData(data)
    },[children])

  return (


    <div className={styles.container}>
        <ul className={styles.bloc_tabs}>
            {
                tabsData.map(({tab,count},idx)=>(
                    <li key={`tabslist-${idx}`} className={idx===activeTab ? styles.active_tabs: styles.tabs} onClick={()=>setActiveTab(idx)}>         
                         <a className={styles.tab}>{tab} <span>{count && `(${count})`}</span></a>
                    </li>
                ))
            }
        </ul>
        <div className={styles.content_tabs}>
            {tabsData[activeTab] && tabsData[activeTab].children}
        </div>

    </div>

  )
}


const TabPane=({children})=>{
return {children}
}

Tab.TabPane = TabPane;

export default Tab