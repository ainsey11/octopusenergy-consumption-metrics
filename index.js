// Libraries
const {InfluxDB, Point} = require('@influxdata/influxdb-client')
const { toNanoDate } = require("influx")

const axios = require('axios');
const dotenv = require('dotenv');
const sleep = require('./sleep')
// Load dotenv
dotenv.config();

// Env Vars
const {
    OCTO_API_KEY,
    OCTO_ELECTRIC_SN,
    OCTO_ELECTRIC_MPAN,
    OCTO_GAS_MPRN,
    OCTO_GAS_SN,
    OCTO_ELECTRIC_COST,
    OCTO_GAS_COST,
    INFLUXDB_URL,
    INFLUXDB_TOKEN,
    INFLUXDB_ORG,
    INFLUXDB_BUCKET,
    LOOP_TIME,
    PAGE_SIZE
} = process.env

const boot = async (callback) => {
    console.log("Starting Octopus Energy Consumption Metrics Container")
    console.log("Current Settings are:")
    console.log(`
        OCTO_API_KEY = ${OCTO_API_KEY}
        OCTO_ELECTRIC_MPAN = ${OCTO_ELECTRIC_MPAN}
        OCTO_ELECTRIC_SN = ${OCTO_ELECTRIC_SN}
        OCTO_GAS_MPAN = ${OCTO_GAS_MPRN}
        OCTO_GAS_SN = ${OCTO_GAS_SN}
        INFLUXDB_URL = ${INFLUXDB_URL}
        INFLUXDB_TOKEN = ${INFLUXDB_TOKEN}
        INFLUXDB_ORG = ${INFLUXDB_ORG}
        INFLUXDB_BUCKET = ${INFLUXDB_BUCKET}
        LOOP_TIME = ${LOOP_TIME}
        OCTO_ELECTRIC_COST = ${OCTO_ELECTRIC_COST}
        OCTO_GAS_COST = ${OCTO_GAS_COST}
        PAGE_SIZE = ${PAGE_SIZE}
    `)


    while (true){
        // Set up influx client
        const client = new InfluxDB({url: INFLUXDB_URL, token: INFLUXDB_TOKEN})
        const writeApi = client.getWriteApi(INFLUXDB_ORG, INFLUXDB_BUCKET)
        writeApi.useDefaultTags({app: 'octopus-energy-consumption-metrics'})
        console.log("Polling data from octopus API")

        // Retrieve data from octopus API
        let electricresponse = null;
        let gasresponse = null;
        try{
            let options = {auth: {
                username: OCTO_API_KEY
            }}
            electricresponse = await axios.get(`https://api.octopus.energy/v1/electricity-meter-points/${OCTO_ELECTRIC_MPAN}/meters/${OCTO_ELECTRIC_SN}/consumption?page_size=${PAGE_SIZE}`, options)
            gasresponse = await axios.get(`https://api.octopus.energy/v1/gas-meter-points/${OCTO_GAS_MPRN}/meters/${OCTO_GAS_SN}/consumption?page_size=${PAGE_SIZE}`, options)

            
        } catch(e){
            console.log("Error retrieving data from octopus API")
            console.log(e)
        }

        // Now we loop over every result given to us from the API and feed that into influxdb

        for await ( obj of electricresponse.data.results) {
            // Here we take the end interval, and convert it into nanoseconds for influxdb as nodejs works with ms, not ns
            const ts = new Date(obj.interval_end)
            const nanoDate = toNanoDate(String(ts.valueOf()) + '000000')
            
            // work out the consumption and hard set the datapoint's timestamp to the interval_end value from the API
            let electricpoint = new Point('electricity')
                .floatField('consumption', Number(obj.consumption))
                .timestamp(nanoDate)
            
            // Same again but for cost mathmatics
            let electriccost = Number(obj.consumption) * Number(OCTO_ELECTRIC_COST) / 100
            let electriccostpoint = new Point('electricity_cost')
                .floatField('price', electriccost)
                .timestamp(nanoDate)

            // and then write the points:
            writeApi.writePoint(electricpoint)
            writeApi.writePoint(electriccostpoint)
        }

        // Repeat the above but for gas
        for await (obj of gasresponse.data.results) {
            const ts = new Date(obj.interval_end)
            const nanoDate = toNanoDate(String(ts.valueOf()) + '000000')

            let gaspoint = new Point('gas')
                .floatField('consumption', Number(obj.consumption))
                .timestamp(nanoDate)
            
            let gascost = Number(obj.consumption) * Number(OCTO_GAS_COST) / 100

            let gascostpoint = new Point('gas_cost')
                .floatField('price', gascost)
                .timestamp(nanoDate)

            writeApi.writePoint(gaspoint)
            writeApi.writePoint(gascostpoint)

        }

        await writeApi
            .close()
            .then(() => {
                console.log('Octopus API response submitted to InfluxDB successfully')
            })
            .catch(e => {
                console.error(e)
                console.log('Error submitting data to InfluxDB')
            })
        
        // Now sleep for the loop time
        console.log("Sleeping for: " + LOOP_TIME)
         sleep(Number(LOOP_TIME))
    }
}

boot((error) => {
    if (error) {
        console.error(error)
        throw(error.message || error)
    }
  });