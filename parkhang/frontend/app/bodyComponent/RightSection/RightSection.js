import React from 'react'
import styles from './RightSection.css'
function RightSection(props) {
const selectedText=props?.Textdata?.activeText
const selectedCategory=props?.Textdata?.activeCategory

if(selectedText && !selectedCategory)  return (
   <SelectedTextRender selectedText={selectedText}/>
  )

if(selectedText && selectedCategory) return (
  <SelectedCategoryRender selectedCategory={selectedCategory}/>
)
else  return(
 <FrontPageRender/>
)
}

export default RightSection



function FrontPageRender(){
return <div className={styles.RightSection}>
<div className={styles.RightModule}>
      <div className={styles.RightTitle}>
          <h3>
             About Lopenling Text
          </h3>
       </div>
       <div className={styles.Discription}>
       <span >
       An application that allow users to participate in creating critical editions
        of texts, initially targeting the Tibetan language.
         </span>
         <a href="/about" className={styles.inTextLink}>Learn More </a>

       </div>
</div>
<div className={styles.RightModule}>
      <div className={styles.RightTitle}>
          <h3>
        Our other web sites
          </h3>
       </div>
       <div className={styles.Discription}>
       <span >
      <ul className={styles.linkList}>
        <li>Lopenling.org</li>
        <li>Esukhia.org</li>
        <li>Bdrc.org</li>
        <li>OpenPecha .org</li>
      </ul>
        </span>
         <a href="/about" className={styles.inTextLink}>Learn More</a>

       </div>
</div>

  </div>
}


function SelectedTextRender({selectedText}){
return  <div className={styles.RightSection}>
<div className={styles.RightModule}>
      <div className={styles.RightTitle}>
          <h3>
             About {selectedText}
          </h3>
       </div>
       <div className={styles.Discription}>
       <span >
         Sefaria is home to 3,000 years of Jewish texts. We are a non-profit organization offering free access to texts, translations, and commentaries so that everyone can participate in the ongoing process of studying, interpreting, and creating Torah.
         </span>
         <a href="/about" className={styles.inTextLink}>Learn More </a>

       </div>
</div><div className={styles.RightModule}>
      <div className={styles.RightTitle}>
          <h3>
         Text related to {selectedText}
          </h3>
       </div>
       <div className={styles.Discription}>
       <span >
         Sefaria is home to 3,000 years of Jewish texts. We are a non-profit organization offering free access to texts, translations, and commentaries so that everyone can participate in the ongoing process of studying, interpreting, and creating Torah.
         </span>
         <a href="/about" className={styles.inTextLink}>Learn More</a>

       </div>
</div>

  </div>
}

function SelectedCategoryRender({selectedCategory}){
  return <div className={styles.RightSection}>
  <div className={styles.RightModule}>
        <div className={styles.RightTitle}>
            <h3>
               About this Section
            </h3>
         </div>
         <div className={styles.Discription}>
         <span >
           Sefaria is home to 3,000 years of Jewish texts. We are a non-profit organization offering free access to texts, translations, and commentaries so that everyone can participate in the ongoing process of studying, interpreting, and creating Torah.
           </span>
           <a href="/about" className={styles.inTextLink}>Learn More </a>
  
         </div>
  </div><div className={styles.RightModule}>
        <div className={styles.RightTitle}>
            <h3>
          related text
            </h3>
         </div>
         <div className={styles.Discription}>
         <span >
           Sefaria is home to 3,000 years of Jewish texts. We are a non-profit organization offering free access to texts, translations, and commentaries so that everyone can participate in the ongoing process of studying, interpreting, and creating Torah.
           </span>
           <a href="/about" className={styles.inTextLink}>Learn More</a>
  
         </div>
  </div>
  
    </div>
}