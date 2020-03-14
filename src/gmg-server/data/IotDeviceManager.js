const awsIot = require('aws-iot-device-sdk');

class IotDeviceManager {
  constructor({ pollingClient, logger }) {
    this._pollingClient = pollingClient
    this._logger = (message) => {
      if (logger)
        logger(message)
      else
        console.log(message)
    }
    this._deviceSetup()

    this.start = this.start.bind(this)
    this.stop = this.stop.bind(this)
    this._onStatus = this._onStatus.bind(this)
  }


  async start() {
    if (this._started) throw new Error('Already started!')
    this._started = true
    this._logger('Starting IoT Device Manager...')
    this._pollingClient.on('status', this._onStatus)
  }


  async stop() {
    if (!this._started) throw new Error('Already stopped!')
    this._started = false
    this._pollingClient.removeListener('status', this._onStatus)
  }

  _deviceSetup() {
    const iotShadow = awsIot.thingShadow({
      keyPath: process.env.AWS_IOT_KEYPATH,
      certPath: process.env.AWS_IOT_CERTPATH,
      caPath: process.env.AWS_IOT_CAPATH,
      host: process.env.AWS_IOT_HOST
    });

    iotShadow.on('connect', function() {
      iotShadow.register(process.env.AWS_IOT_THING)
    });

    iotShadow.on('error', (error) => {
      console.log(`IoT Shadow Error: ${error}`);
    });

    iotShadow.on('timeout', (thing, token) => {
      console.log(`IoT Shadow Timeout: Thing: ${thing} Token: ${token}`);
    });

    iotShadow.on('status', (thing, stat, token, state) => {
      console.log(`IoT Shadow status ${stat}. State: ${state}`);
    });

    this.iotShadow = iotShadow;
  }


  async _onStatus(status) {
    if (!status.isOn) {
      return
    }

    try {
      this._logger('Updating IoT device shadow');
      this.iotShadow.update(process.env.AWS_IOT_THING, { "state": { "desired": status } });
      this.iotShadow.publish('smoker_status',  JSON.stringify(status));
    } catch (err) {
      this._logger("Error updating shadow: " + err);
    }
  }
}

module.exports = IotDeviceManager
