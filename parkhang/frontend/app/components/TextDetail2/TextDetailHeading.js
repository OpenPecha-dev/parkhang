import React, { useState, useCallback, useRef, useEffect } from "react";
import styles from "./textDetailHeading.css";
import SelectVersion from "./SelectVersion";
import Slider from "../UI/Slider";
import TextListContainer from "./TextListContainer";
import OptionsIcon from "images/options.svg";
import Settings from "./HeaderMenu/Settings";
import Search from "./HeaderMenu/Search";
import TableOfContent from "./HeaderMenu/TableOfContent";
import _ from "lodash";
import classnames from "classnames";
import {
    Stack,
    Box,
    TextField,
    Button,
    Collapse,
    Divider,
    ButtonGroup,
    ListItem,
    List,
} from "@mui/material";

type HeaderProps = {
    user: {},
    textFontSize: Number,
    onChangedFontSize: () => void,
    searchResults: [],
};

function TextDetailHeading(props: HeaderProps) {
    const [findvalue, setfindvalue] = useState("");
    let [showFind, setShowFind] = useState(false);
    let [visible, setVisible] = useState(false);

    const inputRef = useRef();
    const headingRef = useRef();
    const handleListItemClick = (id) => {
        props.changeSelectSyncId(id);
        setVisible(false);
    };
    const debouncedSearch = React.useRef(
        _.debounce((s) => {
            props.searchChanged(s);
        }, 1000)
    ).current;
    const handleSearch = useCallback(
        (e) => {
            e.preventDefault();
            setfindvalue("");
            debouncedSearch(findvalue);
            setVisible(true);
        },
        [findvalue]
    );

    const handleWindowSearch = useCallback(() => {
        setShowFind(!showFind);
    }, [showFind]);

    useEffect(() => {
        if (showFind === true) {
            inputRef.current.focus();
        }

        if (showFind === false) debouncedSearch(null);
    }, [showFind]);

    return (
        <Stack
            direction="column"
            ref={headingRef}
            spacing={1}
            px={2}
            py={1}
            style={{ background: "#f7f7f7" }}
        >
            {" "}
            <Stack direction="row" spacing={1} justifyContent="space-between">
                <Box sx={{ display: "flex", gap: 2 }}>
                    <TextListContainer />
                    <SelectVersion
                        witnesses={props.witnesses}
                        activeWitness={props.selectedWitness}
                        onSelectedWitness={props.onSelectedWitness}
                        user={props.user}
                    />
                </Box>

                <ButtonGroup
                    size="small"
                    aria-label="small button group"
                    sx={{
                        position: "relative",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "fit-content",
                        border: (theme) => `1px solid ${theme.palette.divider}`,
                        borderRadius: 1,
                        bgcolor: "background.paper",
                        color: "text.secondary",
                        "& svg": {
                            m: 1.5,
                        },
                        "& hr": {
                            mx: 0.5,
                        },
                    }}
                    className={styles.button_group_menu}
                >
                    <Search handleWindowSearch={handleWindowSearch} />
                    <Settings {...props} />
                    <TableOfContent {...props} />
                </ButtonGroup>
            </Stack>
            <Collapse in={showFind}>
                <form onSubmit={handleSearch}>
                    <Stack direction="row" spacing={2} position="relative">
                        <TextField
                            hiddenLabel
                            id="filled-hidden-label-small"
                            inputProps={{
                                style: {
                                    height: 25,
                                    padding: "0 14px",
                                },
                            }}
                            style={{ height: 25, flex: 1 }}
                            fullWidth
                            inputRef={inputRef}
                            value={findvalue}
                            onChange={(e) => setfindvalue(e.target.value)}
                        />
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={handleSearch}
                            style={{ height: 25 }}
                        >
                            Search
                        </Button>
                        {props.searchResults && visible && (
                            <List
                                sx={{
                                    position: "absolute",
                                    top: 84,
                                    zIndex: 10,
                                    background: "#eee",
                                    boxShadow: 3,
                                }}
                            >
                                {_.isObject(props.searchResults) &&
                                    props.searchResults.hasOwnProperty(
                                        props.selectedText.id
                                    ) &&
                                    props.searchResults[props.selectedText.id]
                                        .results &&
                                    props.searchResults[
                                        props.selectedText.id
                                    ]?.results.map((l, i) => {
                                        return (
                                            <ListItem
                                                onClick={() =>
                                                    handleListItemClick(l[0])
                                                }
                                                sx={{
                                                    cursor: "pointer",
                                                    "&:hover": {
                                                        background: "#fff",
                                                    },
                                                }}
                                                key={l[0] + "listsearch"}
                                            >
                                                {l[1]}
                                            </ListItem>
                                        );
                                    })}
                            </List>
                        )}
                    </Stack>
                </form>
            </Collapse>
        </Stack>
    );
}

export default TextDetailHeading;
