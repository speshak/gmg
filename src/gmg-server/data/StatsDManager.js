const StatsDClient = require('statsd-client');

class StatsDManager {
  constructor({ pollingClient, logger }) {
    this._pollingClient = pollingClient
    this._logger = (message) => {
      if (logger)
        logger(message)
      else
        console.log(message)
    }

    this._sdc = new StatsDClient({host: process.env.STATSD_HOST});

    this.start = this.start.bind(this)
    this.stop = this.stop.bind(this)
    this._onStatus = this._onStatus.bind(this)
  }


  async start() {
    if (this._started) throw new Error('Already started!')
    this._started = true
    this._logger('Starting StatsD Manager...')
    this._pollingClient.on('status', this._onStatus)
  }


  async stop() {
    if (!this._started) throw new Error('Already stopped!')
    this._started = false
    this._sdc.close()
    this._pollingClient.removeListener('status', this._onStatus)
  }


  async _onStatus(status) {
    if (!status.isOn) {
      return
    }

    try {
      this._logger('Sending StatsD metrics');
      this._sdc.gauge('gmg.grill.temp', status.currentGrillTemp);
      this._sdc.gauge('gmg.grill.desired_temp', status.desiredGrillTemp);
      this._sdc.gauge('gmg.food.temp', status.currentFoodTemp);
      this._sdc.gauge('gmg.food.desired_temp', status.desiredFoodTemp);

      this._sdc.gauge('gmg.pellet_alarm', (status.lowPelletAlarmActive ? 1 : 0));
      this._sdc.gauge('gmg.fan_mode', (status.fanModeActive ? 1 : 0));
    } catch (err) {
      this._logger("Error publishing to statsd " + err);
    }
  }
}

module.exports = StatsDManager
