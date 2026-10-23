// Core
import { useEffect } from 'react';
import PropTypes from 'prop-types';
// Components
import 'leaflet/dist/leaflet.css';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import markerIconPng from 'leaflet/dist/images/marker-icon.png';
import { Icon } from 'leaflet';

// ---------------------------------------------------------------------------------
const ZOOM = 14;
const markerIcon = new Icon({ iconUrl: markerIconPng, iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34] });

const Leaflet = ({ geoloc }) => {
  if (!geoloc) return null;

  const geolocation = [geoloc.latitude, geoloc.longitude];

  return (
    <MapContainer
      id="mapId"
      center={geolocation}
      zoom={ZOOM}
      scrollWheelZoom={false}
      style={{ height: 180, width: 180, margin: '20px' }}
    >
      <ChangeView center={geolocation} zoom={ZOOM} />
      {/* L'attribution OpenStreetMap est une condition d'utilisation des tuiles ;
          la forme courte est admise quand la place manque */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={geolocation} icon={markerIcon}>
        {geoloc.altitude && <Legend altitude={geoloc.altitude} />}
      </Marker>
    </MapContainer>
  );
};

Leaflet.propTypes = {
  geoloc: PropTypes.object
};

export default Leaflet;

// Local components -------------------------------------------------------------------------

const ChangeView = ({ center, zoom }) => {
  const map = useMap();
  const [latitude, longitude] = center;

  // Recentre quand la position change, pas à chaque rendu
  useEffect(() => {
    map.setView([latitude, longitude], zoom);
  }, [map, latitude, longitude, zoom]);

  return null;
};

ChangeView.propTypes = {
  center: PropTypes.array,
  zoom: PropTypes.number
};

const Legend = ({ altitude }) => (
  <Popup>
    {`alt. ${altitude.toFixed(2)}m`}
  </Popup>
);

Legend.propTypes = {
  altitude: PropTypes.number
};
