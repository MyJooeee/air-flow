import 'leaflet/dist/leaflet.css';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import markerIconPng from "leaflet/dist/images/marker-icon.png"
import {Icon} from 'leaflet'

export default function Leaflet({coordinates}) {

	function ChangeView({ center, zoom }) {
		const map = useMap();
		map.setView(center, zoom);
		return null;
	 }

	return (
			<MapContainer
		      id="mapId"
			    center={coordinates}
		      zoom={14}
		      scrollWheelZoom={false}
		      style={{ height: 180, width: 180, margin: '20px'}}
		    >
				 <ChangeView center={coordinates} zoom={14} />
			      <TileLayer
			        attribution='&copy;AirFlow'
			        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
			      />
				  <Marker position={coordinates} icon={new Icon({iconUrl: markerIconPng, iconSize: [25, 41], iconAnchor: [12, 41]})}>
			      <Popup>
			        Position
			      </Popup>
			    </Marker>
		    </MapContainer>
	);
}
