import React from "react";
import styles from "./ImageToggle.css";

type Props = {
    showImages: boolean,
    onChange: () => void
};

const ImageToggle = (props: Props) => (
    <div className={styles.imageToggle}>
        <label htmlFor="showPageImages">Show Images</label>
        <input
            id="showPageImages"
            type="checkbox"
            checked={props.showImages}
            onChange={(e: Event) => {
                const target = event.target;
                const checked = target.checked;
                props.onChange(checked);
            }}
        />
    </div>
);

export default ImageToggle;
