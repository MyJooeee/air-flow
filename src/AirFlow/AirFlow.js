import React from 'react'
// https://www.npmjs.com/package/react-chartjs-2
import { Line } from 'react-chartjs-2'
import { css } from '@emotion/css'

export default class AirFlow extends React.Component {

	// Constructor ----------------------------------------------------------------
	constructor(props) {
		super(props)
		const appKey = '43cebb6f101584f15a47a1581d009ee7'
		this.airQualityAPI = 'https://api.openweathermap.org/data/2.5/air_pollution?appid=' + appKey
		this.reverseLocationAPI = 'https://api.openweathermap.org/geo/1.0/reverse?limit=2&appid=' + appKey

		this.airQuality = [
			'loading...',
			'good quality', // 100%
			'fair quality', // 80 %
			'moderate quality', // 60%
			'poor quality', // 40%
			'very poor quality' // 20%
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
			latitude: null,
			longitude: null,
			nameLocation: null
		}
	}

	componentDidMount() {
		if (navigator.geolocation) {
			// Position de l'utilisateur en temps réel
			// navigator.geolocation.watchPosition(
			// Position de l'utilisateur au premier lancement
			navigator.geolocation.getCurrentPosition(
				(position) => {
					this.setState({
						latitude: position.coords.latitude,
						longitude: position.coords.longitude
					}, () => {
						this.getAirFlowData()
						this.getNameLocation()
					})},
				(err) => {
					this.getAirFlowData()
					console.log(err)
				}
			)
		}

		this.line = setInterval(
			() => this.getAirFlowData(),
			1000*60*5
		)
	}

	componentWillUnmount() {
		clearInterval(this.line);
	}

// Functions ----------------------------------------------------------------
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

	getAirFlowData = () => {

		const url = this.airQualityAPI + (
			!this.state.latitude && !this.state.longitude
			? '&lat=48.856614&lon=2.3522219'
			: '&lat='+this.state.latitude+'&lon='+this.state.longitude
		)

		fetch(url)
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

	getNameLocation = () => {
		if (!this.state.longitude && !this.state.latitude) return false
		const url = this.reverseLocationAPI + '&lat='+this.state.latitude+'&lon='+this.state.longitude
		fetch(url)
		.then(res => res.json())
		.then(
			(result) => {
				this.setState({ nameLocation: result[1].name })
			},
			(error) => {
				console.log(error)
			}
		)
	}

	// Renderers ----------------------------------------------------------------
	renderTitle = () => {
		if (!this.state.nameLocation) return 'Air Quality in Paris'
		return 'Air quality in ' + this.state.nameLocation
	}

	render() {
		// https://sevketyalcin.com/blog/responsive-charts-using-Chart.js-and-react-chartjs-2/
		const canvasContainer = {
			height: '60vh' // vh : viewport height
		}

		// Parent
		const topContainer = {
			display: 'flex',
			// flexFlow: row wrap, correspond à :
			// flexDirection: 'row' : direction : ligne ou colonne
			// flewWrap: 'wrap' : bascule en ligne ou colonne si espace insuffisant
			flexFlow: 'row wrap',
			alignItems: 'baseline', // ajuste les enfants verticalement sur leur base
			justifyContent: 'space-around' // ou space-evenly
		}

		const bottomContainer = {
			display: 'flex',
			justifyContent: 'center'
		}

		// Enfant
		// flex : { flex-grow flex-shrink flex-basis }
		// flex-grow : l'enfant choisi occupe le maximum d'espace
		// Exemple : flex: 1 1 auto

		let airQuality = 'Quality : '+this.airQuality[this.state.indexQuality]
		airQuality += (this.state.indexQuality !== 0) ? ' ('+((6-this.state.indexQuality)/5)*100+'%)': ''

		return (
			<div className={css(canvasContainer)}>
				<div className={css(topContainer)}>
					<h1> {this.renderTitle()} </h1>
					<h2> {airQuality} </h2>
				</div>
				<Line
					height={550}
					width={1100}
					data={this.getDataLine()}
					options={this.getOptionsLine()}
				/>
				<div className={css(bottomContainer)}>
					<small>
						Auto refresh data air quality <strong> every 5 minutes</strong>.
					</small>
				</div>
			</div>
		)
	}
}
