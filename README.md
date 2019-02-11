# speedtest-influx


## Local development

For local development, start up an influxDB with

```sh
docker run --name=influxdb -p 8086:8086 -e INFLUXDB_DB=iot -v influxdb:/var/lib/influxdb influxdb
```