import type {Response} from 'express'

export const success = (res: Response, data ?: any) => {
  return res.json({
    status: 'ok',
    data: data
  })
};

export const error = (res: Response, error: (Error & {status ?: number}) | string, status ?: number) => {
  const resStatus = status || (typeof error === 'string' ? false : error.status) || 200;
  return res.status(resStatus).json({
     status: 'fail',
     error: error
   })
}

export const notFound = (res: Response, error?: string) => {

  return res.status(404).json({
     status: 'fail',
     error: error || 'Not Found'
   })
}
