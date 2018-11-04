/**
 * created : 2018-07-28
 * author : HWK
 * description : router.js
 */

var lib = require('./lib');
var user = require('./user');
var database = require('./database');

function staticPageLogged (page, loggedGoTo) {
    return function (req, res) {
        var user = req.user;
        var data = req.data;
        if (!user) {
            if (page === 'register') {
                req.i18n_lang = 'en';
                return res.render('register');
            }
            else if(page == 'details')
            {
             var newsid = req.query.id;
             database.getNewsData(function(error , data){
                if(error){
                    res.status(404);
                    res.render('404');
                }
                return res.render('details',{id:newsid, flag : 0, data:data});
             });
            }
            else if(page == 'newpassword'){
                var email;
                email = req.query.email;
                return res.render('newpassword',{email:email , flag:0});
            }
            else if(page == 'forgot'){
                return res.render('forgot');
            }
            else{
              return res.render('register');
            }
        }
      else{
          if(page == 'modifynews'){
            var a_id = req.query.id;
            var a_title = req.query.title;
            var a_content = req.query.content;
            var a_kind = req.query.kind;

            return res.render('modifynews', {data:loggedGoTo, id:a_id , title:a_title , content:a_content , kind : a_kind});
          }

          if(page == 'details')
          {
            var newsid = req.query.id;
            return res.render('details',{id:newsid, flag : 1, data:data});
          }

          if(page == 'register'){
            return res.render('home',{flag:1,data:data});

          }
          if (loggedGoTo) return res.redirect(loggedGoTo);

          return res.render(page, { user: user , flag:1, data:data});
        }
    };
};

function restrict (req, res, next) {
    if (!req.user) {
        res.status(401);
        if (req.header('Accept') === 'text/plain') { res.send('Not authorized'); } else { res.render('401'); }
    } else { next(); }
};

module.exports = function (app) {
    app.get('/', user.index);
    app.get('/forgotpassword' , staticPageLogged('forgot'));
    app.get('/newpassword' , staticPageLogged('newpassword'));
    app.get('/register', staticPageLogged('register', '/register'));
    app.get('/verify', staticPageLogged('verify'));
    app.get('/register/:ref_id', staticPageLogged('register', '/play'));
    app.get('/login', staticPageLogged('login', '/play'));
    app.get('/faq_en', staticPageLogged('faq_en'));
    app.get('/faq_zh', staticPageLogged('faq_zh'));
    app.get('/postArticle', staticPageLogged('postArticle'));
    app.get('/showDetail', staticPageLogged('details'));
    app.get('/ModifyNews', staticPageLogged('modifynews'));
    app.get('/logout' , user.logout);


    app.get('/no_user', staticPageLogged('profile_no_user'));
    app.get('/no_user_msg', staticPageLogged('profile_no_user_msg'));
    app.post('/login', user.login);
    app.post('/recapture' , user.recapture);
    app.post('/forgotpassword',user.forgotpassword);
    app.post('/newpassword' , user.newpassword);
    app.post('/create', user.createNewArticle);
    app.post('/register', user.register);
    app.post('/register-verify', user.registerVerify);
    app.post('/resendRegisterVerifyCode', user.resendRegisterVerifyCode);
    app.post('/sendVerify', user.checkVerifyCode);
    app.post('/ModifyNews' , user.ModifyNews);
    app.post('/ModifyValues' , user.ModifyValues);
    app.post('/logout',  user.logout);
    app.post('/deletenews' , user.deletenews);
    app.get('/error', function (req, res, next)
    {
      return res.render('error');
    });

    app.get('*', function (req, res) {
        res.status(404);
        res.render('404');
    });

    app.post('/setLanguage', function (req, res, next) {
        var current_url = req.body.current_url;
        var language_code = req.body.language_code;

        if (current_url.includes('faq')) {
            current_url = current_url.replace(/en/g, language_code);
            current_url = current_url.replace(/ru/g, language_code);
        } else {
            if (current_url.includes('clang')) {
                current_url = current_url.replace('clang=en', 'clang=' + language_code);
                current_url = current_url.replace('clang=ru', 'clang=' + language_code);
            } else if (current_url.includes('?')) {
                current_url = current_url + '&clang=' + language_code;
            } else {
                current_url = current_url + '?clang=' + language_code;
            }
        }
        res.redirect(current_url);
    });

};
