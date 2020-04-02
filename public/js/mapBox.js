/*eslint-disable*/
const locations = JSON.parse(document.querySelector('.map').dataset.locations);
export const displayMap = locations =>{
    mapboxgl.accessToken = 'pk.eyJ1IjoicG91eWEtaG9iYmkiLCJhIjoiY2s4NGQ2Z2QyMTBwajNub3dpODJwbTBoaSJ9.jAXSXJjt3RiaXJz0efqdRg';
    
    let map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/pouya-hobbi/ck84dll8j01d41iqt46pot4v9',
        scrollZoom:false
        // center: [-118.113491, 34.111745],
        // zoom : 10,
        // interactive :false
    });
    
    const bounds = new mapboxgl.LngLatBounds();
    
    locations.forEach(loc => {
        // Create Marker
        const el = document.createElement('div');
        el.className = 'marker';
        
        // Add Marker
        new mapboxgl.Marker({
            element: el,
            anchor: 'bottom'
        }).setLngLat(loc.coordinates).addTo(map);
        
        // Add Popup
        new mapboxgl.Popup({
            offset:30
        }).setLngLat(loc.coordinates).setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`).addTo(map);
        
        // Extend map bounds to include current location
        bounds.extend(loc.coordinates);
    })
    
    map.fitBounds(bounds, {
        padding: {
            top: 200,
            bottom: 150,
            left: 100,
            right: 100
        }
    });
}
displayMap(locations);