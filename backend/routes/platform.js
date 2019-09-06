const models = require('../models')
const ObjectId = require('bson').ObjectId

module.exports = {
    getPlatformList: async (req, res) => {
        const platforms = await models.Platform.find()
        await res.json({
            status: 'ok',
            data: platforms
        })
    },
    getPlatform: async (req, res) => {
        const platform = await models.Platform.findOne({ _id: ObjectId(req.params.id) })
        await res.json({
            status: 'ok',
            data: platform
        })
    },
    addPlatform: async (req, res) => {
        let Platform = new models.Platform({
            name: req.body.name,
            label: req.body.label,
            editorType: req.body.editorType,
            description: req.body.description,
            createTs: new Date(),
            updateTs: new Date(),
        })
        Platform = await Platform.save()
        await res.json({
            status: 'ok',
            data: Platform,
        })
    },
    editPlatform: async (req, res) => {
        let platform = await models.Platform.findOne({ _id: ObjectId(req.params.id) })
        if (!platform) {
            return await res.json({
                status: 'ok',
                error: 'not found'
            }, 404)
        }
        platform.name = req.body.name
        platform.label = req.body.label
        platform.editorType = req.body.editorType
        platform.description = req.body.description
        platform.updateTs = new Date()
        platform.save()
        await res.json({
            status: 'ok',
            data: platform,
        })
    },
    deletePlatform: async (req, res) => {
        let platform = await models.Platform.findOne({ _id: ObjectId(req.params.id) })
        if (!platform) {
            return await res.json({
                status: 'ok',
                error: 'not found'
            }, 404)
        }
        await models.Platform.remove({ _id: ObjectId(req.params.id) })
        await res.json({
            status: 'ok',
            data: platform,
        })
    },
}
