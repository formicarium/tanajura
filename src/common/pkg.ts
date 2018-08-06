import * as pkginfo from 'pkginfo'
pkginfo(module, 'version')

export const version = module.exports.version
