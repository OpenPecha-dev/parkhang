import { createTheme } from "@mui/material/styles";

const theme = (mode) =>
    createTheme({
        palette: {
            mode,
            navbar: {
                main: mode !== "dark" ? "#FBFBFA" : "#303030",
            },
            links: {
                main: mode !== "dark" ? "#666666" : "#eee",
            },
            heading: {
                main: mode !== "dark" ? "#fff" : "#383838",
            },
            Imagenavbar: {
                main: mode !== "dark" ? "#aaa" : "#383838",
            },
            texts: {
                main: mode !== "dark" ? "#303030" : "#d3d3d3",
            },
            primary: {
                light: "#757ce8",
                main: "#3f50b5",
                dark: "#002884",
                contrastText: "#fff",
            },
            secondary: {
                light: "#fffde7",
                main: "#f44336",
                dark: "#ba000d",
                contrastText: "#000",
            },
        },
        typography: {
            button: {
                fontWeight: "normal",
                lineHeight: "normal",
                textTransform: "capitalize",
                textDecoration: "none",
                letterSpacing: 0,
                borderRadius: "4px",
                fontFamily: "'Qomolangma-UchenSarchen', 'Overpass', sans-serif",
            },
            h6: {
                color: mode !== "dark" ? "#303030" : "#d3d3d3",
            },
        },
        props: {
            MuiButtonBase: {
                // The properties to apply
                disableRipple: true, // No more ripple, on the whole application!
            },
        },
    });

export default theme;
