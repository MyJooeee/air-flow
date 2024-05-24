import PropTypes from 'prop-types';
import 'leaflet/dist/leaflet.css';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import markerIconPng from "leaflet/dist/images/marker-icon.png"
import {Icon} from 'leaflet'
import { localeData } from 'moment';

// ---------------------------------------------------------------------------------

const Leaflet = ({ geoloc }) => {

	if (!geoloc.longitude && !geoloc.latitude) return null;

	const geolocation = [geoloc.latitude, geoloc.longitude];

	return (
	<MapContainer
		id="mapId"
		center={geolocation}
		zoom={14}
		scrollWheelZoom={false}
		style={{ height: 180, width: 180, margin: '20px'}}
	>
		<ChangeView center={geolocation} zoom={14} />
		<TileLayer
		attribution='&copy;AirFlow'
		url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
		/>
		<Marker position={geolocation} icon={new Icon({iconUrl: markerIconPng, iconSize: [25, 41], iconAnchor: [12, 41]})}>
		{geoloc.altitude && <Legend altitude={geoloc.altitude}/>}
	</Marker>
	</MapContainer>
	);
}

Leaflet.propTypes = {
  geoloc: PropTypes.object
};

export default Leaflet;

// Local components -------------------------------------------------------------------------

const ChangeView = ({ center, zoom }) => {
	const map = useMap();
	map.setView(center, zoom);
	return null;
 }

ChangeView.propTypes = {
  center: PropTypes.array,
  zoom: PropTypes.number
}

const Legend = ({ altitude }) => (
	<Popup>
		{`alt. ${altitude.toFixed(2)}m`}
	</Popup>
)

Legend.propTypes = {
  altitude: PropTypes.number
}