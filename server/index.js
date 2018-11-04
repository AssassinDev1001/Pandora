var fs              = require('fs');
var express         = require('express');
var http            = require('http');
var https           = require('https');
var constants       = require('constants');
var compression     = require('compression');
var path            = require('path');
var bodyParser      = require('body-parser');
var cookieParser    = require('cookie-parser');
var socketIO        = require('socket.io');
var ioCookieParser  = require('socket.io-cookie');
var debug           = require('debug')('app:index');
const fileUpload    = require('express-fileupload');
var app             = express();
var config          = require('../config/config');
var routes          = require('./routes');
var database        = require('./database');
var Chat            = require('./chat');
var lib             = require('./lib');
var i18n            = require('i18n-express');
var session         = require('express-session');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/** Render Engine
 *
 * Put here render engine global variable trough app.locals
 * **/
app.set('views', path.join(__dirname, '../views'));

app.locals.buildConfig = config.BUILD;

var dotCaching = true;
if (config.PRODUCTION === config.PRODUCTION_LOCAL_DEV) {
    app.locals.pretty = true;
    dotCaching = false;
}

app.engine('html', require('dot-emc').init(
    {
        app: app,
        fileExtension: 'html',
        options: {
            templateSettings: {
                cache: dotCaching
            }
        }
    }
).__express);

/** Middleware **/
app.use(bodyParser());
app.use(cookieParser());
app.use(compression());
app.use(fileUpload());

/** App settings **/
app.set('view engine', 'html');
app.disable('x-powered-by');
app.enable('trust proxy');

app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));

app.use(i18n({
    translationsPath: path.join(__dirname, '../i18n'), // <--- use here. Specify translations files path.
    siteLangs: ['en', 'ru'],
    textsVarName: 'translation'
}));

/** Serve Static cont **/
var twoWeeksInSeconds = 1209600;
if (config.PRODUCTION === config.PRODUCTION_SERVER_1 || config.PRODUCTION === config.PRODUCTION_SERVER_2) {
    app.use(express.static(path.join(__dirname, '../build'), { maxAge: twoWeeksInSeconds * 1000 }));
} else {
    app.use(express.static(path.join(__dirname, '../theme'), { maxAge: twoWeeksInSeconds * 1000 }));
    app.use('/node_modules', express.static(path.join(__dirname, '../node_modules')), { maxAge: twoWeeksInSeconds * 1000 });
}

/** Login middleware
 *
 * If the user is logged append the user object to the request
 */

app.use(function(req, res, next)
{
  var sessionId = req.cookies.id;
  if (!sessionId) {
    res.header('Vary', 'Accept, Accept-Encoding, Cookie');
    res.header('Cache-Control', 'public, max-age=60'); // Cache the logged-out version

    return next();

    // return res.redirect('/login');
  }

  res.header('Cache-Control', 'no-cache');
  res.header("Content-Security-Policy", "frame-ancestors 'none'");


  if (!lib.isUUIDv4(sessionId))
  {
    res.clearCookie('id');
    return next();
  }
  database.getUserBySessionId(sessionId, function(err, user)
  {
    if (err || user == 'failed')
    {
      res.clearCookie('id');
      if (err === 'NOT_VALID_SESSION')
      {
        return res.redirect('/' );
      }
      else
      {
        console.error('[INTERNAL_ERROR] Unable to get user by session id ' + sessionId + ':', err);
        return res.redirect('/error');
      }
    }
    // user.advice = req.query.m;
    // user.error = req.query.err;
    // user.eligible = lib.isEligibleForGiveAway(user.last_giveaway);
    // user.admin = user.userclass === 'admin';
    // user.moderator = user.userclass === 'admin' ||
    //                  user.userclass === 'moderator';
    req.user        = user.user;
    req.data        = user.article;
    // console.log(user);
    next();
  });
});

/** Error Middleware
 *
 * How to handle the errors:
 * If the error is a string: Send it to the client.
 * If the error is an actual: error print it to the server log.
 *
 * We do not use next() to avoid sending error logs to the client
 * so this should be the last middleware in express .
 */
function errorHandler (err, req, res, next) {
    if (err) {
        if (typeof err === 'string') {
            return res.render('error', { error: err });
        } else {
            if (err.stack) {
                console.error('[INTERNAL_ERROR] ', err.stack);
            } else console.error('[INTERNAL_ERROR', err);
            res.render('error');
        }
    } else {
        console.warning("A 'next()' call was made without arguments, if this an error or a msg to the client?");
    }
}

routes(app);
app.use(errorHandler);

/**  Server **/
var serverHttp = http.createServer(app);
serverHttp.listen(config.PORT_HTTP, function () {
    console.log('W: Listening on port ', config.PORT_HTTP, ' with HTTP');
    lib.log('success', 'W: Listening on port ', config.PORT_HTTP, ' with HTTP');
});
var server = serverHttp;

var serverHttps;
if (config.PRODUCTION === config.PRODUCTION_SERVER_1 || config.PRODUCTION === config.PRODUCTION_SERVER_2) {
    var options = {
        key: fs.readFileSync(config.HTTPS_KEY),
        cert: fs.readFileSync(config.HTTPS_CERT),
        secureProtocol: 'SSLv23_method',
        secureOptions: constants.SSL_OP_NO_SSLv3 | constants.SSL_OP_NO_SSLv2
    };

    if (config.HTTPS_CA) {
        options.ca = fs.readFileSync(config.HTTPS_CA);
    }

    serverHttps = https.createServer(options, app);
    serverHttps.listen(config.PORT_HTTPS, function () {
        console.log('W: Listening on port ', config.PORT_HTTPS, ' with HTTPS');
        lib.log('W: Listening on port ', config.PORT_HTTPS, ' with HTTPS');
    });

    server = serverHttps;
}

var io = socketIO(server); // Socket io must be after the lat app.use
io.use(ioCookieParser);

/** Socket io login middleware **/
io.use(function (socket, next) {
    debug('incoming socket connection');
    var sessionId = (socket.request.headers.cookie) ? socket.request.headers.cookie.id : null;

    // If no session id or wrong the user is a guest
    if (!sessionId || !lib.isUUIDv4(sessionId)) {
        socket.user = false;
        return next();
    }

  database.getUserBySessionId(sessionId, function(err, user)
  {
    if (err || user == 'failed')
    {
      res.clearCookie('id');
      if (err === 'NOT_VALID_SESSION')
      {
        return res.redirect('/' );
      }
      else
      {
        console.error('[INTERNAL_ERROR] Unable to get user by session id ' + sessionId + ':', err);
        return res.redirect('/error');
      }
    }
    // user.advice = req.query.m;
    // user.error = req.query.err;
    // user.eligible = lib.isEligibleForGiveAway(user.last_giveaway);
    // user.admin = user.userclass === 'admin';
    // user.moderator = user.userclass === 'admin' ||
    //                  user.userclass === 'moderator';
    req.user        = user.user;
    req.data        = user.article;
    console.log(user);
    next();
  });

});

var chatServer = new Chat(io);

/** Log uncaught exceptions and kill the application **/
process.on('uncaughtException', function (err) {
    console.error((new Date()).toUTCString() + ' uncaughtException:', err.message);
    console.error(err.stack);
    process.exit(1);
});
