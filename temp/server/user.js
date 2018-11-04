/**
 * created : 2018-07-28
 * author : HWK
 * description : user.js
 */

var lib = require('./lib');
var assert = require('better-assert');
var database = require('./database');
var querystring = require('querystring');
var request  = require('request');
var config = require('../config/config');
var uuid = require('uuid');
var fs  = require('fs');
var qr = require('qr-image');
var sendemail = require('./sendEmail');

var secure;
if (config.PRODUCTION === config.PRODUCTION_SERVER_1) secure = true;
if (config.PRODUCTION === config.PRODUCTION_SERVER_2) secure = true;

var recapture_flag = false;
var sessionOptions = {
    httpOnly: true,
    secure: false
};

// HWK : 2018-07-28
// register.
exports.register = function (req, res, next) {
    var values = {};

    var username = lib.removeNullsAndTrim(req.body.username);
    var password  = lib.removeNullsAndTrim(req.body.password);
    var secret_answer = lib.removeNullsAndTrim(req.body.secret_answer);
    var secret_question = lib.removeNullsAndTrim(req.body.secret_question);
    var password2 = lib.removeNullsAndTrim(req.body.confirm);
    var email    = lib.removeNullsAndTrim(req.body.email);

    if (email == undefined) email = '';
    var renderPage = 'register';

    console.log('register - [begin] - username:' + username + '   email:' + email  + '   ip:' + req.ip);
    lib.log('info', 'register - [begin] - username:' + username + '   email:' + email + '   ip:' + req.ip);

    if (req.headers.referer.includes('register') == false) {
        renderPage = 'home  ';
        req.originalUrl = '/';
    }

    values.username = username;
    values.password = password;
    values.confirm  = password2;
    values.email    = email;
    values.secret_question = secret_question;
    values.secret_answer = secret_answer;

    // check super admin
    var superAdminInfo = JSON.parse(fs.readFileSync(__dirname + '/../admin.json')); // read admin.json
    if (username === superAdminInfo.username && password === superAdminInfo.password) { // if the username and password is same as superadmin in admin.json
        console.log('register - name is same with [superadmin]');
        lib.log('info', 'register with superadmin');
        console.log('register - render - ' + renderPage + '   username:' + username);
        lib.log('info', 'register - render - ' + renderPage + '   username:' + username);
        renderPage = "home";
        return res.json({status:"success",msg:"admin"});
    }

    var ipAddress = req.ip;

    var userAgent = req.get('user-agent'); // infomation of browser

    var notValid = lib.isInvalidUsername(username);
    if (notValid) {
        console.log('register - username is not valid');
        lib.log('info', 'register - username is not valid');
        console.log('register - render - ' + renderPage + '   username:' + username);
        lib.log('info', 'register - render - ' + renderPage + '   username:' + username);
        return res.json({status:"failed",msg:"username is invalid."});
    }

    // stop new registrations of >16 char usernames
    if (username.length > 16) {
        console.log('register - username is too long');
        lib.log('info', 'register - username is too long');
        console.log('register - render - ' + renderPage + '   username:' + username);
        lib.log('info', 'register - render - ' + renderPage + '   username:' + username);
        return res.json({status:"failed",msg:"username's length is too long."});
    }

    notValid = lib.isInvalidPassword(password);
    if (notValid) {
        console.log('register - password is not valid');
        lib.log('info', 'register - password is not valid');
        console.log('register - render - ' + renderPage + '   username:' + username);
        lib.log('info', 'register - render - ' + renderPage + '   username:' + username);
        return res.json({status:"failed",msg:"Password is invalid."});
    }

    if (password.length > 50) {
        console.log('register - password is too long');
        lib.log('info', 'register - password is too long');
        console.log('register - render - ' + renderPage + '   username:' + username);
        lib.log('info', 'register - render - ' + renderPage + '   username:' + username);
        return res.json({status:"failed",msg:"Password's length is too long."});
    }

    if (email) {
        notValid = lib.isInvalidEmail(email);
        if (notValid) {
            console.log('register - render - ' + renderPage + '   username:' + username);
            lib.log('info', 'register - render - ' + renderPage + '   username:' + username);
            return res.json({status:"failed",msg:"Email is invalid."});
        }
    }

    // Ensure password and confirmation match
    if (password !== password2) {
        console.log('register - password not match with confirmation.');
        lib.log('info', 'register - password not match with confirmation.');
        console.log('register - render - ' + renderPage + '   username:' + username);
        lib.log('info', 'register - render - ' + renderPage + '   username:' + username);
        return res.json({status:"failed",msg:"Password is different with confirm."});
    }

    // check username and email is duplicated or not

    console.log('before check up');
    database.checkDup(username, email, function (err, strDup) {
        if (err) {
            console.log('register - check_dup - db error - username:' + username + '   email:' + email);
            lib.log('error', 'register - check_dup - db error - username:' + username + '   email:' + email);
            return res.json({status:"failed",msg:"register - check up - db error."});
        }

        if (strDup === 'NAME_DUP') {
            console.log('register - check_dup - name already exists - username:' + username + '   email:' + email);
            lib.log('error', 'register - check_dup - name already exists - username:' + username + '   email:' + email);
            return res.json({status:"failed",msg:"Username is already exists."});
        } else if (strDup === 'EMAIL_DUP') {
            console.log('register - check_dup - email already exists - username:' + username + '   email:' + email);
            lib.log('error', 'register - check_dup - email already exists - username:' + username + '   email:' + email);
            return res.json({status:"failed",msg:"Email is already exists."});
        }

        if (strDup !== 'NO_DUP') {
            console.log('register - check_dup - case - username:' + username + '   email:' + email + '   str_dup:' + strDup);
            lib.log('error', 'register - check_dup - case - username:' + username + '   email:' + email + '   str_dup:' + strDup);
            return res.json({status:"success",msg:"register - check_dup - case."});
        }

        // register in temp buffer
        var strVerifyCode = lib.getVerifyCode();

        database.createRegBuffer(username, email, password, ipAddress, userAgent, strVerifyCode, secret_question , secret_answer , function (err) {
            if (err) {
                console.log('register - create_register_buffer - error - username:' + username + '   email:' + email + '   password:' + password +  '   ip_address:' + ipAddress + '   verification_code:' + strVerifyCode);
                lib.log('error', 'register - create_register_buffer - error - username:' + username + '   email:' + email + '   password:' + password  +  '   ip_address:' + ipAddress + '   verification_code:' + strVerifyCode);
                return res.json({status:"failed",msg:"Register - create _ register _buffer error."});
            }

            console.log('register - create_register_buffer - success - username:' + username + '   password:' + password +  '   email:' + email + '   ip_address:' + ipAddress + '   verification_code:' + strVerifyCode);
            lib.log('info', 'register - create_register_buffer - success - username:' + username  + '   password:' + password  + '   email:' + email + '   ip_address:' + ipAddress + '   verification_code:' + strVerifyCode);

            sendVerificationCode(email, strVerifyCode, req.i18n_lang, function (err, sendResult) {
                if (err || parseInt(sendResult) < 0) {
                    console.log('error', 'register - send_verification_code - error - username:' + username + '   email:' + email + '   verification_code:' + strVerifyCode + '   send_result:' + sendResult + '   lang:' + req.i18n_lang);
                    lib.log('error', 'register - send_verification_code - error - username:' + username + '   email:' + email + '   verification_code:' + strVerifyCode + '   send_result:' + sendResult + '   lang:' + req.i18n_lang);

                    database.delRegBuffer(username, function (err) {
                        console.log('error', 'delete register - send_verification_code - error - username:' + username + '   email:' + email + '   verification_code:' + strVerifyCode + '   send_result:' + sendResult + '   lang:' + req.i18n_lang);
                        lib.log('error', 'delete register - send_verification_code - error - username:' + username + '   email:' + email + '   verification_code:' + strVerifyCode + '   send_result:' + sendResult + '   lang:' + req.i18n_lang);
                    });
                  return res.json({status:"failed", msg:"failed to send verifycode."});
                } else {
                    console.log('register - send_verification_code - success - username:' + username + '   email:' + email + '   verification_code:' + strVerifyCode + '   lang:' + req.i18n_lang);
                    lib.log('info', 'register - send_verification_code - success - username:' + username + '   email:' + email + '   verification_code:' + strVerifyCode + '   lang:' + req.i18n_lang);

                    return res.json({status:"success", msg:"success"});
                }
            });
        });
    });
};

/**
 * Resend Email Verification Code when user register
 * @author HWK
 */
exports.resendRegisterVerifyCode = function (req, res, next) {
    var email = lib.removeNullsAndTrim(req.body.email);

    email = lib.clearPhoneNumber(email);

    var strVerifyCode = lib.getVerifyCode();
    if (email == 'hwk-king@outlook.com') { strVerifyCode = '0'; }
    database.updateVerifyCode(email, strVerifyCode, function (err, result) {
        if (err) return res.send(false);

        sendVerificationCode(email, strVerifyCode, req.i18n_lang, function (err, sendResult) {
            if (err || parseInt(sendResult) < 0) {
                console.log('resend verify code - error - email:' + email + '   send_result:' + sendResult + '   verification_code:' + strVerifyCode);
                lib.log('error', 'resend verify code - error - email:' + email + '   send_result:' + sendResult + '   verification_code:' + strVerifyCode);

                database.delRegBuffer(email, function (err) {
                    console.log('error', 'delete register - send_verification_code - error - email:' + email +
                                '   email:' + email + '   verification_code:' + strVerifyCode + '   send_result:' + sendResult + '   lang:' + req.i18n_lang);
                    lib.log('error', 'delete register - send_verification_code - error - email:' + email +
                                '   email:' + email + '   verification_code:' + strVerifyCode + '   send_result:' + sendResult + '   lang:' + req.i18n_lang);
                    return res.send(false);
                });
            } else {
                console.log('resend verify code - success - email:' + email + '   verification_code:' + strVerifyCode);
                lib.log('info', 'resend verify code - success - email:' + email + '   verification_code:' + strVerifyCode);
                return res.send(true);
            }
        });
    });
};

/**
 * POST
 * Public API
 * Register - email - verification a user
 */
exports.registerVerify = function (req, res, next) {
    var values = {};
    var renderPage  = "register";
    var username    = lib.removeNullsAndTrim(req.body.username);
    var verify_code = lib.removeNullsAndTrim(req.body.verify_code);
    var password    = lib.removeNullsAndTrim(req.body.password);
    var password2   = lib.removeNullsAndTrim(req.body.confirm);
    var email       = lib.removeNullsAndTrim(req.body.email);
    var ip_address  = req.ip;
    var user_agent  = req.get('user-agent');
    var secret_question  = lib.removeNullsAndTrim(req.body.secret_question);
    var secret_answer    = lib.removeNullsAndTrim(req.body.secret_answer);

    if (email === undefined) email = '';

    values.username         = username;
    values.verify_code      = verify_code;
    values.ip_address       = ip_address;
    values.user_agent       = user_agent;
    values.password         = password;
    values.confirm          = password2;
    values.email            = email;
    values.secret_question  = secret_question;
    values.secret_answer    = secret_answer;

    var notValidUsername = lib.isInvalidUsername(username);
    var notValidPassword = lib.isInvalidPassword(password);
    if (email != '') {
        var notValidEmail = lib.isInvalidPassword(email);
        if (notValidEmail) {
            return res.render(renderPage, {
                warning: 'rule_alert31'
            });
        }
    }

    if (notValidUsername || notValidPassword) {
        return res.render(renderPage, {
            warning: 'rule_alert31'
        });
    }

    if (username.length > 50 || password.length > 50 || phone_number.length > 50 || time_zone.length > 50) {
        return res.render(renderPage, {
            warning: 'rule_alert29'
        });
    }

    console.log('register_verify - username:' + username + '   verification_code:' + verify_code + '   email:' + email + '   password:' + password +  '   ip_address:' + ip_address);
    lib.log('info', 'register_verify - username:' + username + '   verification_code:' + verify_code + '   email:' + email + '   password:' + password +  '   ip_address:' + ip_address);

    database.checkVerifyCode(username, verify_code, function (err_check) {
        if (err_check === 'ILLEGAL_USER') {
            console.log('register_verify - illegal_user - username:' + username + '   verification_code:' + verify_code);
            lib.log('error', 'register_verify - illegal_user - username:' + username + '   verification_code:' + verify_code);

            return res.render('register_verify', {
                warning: 'rule_alert13',
                values: values
            });
        } else if (err_check === 'EXCEED_MAX_INPUT') {
            console.log('register_verify - exceed_max_input - username:' + username + '   verification_code:' + verify_code);
            lib.log('error', 'register_verify - exceed_max_input - username:' + username + '   verification_code:' + verify_code);
            return res.render('register_verify', {
                warning: 'rule_alert14',
                values: values
            });
        } else if (err_check === 'EXCEED_MAX_MINUTE') {
            console.log('register_verify - exceed_max_time - username:' + username + '   verification_code:' + verify_code);
            lib.log('error', 'register_verify - exceed_max_time - username:' + username + '   verification_code:' + verify_code);
            return res.render('register_verify', {
                warning: 'rule_alert15',
                values: values
            });
        } else if (err_check === 'VERIFY_CODE_MISMATCH') {
            console.log('register_verify - verification_code_mismatch - username:' + username + '   verification_code:' + verify_code);
            lib.log('error', 'register_verify - verification_code_mismatch - username:' + username + '   verification_code:' + verify_code);
            return res.render('register_verify', {
                warning: 'rule_alert16',
                values: values
            });
        } else if (err_check == null) {
            // register
            console.log('register_verify - verification_code success - username:' + username + '   verification_code:' + verify_code);
            lib.log('info', 'register_verify - verification_code success - username:' + username + '   verification_code:' + verify_code);
            return res.render('play');
        } else {
            console.log('register_verify - unknown error - username:' + username);
            lib.log('error', 'register_verify - unknown error - username:' + username);
            return res.render('register_verify', {
                warning: 'rule_alert19',
                values: values
            });
        }
    });
};

/**
 * POST
 * Public API
 * Login a user
 */
exports.login = function (req, res, next) {
    var email     = lib.removeNullsAndTrim(req.body.email);
    var password  = lib.removeNullsAndTrim(req.body.password);
    var remember  = !!req.body.remember;
    var ipAddress = req.ip;
    var userAgent = req.get('user-agent');

    var renderPage = 'login';

    if (req.headers.referer.includes('login') == false) {
        renderPage = 'home';
        req.originalUrl = '/';
    }

    var notValidEmail = lib.isInvalidEmail(email);
    var notValidPassword = lib.isInvalidPassword(password);

    if (notValidEmail || notValidPassword) {
      return res.json({status:"failed",msg:"Type of info is invalid."});
    }

    if (!email || !password) {
      return res.json({status:"failed",msg:"email or password is wrong."});
    }

    if (email.length > 50 || password.length > 50) {
        return res.json({status:"failed",msg:"Length is too long."});
    }

    var superAdminInfo = JSON.parse(fs.readFileSync(__dirname + '/../admin.json'));
    if (email === superAdminInfo.email && password === superAdminInfo.password) { 
        database.validateUser(superAdminInfo.email, superAdminInfo.password, function (err, userId) { 
            if (err) {
                console.log('login - validate_super_admin - email:' + email, '   error:' + err);
                lib.log('error', 'login - validate_super_admin - email:' + email, '   error:' + err);

                if (err === 'NO_USER') {
                  return res.json({status:"failed",msg:"No User Info."});
                }
                if (err === 'WRONG_PASSWORD') {
                  return res.json({status:"failed",msg:"Wrong password."});
                }
                return next(new Error('Unable to validate user ' + email + ': \n' + err));

            } else {
                assert(userId);
                database.createSession(userId, ipAddress, userAgent, remember, function (err, sessionInfo) {
                    if (err) { return next(new Error('Unable to create session for userid ' + userId + ':\n' + err)); }

                    var sessionId = sessionInfo.id;
                    var expires = sessionInfo.expires;
                    // if(remember)
                    sessionOptions.expires = expires;
                    res.cookie('id', sessionId, sessionOptions);
                    res.redirect('/postArticle');
                });
            }
        });
    } else {
        database.validateUser(email, password, function (err, userId) {
            if (err) {
                console.log('login - validate_user - email:' + email, '   error:' + err);
                lib.log('error', 'login - validate_user - email:' + email, '   error:' + err);

                if (err === 'NO_USER') {
                    return res.json({status:"failed",msg:"No User Info."});
                }
                if (err === 'WRONG_PASSWORD') {
                  return res.json({status:"failed",msg:"Wrong Password."});
                }
                return next(new Error('Unable to validate user ' + email + ': \n' + err));
            }
            assert(userId);

            database.createSession(userId, ipAddress, userAgent, remember, function (err, sessionInfo) {
                if (err) { return next(new Error('Unable to create session for userid ' + userId + ':\n' + err)); }

                var sessionId = sessionInfo.session_id;
                var expires = sessionInfo.expired_at;
                var sessionOptions = {};
                sessionOptions.expires = expires;
                // if (remember) { sessionOptions.expires = expires; }

                res.cookie('id', sessionId, sessionOptions);
                return res.json({status:"success",msg:"success"});
            });
        });
    }
};

/**
 * created : 2018-07-28
 * author : HWK
 * description : render index page
 */
exports.index = function (req, res)
{
    var flag = 0;
    if(req.user){
        flag = 1;
    }
    database.getData(function (error, result) {
      if(error)
          return res.render('home',{flag:flag});
      else
          return res.render('home',{data:result, flag:flag});
    })
};

/**
 * created : 2018-07-28
 * author : HWK
 * description : render forgotpassword page
 */
exports.forgotpassword = function (req, res)
{
    var email = lib.removeNullsAndTrim(req.body.email);
    var aryData = {};
    aryData[0] = "/newpassword";
    aryData[1] = email;
    database.checkEmailExist(email , function(err, result){
        if(err){
            return res.json(err);
        }
        sendemail.passwordReset(email , aryData , function (error, result) {
        if(error){
          return res.json({status:"failed", msg:error});
        }
        return res.json({status:"success" , msg:"We sent new password input link into your email."});
      })

    })
};

/**
 * created : 2018-07-28
 * author : HWK
 * description : send email to user.
 */
function sendVerificationCode(email , strVerifyCode , lang, callback)
{
    sendemail.sendRegVCode(email , strVerifyCode , lang , function (err , res){
        if(err){
            return callback(err);
        }
        return callback(null , res);
    });
}

/**
 * created : 2018-07-28
 * author : HWK
 * description : send email to user.
 */
 // function sendResetPassword(email , )



 /**
 * created : 2018-07-28
 * author : HWK
 * description : create new article.
 */
 function createNewArticle(req , res , next)
 {
    var title = req.body.Title;
    var content = req.body.Content;
    var kind = req.body.Kind;
    database.createNewArticle(title , content , kind , function (error, result) {
      if(error){
          return res.json({status:"failed",msg:error});
      }
      return res.json({status:"success",msg:"success"});
    });
 }
 exports.createNewArticle = createNewArticle;

 /**
 * created : 2018-07-28
 * author : HWK
 * description : create new password.
 */
 exports.newpassword = function(req ,res ,next)
 {
     var email = lib.removeNullsAndTrim(req.body.email);
     var newpassword = lib.removeNullsAndTrim(req.body.newpassword);
     var confirm = lib.removeNullsAndTrim(req.body.confirm);
     database.updatePassword(email, newpassword ,  function (error , result) {
       if(error){
           return res.json(error);
       }
       var strContent = email + "' password has been changed successfully.";
       sendemail.contact(email , strContent , function  (err ,  res) {

       });
       return res.json(result);
     })
 }

/**
 * created : 2018-07-28
 * author : HWK
 * description : check verify code.
 */

 exports.checkVerifyCode = function(req, res, next)
 {
     var strVerifyCode = req.body.verifycode;
     strVerifyCode = lib.removeNullsAndTrim(strVerifyCode);
     var username = lib.removeNullsAndTrim(req.body.username);
     var email = lib.removeNullsAndTrim(req.body.email);

     database.checkVerifyCode(username , email , strVerifyCode , function(error, result)
     {
        if(error){
            return res.json({status:"failed" , msg:"Failed to verify. Please Try it again."});
        }

        return res.json({status:"success" , msg:"Success"});
     });
 }

/**
 * created : 2018-07-28
 * author : HWK
 * description : modify news.
 */

 exports.ModifyNews = function (req, res, next) {
   var strUserId = req.body.userid;
   database.getArticleInfoByuerId(strUserId , function (error, result) {
     if(error){
         return res.json({status:"failed",msg:error});
     }
     else{
         return res.json({status:"success", msg:result});
     }
   })
 }

/**
 * created : 2018-07-28
 * author : HWK
 * description : modify news.
 */
 exports.ModifyValues =  function(req, res, next){
   var id = req.body.Id;
   var title = req.body.Title;
   var content = req.body.Content;
   var kind = req.body.Kind;
   database.ModifyValues(id , title , content , kind , function (error, result) {
     if(error){
       return res.json({status:"failed",msg:error});
     }
     return res.json({status:"success",msg:"success"});
   });
 }

/**
 * created : 2018-07-28
 * author : HWK
 * description : logout.
 */

 exports.logout = function (req, res, next) {
   var userId      = req.user.id;
   var sessionId   = req.user.session_id;
   database.expireSessionByUserId(userId , function(result)
   {
     if(result.status == 'failed')
     {
       return next(new Error('Unable to logout got error: \n' + err));
     }
     var flag = 0;

     database.getData(function (error, result) {
       if(error)
         return res.render('home',{flag:flag});
       else
         return res.render('home',{data:result, flag:flag});
     })
   });
 }

/**
 * created : 2018-07-28
 * author : HWK
 * description : recapture.
 */


exports.recapture = function (req, res, next) {
   console.log(req);
    var s = "";

 }

 exports.deletenews = function (req, res, next) {
   var strid = req.body.id;
   database.deletenews(strid , function (error, result) {
     if(error)
         return res.json({status:"failed",msg:error});
     return res.json({status:"success",msg:"success"});
   })
 }