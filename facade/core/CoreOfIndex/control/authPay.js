/**
 * Created by liub on 2017-04-06.
 */
let facade = require('../../../Facade')
let {now, ms, sign} = facade.util

/**
 * 第三方认证支付接口
 */
class authPay extends facade.Control 
{
    get router() {
        return [
            ['/auth360.html', 'auth360'],         //模拟 360 网关下发签名集
            ['/authAdmin.html', 'authAdmin'],     //管理后台登录验证页面
        ]
    }

    /**
     * for test only: 用于为测试环境下的直连模式生产验证信息
     * @param {*} objData 
     */
    async auth360(objData){
        let ret = {
            t: now(),                           //当前时间戳，游戏方必须验证时间戳，暂定有效 期为当前时间前后 5 分钟
            nonce: Math.random()*1000 | 0,      //随机数
            plat_user_id: objData.id,           //平台用户 ID
            nickname: objData.id,               //用户昵称
            avatar: objData.id,                 //头像
            is_tourist: 1,                      //是否为游客
        };
        ret.sign = sign(ret, this.core.options['360'].game_secret);
        return ret;
    }

    /**
     * 发放验证信息：此处实现session发放、有效性验证等功能
     * @param objData
     * @returns {Promise.<{t: number, nonce: number, plat_user_id, nickname, avatar, is_tourist: number}>}
     *
     * @note
     *      1、先检查session是否有效，有的话直接返回签名档
     *      2、如果session为空或者已经失效，则根据openid/openkey进行检验，openkey有可能为验证码或者密码
     */
    async authAdmin(objData){
        //console.log(objData);
        if(objData.oemInfo.constructor == String){
            objData.oemInfo = JSON.parse(objData.oemInfo);
        }
        let ret = this.core.registerSession(objData.oemInfo.openid, objData.oemInfo.openkey, objData.oemInfo.session);
        //console.log(ret);
        if(!!ret){
            let rt = {
                t: now(),                           //当前时间戳，必须验证时间戳，暂定有效 期为当前时间前后 5 分钟
                nonce: Math.random()*1000 | 0,      //随机数
                plat_user_id: ret.openid,           //平台用户 ID
                nickname: ret.openid,               //用户昵称
                avatar: ret.openid,                 //头像
                is_tourist: 1,                      //是否为游客
                session:ret.session,                //Session
            };
            rt.sign = facade.util.sign(rt, this.core.options.game_secret);
            return rt;
        }
        else{
            return {session:""};
        }
    }
}

exports = module.exports = authPay;
