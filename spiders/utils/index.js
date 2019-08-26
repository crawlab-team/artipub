module.exports = {
    checkArticleId: (articleId, filename) => {
        if (!articleId || !articleId.match(/^[0-9a-f]{24}$/)) {
            console.log(`article_id "${articleId}" is invalid`)
            console.log(`node ${filename} <article_id>`)
            process.exit()
        }
    },
}
