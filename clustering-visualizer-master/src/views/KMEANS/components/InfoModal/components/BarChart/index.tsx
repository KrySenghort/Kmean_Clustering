import React, { ReactElement, useEffect, useState } from 'react';
import Chart from 'chart.js';

import { Variance } from '../../../../../../reduxStore/reducers/kmeans.algorithm';

interface Props {
    data: Chart.ChartData;
    options: Chart.ChartOptions;
    width: number;
    height: number;
    variance: Variance | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    key: any;
}

function BarChart(props: Props): ReactElement {
    const { data, options } = props;
    Chart.defaults.global.defaultFontColor = '#D3D3D3';
    const [chart, setChart] = useState<Chart | null>(null);

    useEffect(() => {
        const ele = document.getElementById('myChart') as HTMLCanvasElement;
        if (!ele) {
            return;
        }

        const ctx = ele.getContext('2d');
        if (ctx) {
            if (!chart) {
                const newChart = new Chart(ctx, {
                    type: 'bar',
                    data: data,
                    options: options,
                });
                setChart(newChart);
            } else {
                chart.data = data;
                chart.update();
            }
        }
    }, [props.key]);

    return (
        <div
            id="wrapper"
            {...(props.key ? { key: props.key } : {})}
            style={{ position: 'relative', height: '40vh', maxHeight: '500px', width: '100%' }}
        >
            <canvas id="myChart"></canvas>{' '}
        </div>
    );
}

export default BarChart;
