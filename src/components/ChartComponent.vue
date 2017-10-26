<template>
  <div>
    <div class="canvas">
      <div v-on:click="prev()">
        <span>Prev</span>
      </div>
      <canvas width="1300" height="400" ref="canvas"></canvas>
      <div v-on:click="next()">Next</div>
    </div>
    <div class="options">
      <div class="selector">
        <span>Change type</span>
        <div class="btn-selector">
          <button v-on:click="changeType(2)" v-bind:class="{ 'active': currentView == 2 }" type="button">Week</button><button v-on:click="changeType(1)" type="button" v-bind:class="{ 'active': currentView == 1 }">Month</button><button v-bind:class="{ 'active': currentView == 3 }" v-on:click="changeType(3)" type="button">Full</button>
        </div>
      </div>
      <div class="data-type">
        <span>Change data</span>
        <div class="btn-selector">
          <button v-on:click="changeDataFrom(1)" v-bind:class="{ 'active': currentDataFrom == 1 }" type="button">Load remote data</button><button v-on:click="changeDataFrom(2)" type="button" v-bind:class="{ 'active': currentDataFrom == 2 }">Load local data</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Line } from 'vue-chartjs'
import localData from '../assets/data.json'

export default {
  name: "ChartComponent",
  data: function () {
    return {
      myChart: null,
      context: null,
      chart: null,
      currentDataFrom: 1,
      data: [],
      weekArray: [],
      monthArray: {},
      month: [],
      week: [],
      currentMonth: 0,
      currentWeek: 0,
      currentView: 2,
      days: [
        "Mon", "Tue", "Wen", "Thu", "Fri", "Sat", "Sun"
      ]
    }
  },
  mounted () {
    this.context = this.$refs.canvas.getContext('2d');
    this.getData();
  },
  methods: {
    next: function () {
      if (this.currentView === 1){
        if (this.currentMonth != this.month.length - 1) {
          ++this.currentMonth;
          this.init(this.monthArray[this.month[this.currentMonth]]);
        }
      }
      if (this.currentView === 2) {
        if (this.currentWeek != this.week.length - 1) {
          ++this.currentWeek;
          this.init(this.weekArray[this.week[this.currentWeek]]);
        }
      } 
    },
    prev: function () {
      if (this.currentView === 1){
        if (this.currentMonth != 0) {
          --this.currentMonth;
          this.init(this.monthArray[this.month[this.currentMonth]]);
        } 
      } 
      if (this.currentView === 2) {
        if (this.currentWeek != 0) {
          --this.currentWeek;
          this.init(this.weekArray[this.week[this.currentWeek]]);
        } 
      }   
    },
    changeDataFrom(from){
      this.currentMonth = 0;
      this.currentWeek = 0;
      this.currentView = 1;
      this.currentDataFrom = from;
      if (from == 1){
        this.getData();
      } else {
        this.getLocalData();
      }
    },
    changeType: function (type) {
      this.currentView = type;
      if (type == 1) {
        this.currentMonth = 0;
        this.init(this.monthArray[this.month[this.currentMonth]]);
      }
      if (type == 2) {
        this.currentWeek = 0;
        this.init(this.weekArray[this.week[this.currentWeek]]);
      } 
      if (type == 3) {
        this.init(this.data);
      }
    },
    addSame(data){
      let newData = {};
      for (let i = 0; i < data.length; ++i) {
        let temp = data[i].date.getFullYear() + "-" + data[i].date.getMonth() + "-" + data[i].date.getDate();
        if ( newData[temp] ){
          newData[temp].saleNum += data[i].saleNum;
        } else {
          newData[temp] = data[i];
        }
      }
      return newData;
    },
    init: function (data) {
      let labels = [];
      let chartData = [];

      let options = {
          scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: false
                }
            }],
          },
          responsive: false,
          maintainAspectRatio: false,
      };

      if (this.currentView == 1 || this.currentView == 3){
        options.scales['xAxes'] = [{
          type: 'time',
          position: 'bottom',
          time: {
              displayFormats: {
                  'day': 'DD/MM'
              },
              tooltipFormat: 'DD/MM/YY',
              unit: 'day',
          }              
        }]
        for (let elem in data) {
          chartData.push(data[elem].saleNum);
          labels.push(data[elem].date);
        };
      }
      if (this.currentView == 2) {
        for (let elem in data) {
          chartData.push(data[elem].saleNum);
          labels.push(this.days[data[elem].date.getDay()]);
        };
      }

      

      // chartData.push(null);
      // labels.push("a");
      if (this.myChart){
        this.myChart.destroy();
      }

      this.myChart = new Chart(this.context, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: '# of Sales',
                data: chartData,
                borderColor: 'rgba(255, 159, 64, 1)',
                backgroundColor: 'transparent',
                pointBackgroundColor: 'rgba(255, 159, 64, 1)',
                borderWidth: 2
            }]
        },
        options: options
      });
    },
    getData: function () {
      this.axios.get('https://private-627474-nulisec.apiary-mock.com/sales').then((response) => {
        if(response.status === 200) {
          this.data = [];
          for (let i = 0; i < response.data.length; ++i) {
            let item = {
              sale: response.data[i].sale,
              saleNum: parseInt(response.data[i].sale.split('$')[1], 10),
              date: new Date(response.data[i].published_at)
            }
            this.data.push(item);
          }
          this.data.sort(function (a, b){
            return a.date - b.date;
          });
          
          this.data = this.addSame(this.data);
          this.createMonthArray(this.data);
          this.createWeekArray(this.data);
          this.init(this.monthArray[this.month[0]]);
        }
      });
    },
    getLocalData: function () {
      console.log(localData);
      this.data = [];
      for (let i = 0; i < localData.length; ++i) {
        let item = {
          sale: localData[i].sale,
          saleNum: parseInt(localData[i].sale.split('$')[1], 10),
          date: new Date(localData[i].published_at)
        }
        this.data.push(item);
      }
      this.data.sort(function (a, b){
        return a.date - b.date;
      });
      
      this.data = this.addSame(this.data);
      this.createMonthArray(this.data);
      this.createWeekArray(this.data);
      this.init(this.monthArray[this.month[0]]);
    },
    createWeekArray: function (data) {
      this.weekArray = {};
      this.week = [];
      for (let elem in data) {
        let temp = this.getWeekNumber(data[elem].date);
        if (!this.weekArray[temp]){
          this.weekArray[temp] = [];
          this.week.push(temp[0]);
        }
        this.weekArray[temp].push(data[elem]);
      };
    },
    createMonthArray: function (data) {
      this.monthArray = {};
      this.month = [];
      for (let elem in data) {
        let temp = elem.split("-")[0] + "-" + elem.split("-")[1];
        if (!this.monthArray[temp]){
          this.monthArray[temp] = [];
          this.month.push(temp);
        }
        this.monthArray[temp].push(data[elem]);
      };
    },
    getWeekNumber: function (d) {
      d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
      d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
      var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
      var weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
      return [d.getUTCFullYear() + "-" + weekNo];
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1, h2 {
  font-weight: normal;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}
.canvas {
  width: 100%;
  display: flex;
  flex-direction: row;
}

.canvas div {
  height: 400px;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 50px;
  cursor: pointer;
  transition: 0.3s;
  padding: 0 20px;
}

.canvas div:hover {
  background-color: rgba(200, 200, 200, 0.1);
}

.options {
  display: flex;
  flex-direction: row;
  padding: 20px 70px;
}

.options .btn-selector button {
  margin: 10px 0;
  background-color: rgba(255, 159, 64, 0.2);
  border: 1px solid rgba(255, 159, 64, 1);
  padding: 5px 10px;
  min-width: 100px;
}

.options .btn-selector button.active {
  background-color: rgba(255, 159, 64, 1);
  color: #fff;
}

.data-type {
  margin-left: 20px;
}

</style>
