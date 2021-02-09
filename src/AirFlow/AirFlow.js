import React from 'react'
import { Line } from 'react-chartjs-2'

export default class AirFlow extends React.Component {

	// Constructor ----------------------------------------------------------------
	constructor(props) {
		super(props)

		const appKey = '43cebb6f101584f15a47a1581d009ee7'
		const url = 'https://api.openweathermap.org/data/2.5/air_pollution?lat=48.856614&lon=2.3522219&appid='
		this.endpointAPI = url + appKey

		this.state = {
			data: {
				co: [],
				o3: [],
				so2: [],
				pm2_5: []
			},
			label: []
		}
	}

	componentDidMount() {
		this.getAirFlowData()
		this.line = setInterval(
			 () => this.getAirFlowData(),
			 1000*60*5
		)
	}

	componentWillUnmount() {
		clearInterval(this.line);
	}

	getData = () => {
		const data = {
		  labels: this.state.label,
		  datasets: [
		    {
		      label: 'Сoncentration of CO (Carbon monoxide), μg/m3',
		      data: this.state.data.co,
		      fill: false,
		      backgroundColor: 'rgb(255, 99, 132)',
		      borderColor: 'rgba(255, 99, 132, 0.2)',
		    },
		    {
		      label: 'Сoncentration of O3 (Ozone), μg/m3',
		      data: this.state.data.o3,
		      fill: false,
		      backgroundColor: 'rgba(0, 140, 255, 1)',
		      borderColor: 'rgba(0, 140, 255, 1)',
		    },
		    {
		      label: 'Сoncentration of SO2 (Sulphur dioxide), μg/m3',
		      data: this.state.data.so2,
		      fill: false,
		      backgroundColor: 'rgba(199, 140, 255, 1)',
		      borderColor: 'rgba(199, 140, 255, 1)',
		    },
		    {
		      label: 'Сoncentration of PM2.5 (Fine particles matter), μg/m3',
		      data: this.state.data.pm2_5,
		      fill: false,
		      backgroundColor: 'rgba(67, 245, 123, 0.6)',
		      borderColor: 'rgba(67, 245, 123, 0.6)',
		    }
		  ]
		}
		return data
	}

	getOptions = () => {
		const options = {
		  scales: {
		    yAxes: [
		      {
		        ticks: {
		          beginAtZero: true,
		        },
		      },
		    ],
		  },
		}
		return options
	}

	getAirFlowData = () => {
		fetch(this.endpointAPI)
		.then(res => res.json())
		.then(
			(result) => {

				let data = {...this.state.data}

				const co = data.co
				let element = result.list[0].components.co
				co.push(element)

				const o3 = data.o3
				element = result.list[0].components.o3
				o3.push(element)

				const so2 = data.so2
				element = result.list[0].components.so2
				so2.push(element)

				const pm2_5 = data.pm2_5
				element = result.list[0].components.pm2_5
				pm2_5.push(element)

				data = {co, o3, so2, pm2_5}

				const label = [...this.state.label]
				const initDate = new Date()
				const newLabel = initDate.toLocaleTimeString()
				label.push(newLabel)

				this.setState({
				  data : data,
				  label: label
				}, console.log(this.state.data))
			},
			(error) => {
				console.log(error)
			}
		)
	}

	// Renderers ----------------------------------------------------------------
	render() {
		return (
			<div>
				<div className='header'>
					<h1 className='title'>Air quality Paris</h1>

				</div>
				<Line
					data={this.getData()}
					options={this.getOptions()}
				/>
			</div>
		)
	}
}
