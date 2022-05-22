const fs = require('fs');
const axios = require('axios');


class Busquedas{

    historial = [];
    dbPath = './db/database.json';

    constructor(){
        //TODO: Leer base de datos si existe
        this.leerDB();
    }
    
    get historialCapitalizado(){
        return this.historial.map( lugar => {
            let palabras    = lugar.split(' ');
            palabras        = palabras.map( p => p[0].toUpperCase() + p.substring(1) )
            return palabras.join(' ');
        });
    }
    

    get paramsMapbox (){
        return {
            'access_token' : process.env.MAPBOX_KEY,
            'limit': 5,
            'language': 'es'
        };
    }
    
    get paramsWeather ( ){
        return {
            'appid' : process.env.OPENWEATHER_KEY,
            'units' : 'metric',
            'lang'  : 'es',
        }
    }

    

    async ciudad ( lugar = '' ){


        try {
            //const resp = await axios.get('https://api.mapbox.com/geocoding/v5/mapbox.places/otawa.json?access_token=pk.eyJ1IjoibGFwaXRveCIsImEiOiJjbDNoano3NXcxMXN6M2preWl1cmhvcmlqIn0.rl5q0QNJZAdA384xvUUhMQ&language=es&limit=5');
            const instance = axios.create({
                baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${lugar}.json`,
                params: this.paramsMapbox
            });

            const resp = await instance.get();

            /*console.log(resp.data.features);*/
            
            return resp.data.features.map( lugar => ({
                id:     lugar.id,
                nombre: lugar.place_name,
                lng:    lugar.center[0],
                lat:    lugar.center[1],
            }) );
            
        } catch (error) {
            return [];            
        }

        

    }

    async climaLugar( lat, lon){

        try {
            // mi codigo 
            /*
            const instance = axios.create({
                baseURL: `https://api.openweathermap.org/data/2.5/weather`,
                params: {
                    'appid' : process.env.OPENWEATHER_KEY,
                    'units' : 'metric',
                    'lang'  : 'es',
                    'lat'   :lat,
                    'lon'   :lon
                }
            });

            const resp = await instance.get();
           
            return {
                desc  : resp.data.weather[0].description,
                min   : resp.data.main.temp_min,
                max   : resp.data.main.temp_max,
                temp  : resp.data.main.temp ,
                
                
            }      
            
            */
            
            //codigo de la respuesta

            const instance = axios.create({
                baseURL: `https://api.openweathermap.org/data/2.5/weather`,
                params: { ...this.paramsWeather, lat, lon }
            });

            const resp = await instance.get();
            const { weather , main } = resp.data;

            return {
                desc : weather[0].description,
                min  : main.temp_min,
                max  : main.temp_max,
                temp : main.temp
            } 
            
        } catch (error) {

            console.log(error);
            
        }

    }

    agregarHistorial( lugar = "" ){

        // prevenir duplicados

        if ( this.historial.includes( lugar.toLocaleLowerCase() ) ){
            return;
        }

        this.historial = this.historial.splice(0,5);

        this.historial.unshift( lugar.toLocaleLowerCase() );

        this.guardarDB();

        //Grabar en DB

    }

    guardarDB(){

        const payload = {
            historial: this.historial
        }

        fs.writeFileSync( this.dbPath, JSON.stringify( payload ) );

    }

    leerDB(){

        if(!fs.existsSync ( this.dbPath )) return ;
        const info = fs.readFileSync( this.dbPath,{ encoding:'utf-8' });
        const data = JSON.parse(info);
        this.historial = data.historial;
    }


}



module.exports = Busquedas;