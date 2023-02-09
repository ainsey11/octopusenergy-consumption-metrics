# octopus consumption metrics

A utility written in nodejs to pull energy consumption from the Octopus Energy API for tracking usage in grafana.

## How does it work?
The octopus API is a little strange in the way they provide data from smart meters.
It's really cool how they let you interface with them to be able to pull your own consumption data though!

Basically they poll your meter every day (or a smidge longer) for the 30 min interval statistics of your consumption
I was under the impression they polled it every 30 mins and the API would be "real time" but this is not the case - thanks to the point made in this blog post: 
https://www.guylipman.com/octopus/api_guide.html


This was quite frustrating as I had originally planned to do this as a prometheus based exporter, but when the data isn't near realtime, it makes it very tricky to handle, instead I opted to feed the data into InfluxDB.

This is because you can specify the timestamp of the data point when you write it into Influx, meaning that I can poll the API for "new" data every so often, and back load it into influx.

More information can be found on my blog [here](https://ainsey11.com/monitoring-my-energy-consumption-with-octopus-energy-grafana-influxdb-and-node-js/)

## Requirements


This can either be ran in docker or natively in a nodejs environment.
You will need:
 - An Octopus Energy Account
 - An Octopus API Key
 - An SMETS1 or SMETS2 compatible smart meter, sending readings into Octopus (they must be visible in the octopus dashboard)
 - NodeJS installed or docker
 - An InfluxDB server running with a token generated and a bucket created

## Docker

`docker build -t repo/octopus-energy-metrics:latest . `

## Docker-compose

rename the `.env.example` file to `.env` and edit the values in the `.env` file then run `docker-compose up -d` or `docker compose up -d`
 
## Environment Variables
To run the application, it takes certain variables to make it function. All of these variables are mandatory for the code to work.

```
    OCTO_API_KEY = Your API Key from the dashboard
    OCTO_ELECTRIC_SN = Your electric meter serial number
    OCTO_ELECTRIC_MPAN = Your electric meter MPAN reference
    OCTO_GAS_MPRN = Your gas meter MPRN reference
    OCTO_GAS_SN = Your gas meter serial number
    OCTO_ELECTRIC_COST = Your cost per KWH for electricity in pence
    OCTO_GAS_COST = Your cost per KWH for gas in pence
    INFLUXDB_URL = the full url to your influddb server (https://influxdb.xxxx.xxxx)
    INFLUXDB_TOKEN = A token for influx with write access to your bucket
    INFLUXDB_ORG = the org in your influxdb server
    INFLUXDB_BUCKET = the bucket name for your metrics to be stored in, this must exist first
    LOOP_TIME = How often to poll the Octopus API in seconds
    PAGE_SIZE = How many data points to retrieve in one go, useful if you want to pull a large backload of data in for historical reasons, realistically this can be set to 48 (1 point every 30 mins in a 24 hour window) - maximum sizes are in the Octopus API docs
    VOLUME_CORRECTION = 1.02264 = standard volume correction rate for gas
    CALORIFIC_VALUE = 37.5 = standard calorific calue for gas
    JOULES_CONVERSION = 3.6 = standard conversion divider to convert to joules for gas

```
You can find the MPAN,MPRN and SN's of your devices in the Octopus dashboard


## Discord Server to aid discussions for my projects: [https://discord.gg/VWNXq4Em]
