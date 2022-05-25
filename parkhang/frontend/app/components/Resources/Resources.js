import React,{useState} from 'react'
import styles from './Resources.css'
import AboutIcon from 'images/about-text.svg'
import CommentIcon from 'images/notes.svg'
import DictionariesIcon from 'images/dictionaries.svg'
import FindIcon from 'images/magnifier.svg'
import FeedbackIcon from 'images/feedback.svg'
import ApplyTooltip from '../UI/ApplyTooltip'
import classnames from 'classnames'
import Index from './ResourceOption'
function Resources() {
  const [selectedOption,setSelectedOption]=useState(0);
  const handleClick=(num)=>{
      setSelectedOption(num)
  } 
  const resources=[{
      id:0,
      title:'About',
      effect:'float',
      className:styles.ResourceIcon
  },
  {
    id:1,
    title:'Commentary',
    effect:'solid',
    className:styles.ResourceIcon
},
{
    id:2,
    title:'Dictionary',
    effect:'solid',
    className:styles.ResourceIcon
},
{
    id:3,
    title:'Question',
    effect:'solid',
    className:styles.ResourceIcon
},{
    id:4,
    title:'Search',
    effect:'solid',
    className:styles.ResourceIcon
}
]

    return (
    <div className={styles.Resources}>
       <div className={styles.ResourcesHeader}>
              {
                  resources.map((resource,key)=>
                  <div className={selectedOption===key?classnames(resource.className,styles.activeResource):resource.className} onClick={()=>handleClick(resource.id)} key={`resources-${key}`}>
                  <ApplyTooltip tooltipName={resource.title} effect={resource.effect} className={resource.className}>
                  {resource.id ===0 && <AboutIcon/>}
                  {resource.id ===1 && <CommentIcon/>}
                  {resource.id ===2 && <DictionariesIcon/>}
                  {resource.id  ===3 && <FeedbackIcon/>}
                  {resource.id  ===4 && <FindIcon/>}
                  </ApplyTooltip>
                  </div>
                  )
              }
              
       </div>
        <div className={styles.ResourceDetail}>
          {selectedOption ===0 && <Index.About/>}
          {selectedOption ===1 && <Index.Comment/>}
          {selectedOption ===2 && <Index.Dictionary/>}
          {selectedOption ===3 && <Index.Question/>}
          {selectedOption ===4 && <Index.Find/>}
        </div>
    </div>
  )
}

export default Resources