const jwt = require('jsonwebtoken');

function verifyStudentToken(req, res, next) {
    const authorization = req.header('Authorization');
    console.log('Authorization header', authorization);

    if (authorization == null) {
        console.log('No authorization information');
        res.sendStatus(401);
        return;
    }

    const token = authorization.split(' ')[1];
    console.log('Token', token);

    jwt.verify(token, process.env.SECRETKEY, (error, decoded)=>{
        if (error != null) {
            console.log('Cannot verify token');
            res.sendStatus(401);
            return;
        }

        const matriculationNumber = decoded.matriculationNumber;
        const name = decoded.name;
        console.log('matriculation number', matriculationNumber, 'name', name);
        req.matriculationNumber = matriculationNumber;
        req.name = name;

        next();
    });
}

module.exports = verifyStudentToken;
