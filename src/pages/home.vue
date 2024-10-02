<template>
    <div class="main">
        <div class="part-1">
            <div class="time">
                <span>当前时间：</span><span>{{ currentTime }}</span>
                <el-select v-model="selectedOption">
                    <el-option label="1" :value="1"></el-option>
                    <el-option label="2" :value="2"></el-option>
                </el-select>
            </div>


            <div class="charts-container">
                <line-chart v-for="chartData in selectedCharts"
                            :key="chartData.title"
                            :title="chartData.title"
                            :apiUrls="chartData.apiUrls"
                            class="chart">
                </line-chart>
            </div>










        </div>





        <div class="part-2">
            <line-chart v-if="selectedOption == '1'"
                        title="控制参数对比趋势"
                        :apiUrls="[
              { label: '#1 浓密机底流流量（DCS系统设定值）', url: '/prod-api/inst/detail/all' },
              { label: '#1 浓密机底流流量（推荐值）', url: '/prod-api/inst/detail/all' },
                ]" 
              @update:data="handleDataUpdate"/>
            <line-chart v-if="selectedOption == '2'"
                        title="控制参数对比趋势"
                        :apiUrls="[
                { label: '#2 浓密机底流流量（DCS系统设定值）', url: '/prod-api/inst/detail/all' },
                { label: '#2 浓密机底流流量（推荐值）', url: '/prod-api/inst/detail/all' },
                ]" 
              @update:data="handleDataUpdate"/>




            <div class="end-card">
                <p class="title">控制参数对比统计</p>
                <el-select value="1">
                    <el-option value="1" label="过去6小时内"></el-option>
                    <el-option value="2" label="过去12小时内"></el-option>
                </el-select>
                <p><span>绝对平均误差：</span><el-input v-model="mae" />m3/h</p>
            </div>


        </div>



    </div>

</template>

<script>
    import dayjs from 'dayjs';
    import LineChart from '../components/LineChart.vue'
    import { Select, Option } from 'element-ui';
    export default {
        name: 'HomePage',
        data() {
            return {
                currentTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),  // 初始时间
                selectedOption: 1,
                mae: 0,
                charts: {
                    '1': [
                        { title: "底流流量", apiUrls: [{ label: '#1 浓密机底流流量（DCS系统设定值）', url: '/prod-api/inst/detail/all' }, { label: '#1 浓密机底流流量（跟踪值）', url: '/prod-api/inst/detail/all' }] },
                        { title: "底流浓度", apiUrls: [{ label: '#1 浓密机出料浓度（DCS系统设定值）', url: '/prod-api/inst/detail/all' }, { label: '#1 浓密机出料浓度（跟踪值）', url: '/prod-api/inst/detail/all' }] },
                        { title: "泥层压强", apiUrls: [{ label: '#1 浓密机泥层压力', url: '/prod-api/inst/detail/all' }] },
                        { title: "进料流量", apiUrls: [{ label: '#1 浓密机进料流量', url: '/prod-api/inst/detail/all' }] },
                        // 其他图表数据...
                    ],
                    '2': [
                        { title: "底流流量", apiUrls: [{ label: '#2 浓密机底流流量（DCS系统设定值）', url: '/prod-api/inst/detail/all' }, { label: '#2 浓密机底流流量（跟踪值）', url: '/prod-api/inst/detail/all' }] },
                        { title: "底流浓度", apiUrls: [{ label: '#2 浓密机出料浓度（DCS系统设定值）', url: '/prod-api/inst/detail/all' }, { label: '#2 浓密机出料浓度（跟踪值）', url: '/prod-api/inst/detail/all' }] },
                        { title: "泥层压强", apiUrls: [{ label: '#2 浓密机泥层压力', url: '/prod-api/inst/detail/all' }] },
                        { title: "进料流量", apiUrls: [{ label: '#2 浓密机进料流量', url: '/prod-api/inst/detail/all' }] },
                        // 其他图表数据...
                    ]
                },
            }
        },
        components: {
            LineChart,
            'el-select': Select,
            'el-option': Option,
        },
        computed: {
            // 计算属性，根据 selectedOption 决定展示哪些图表数据
            selectedCharts: function () {
                return this.charts[this.selectedOption] || [];
            }
        },
        mounted() {
            // 每秒更新一次时间
            this.updateTime();
            this.interval = setInterval(this.updateTime, 10000);
        },
        beforeDestroy() {
            // 清除定时器
            clearInterval(this.interval);
        },
        methods: {
            updateTime() {
                this.currentTime = dayjs().format('YYYY-MM-DD HH:mm:ss');  // 更新当前时间
            },
            handleDataUpdate(data) {
                if (!data || !data.seriesData || !data.chartCategories) {
                    console.error('Data is missing or incomplete');
                    return;
                }

                console.log('data.seriesData:', data.seriesData);
                console.log('data.chartCategories:', data.chartCategories);

                // 提取真实值和预测值
                const realSeries = data.seriesData.find(series => series.name.includes("DCS系统设定值"));
                const predictedSeries = data.seriesData.find(series => series.name.includes("推荐值"));

                console.log('realSeries:', realSeries);
                console.log('predictedSeries:', predictedSeries);


                if (!realSeries || !predictedSeries) {
                    console.error('Real or predicted series data is missing');
                    return;
                }

                // 将数据和时间戳组合，并复制一份用于后续操作
                const realValues = realSeries.data.map((point, index) => ({
                    time: data.chartCategories[index],
                    value: point[1]
                })).concat([]);

                const predictedValues = predictedSeries.data.map((point, index) => ({
                    time: data.chartCategories[index],
                    value: point[1]
                })).concat([]);   

                // 打印数据进行检查
                console.log('Real Values:', realValues);
                console.log('Predicted Values:', predictedValues);

                // 根据时间戳对真实值和预测值进行排序
                realValues.sort((a, b) => a.time - b.time);
                predictedValues.sort((a, b) => a.time - b.time);


                // 计算MAE
                const mae = this.calculateMAE(realValues, predictedValues);
                this.mae = mae.toFixed(2); // 更新MAE结果，并保留两位小数
            },
            //handleSeriesData2(data) {
            //    // 处理第二个图表的数据
            //    console.log(data);
            //}
            calculateMAE(realValues, predictedValues) {
                let sumAbsoluteErrors = 0;
                let alignedRealValues = [];

                predictedValues.forEach(predicted => {
                    let minDiff = Infinity;
                    let closestReal = null;

                    realValues.forEach(real => {
                        const timeDiff = Math.abs(new Date(predicted.time) - new Date(real.time));
                        if (timeDiff < minDiff) {
                            minDiff = timeDiff;
                            closestReal = real.value;
                        }
                    });

                    if (closestReal !== null) {
                        alignedRealValues.push(closestReal);
                        sumAbsoluteErrors += Math.abs(predicted.value - closestReal);
                    }
                });

                const mae = alignedRealValues.length > 0 ? sumAbsoluteErrors / alignedRealValues.length : 0;
                return mae;
            }
        }
    };
</script>

<style scoped>
    .main .part-1 {
        display: grid;
        /* 一行三个 */
        grid-template-columns: 1fr 1fr 1fr;
        gap: 30px 10px;
    }

    .main .part-1 .time {
            background-color: #f6f6f6;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 30px;
            font-weight: bold;
            flex-direction: column;
            text-align: center;
        }

    .charts-container {
        display: grid;
        grid-template-columns: 1fr 1fr; /* 创建两列 */
        gap: 50px;
        width: 1200px; /* 固定宽度 */
    }

    .chart {
        width: 3000px; /* 或者设置为百分比，例如 "calc(33.333% - 10px)" */
        lex-shrink: 0; /* 防止图表在容器空间不足时被压缩 */
    }

    .main .part-1 .time span:last-child {
        display: block;
        padding: 20px;
        background: #fff;
        border: 2px solid #ccc;
        margin-top: 30px;
    }

    .main .part-2 {
        display: grid;
        /* 一行三个 */
        grid-template-columns: 1fr 1fr;
        gap: 10px;
    }

    .end-card {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding-bottom: 170px;
    }

        .end-card p {
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

            .end-card p span {
                width: 200px;
            }

        .end-card .title {
            margin-bottom: auto;
            font-weight: bold;
            text-align: left;
            width: 100%;
        }
</style>