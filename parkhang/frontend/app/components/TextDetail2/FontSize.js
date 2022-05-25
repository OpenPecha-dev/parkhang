import React from "react";
import styles from "./FontSize.css";

type Props = {
    fontSize: number,
    onChange: (fontSize: number) => void
};

const FontSize = (props: Props) => {
    const minimumSize = 14;
    const maximumSize = 48;
    const options = new Array(maximumSize - minimumSize)
        .fill()
        .map((value: any, index: number) => {
            const size = minimumSize + index;
            return (
                <option value={size} key={size}>
                    {size}
                </option>
            );
        });
    const onChange = (e: Event) => {
        const target = event.target;
        const fontSize = Number(target.value);
        props.onChange(fontSize);
    }
    return (
        <div className={styles.fontSize}>
            <label htmlFor="fontSize">Font Size</label>
            <select value={props.fontSize} onChange={onChange}>
                {options}
            </select>
        </div>
    );
};

export default FontSize;
