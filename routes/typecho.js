const configs = require('../spiders/config')
const Typechoblog = require('typecho-api')

module.exports = {
  getTypechoCategories: async (req, res) => {
    const metaWeblog = new Typechoblog(configs.typecho.urls.xmlrpc, configs.typecho.info.username, configs.typecho.info.password);
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
