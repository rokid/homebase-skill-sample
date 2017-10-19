'use strict'

const { Controller } = require('egg')

const Device = require('../model/devices')

class DeviceController extends Controller {
  async index () {
    this.ctx.body = Device.data
  }

  async show () {
    const { params: { id } } = this.ctx
    this.ctx.body = Device.find(id)
  }

  async create () {
    const { request: { body } } = this.ctx
    const device = Device.create(body)
    this.ctx.body = device
    this.ctx.app.io.emit('device:create', { device })
  }

  async update () {
    const { params: { id }, request: { body } } = this.ctx
    const device = Device.update(id, body)
    this.ctx.body = device
    this.ctx.app.io.emit('device:update', { device })
  }

  async reset () {
    Device.reset()
    const devices = Device.data
    this.ctx.body = devices
    this.ctx.app.io.emit('device:reset', { devices })
  }

  async resetState () {
    Device.resetState()
    const devices = Device.data
    this.ctx.body = devices
    this.ctx.app.io.emit('device:reset', { devices })
  }
}

module.exports = DeviceController
