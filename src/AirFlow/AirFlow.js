import React from 'react'
// https://www.npmjs.com/package/react-chartjs-2
import { Line, Doughnut } from 'react-chartjs-2'
import { css } from '@emotion/css'

export default class AirFlow extends React.Component {

	// Constructor ----------------------------------------------------------------
	constructor(props) {
		super(props)
		const appKey = '43cebb6f101584f15a47a1581d009ee7'
		const url = 'https://api.openweathermap.org/data/2.5/air_pollution?lat=48.856614&lon=2.3522219&appid='
		this.endpointAPI = url + appKey
		this.airQuality = [
			'loading...',
			'good quality',
			'fair quality',
			'moderate quality',
			'poor quality',
			'very poor quality'
		]
		this.state = {
			data: {
				co: [],
				o3: [],
				so2: [],
				pm2_5: []
			},
			label: [],
			indexQuality: 0,
			latitude: 'loading...',
			longitude: 'loading...'
		}
	}

	componentDidMount() {
		if (navigator.geolocation) {
			navigator.geolocation.watchPosition(
				(position) => {
					this.setState({
						latitude: position.coords.latitude,
						longitude: position.coords.longitude
					})
				},
				(err) => {
					console.log(err)
				}
			)
		}

		this.getAirFlowData()
		this.line = setInterval(
			() => this.getAirFlowData(),
			1000*60*5
		)
	}

	componentWillUnmount() {
		clearInterval(this.line);
	}

	getDataLine = () => {
		return {
			labels: this.state.label,
			datasets: [
				{
					label: 'Сoncentration of CO (Carbon monoxide), μg/m3',
					data: this.state.data.co,
					fill: false,
					backgroundColor: 'rgb(255, 99, 132)',
					borderColor: 'rgba(255, 99, 132, 0.3)',
				},
				{
					label: 'Сoncentration of O3 (Ozone), μg/m3',
					data: this.state.data.o3,
					fill: false,
					backgroundColor: 'rgb(0, 140, 255)',
					borderColor: 'rgba(0, 140, 255, 0.3)',
				},
				{
					label: 'Сoncentration of SO2 (Sulphur dioxide), μg/m3',
					data: this.state.data.so2,
					fill: false,
					backgroundColor: 'rgb(199, 140, 255)',
					borderColor: 'rgba(199, 140, 255, 0.3)',
				},
				{
					label: 'Сoncentration of PM2.5 (Fine particles matter), μg/m3',
					data: this.state.data.pm2_5,
					fill: false,
					backgroundColor: 'rgb(67, 245, 123)',
					borderColor: 'rgba(67, 245, 123, 0.3)',
				}
			]
		}
	}

	getOptionsLine = () => {
		return {
			scales: {
				yAxes: [
					{
						ticks: {
							beginAtZero: true,
						},
					},
				],
			},
			maintainAspectRatio: false
		}
	}

	getDataDoughnut = () => {
		let data = [0]
		let labels = [this.airQuality[this.state.indexQuality]]
		let backgroundColor = ['rgba(235, 235, 235, 0.2)']
		let borderColor = ['rgba(255, 255, 255, 1)']
		if (this.state.indexQuality === 1) {
			data = [1]
			backgroundColor = ['rgba(54, 162, 235, 0.2)']
			borderColor = ['rgba(54, 162, 235, 1)']
		} else {
			if (this.state.indexQuality === 2) {
				data = [4, 1]
				backgroundColor.unshift('rgba(75, 192, 192, 0.2)')
				borderColor.unshift('rgba(75, 192, 192, 1)')
			} else if (this.state.indexQuality === 3) {
				data = [3, 2]
				backgroundColor.unshift('rgba(255, 206, 86, 0.2)')
				borderColor.unshift('rgba(255, 206, 86, 1)')
			} else if (this.state.indexQuality === 4) {
				data = [2, 3]
				backgroundColor.unshift('rgba(255, 159, 64, 0.2)')
				borderColor.unshift('rgba(255, 159, 64, 1)')
			} else if (this.state.indexQuality === 5) {
				data = [1, 4]
				backgroundColor.unshift('rgba(255, 99, 132, 0.2)')
				borderColor.unshift('rgba(255, 99, 132, 1)')
			}
			labels.push('')
		}

		return {
			labels: labels,
			datasets: [
				{
					label: 'Air quality',
					data: data,
					backgroundColor: backgroundColor,
					borderColor: borderColor,
					borderWidth: 1,
				},
			],
		}
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

				const indexQuality = result.list[0].main.aqi

				this.setState({
					data : data,
					label: label,
					indexQuality: indexQuality
				})
			},
			(error) => {
				console.log(error)
			}
		)
	}

	// Renderers ----------------------------------------------------------------
	render() {

		// https://sevketyalcin.com/blog/responsive-charts-using-Chart.js-and-react-chartjs-2/
		const canvasContainer = {
			height: '60vh' // vh : viewport height
		}

		// Parent
		const container = {
			display: 'flex',
			// flexFlow: row wrap, correspond à :
			// flexDirection: 'row' : direction : ligne ou colonne
			// flewWrap: 'wrap' : bascule en ligne ou colonne si espace insuffisant
			flexFlow: 'row wrap',
			alignItems: 'baseline', // ajuste les enfants verticalement sur leur base
			justifyContent: 'space-around' // ou space-evenly
		}

		// Enfant
		// flex : { flex-grow flex-shrink flex-basis }
		// flex-grow : l'enfant choisi occupe le maximum d'espace
		// fExemple : flex: 1 1 auto

		return (
			<div className={css(canvasContainer)}>
				<div className={css(container)}>
					<h1> Air quality in Paris </h1>
					<Doughnut
						height={50}
						width={50}
						data={this.getDataDoughnut()}
						options={{ maintainAspectRatio: false }}
					/>
				</div>
				<Line
					height={550}
					width={1100}
					data={this.getDataLine()}
					options={this.getOptionsLine()}
				/>
				<p>
					<small>
						Longitude : {this.state.longitude},
						latitude : {this.state.latitude}
					</small> 
				</p>
			</div>
		)
	}
}
