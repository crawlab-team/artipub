import * as Result from "../utils/result";
import { Template } from "@/models";
import { Router } from "express";

const getTemplateList = async (req, res, next) => {
  const userId = req.user._id;
  const templates = await Template.find({ user: userId });
  return Result.success(res, templates);
};

const router = Router();

router.get("/list", getTemplateList);

export = { router, basePath: "/template" };
