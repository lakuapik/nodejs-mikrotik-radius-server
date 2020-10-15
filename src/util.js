exports.sha1 = (value) => {
    return require('crypto').createHash('sha1').update(value).digest('hex');
}