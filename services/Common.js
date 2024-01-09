const passport = require('passport');

exports.isAuth = (req, res, done) => {
    return passport.authenticate('jwt');
};


exports.sanitizeUser = (user) => {
    return {id: user.id, role: user.role};
}

exports.cookieExtractor = function(req) {
    let token = null;
    if (req && req.cookies) {
        token = req.cookies['jwt'];
    }
   
    // token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1OWQ1ZjVhMmM1MTgyZTA4MWFjNTg3ZSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzA0ODEyNTc2fQ.t0_qfhehxNtFIVYrR0JrLTgK-2rYzowfzg3FUdVeuTw";
    return token;
  };