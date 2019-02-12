# speedtest-influx

## Startup

The following environment variables exist

| Key  | Default   |
| ---- | --------- |
| host | 127.0.0.1 |
| port | 8086      |
| db   | iot       |

A full startup looks like this

```sh
node index.js --host=127.0.0.1 --port=8086 --db=iot
```

## Local development

For local development, build an influxDB container with

```sh
docker run --name=influxdb -p 8086:8086 -e INFLUXDB_DB=iot -v influxdb:/var/lib/influxdb influxdb
```