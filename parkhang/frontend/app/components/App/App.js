// @flow
import React, { Suspense, lazy } from "react";
import classnames from "classnames";
import type { AppState } from "reducers";
import * as actions from "actions";
import styles from "./App.css";
import utilStyles from "css/util.css";
import favimage from "images/favicon.png";
import Favicon from "react-favicon";
import { ThemeProvider } from "@mui/material/styles";
import createTheme from "components/UI/theme";
import { Box, CircularProgress } from "components/UI/muiComponent";
import LopenlingLogo from "images/lopenling_logo.png";
const Switcher = lazy(() => import("./Switcher"));
const Header = lazy(() => import("components/Header"));

type Props = {
    title: string,
    selectedText: {},
    dispatch: (action: actions.Action) => void,
    onChangedTextWidth: (width: number) => void,
    onChangedTextListVisible: (isVisible: boolean) => void,
};

function setTitle(title: string) {
    document.title = title;
}

const App = (props: Props) => {
    let mode = props.theme;
    const theme = createTheme(mode);
    let SelectedText = props.selectedText;
    setTitle(props.title);
    if (!SelectedText) {
        setTitle("parkhang");
    } else if (props.page === "Editors") {
        setTitle(SelectedText?.name + "-" + props.title);
    }
    const favicon = React.useMemo(() => <Favicon url={favimage} />, []);
    return (
        <ThemeProvider theme={theme}>
            {favicon}
            <Box
                sx={{
                    bgcolor: "background.default",
                    color: "text.primary",
                }}
                className={classnames(
                    styles.container,
                    utilStyles.flex,
                    utilStyles.flexColumn
                )}
            >
                <Suspense
                    fallback={
                        <Box
                            sx={{
                                zIndex: (theme) => theme.zIndex.drawer + 1,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                height: "100vh",
                            }}
                        >
                            <img
                                src={LopenlingLogo}
                                alt="suspence image"
                                height={150}
                                style={{ objectFit: "contain" }}
                            />
                            <CircularProgress />
                        </Box>
                    }
                >
                    <Header />
                    <Switcher />
                </Suspense>
            </Box>
        </ThemeProvider>
    );
};

export default App;
