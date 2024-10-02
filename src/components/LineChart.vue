<template>
    <div ref="lineChart" style="width: 100%; height: 500px;"></div>
</template>

<script>
    import * as echarts from 'echarts';

    const colors = ['#FF6347', '#1E90FF', '#32CD32', '#FFD700', '#FF4500']; // 自定义颜色数组

    export default {
        name: 'LineChart',
        props: {
            apiUrls: {
                type: Array,
                required: true  // 每个图表都需要传入 API URL
            },
            title: {
                type: String,
                required: true  // 每个图表都需要传入 API URL
            },
        },
        data() {
            return {
                seriesData: [],
                chartCategories: [],
            };
        },
        async mounted() {
            this.loadData();

        },
        methods: {
            async loadData() {
                // 使用通用的请求函数加载数据
                this.seriesData = await Promise.all(
                    this.apiUrls.map(async (item, index) => ({
                        name: item.label,
                        type: 'line',
                        smooth: true, // 设置为 true 使线条平滑
                        areaStyle: {
                            color: `rgba(${parseInt(colors[index].slice(1, 3), 16)}, ${parseInt(colors[index].slice(3, 5), 16)}, ${parseInt(colors[index].slice(5, 7), 16)}, 0.5)` // 背景色使用 RGBA
                        },
                        data: await this.$axios.get(item.url).then(data => data.data.data.charts.data)
                    }))
                )
                this.chartCategories = this.seriesData[0].data.map(item => item[0]);
                this.seriesData = this.seriesData.map(item => ({
                    ...item,
                    data: item.data.map(item => item[1])
                }));
                this.initChart();
                this.sendDataToParent();
            },
            sendDataToParent() {
                this.$emit('update:data', {
                    seriesData: this.seriesData,
                    chartCategories: this.chartCategories
                });
            },
            initChart() {
                const chartDom = this.$refs.lineChart;
                const myChart = echarts.init(chartDom);

                const option = {
                    title: {
                        text: this.title,
                        top: 10  // 设置 title 距离顶部 10px
                    },
                    tooltip: {
                        trigger: 'axis'
                    },
                    legend: {
                        data: this.apiUrls.map(item => item.label),
                        top: 60  // 设置 legend 距离顶部 40px
                    },
                    grid: {
                        top: 140,  // 为 grid 设置上边距，增加空间
                        left: '3%',
                        right: '4%',
                        bottom: '3%',
                        containLabel: true  // 保证标签包含在 grid 内
                    },
                    xAxis: {
                        type: 'category',
                        data: this.chartCategories
                    },
                    yAxis: {
                        type: 'value'
                    },
                    series: this.seriesData,
                    dataZoom: [
                        {
                            type: 'slider',  // 使用滑动条
                            show: true,
                            xAxisIndex: [0], // 仅对第一个 x 轴有效
                            start: 0,        // 数据的起始百分比
                            end: 30         // 数据的结束百分比
                        },
                        {
                            type: 'inside',  // 内部缩放
                            xAxisIndex: [0],
                            start: 0,
                            end: 100
                        }
                    ]
                };

                myChart.setOption(option);
            }
        },
        watch: {
            apiUrls: {
                //deep: true,
                async handler() {
                    //this.seriesData = [];
                    //this.chartCategories = [];
                    await this.loadData();

                }
            }
        }
    };
</script>

<style scoped>
</style>
