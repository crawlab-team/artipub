const Typechoblog = require('typecho-api')
const models = require('../models')


module.exports = {
  getTypechoCategories: async (req, res) => {
    const platform = await models.Platform.findOne({name:'typecho'})

    if(!platform){
      await res.json({
        status: 'error',
        data:"no such platform"
      })
    }
    if(!platform.url||!platform.username||!platform.password){
      await res.json({
        status: 'error',
        data:"请检查type信息是否填写正确"
      })
    }
    const metaWeblog = new Typechoblog(platform.url, platform.username, platform.password);
    if(!metaWeblog){
      await res.json({
        status: 'error',
        data:"检查xmlrpc的URL是否正确"
      })
    }
    let categories = []
    if (categories.length === 0) {
      await metaWeblog.getCategories("1")
        .then((categories_) => {
          // console.log('\n Method response[0] for \'getCategories\': ');
          // console.log(categories);
          categories_.forEach(category => {
            categories.push(
              {"value": category.categoryName, "label": category.categoryName}
            )
          })
        })
    }
    await res.json({
      status: 'ok',
      data: categories
    })
  }
}
