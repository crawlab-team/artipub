const models = require('../models')
const ObjectId = require('bson').ObjectId
const exec = require('child_process').exec
const path = require('path')

module.exports = {
    getTaskList: async (req, res) => {
        const Tasks = await models.Task.find()
        res.json({
            status: 'ok',
            data: Tasks
        })
    },
    getTask: async (req, res) => {
        const Task = await models.Task.findOne({ _id: ObjectId(req.params.id) })
        res.json({
            status: 'ok',
            data: Task
        })
    },
    addTask: async (req, res) => {
        let Task = new models.Task({
        })
        Task = await Task.save()
        res.json({
            status: 'ok',
            data: Task,
        })
    },
    editTask: async (req, res) => {
        let Task = await models.Task.findOne({ _id: ObjectId(req.params.id) })
        if (!Task) {
            return res.json({
                status: 'ok',
                error: 'not found'
            }, 404)
        }
        Task.title = req.body.title
        Task.content = req.body.content
        Task.updateTs = new Date()

        // 平台
        platforms.forEach(platform => {
            if (req.body[platform]) {
                Task.platforms[platform] = req.body[platform]
            }
        })

        // 更新
        Task = await Task.updateOne(Task)

        res.json({
            status: 'ok',
            data: Task,
        })
    },
    deleteTask: async (req, res) => {
        let Task = await models.Task.findOne({ _id: ObjectId(req.params.id) })
        if (!Task) {
            return res.json({
                status: 'ok',
                error: 'not found'
            }, 404)
        }
        await models.Task.remove({ _id: ObjectId(req.params.id) })
        res.json({
            status: 'ok',
            data: req.body,
        })
    },
    publishTask: async (req, res) => {
        let Task = await models.Task.findOne({ _id: ObjectId(req.params.id) })
        if (!Task) {
            return res.json({
                status: 'ok',
                error: 'not found'
            }, 404)
        }
        const platforms = req.body.platforms.split(',')
        let isError = false
        let errMsg = ''
        for (let i = 0; i < platforms.length; i++) {
            if (isError) break
            const platform = platforms[i]

            // 获取执行路径
            let execPath
            if (platform === 'juejin') {
                execPath = 'juejin/juejin_spider.js'
            } else if (platform === 'segmentfault') {
                execPath = 'segmentfault/segmentfault_spider.js'
            } else if (platform === 'jianshu') {
                execPath = 'jianshu/jianshu_spider.js'
            } else {
                continue
            }
            const filePath = path.join(__dirname, '..', '..', 'spiders', execPath)

            // 初始化平台
            if (!Task.platforms[platform]) {
                Task.platforms[platform] = {}
            }

            // 初始化执行结果
            if (Task.platforms[platform].url || Task.platforms[platform].status === 'processing') {
                // 如果结果已经存在或状态为正在处理，跳过
                console.log(`skipped ${platform}`)
                continue
            } else {
                Task.platforms[platform] = {
                    status: 'processing',
                    updateTs: new Date(),
                }
                await Task.updateOne(Task)
            }

            console.log(`node ${filePath} ${Task._id.toString()}`)
            await exec(`node ${filePath} ${Task._id.toString()}`, (err, stdout, stderr) => {
                if (err) {
                    console.error(stderr)
                    isError = true
                    errMsg = stderr
                    Task.platforms[platform] = {
                        status: 'error',
                        updateTs: new Date(),
                        error: errMsg,
                    }
                    Task.updateOne(Task)
                }
            })
        }

        if (isError) {
            res.json({
                status: 'ok',
                error: errMsg,
            }, 500)
        } else {
            res.json({
                status: 'ok',
                data: Task,
            })
        }
    }
}
