/**
 * created : 2018-07-28
 * author : HWK
 * description : Database.js
 */

var assert      = require('assert');
var uuid        = require('uuid');
var config      = require('../config/config');

var async       = require('async');
var lib         = require('./lib');
var pg          = require('pg');
var passwordHash = require('password-hash');
var speakeasy   = require('speakeasy');
var m           = require('multiline');
var fs          = require('fs');

var productName = config.PRODUCTION;
var realPath    = 'DATABASE_URL_' + productName;
var databaseUrl = config[realPath];

if (!databaseUrl)
    throw new Error('must set DATABASE_URL environment var');

// console.log('DATABASE_URL: ', databaseUrl); // HWK

pg.types.setTypeParser(20, function(val) { // parse int8 as an integer
    return val === null ? null : parseInt(val);
});

// callback is called with (err, client, done)
function connect(callback) {
    return pg.connect(databaseUrl, callback);
}

function query(query, params, callback) {
    //third parameter is optional
    if (typeof params == 'function') {
        callback = params;
        params = [];
    }

    doIt();
    function doIt() {
        connect(function(err, client, done) {
            if (err) return callback(err);

            // console.log("HWK : ", query);

            client.query(query, params, function(err, result) {
                done();
                if (err) {
                    if (err.code === '40P01') {
                        console.log('Warning: Retrying deadlocked transaction: ', query, params);
                        return doIt();
                    }
                    return callback(err);
                }

                callback(null, result);
            });
        });
    }
}

exports.query = query;

pg.on('error', function(err) {
    console.error('POSTGRES EMITTED AN ERROR', err);
});

/**
 * check existness for username and email.
 * @author HWK
 */

exports.checkDup = function(reg_name, email, callback) {

    console.log("= Register checkDup : " + reg_name + ", " + email);

    var sql = "";
    sql = "SELECT count(*) FROM users WHERE lower(username) = lower($1) and verify = true";
    query(sql, [reg_name], function(err, res){
        if (err) return callback(err);

        var nCntDup = parseInt(res.rows[0]['count']);
        if (nCntDup > 0) return callback(null, "NAME_DUP");

        sql = "SELECT count(*) FROM users WHERE lower(email) = lower($1) and verify = true";
        query(sql, [email], function(err, e_res){
            if (err) return callback(err);

            console.log("= Register checkDup : Count - " + e_res);

            var nCntDup = parseInt(e_res.rows[0].count);
            console.log("= Register checkDup : emailCount - " + nCntDup);
            if (nCntDup > 0) return callback(null, "EMAIL_DUP");

            callback(null, "NO_DUP");
        });
    });
};

/**
 * insert user info into users table.
 * @author HWK
 */

exports.createRegBuffer = function(username, email, password, ipAddress, userAgent, verify_code, secret_question , secret_answer, callback)
{
    console.log("= Register Create Reg Buffer : email - " + email);
    console.log("= Register Create Reg Buffer : username - " + username);
    console.log("= Register Create Reg Buffer : password - " + password);
    console.log("= Register Create Reg Buffer : ipAddress - " + ipAddress);
    console.log("= Register Create Reg Buffer : userAgent - " + userAgent);
    console.log("= Register Create Reg Buffer : verify_code - " + verify_code);
    console.log("= Register Create Reg Buffer : secret_answer - " + secret_answer);
    console.log("= Register Create Reg Buffer : secret_question - " + secret_question);

    var sql = "INSERT INTO users (username, email, password, ip_address, user_agent, verify_code, secret_question, secret_answer, is_deleted ,created_at) VALUES($1, $2, $3, $4, $5, $6, $7, $8,false,now())";
    query(sql, [username, email, passwordHash.generate(password), ipAddress, userAgent, verify_code, secret_question, secret_answer], function(err, res)
    {
        if (err) return callback(err);

        callback(null);
    });
};

/**
 * delete user info into users table.
 * @author HWK
 */

exports.delRegBuffer = function(email, callback)
{
    sql = "DELETE FROM users WHERE lower(email)=lower($1) OR (DATE_PART('hour', now()-created_at)*60 + DATE_PART('minute', now()-created_at)) > 10";
    query(sql, [email], function(err)
    {
        if (err) return callback(err);

        callback(null);
    });
};

/**
 * check verify code.
 * @author HWK
 */
exports.checkVerifyCode = function(username, verify_code, callback)
{
    var sql = "SELECT DATE_PART('hour', now()-created_at)*60 + DATE_PART('minute', now()-created_at) AS min_diff, verifycode FROM users WHERE lower(username)=lower($1)";
    query(sql, [username], function(err, res)
    {
        if (err) return callback(err);
        if (res.rowCount != 1)
        {
            if (err) return callback(err);
            return callback("ILLEGAL_USER");
        }
        else
        {
            sql = "UPDATE users SET is_deleted = false WHERE lower(username)=lower($1)";
            query(sql, [username], function(err)
            {
                if (err) return callback(err);

                var nMin = res.rows[0].min_diff;
                var strVerifyCode = res.rows[0].verify_code;

                nMin = parseInt(nMin);
                if (nMin > 10)
                {
                    sql = "DELETE FROM users WHERE lower(username)=lower($1)";
                    query(sql, [username], function(err)
                    {
                        if (err) return callback(err);
                        return callback("EXCEED_MAX_MINUTE");
                    });
                }
                else
                {
                    if (strVerifyCode != verify_code)
                        return callback("VERIFY_CODE_MISMATCH");

                    return callback(null, res.rows[0]);
                }
            });
        }
    });
};

/**
 * update verifycode in users.
 * @author HWK
 */

function updateVerifyCode(email, strNewVerifyCode, callback) {
    sql = "UPDATE users SET verify_code = $1 WHERE email = $2";
    query(sql, [strNewVerifyCode, email], function(err) {

        if(err) return callback(err, false);
        return callback(null, true);
    });
}

exports.updateVerifyCode = updateVerifyCode;

/**
 * create session.
 * @author HWK
 */

function createSession( userId, ipAddress, userAgent, remember, callback) {
    var sessionId = uuid.v4();

    var expired = new Date();
    if (remember)
        expired.setDate(expired.getDate()+ 2);
    else
        expired.setDate(expired.getDate() + 1);

    query('INSERT INTO session(userid, ipaddress, useragent, created_at, expired_at , session_id) VALUES($1, $2, $3, now(), $4 , $5) RETURNING *',
        [userId, ipAddress, userAgent, expired , sessionId], function(err, res) {

        if (err) return callback(err);
        assert(res.rows.length === 1);

        var session = res.rows[0];
        assert(session.session_id);

        callback(null, session);
    });
}

exports.createSession = createSession;

/**
 * check validateUser.
 * @author HWK
 */

exports.validateUser = function(username, password, callback) {
    assert(username && password);

    console.log("==== Login validateUser : " + username + " ====");
    query('SELECT id, password FROM users WHERE (lower(username) = lower($1) OR lower(email) = lower($1)) AND is_deleted = false and verify = true', [username], function (err, data) {
        if (err) return callback(err);

        if (data.rows.length === 0)
            return callback('NO_USER');

        var user = data.rows[0];

        var verified = passwordHash.verify(password, user.password);
        if (!verified)
            return callback('WRONG_PASSWORD');

        callback(null, user.id);
    });
};

/**
 * get verifycode form users.
 * @author HWK
 */

exports.getVerifyCodeFromRegBuffer = function(username , password , strVerifyCode ,callback)
{
    assert(username && password);
    console.log("==== Login validateUser : " + username + " ====");

    var sql = 'SELECT verifycode FROM users WHERE (lower(username) = lower($1) OR lower(email) = lower($1)) AND is_deleted = false';
    query(sql, [username], function (err, data) {
        if (err) return callback(err);

        if (data.rows.length !== 1)
            return callback('NO_USER');

        var user = data.rows[0];

        var verified = passwordHash.verify(password, user.password);
        if (!verified)
            return callback('WRONG_PASSWORD');

        callback(null, user.verifycode);
    });
}

/**
 * get company mail.
 * @author HWK
 */

exports.getCompanyMail = function(callback)
{
    var sql = "select * from companyinfo";
    query(sql,[],function (error, result) {
      if(error)
      {
          return callback(error);
      }
      if(result.rowCount == 0)
          return callback("'don't exist");
      return callback(null , result.rows[0].companymail);
    });
}

/**
 * get company password.
 * @author HWK
 */

exports.getCompanyPassword = function (callback) {
  var sql = "select * from companyinfo";
  query(sql,[],function (error, result) {
    if(error)
    {
      return callback(error);
    }
    if(result.rowCount == 0)
      return callback("'don't exist");
    return callback(null , result.rows[0].password);
  });
}

/**
 * check verify code.
 * @author HWK
 */
exports.checkVerifyCode = function(username , email , strVerifyCode , callback)
{
    var sql = "select * from users where username = $1 and email = $2 and verify_code = $3";
    query(sql , [username , email , strVerifyCode] , function (error, result) {
      if(error){
          return callback(error);
      }
      if(result.rowCount == 0)
          return callback("Don't exist")
      sql = "update users set verify = true where email = $1 and username = $2";
      query(sql , [email ,username] , function (err, res) {
        if(err){
            return callback("Verify failed.");
        }
        return callback(null , "success");
      })
    });
}

/**
 * check email's exist
 * @author HWK
 * */

exports.checkEmailExist = function (email , callback)
{
    var sql = "select * from users where email = $1";
    query(sql , [email] , function (error, result) {
      if(error){
          return callback({status:"failed", msg:error});
      }
      if(result.rowCount == 0)
      {
          return callback({status:"failed", msg:"Doesn't exist."});
      }
      return callback(null, {status:"success", msg:"success"});
    })

}

/**
 * update password.
 * @author HWK
 * */

exports.updatePassword = function (email, newpassword, callback) {
    var sql = "update users set password = $1 where email = $2";
    query(sql , [passwordHash.generate(newpassword) , email] , function (error, result) {
      if(error){
          return callback({status:"failed", msg:error});
      }

      return callback(null , {status:"success",msg:'success'});
    })
}

/**
 * update password.
 * @author HWK
 * */
exports.createNewArticle = function(title, content, kind, callback){
    var sql = "insert into article (title, content, kind , created_at, state) values($1, $2, $3, now(),true)";
    query(sql, [title , content ,  kind] , function (error, result) {
      if(error)
          return callback(error);
    });
    return callback(null, "success");
}

/**
 * get data.
 * @author HWK
 * */
exports.getData = function (callback) {
  var sql = "select title, content, id , kind , to_char(created_at,'yyyy-mm-dd') as created_at from article";
  query(sql , [] , function (error, result) {
    if(error)
        return callback(error);
    return callback(null , result.rows);
  })
}

/**
 * get data by sessionID.
 * @author HWK
 * */

exports.getUserBySessionId = function(sessionId , callback)
{
  var sql = "select  users.*, session.expired_at as expires from users left join session on users.id = session.userid where session.session_id = $1 and expired_at > now()";
  query(sql , [sessionId] , function (error, result) {
    if(error){
        return callback(error);
    }
    sql = "select id, title, content, kind, to_char(created_at, 'yyyy-mm-dd') as created_at from article";
    query(sql , [] , function (err, res) {
      if(err)
        return callback(err);
      var info = {};
      info['user'] = result.rows[0];
      info['article'] = res.rows;
      return callback(null , info);
    });
  });

}

/**
 * get data by sessionID.
 * @author HWK
 * */
 exports.getNewsData = function(callback)
 {
    sql = "select id, title, content, kind, to_char(created_at, 'yyyy-mm-dd') as created_at from article";
    query(sql , [] , function (err, res) {
      if(err)
        return callback(err);
      return callback(null , res.rows);
    });
 }

/**
 * get data by userid.
 * @author HWK
 * */

exports.getArticleInfoByuerId = function(strUserId , callback)
{
    var sql = "select * from article where id = $1";
    query(sql , [strUserId] , function (error, result) {
      if(error)
          return callback(error);
      return callback(null , result.rows[0]);
    })
}

/**
 * update password.
 * @author HWK
 * */
exports.ModifyValues = function(id , title, content, kind, callback){
    var expiredate =  new Date();
  var sql = "update article set title = $1 , kind = $2  , content = $3  , created_at = $4  , state = $5 where id = $6";
  query(sql, [title , kind ,content, expiredate, true , id] , function (error, result) {
    if(error)
      return callback(error);
    return callback(null, "success");
  });
}

/**
 * logout.
 * @author HWK
 * */

exports.expireSessionByUserId = function (userId , callback) {
  var nowTime = new Date();
  query('UPDATE session SET expired_at= $1 WHERE userid = $2 AND expired_at> $3', [nowTime , userId , nowTime], function(err , res){
    if(err){
      return callback({status:"failed" , data:"DATABASE_ERROR"});
    }
    else
    {
      return callback({status:"success" , data:res});
    }
  });
}

/**
 * delete.
 * @author HWK
 * */

exports.deletenews = function (id, callback) {
  var sql = "delete from article where id = $1";
  query(sql , [id] , function (error, result) {
    if(error)
      return callback(error);
    return callback(null , result);
  });
}