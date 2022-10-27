import React from "react";
import {
    Box as MuiBox,
    Button as MuiButton,
    CircularProgress as MuiCircularProgress,
    SpeedDial as MuiSpeedDial,
    SpeedDialAction as MuiSpeedDialAction,
    SpeedDialIcon as MuiSpeedDialIcon,
    Snackbar as MuiSnackbar,
    Alert as MuiAlert,
    Collapse as MuiCollapse,
    Divider as MuiDivider,
    Tooltip as MuiTooltip,
    MenuItem as MuiMenuItem,
    Stack as MuiStack,
    Menu as MuiMenu,
    IconButton as MuiIconButton,
    AppBar as MuiAppBar,
    Chip as MuiChip,
    Slider as MuiSlider,
    Autocomplete as MuiAutocomplete,
    Checkbox as MuiCheckBox,
    Typography as MuiTypography,
    Paper as MuiPaper,
    Container as MuiContainer,
    Pagination as MuiPagination,
    Accordion as MuiAccordion,
    AccordionSummary as MuiAccordionSummary,
    AccordionDetails as MuiAccordionDetails,
    Link as MuiLink,
    Tab as MuiTab,
    Tabs as MuiTabs,
    ButtonGroup as MuiButtonGroup,
    ClickAwayListener as MuiClickAwayListener,
    Grow as MuiGrow,
    MenuList as MuiMenuList,
    Slide as MuiSlide,
    TextField as MuiTextField,
    Badge as MuiBadge,
    Toolbar as MuiToolbar,
    Avatar as MuiAvatar,
    ListItemButton as MuiListItemButton,
    InputBase as MuiInputBase,
    NativeSelect as MuiNativeSelect,
    ListItemText as MuiListItemText,
    ListItemIcon as MuiListItemIcon,
    List as MuiList,
    Card as MuiCard,
    CardContent as MuiCardContent,
} from "@mui/material";
const ListItemButton = (props) => (
    <MuiListItemButton {...props}>{props.children}</MuiListItemButton>
);
const InputBase = (props) => (
    <MuiInputBase {...props}>{props.children}</MuiInputBase>
);
const NativeSelect = (props) => (
    <MuiNativeSelect {...props}>{props.children}</MuiNativeSelect>
);
const ListItemText = (props) => (
    <MuiListItemText {...props}>{props.children}</MuiListItemText>
);
const ListItemIcon = (props) => (
    <MuiListItemIcon {...props}>{props.children}</MuiListItemIcon>
);
const List = (props) => <MuiList {...props}>{props.children}</MuiList>;
const Card = (props) => <MuiCard {...props}>{props.children}</MuiCard>;
const CardContent = (props) => (
    <MuiCardContent {...props}>{props.children}</MuiCardContent>
);

const Badge = (props) => <MuiBadge {...props}>{props.children}</MuiBadge>;
const Toolbar = (props) => <MuiToolbar {...props}>{props.children}</MuiToolbar>;
const Avatar = (props) => <MuiAvatar {...props}>{props.children}</MuiAvatar>;
const Grow = (props) => <MuiGrow {...props}>{props.children}</MuiGrow>;
const MenuList = React.forwardRef((props, ref) => (
    <MuiMenuList ref={ref} {...props}>
        {props.children}
    </MuiMenuList>
));
const Slide = (props) => <MuiSlide {...props}>{props.children}</MuiSlide>;
const TextField = (props) => (
    <MuiTextField {...props}>{props.children}</MuiTextField>
);

const ButtonGroup = (props) => (
    <MuiButtonGroup {...props}>{props.children}</MuiButtonGroup>
);
const ClickAwayListener = (props) => (
    <MuiClickAwayListener {...props}>{props.children}</MuiClickAwayListener>
);

const Tab = (props) => <MuiTab {...props}>{props.children}</MuiTab>;
const Tabs = (props) => <MuiTabs {...props}>{props.children}</MuiTabs>;
const Accordion = (props) => (
    <MuiAccordion {...props}>{props.children}</MuiAccordion>
);
const AccordionSummary = (props) => (
    <MuiAccordionSummary {...props}>{props.children}</MuiAccordionSummary>
);
const AccordionDetails = (props) => (
    <MuiAccordionDetails {...props}>{props.children}</MuiAccordionDetails>
);
const Link = (props) => <MuiLink {...props}>{props.children}</MuiLink>;

const Paper = (props) => <MuiPaper {...props}>{props.children}</MuiPaper>;
const Pagination = (props) => (
    <MuiPagination {...props}>{props.children}</MuiPagination>
);

const Chip = (props) => <MuiChip {...props}>{props.children}</MuiChip>;
const Slider = (props) => <MuiSlider {...props}>{props.children}</MuiSlider>;
const Autocomplete = (props) => (
    <MuiAutocomplete {...props}>{props.children}</MuiAutocomplete>
);
const Checkbox = (props) => (
    <MuiCheckBox {...props}>{props.children}</MuiCheckBox>
);
const Typography = (props) => (
    <MuiTypography {...props}>{props.children}</MuiTypography>
);

const Box = React.forwardRef((props, ref) => (
    <MuiBox {...props} ref={ref}>
        {props.children}
    </MuiBox>
));
const Button = (props) => <MuiButton {...props}>{props.children}</MuiButton>;
const CircularProgress = (props) => (
    <MuiCircularProgress {...props}>{props.children}</MuiCircularProgress>
);
const SpeedDial = (props) => (
    <MuiSpeedDial {...props}>{props.children}</MuiSpeedDial>
);
const SpeedDialAction = (props) => (
    <MuiSpeedDialAction {...props}>{props.children}</MuiSpeedDialAction>
);
const SpeedDialIcon = (props) => (
    <MuiSpeedDialIcon {...props}>{props.children}</MuiSpeedDialIcon>
);
const Snackbar = (props) => (
    <MuiSnackbar {...props}>{props.children}</MuiSnackbar>
);
const Alert = (props) => <MuiAlert {...props}>{props.children}</MuiAlert>;
const Collapse = (props) => (
    <MuiCollapse {...props}>{props.children}</MuiCollapse>
);
const Divider = (props) => <MuiDivider {...props}>{props.children}</MuiDivider>;
const Tooltip = (props) => {
    const { title, ...Tprops } = props;
    const Element = React.forwardRef((props, ref) => (
        <div {...props} ref={ref}>
            {props.children}
        </div>
    ));

    return (
        <MuiTooltip title={title}>
            <Element {...Tprops} />
        </MuiTooltip>
    );
};
const MenuItem = (props) => (
    <MuiMenuItem {...props}>{props.children}</MuiMenuItem>
);
const Stack = React.forwardRef((props, ref) => (
    <MuiStack {...props} ref={ref}>
        {props.children}
    </MuiStack>
));
const Menu = (props) => <MuiMenu {...props}>{props.children}</MuiMenu>;
const IconButton = (props) => (
    <MuiIconButton {...props}>{props.children}</MuiIconButton>
);
const AppBar = (props) => <MuiAppBar {...props}>{props.children}</MuiAppBar>;
const Container = (props) => (
    <MuiContainer {...props}>{props.children}</MuiContainer>
);

export {
    Box,
    Button,
    CircularProgress,
    SpeedDial,
    SpeedDialAction,
    SpeedDialIcon,
    Snackbar,
    Alert,
    Collapse,
    Divider,
    Tooltip,
    MenuItem,
    Stack,
    Menu,
    IconButton,
    AppBar,
    Chip,
    Slider,
    Autocomplete,
    Checkbox,
    Typography,
    Paper,
    Container,
    Pagination,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Link,
    Tab,
    Tabs,
    ClickAwayListener,
    ButtonGroup,
    TextField,
    Slide,
    MenuList,
    Grow,
    Badge,
    Toolbar,
    Avatar,
    ListItemButton,
    InputBase,
    NativeSelect,
    List,
    ListItemText,
    ListItemIcon,
    Card,
    CardContent,
};
