const awsIot = require('aws-iot-device-sdk');

class IoTSender {
    constructor() {
      const deviceSettings = {
        keyPath: process.env.AWS_IOT_KEYPATH,
        certPath: process.env.AWS_IOT_CERTPATH,
        caPath: process.env.AWS_IOT_CAPATH,
        host: process.env.AWS_IOT_HOST
      };

      console.log(deviceSettings);
      this.iotDevice = awsIot.device(deviceSettings);

      this.iotDevice.on('error', (error) => {
        console.log('IoT Device Error: ' + error)
      });

      this.send = this.send.bind(this)
    }

    get name() {
      return path.basename(__filename)
    }


    async send(alert) {
      try {
        console.log("Sending IoT alert")
        const json = JSON.stringify(alert)
        this.iotDevice.publish('smoker_alerts', json);
      } catch (err) {
        console.log(`Error sending IoT alert: ${err}`);
      }
    }
}

module.exports = IoTSender
