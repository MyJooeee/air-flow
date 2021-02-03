import React from 'react'
import { Line } from 'react-chartjs-2'

export default class AirFlow extends React.Component {

	// Constructor ----------------------------------------------------------------
	constructor(props) {
		super(props)

		const appKey = ''
		const url = 'http://api.openweathermap.org/data/2.5/air_pollution?lat=48.856614&lon=2.3522219&appid='
		this.endpointAPI = url + appKey

		this.state = {
			data: [],
			label: []
		}
	}

	componentDidMount() {
		this.getAirFlowData()
		this.ChartId = setInterval(
			 () => this.getAirFlowData(),
			 10000
		)
	}

	componentWillUnmount() {
		clearInterval(this.ChartId);
	}

	getData = () => {
		const data = {
		  labels: this.state.label,
		  datasets: [
		    {
		      label: 'Сoncentration of CO (Carbon monoxide), μg/m3',
		      data: this.state.data,
		      fill: false,
		      backgroundColor: 'rgb(255, 99, 132)',
		      borderColor: 'rgba(255, 99, 132, 0.2)',
		    },
		  ],
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

			const data = [...this.state.data]
			const element = result.list[0].components.co
			data.push(element)

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
		console.log(this.getData())
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
