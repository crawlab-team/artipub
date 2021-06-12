import * as Result from '../utils/result'
import { Router } from 'express'
import { Environment } from '@/models';
const router = Router();

const getEnvList = async (req, res) => {
    const environments = await Environment.find({user: req.user._id})
    await Result.success(res, environments)
  };
// const addEnv = async (req, res) => {
//     let env = new models.Environment({
//       _id: req.body._id,
//       value: req.body.value,
//       label: req.body.label,
//     })
//     env = await env.save()
//     await res.json({
//       status: 'ok',
//       data: env,
//     })
//   };
const editEnv = async (req, res) => {
    let env = await Environment.findOne({ _id: req.body._id , user: req.user._id})
    if (!env) {
      return res.json({
        status: 'ok',
        error: 'not found'
      }, 404)
    }
    env.value = req.body.value
    env.label = req.body.label
    env = await env.save()
    res.json({
      status: 'ok',
      data: env,
    })
  };
// const deleteEnv = async (req, res) => {
//     let env = await models.Environment.findOne({ _id: req.body._id })
//     if (!env) {
//       return res.json({
//         status: 'ok',
//         error: 'not found'
//       }, 404)
//     }
//     await models.Environment.remove({ _id: req.body._id })
//     await res.json({
//       status: 'ok',
//       data: req.body,
//     })
//   };

router.get('/', getEnvList)
router.post('/', editEnv)

export = { router, basePath: '/environments', };
