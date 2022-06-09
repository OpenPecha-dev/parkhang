import React from 'react'
import TextDetailHeading from './TextDetailHeadingContainer'
import SplitTextComponent from './SplitText'
import SplitText from "lib/SplitText";
import Loader from "react-loader";
import lengthSplitter from "lib/text_splitters/lengthSplitter";
import styles from './TextDetail.css'

function TextDetail(props) {
  let text = {
    name: "",
  };
if (props.text) {
    text = props.text;
}
let inlineControls = false;
let textComponent = null;
let splitText = null;
if (
 !props.annotatedText ||
 !props.text ||
  props.loading
) {
  textComponent = <div key={`key-${Math.random()}`}/>;
} else {
  let limitWidth = false;
  let splitter;
  if (props.paginated) {
      splitter = positionSplitter(props.pageBreaks);
  } else {
      splitter = lengthSplitter(2000, /^།[\s]+(?!།[\s]+)/, 2, 5);
  }
  
let key=12;
  splitText = new SplitText(props.annotatedText, splitter);
  inlineControls = true;
  textComponent = (
      <SplitTextComponent
          splitText={splitText}
          // annotations={this.props.annotations}
          // activeAnnotations={this.props.activeAnnotations}
          // activeAnnotation={this.props.activeAnnotation}
          limitWidth={limitWidth}
          // didSelectSegmentIds={props.didSelectSegmentIds}
          selectedSegmentId={props.selectedSegmentId}
          annotationPositions={props.annotationPositions}
          selectedAnnotatedSegments={
             props?.selectedAnnotatedSegments
          }
          // textListVisible={this.props.textListVisible}
          // showImages={this.props.pageImagesVisible}
          // imagesBaseUrl={this.props.imagesBaseUrl}
          selectedWitness={props.selectedWitness}
          key={key}
          // selectedSearchResult={this.props.selectedSearchResult}
          // searchValue={this.props.searchValue}
          fontSize={props.textFontSize}
          // editMenuVisible={this.props.menuListIsVisible}
      ></SplitTextComponent>
  );
}

let textComponents = [textComponent];

  return (
    <div style={{width:'50%'}} className={styles.textDetail2}>
        
        <TextDetailHeading/>
        <Loader loaded={!props.loading} />

           {!props.loading ? textComponents : <div />}
    </div>
  )
}

export default TextDetail