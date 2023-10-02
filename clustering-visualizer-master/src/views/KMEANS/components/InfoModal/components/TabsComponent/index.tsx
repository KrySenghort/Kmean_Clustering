import React, { ReactElement } from 'react';
import { makeStyles, Theme, useTheme } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { Grid, useMediaQuery } from '@material-ui/core';

import { Mode } from '../../../InfoModal';

interface TabPanelProps {
    children?: React.ReactNode;
    dir?: string;
    index: any;
    value: any;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`full-width-tabpanel-${index}`}
            aria-labelledby={`full-width-tab-${index}`}
            {...other}
            style={{ width: '100%', height: '100%' }}
        >
            {value === index && (
                <div
                    style={{
                        width: '100%',
                        height: '100%',
                    }}
                >
                    {children}
                </div>
            )}
        </div>
    );
}

function a11yProps(index: any) {
    return {
        id: `full-width-tab-${index}`,
        'aria-controls': `full-width-tabpanel-${index}`,
    };
}

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        backgroundColor: theme.palette.background.paper,
        width: '100%',
    },
}));

type Props = {
    item1: ReactElement;
    item2: ReactElement;
    mode?: Mode;
};

export default function FullWidthTabs(props: Props): ReactElement {
    const classes = useStyles();
    const theme = useTheme();
    const [value, setValue] = React.useState(0);

    const smUp = useMediaQuery(theme.breakpoints.up('sm'));

    const handleChange = (event: React.ChangeEvent<any>, newValue: number) => {
        setValue(newValue);
    };

    return (
        <Grid
            container
            direction="column"
            justify={props.mode !== undefined && props.mode === Mode.RESULT && smUp ? 'space-between' : 'flex-start'}
            alignItems="center"
            className={classes.root}
            style={{ height: props.mode === Mode.RESULT && smUp ? '100%' : '60vh' }}
        >
            <Grid
                container
                alignItems="flex-start"
                item
                style={{
                    paddingTop: props.mode !== undefined && props.mode === Mode.RESULT && smUp ? '0px' : '50px',
                }}
            >
                {' '}
                <Tabs
                    variant="fullWidth"
                    value={value}
                    onChange={handleChange}
                    indicatorColor="secondary"
                    textColor="secondary"
                    aria-label="full width tabs example"
                    style={{ marginBottom: '10px' }}
                >
                    <Tab label="Info" {...a11yProps(0)} />
                    <Tab label="Chart" {...a11yProps(1)} />
                </Tabs>
            </Grid>

            <Grid container item>
                <TabPanel value={value} index={0} dir={theme.direction}>
                    {props.item1}
                </TabPanel>
                <TabPanel value={value} index={1} dir={theme.direction}>
                    {props.item2}
                </TabPanel>{' '}
            </Grid>
        </Grid>
    );
}
