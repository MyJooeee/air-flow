import 'leaflet/dist/leaflet.css';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import markerIconPng from "leaflet/dist/images/marker-icon.png"
import {Icon} from 'leaflet'

export default function Leaflet({ geoloc }) {

	function ChangeView({ center, zoom }) {
		const map = useMap();
		map.setView(center, zoom);
		return null;
	 }

	 let popup = null;
	 if (geoloc.altitude)
	popup = (
		<Popup>
		{`alt. ${geoloc.altitude.toFixed(2)}m`}
		</Popup>
	)

	return (
	<MapContainer
		id="mapId"
		center={[geoloc.longitude, geoloc.latitude]}
		zoom={14}
		scrollWheelZoom={false}
		style={{ height: 180, width: 180, margin: '20px'}}
	>
		<ChangeView center={[geoloc.longitude, geoloc.latitude]} zoom={14} />
		<TileLayer
		attribution='&copy;AirFlow'
		url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
		/>
		<Marker position={[geoloc.longitude, geoloc.latitude]} icon={new Icon({iconUrl: markerIconPng, iconSize: [25, 41], iconAnchor: [12, 41]})}>
		{popup}
	</Marker>
	</MapContainer>
	);
}
