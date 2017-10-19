'use strict'

const _ = require('lodash')

const StateDefaults = {
  switch: 'off',
  color: 256,
  brightness: 10,
  mode: 'auto',
  swing_mode: 'auto',
  fanspeed: 10,
  humidity: 10,
  temperature: 10,
  volume: 100,
  channel: 100,
  color_temperature: 10
}

const devices = [
  {
    type: 'light',
    deviceId: '0',
    name: '一号灯',
    roomName: '客厅',
    deviceInfo: {
      foo: 'bar',
      from: 'sample-driver',
      type: 'light'
    },
    actions: {
      switch: [ 'on', 'off' ],
      color: [ 'random', 'num' ],
      brightness: [ 'up', 'down', 'max', 'min', 'num' ]
    },
    state: {
      switch: 'off',
      color: 256,
      brightness: 10
    }
  },
  {
    type: 'ac',
    deviceId: '1',
    name: '二号空调',
    roomName: '客厅',
    deviceInfo: {
      foo: 'bar',
      from: 'sample-driver',
      type: 'ac'
    },
    actions: {
      switch: [ 'on', 'off' ],
      mode: [ 'auto', 'manual', 'cool', 'heat', 'dry', 'fan', 'silent', 'energy', 'sleep' ],
      swing_mode: [ 'auto', 'on', 'off', 'horizon', 'horizon.off', 'vertical', 'vertical.off' ],
      fanspeed: [ 'up', 'down', 'max', 'min', 'num' ],
      humidity: [ 'up', 'down', 'max', 'min', 'num' ],
      temperature: [ 'up', 'down', 'max', 'min', 'num' ]
    },
    state: {
      switch: 'off',
      mode: 'auto',
      swing_mode: 'auto',
      fanspeed: 10,
      humidity: 10,
      temperature: 10
    }
  },
  {
    type: 'tv',
    deviceId: '2',
    name: '三号电视',
    roomName: '客厅',
    deviceInfo: {
      foo: 'bar',
      from: 'sample-driver',
      type: 'tv'
    },
    actions: {
      switch: [ 'on', 'off' ],
      volume: [ 'up', 'down', 'max', 'min', 'num' ],
      channel: [ 'next', 'prev', 'random', 'num' ]
    },
    state: {
      switch: 'off',
      volume: 100,
      channel: 100
    }
  },
  {
    type: 'light',
    deviceId: '3',
    name: '测试设备',
    roomName: '客厅',
    deviceInfo: {
      foo: 'bar',
      from: 'sample-driver',
      type: 'light'
    },
    actions: {
      brightness: [
        'up',
        'down',
        'max',
        'min',
        'num'
      ],
      color: [
        'random',
        'num'
      ],
      color_temperature: [
        'up',
        'down',
        'max',
        'min',
        'num'
      ],
      switch: [
        'on',
        'off'
      ],
      mode: [
        'auto',
        'manual',
        'cool',
        'heat',
        'dry',
        'fan',
        'silent',
        'energy',
        'sleep'
      ],
      swing_mode: [
        'auto',
        'on',
        'off',
        'horizon',
        'horizon.off',
        'vertical',
        'vertical.off'
      ],
      fanspeed: [
        'up',
        'down',
        'max',
        'min',
        'num'
      ],
      humidity: [
        'up',
        'down',
        'max',
        'min',
        'num'
      ],
      temperature: [
        'up',
        'down',
        'max',
        'min',
        'num'
      ],
      volume: [
        'up',
        'down',
        'max',
        'min',
        'num'
      ],
      channel: [
        'next',
        'prev',
        'random',
        'num'
      ]
    },
    state: {
      switch: 'off',
      brightness: 10,
      color: 256,
      volume: 100,
      channel: 100,
      mode: 'auto',
      swing_mode: 'auto',
      fanspeed: 10,
      humidity: 10,
      temperature: 10,
      color_temperature: 10
    }
  }
]

class Device {
  constructor () {
    this.reset()
  }

  find (deviceId) {
    return _.find(this.data, { deviceId })
  }

  update (deviceId, update) {
    const device = _.find(this.data, { deviceId })
    Object.assign(device, update, _.pick(device, 'deviceId'))
    return device
  }

  create (device) {
    const deviceId = String(this.data.length)
    this.data = [ ...this.data, Object.assign({}, device, { deviceId }) ]
    return this.find(deviceId)
  }

  reset () {
    this.data = devices.map(it => _.cloneDeep(it))
  }

  resetState () {
    this.data = this.data.map(it => {
      it.state = _.mapValues(it.state, (v, key) => {
        if (StateDefaults[key] != null) {
          return StateDefaults[key]
        }
        return v
      })
      return it
    })
  }
}

module.exports = new Device()
