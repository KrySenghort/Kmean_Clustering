import React, { Component } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { Typography, Grid } from '@material-ui/core';

import AlgorithmNames from '../../../../common/algorithms.enum';
import { Slider } from '../../../../components';
import { CommonNavBar } from '../../../../components';
import { GlobalActionTypes, RootState, DBSCANAlgorithmActionTypes } from '../../../../reduxStore';

const mapStateToProps = (state: RootState) => ({
    global: state.global,
    dbscan: state.dbscan,
    algorithm: state.algorithm,
});

const mapDispatchToProps = {
    setAlgorithm: (algo: AlgorithmNames) => ({
        type: GlobalActionTypes.SET_ALGORITHM,
        payload: algo,
    }),
    setMinPts: (minpts: number) => ({ type: DBSCANAlgorithmActionTypes.SET_MIN_POINTS, payload: minpts }),
    setEps: (eps: number) => ({ type: DBSCANAlgorithmActionTypes.SET_EPSILON, payload: eps }),
    setShowGuideCircle: (s: boolean) => ({ type: DBSCANAlgorithmActionTypes.SET_SHOW_GUIDE_CIRCLE, payload: s }),
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

type Props = PropsFromRedux;

type State = any;

class NavBar extends Component<Props, State> {
    state = {};

    componentDidMount() {
        if (this.props.global.algorithm !== AlgorithmNames.DBSCAN) this.props.setAlgorithm(AlgorithmNames.DBSCAN);
    }
    componentDidUpdate() {
        if (this.props.global.algorithm !== AlgorithmNames.DBSCAN) this.props.setAlgorithm(AlgorithmNames.DBSCAN);
    }

    render() {
        return (
            <div>
                <CommonNavBar
                    disabled={() => this.props.dbscan.minPts <= 1 && this.props.dbscan.eps <= 10}
                    drawerChildren={[
                        <Grid container justify="center" alignItems="center" key={0}>
                            <Grid
                                container
                                direction="column"
                                style={{
                                    width: '100%',
                                    marginLeft: 0,
                                    marginRight: 0,
                                    marginTop: '10px',
                                    maxWidth: '500px',
                                }}
                            >
                                <Typography variant="button">Min Points: {this.props.dbscan.minPts}</Typography>
                                <Slider
                                    //disabled={this.props.global.start}
                                    valueLabelDisplay="auto"
                                    color="secondary"
                                    min={1}
                                    max={20}
                                    value={this.props.dbscan.minPts}
                                    onChange={(e, val) => this.props.setMinPts(val as number)}
                                />
                            </Grid>
                        </Grid>,
                        <Grid container justify="center" alignItems="center" key={1}>
                            <Grid
                                container
                                direction="column"
                                style={{
                                    width: '100%',
                                    marginLeft: 0,
                                    marginRight: 0,
                                    marginTop: '10px',
                                    maxWidth: '500px',
                                }}
                            >
                                <Typography variant="button">Epsilon: {this.props.dbscan.eps}</Typography>
                                <Slider
                                    //disabled={this.props.global.start}

                                    valueLabelDisplay="auto"
                                    color="secondary"
                                    min={20}
                                    max={100}
                                    value={this.props.dbscan.eps}
                                    onChange={(e, val) => this.props.setEps(val as number)}
                                />
                            </Grid>
                        </Grid>,
                    ]}
                >
                    {[
                        <Grid
                            key={0}
                            container
                            direction="column"
                            justify="flex-end"
                            style={{
                                maxWidth: '150px',
                                marginLeft: '10px',
                                marginRight: '10px',
                                // position: 'relative',
                                // top: '12px',
                            }}
                        >
                            <Typography variant="button">Min Points: {this.props.dbscan.minPts}</Typography>
                            <Slider
                                // disabled={this.props.global.start}
                                valueLabelDisplay="auto"
                                color="secondary"
                                min={1}
                                max={20}
                                value={this.props.dbscan.minPts}
                                onChange={(e, val) => this.props.setMinPts(val as number)}
                            />
                        </Grid>,

                        <Grid
                            key={1}
                            onPointerUp={() => this.props.setShowGuideCircle(false)}
                            container
                            direction="column"
                            justify="flex-end"
                            style={{
                                maxWidth: '150px',
                                marginLeft: '10px',
                                marginRight: '20px',
                                // position: 'relative',
                                // top: '12px',
                            }}
                        >
                            <Typography variant="button">Epsilon: {this.props.dbscan.eps}</Typography>
                            <Slider
                                onPointerDown={() => this.props.setShowGuideCircle(true)}
                                onBlur={() => this.props.setShowGuideCircle(false)}
                                // disabled={this.props.global.start}
                                valueLabelDisplay="auto"
                                color="secondary"
                                min={20}
                                max={100}
                                value={this.props.dbscan.eps}
                                onChange={(e, val) => this.props.setEps(val as number)}
                            />
                        </Grid>,
                    ]}
                </CommonNavBar>
            </div>
        );
    }
}

export default connector(NavBar);
