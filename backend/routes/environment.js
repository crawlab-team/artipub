const models = require('../models')

module.exports = {
  getEnvList: async (req, res) => {
    const environments = await models.Environment.find()
    await res.json({
      status: 'ok',
      data: environments
    })
  },
  addEnv: async (req, res) => {
    let env = new models.Environment({
      _id: req.body._id,
      value: req.body.value,
      label: req.body.label,
      updateTs: new Date(),
      createTs: new Date(),
    })
    env = await env.save()
    await res.json({
      status: 'ok',
      data: env,
    })
  },
  editEnv: async (req, res) => {
    let env = await models.Environment.findOne({ _id: req.body._id })
    if (!env) {
      return res.json({
        status: 'ok',
        error: 'not found'
      }, 404)
    }
    env.value = req.body.value
    env.label = req.body.label
    env.updateTs = new Date()
    env = await env.save()
    res.json({
      status: 'ok',
      data: env,
    })
  },
  deleteEnv: async (req, res) => {
    let env = await models.Environment.findOne({ _id: req.body._id })
    if (!env) {
      return res.json({
        status: 'ok',
        error: 'not found'
      }, 404)
    }
    await models.Environment.remove({ _id: req.body._id })
    await res.json({
      status: 'ok',
      data: req.body,
    })
  },
}
