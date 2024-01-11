require('dotenv').config();
const express = require("express");
const server = express();
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require('jsonwebtoken');
const session = require("express-session");
const passport = require("passport");
const cookieParser = require('cookie-parser');
const LocalStrategy = require("passport-local").Strategy;
const crypto = require("crypto");
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const path = require('path');

const productsRouter = require("./routes/Product");
const brandsRouter = require("./routes/Brand");
const categoriesRouter = require("./routes/Category");
const usersRouter = require("./routes/User");
const authRouter = require("./routes/Auth");
const cartRouter = require("./routes/Cart");
const orderRouter = require("./routes/Order");
const { User } = require("./model/User");
const { isAuth, sanitizeUser, cookieExtractor } = require("./services/Common");


// JWT options

const opts = {}
opts.jwtFromRequest = cookieExtractor;
opts.secretOrKey = process.env.JWT_SECRET_KEY;// shouldn't be in code


// middlewares
server.use(express.static(path.resolve(__dirname, 'build')));
server.use(cookieParser())
server.use(
  session({
    secret: process.env.SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: false,
  })
);
server.use(passport.authenticate("session"));
server.use(express.json()); // to parse req body
server.use(express.raw({type: 'application/json'}));
server.use(express.static("public"));
server.use(
  cors({
    exposedHeaders: ["X-Total-Count"],
  })
);
server.use("/products", isAuth(), productsRouter.router);
server.use("/brands", isAuth(),  brandsRouter.router);
server.use("/users", isAuth(), usersRouter.router);
server.use("/categories", isAuth(), categoriesRouter.router);
server.use("/auth", authRouter.router);
server.use("/cart", isAuth(), cartRouter.router);
server.use("/orders", isAuth(), orderRouter.router);
server.get('*', (req, res) => res.sendFile(path.resolve('build', 'index.html')));

// passport
passport.use('local',
  new LocalStrategy(
    {usernameField: 'email'},
    async function (email, password, done) {
    try {
      const user = await User.findOne({ email: email });
      console.log(email, password);
      if (!user) {
       return done(null, false, { message: "invalid credentials" });
      }

      crypto.pbkdf2(
        password,
        user.salt,
        310000,
        32,
        "sha256",
        async function (err, hashedPassword) {
          if (!crypto.timingSafeEqual(user.password, hashedPassword)) {
           return done(null, false, { message: "invalid credentials" });
          } 

          const token = jwt.sign(sanitizeUser(user),  process.env.JWT_SECRET_KEY);
          done(null, {token});
        }
      );
    } catch (err) {
      done(err);
    }
  })
);

passport.use('jwt', new JwtStrategy(opts,async function(jwt_payload, done) {
    console.log({jwt_payload});
    try{
        const user = await User.findById(jwt_payload.id);
        console.log(user);
        if (user) {
            return done(null, sanitizeUser(user)); // this calls serializer
        } else {
            return done(null, false);
            // or you could create a new account
        }
    } catch(err)
    {
        done(err);
    }
}));

passport.serializeUser(function (user, cb) {
  process.nextTick(function () {
    // console.log(user,"here", {id: user.id, role: user.role});
    return cb(null, user);
  });
});

passport.deserializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, user);
  });
});



const stripe = require("stripe")(process.env.STRIPE_SSERVER_KEY);



server.post("/create-payment-intent", async (req, res) => {
  const { totalAmount } = req.body;

  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount: totalAmount, // for decimal compensation
    currency: "inr",
    automatic_payment_methods: {
      enabled: true,
    },
  });

  res.send({
    clientSecret: paymentIntent.client_secret,
  });
});

// Webhook

// TODO: we will capture actual order after deploying out server live on public URL

// const endpointSecret = "whsec_0e1456a83b60b01b3133d4dbe06afa98f384c2837645c364ee0d5382f6fa3ca2";

// server.post('/webhook', express.raw({type: 'application/json'}), (request, response) => {
//   const sig = request.headers['stripe-signature'];

//   let event;

//   try {
//     event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
//   } catch (err) {
//     response.status(400).send(`Webhook Error: ${err.message}`);
//     return;
//   }

//   // Handle the event
//   switch (event.type) {
//     case 'payment_intent.succeeded':
//       const paymentIntentSucceeded = event.data.object;
//       console.log({paymentIntentSucceeded})
//       // Then define and call a function to handle the event payment_intent.succeeded
//       break;
//     // ... handle other event types
//     default:
//       console.log(`Unhandled event type ${event.type}`);
//   }

//   // Return a 200 response to acknowledge receipt of the event
//   response.send();
// });



// connect with db
main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect(process.env.MONGODB_URL);
  console.log("Database connect");
}

server.get("/", (req, res) => {
  res.json({ status: "success" });
});

server.listen(process.env.PORT, () => {
  console.log("server started");
});
