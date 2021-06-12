//配置
require("dotenv").config({
  path: process.env.NODE_ENV === "production" ? 'src/config/.env.prod' : 'src/config/.env',
});
import express = require("express");
import cookieParser = require("cookie-parser");
import morgan = require("morgan");
import passport = require("passport");
import expressJwt = require("express-jwt");
import mongoose = require("mongoose");
import * as fs from "fs";
import * as path from "path";

import init from "./init";
import config, { SECRET, TOKEN } from "./config";
import exec from "./exec";
import logger from "./logger";

const { ObjectId } = require("bson");
// express实例
const app = express();

app.use(
  express.json({
    limit: "5mb",
  })
);
app.use(
  express.urlencoded({
    limit: "5mb",
    extended: true, //需明确设置
  })
);
app.use(cookieParser());

app.use(passport.initialize());

// 日志中间件
app.use(morgan("dev"));

// 跨域cors
app.use("*", function (req, res, next) {
  res.header("Access-Control-Allow-Origin", req.headers.origin);
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Content-Length, Authorization, Accept, X-Requested-With"
  );
  res.header("Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, OPTIONS"); //设置方法
  if (req.method === "OPTIONS") {
    res.sendStatus(200); // 意思是，在正常的请求之前，会发送一个验证，是否可以请求。
  } else {
    next();
  }
});

app.use(
  expressJwt({
    secret: SECRET,
    algorithms: ["HS256"],
    getToken: function fromCookies(req, res) {
      return req.cookies[TOKEN];
    },
  }).unless({ path: ["/users/login", "/users/signup"] }),
  (req, res, next) => {
    //@ts-ignore
    if (req?.user?.id) {
      //@ts-ignore
      req.user._id = ObjectId(req.user.id);
    }
    next();
  }
);

// 路由
fs.readdirSync(path.resolve(__dirname, "./routes"))
  .filter((file) => !file.endsWith(".map"))
  .forEach((file) => {
    const router = require(`./routes/${file}`);
    app.use(router.basePath, router.router);
  });

app.use("*", (req, res, next) => {
  res.json({ error: "url不存在" });
});

app.use((err, req, res, next) => {
  if (err) {
    const status = err.status || 500;
    res.status(status).json({
      code: -1,
      error: err || "系统未知异常，请联系管理页",
    });
  }
});

// 启动express server
app.listen(config.PORT, () => {
  logger.info("listening on port " + config.PORT);
});

// 初始化
init();

// 启动执行器
const runner = new exec.Runner();
runner.run();
