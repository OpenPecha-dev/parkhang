import React from 'react'
import styles from './Search.css'
import Tab from '../utility/Tab'
import TextList from 'containers/TextListContainer'
import TextSearch from 'components/TextsSearch'
function Search(props) {
const {searchTerm} =props
const tabContent =[{
  title:'Sources',
  count:21
},
{
  title:'Sheets',
  count:3
}
];
const searchCount=10;
  return (
    <div className={styles.SearchContainer}>
      <div className={styles.LeftSearch}>
      <div className={styles.SearchTitle}>Results for: {searchTerm}</div>
      <div className={styles.SearchCount}>{searchCount} Results found</div>

      <Tab active={0}>
                {tabContent.map((tab, idx) => (
                    <Tab.TabPane key={`Tab-${idx}`} tab={tab.title} count={tab.count}>
                       
                    </Tab.TabPane>
                ))}
            </Tab>
      </div>
    <div className={styles.RightSearch}>
       <h2>
         <span>Full Term Search</span></h2>
         <TextSearch searchTerm={searchTerm}/>
         <TextList/>
    </div>
    </div>
  )
}

export default Search