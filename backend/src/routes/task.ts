import * as Result from '../utils/result'
import constants from '../constants'
import { Router } from 'express';
import { Task } from '@/models';
const router = Router();
const ObjectId = require('bson').ObjectId

const getTaskList = async (req, res) => {
    const tasks = await Task.find()
    await Result.success(res, tasks)
  };
const getTask = async (req, res) => {
    const task = await Task.findOne({ _id: ObjectId(req.params.id) })
    await Result.success(res, task)
  };
const addTasks = async (req, res) => {
    for (let _task of req.body) {
      let task
      if (_task._id) {
        task = await Task.findOne({ _id: ObjectId(_task._id) })
        task.category = _task.category
        task.tag = _task.tag
        task.pubType = _task.pubType
        task.updateTs = new Date()
        task.checked = _task.checked
        task.authType = _task.authType
        task.title = _task.title
      } else {
        task = new Task({
          articleId: ObjectId(_task.articleId),
          platformId: ObjectId(_task.platformId),
          user: req.user._id,
          status: constants.status.NOT_STARTED,
          checked: _task.checked,
          authType: _task.authType,

          // 配置信息
          category: _task.category,
          tag: _task.tag,
          pubType: _task.pubType,
          title: _task.title,
        });
      }
      task = await task.save()
    }
  await Result.success(res);
  };
const addTask = async (req, res) => {
    let task = new Task({
      articleId: ObjectId(req.body.articleId),
      platformId: ObjectId(req.body.platformId),
      user: req.user._id,
      status: constants.status.NOT_STARTED,

      // 配置信息
      category: req.body.category,
      tag: req.body.tag,
    })
    task = await task.save()
    await Result.success(res, task)
  };
const editTask = async (req, res) => {
    let task = await Task.findOne({ _id: ObjectId(req.params.id) })
    if (!task) {
      return Result.notFound(res)
    }
    task.category = req.body.category
    //@ts-ignore
    task.tag = req.body.tag
    task = await task.save()
    await Result.success(res, task)
    return;
  };
const deleteTask = async (req, res) => {
    let task = await Task.findOne({ _id: ObjectId(req.params.id), user: req.user._id})
    if (!task) {
      return Result.notFound(res);
    }
    await Task.remove({ _id: ObjectId(req.params.id) })
  await Result.success(res, req.body);
  return;
  };
// const publishTask = async (req, res) => {
//   let Task = await models.Task.findOne({ _id: ObjectId(req.params.id) })
//   if (!Task) {
//     return res.json({
//       status: 'ok',
//       error: 'not found'
//     }, 404)
//   }
//   const platforms = req.body.platforms.split(',')
//   let isError = false
//   let errMsg = ''
//   for (let i = 0; i < platforms.length; i++) {
//     if (isError) break
//     const platform = platforms[i]

//     // 获取执行路径
//     let execPath
//     if (platform === 'juejin') {
//       execPath = 'juejin/juejin_spider.js'
//     } else if (platform === 'segmentfault') {
//       execPath = 'segmentfault/segmentfault_spider.js'
//     } else if (platform === 'jianshu') {
//       execPath = 'jianshu/jianshu_spider.js'
//     } else {
//       continue
//     }
//     const filePath = path.join(__dirname, '..', '..', 'spiders', execPath)

//     // 初始化平台
//     if (!Task.platforms[platform]) {
//       Task.platforms[platform] = {}
//     }

//     // 初始化执行结果
//     if (Task.platforms[platform].url || Task.platforms[platform].status === 'processing') {
//       // 如果结果已经存在或状态为正在处理，跳过
//       logger.info(`skipped ${platform}`)
//       continue
//     } else {
//       Task.platforms[platform] = {
//         status: 'processing',
//         updateTs: new Date(),
//       }
//       await Task.updateOne(Task)
//     }

//     logger.info(`node ${filePath} ${Task._id.toString()}`)
//     await exec(`node ${filePath} ${Task._id.toString()}`, (err, stdout, stderr) => {
//       if (err) {
//         logger.error(stderr)
//         isError = true
//         errMsg = stderr
//         Task.platforms[platform] = {
//           status: 'error',
//           updateTs: new Date(),
//           error: errMsg,
//         }
//         Task.updateOne(Task)
//       }
//     })
//   }

//   if (isError) {
//     await res.json({
//       status: 'ok',
//       error: errMsg,
//     }, 500)
//   } else {
//     await res.json({
//       status: 'ok',
//       data: Task,
//     })
//   }
// };


router.get('/', getTaskList)
router.get('/:id', getTask)
router.put('/', addTask)
router.put('/batch', addTasks)
router.post('/:id', editTask)
router.delete('/:id', deleteTask)

export = { router, basePath: '/tasks', };
