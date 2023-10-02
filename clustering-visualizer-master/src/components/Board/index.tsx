/**
 * This is one of the core components of the application.
 * This component is responsible for creation, deletion of clusters and points.
 */
import React, { ReactElement } from 'react';
import { Fab, Zoom, SvgIcon } from '@material-ui/core';
import { connect, ConnectedProps } from 'react-redux';

import GlobalActionTypes from '../../reduxStore/types/Global.types';
import { Node } from '../../reduxStore/reducers/global';
import { RootState } from '../../reduxStore/reducers';
import FloatingActionButtons from '../FloatingActionButtons';
import { UserPreferencesActionTypes, AlgorithmActionTypes } from '../../reduxStore';
import { calculateSquaredDistance } from '../../utils';

const mapStateToProps = (state: RootState) => ({
    global: state.global,
    userPreference: state.userPreferences,
    algorithm: state.algorithm,
});

const mapDispatchToProps = {
    setCoordinates: (coordinates: Node[]) => ({
        type: GlobalActionTypes.SET_COORDINATES_OF_NODES,
        payload: coordinates,
    }),
    updateCoordinates: (node: Node) => ({
        type: GlobalActionTypes.UPDATE_COORDINATES,
        payload: node,
    }),
    resetFabCoordinates: () => ({ type: UserPreferencesActionTypes.RESET_FAB_COORDINATES }),
    deleteNode: (id: number) => ({ type: GlobalActionTypes.DELETE_NODE, payload: id }),
    increaseMaxIdBy: (num: number) => ({ type: GlobalActionTypes.INCREASE_MAX_ID, payload: num }),
    resetAlgoData: () => ({ type: AlgorithmActionTypes.RESET_DATA }),
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;
type IBoardProps = PropsFromRedux & {
    /**
     * component - is based on the algorithm, It gives the visualizations for the algorithms
     */
    component?: ReactElement;
    fabChildren?: (ReactElement | null)[]; // addition fab if provided
};

type BoardState = {
    //referenec to the Svg Element. All the visualizations are made possible because of Svg!
    bg: React.RefObject<SVGSVGElement>;
    //if toggled on, you can create clusters easily by clicking and dragging
    createClusterMode: boolean;
    //if toggled on, you can delete clusters easily by clicking and dragging
    deleteMode: boolean;
};

class Board extends React.Component<IBoardProps, BoardState> {
    constructor(props: IBoardProps) {
        super(props);
        this.state = {
            bg: React.createRef(),
            createClusterMode: false,
            deleteMode: false,
        };
    }

    componentDidMount() {
        // reset the position of the fab when the user resizes the window. So that fab is always visible
        window.addEventListener('resize', this.props.resetFabCoordinates);
    }

    componentDidUpdate() {
        if (this.state.bg.current !== null) {
            //preventing the default touch behaviour
            this.state.bg.current.addEventListener('touchmove', (e: TouchEvent) => e.preventDefault());
        }
    }

    handleMove = (event: React.PointerEvent<SVGSVGElement>, id: number) => {
        if (this.props.global.start === true || this.state.createClusterMode || this.state.deleteMode) {
            return;
        }
        event.persist();

        const currentNode = event.target as SVGSVGElement;
        let X = 0,
            Y = 0;

        const handleNodeMove = (event: PointerEvent): void => {
            if (this.state.bg.current === null) {
                return;
            }

            // calculate the coordinates of event
            X = event.clientX - this.state.bg.current.getBoundingClientRect().left;
            Y = event.clientY - this.state.bg.current.getBoundingClientRect().top;
            currentNode.setAttribute('cx', X.toString());
            currentNode.setAttribute('cy', Y.toString());
            //adding the node
            this.props.updateCoordinates({ id, coordinates: [X, Y] });
        };

        const removeListeners = () => {
            if (this.state.bg.current === null) {
                return;
            }
            //removing the event listeners
            this.state.bg.current.removeEventListener('pointermove', handleNodeMove);
            this.state.bg.current.removeEventListener('pointerup', removeListeners);
        };

        if (this.state.bg.current !== null) {
            //adding the event listeners
            this.state.bg.current.addEventListener('pointermove', handleNodeMove);
            this.state.bg.current.addEventListener('pointerup', removeListeners);
        }
    };

    handleClick = (event: React.MouseEvent<SVGSVGElement>) => {
        if (this.props.global.start === true || this.state.deleteMode) {
            return;
        }
        event.persist();

        const target = event.target as SVGSVGElement;
        const X = event.clientX - target.getBoundingClientRect().left;
        const Y = event.clientY - target.getBoundingClientRect().top;

        if (X <= 20 || Y <= 20 || !X || !Y) {
            return;
        }

        if (this.state.createClusterMode) {
            // createClusterMode is 'on' then create a cluster in the event of clicking
            this.createCluster(X, Y);
            return;
        }

        this.props.setCoordinates([
            ...this.props.global.coordinatesOfNodes,
            { coordinates: [X, Y], id: this.props.global.maxId },
        ]);

        this.props.increaseMaxIdBy(1);
    };

    handleDelete = (x: number, y: number) => {
        if (!this.state.deleteMode) {
            return;
        }
        //remove nodes which are near to coordinates (x,y)
        this.props.setCoordinates(
            this.props.global.coordinatesOfNodes.filter(
                (o) => Math.sqrt(calculateSquaredDistance(o.coordinates, [x, y])) > 20,
            ),
        );
    };

    handleErase = (e: any) => {
        if (
            this.props.global.start === true ||
            !this.state.deleteMode ||
            !this.state.bg.current ||
            this.state.createClusterMode
        ) {
            return;
        }

        if (this.props.algorithm.render.length !== 0) {
            this.props.resetAlgoData();
        }

        /**
         * NOTE - getBoundingClientRect() method returns the size of an element and its position relative to the viewport.
         */

        const left = this.state.bg.current.getBoundingClientRect().left;
        const top = this.state.bg.current.getBoundingClientRect().top;

        const X = e.clientX - left;
        const y = e.clientY - top;

        this.handleDelete(X, y);

        const deleteCluster = (e: PointerEvent) => {
            const X = e.clientX - left;
            const y = e.clientY - top;
            this.handleDelete(X, y);
        };

        const removeEventListeners = () => {
            this.state.bg.current?.removeEventListener('pointermove', deleteCluster);
            window.removeEventListener('pointerup', removeEventListeners);
        };

        /**
         * Add event listeners to the Node
         */
        this.state.bg.current?.addEventListener('pointermove', deleteCluster);
        window.addEventListener('pointerup', removeEventListeners);
    };

    createCluster = (X: number, y: number) => {
        if (this.state.bg.current === null) {
            return;
        }

        /**
         * NOTE - getBoundingClientRect() method returns the size of an element and its position relative to the viewport.
         */

        const left = this.state.bg.current.getBoundingClientRect().left;
        const top = this.state.bg.current.getBoundingClientRect().top;

        const space = 40;
        X = X - left;
        y = y - top;

        // To prevent Creating Data Points on Navbar
        if (y - space < 80) {
            return;
        }

        /**
         * Randomly create 8 data points around (X,y)
         */
        this.props.setCoordinates([
            ...this.props.global.coordinatesOfNodes,
            { coordinates: [X, y], id: this.props.global.maxId },
            { coordinates: [X + space * Math.random(), y], id: this.props.global.maxId + 1 },
            { coordinates: [X - space * Math.random(), y], id: this.props.global.maxId + 2 },
            { coordinates: [X, y + space * Math.random()], id: this.props.global.maxId + 3 },
            { coordinates: [X, y - space], id: this.props.global.maxId + 4 },
            {
                coordinates: [X + space * Math.random(), y + space * Math.random()],
                id: this.props.global.maxId + 5,
            },
            {
                coordinates: [X - space * Math.random(), y - space * Math.random()],
                id: this.props.global.maxId + 6,
            },
            {
                coordinates: [X + space * Math.random(), y - space],
                id: this.props.global.maxId + 7,
            },
            {
                coordinates: [X - space * Math.random(), y + space * Math.random()],
                id: this.props.global.maxId + 8,
            },
        ]);

        this.props.increaseMaxIdBy(9);
    };

    handleCreate = () => {
        if (
            this.props.global.start === true ||
            !this.state.createClusterMode ||
            !this.state.bg.current ||
            this.state.deleteMode
        ) {
            return;
        }

        if (this.props.algorithm.render.length !== 0) {
            this.props.resetAlgoData();
        }

        const left = this.state.bg.current.getBoundingClientRect().left;
        const top = this.state.bg.current.getBoundingClientRect().top;

        // used to bounce the user input, i.e prevents forming of clusters too closely
        let cluster = true;

        const createCluster = (e: PointerEvent) => {
            if (!cluster) {
                return;
            }

            this.createCluster(e.clientX, e.clientY);

            cluster = false;
            setTimeout(() => {
                cluster = true;
            }, 100);
        };

        const removeEventListeners = () => {
            this.state.bg.current?.removeEventListener('pointermove', createCluster);
            window.removeEventListener('pointerup', removeEventListeners);
        };
        this.state.bg.current?.addEventListener('pointermove', createCluster);
        window.addEventListener('pointerup', removeEventListeners);
    };
    componentWillUnmount() {
        window.removeEventListener('resize', this.props.resetFabCoordinates);
    }

    public render() {
        return (
            <div>
                {/*    Mount Fab   */}
                <FloatingActionButtons>
                    {[
                        ...(this.props.fabChildren ? (this.props.fabChildren as ReactElement[]) : []),
                        <Zoom in={true} key={'delete mode'}>
                            <Fab
                                onClick={() =>
                                    this.setState((s) => ({
                                        ...s,
                                        deleteMode: !s.deleteMode,
                                        createClusterMode: false,
                                    }))
                                }
                                style={{
                                    backgroundColor: this.state.deleteMode ? 'red' : undefined,
                                    marginBottom: '10px',
                                }}
                            >
                                <SvgIcon>
                                    <svg viewBox="0 0 24 24">
                                        <path
                                            fill={this.state.deleteMode ? 'white' : 'grey'}
                                            d="M15.14,3C14.63,3 14.12,3.2 13.73,3.59L2.59,14.73C1.81,15.5 1.81,16.77 2.59,17.56L5.03,20H12.69L21.41,11.27C22.2,10.5 22.2,9.23 21.41,8.44L16.56,3.59C16.17,3.2 15.65,3 15.14,3M17,18L15,20H22V18"
                                        />
                                    </svg>
                                </SvgIcon>
                            </Fab>
                        </Zoom>,
                        <Zoom in={true} key={'create clusters'}>
                            <Fab
                                onClick={() => {
                                    this.setState((s) => ({
                                        createClusterMode: !s.createClusterMode,
                                        deleteMode: false,
                                    }));
                                }}
                                style={{
                                    backgroundColor: this.state.createClusterMode ? '#2196f3' : undefined,
                                }}
                            >
                                <SvgIcon>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 444.892 444.892">
                                        <path
                                            d="M440.498 173.103c5.858-5.857 5.858-15.355 0-21.213l-22.511-22.511a15.003 15.003 0 00-19.038-1.8l-47.332 32.17 31.975-47.652a14.999 14.999 0 00-1.85-18.964l-48.83-48.83a14.996 14.996 0 00-17.114-2.908l-8.443 4.065 4.043-8.97a15 15 0 00-3.068-16.771L293.002 4.393c-5.857-5.857-15.355-5.857-21.213 0l-119.06 119.059 168.71 168.71 119.059-119.059zM130.56 145.622l-34.466 34.466a15 15 0 000 21.212l32.694 32.694c6.299 6.299 9.354 14.992 8.382 23.849-.971 8.851-5.843 16.677-13.366 21.473-96.068 61.238-105.023 70.194-107.965 73.137-21.119 21.118-21.119 55.48 0 76.6 21.14 21.14 55.504 21.098 76.6 0 2.944-2.943 11.902-11.902 73.136-107.965 4.784-7.505 12.607-12.366 21.462-13.339 8.883-.969 17.575 2.071 23.859 8.354l32.694 32.694c5.857 5.857 15.356 5.857 21.213 0l34.467-34.467-168.71-168.708zM70.05 404.825c-8.28 8.28-21.704 8.28-29.983 0-8.28-8.28-8.28-21.704 0-29.983 8.28-8.28 21.704-8.28 29.983 0 8.28 8.279 8.28 21.703 0 29.983z"
                                            fill={this.state.createClusterMode ? 'white' : 'grey'}
                                        />
                                    </svg>
                                </SvgIcon>
                            </Fab>
                        </Zoom>,
                    ]}
                </FloatingActionButtons>
                <svg
                    width="100%"
                    height="99vh"
                    ref={this.state.bg}
                    onClick={this.handleClick}
                    onPointerDown={this.state.deleteMode ? this.handleErase : this.handleCreate}
                >
                    <defs>
                        <marker id="markerArrow" markerWidth="20" markerHeight="20" refX="24" refY="6" orient="auto">
                            <path d="M2,2 L2,11 L10,6 L2,2" fill="yellow" />
                        </marker>
                        <linearGradient id="Deep-Space" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" style={{ stopColor: '#434343', stopOpacity: 1 }} />
                            <stop offset="100%" style={{ stopColor: 'rgb(0,0,0)', stopOpacity: 1 }} />
                        </linearGradient>
                        <marker
                            id="arrow"
                            markerWidth="20"
                            markerHeight="20"
                            refX="0"
                            refY="3"
                            orient="auto"
                            markerUnits="strokeWidth"
                        >
                            <path d="M0,0 L0,6 L9,3 z" fill="yellow" />
                        </marker>
                    </defs>

                    <rect width="100%" height="100%" style={{ fill: 'url(#Deep-Space)' }} />
                    {/*                 render the nodes                 */}
                    {this.props.global.coordinatesOfNodes.map((o: Node) => (
                        <g
                            key={o.id}
                            onPointerDown={(e: React.PointerEvent<SVGSVGElement>) =>
                                !this.props.global.start ? this.handleMove(e, o.id) : null
                            }
                        >
                            <circle
                                cx={o.coordinates[0]}
                                cy={o.coordinates[1]}
                                r={this.props.userPreference.sizeOfPoint || 9}
                                style={{ fill: 'white' }}
                                stroke="grey"
                                strokeWidth="0.5"
                            />
                        </g>
                    ))}
                    {/* renders the visualization */}
                    {this.props.component}
                </svg>
            </div>
        );
    }
}

export default connector(Board);
