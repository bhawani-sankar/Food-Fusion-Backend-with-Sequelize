import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import bcript from "bcryptjs";
import jwt from "jsonwebtoken";
import Razorpay from "razorpay";
import "./model/conn.mjs";
import { Address, food, foodOrder, sequelize, user } from "./model/conn.mjs";
import { authToken } from "./middleware/auth.mjs";


const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());

app.get("", (req, res) => {
  res.send("server live");
});

app.post("/v1/user/register", async (req, res) => {
  try {
    const { name, email, username, password } = req.body;
    const bpassword = await bcript.hash(password, 10);
    const result = await user.create({
      name,
      email,
      username,
      password: bpassword,
    });
    if (!result) {
      res
        .status(409)
        .json({ message: "duplicate resource or resource already exists" });
    } else {
      const payload = {
        id: result.id
      };
      jwt.sign(
        payload,
        process.env.jwtsecret,
        { expiresIn: "4h" },
        (err, token) => {
          if (err) {
            throw err;
          } else {
            res.status(201).json({ token });
          }
        }
      );
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "user not register" });
  }
});

  app.post("/v1/user/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const result = await user.findOne({where:{username}})
      console.log(result);
          if (!result || result =='') {
            res.status(401).json({message: "invalid credential" });
          } else {
            const isvalid = await bcript.compare(password, result.password);
            if (isvalid) {
              const payload = {
                id: result.id,
              };
              jwt.sign(
                payload,
                process.env.jwtsecret,
                { expiresIn: "4h" },
                (err, token) => {
                  if (err) {
                    throw err;
                  } else {
                    res.status(201).json({ status : 0 , token });
                  }
                }
              );
            } else {
              res.status(401).json({ status : 1 , message: "invalid credential" });
            }
          }
    } catch (e) {
        res.status(500).json({message: "internal server error" });
    }
  });

  app.get("/v1/user", authToken, async(req, res) => {
    const id = req.user.id;
    const result = await user.findOne({where:{id}})
      if (!result) {
        res.status("404").json({ message: "User not found" });
      } else {
        res.status(200).json({ result });
      }
  });

  app.get("/v1/foods", async(req, res) => {
    const result = await food.findAll()
      if (!result || result == '') {
        res.status(404).json({ message: "Food not found" });
      } else {
        res.status(200).json({ result });
      }
  });

  app.get("/v1/foods/:id",async(req, res) => {
    const id = req.params.id;
    console.log(id);
    const result = await food.findOne({where:{id}})
      if (!result || result =='') {
        res.status(404).json({ message: "Food not found" });
      } else {
        res.status(200).json({ result });
      }
  });
  
  app.post("/v1/payment", (req, res) => {
    const { price } = req.body;
    const instance = new Razorpay({
      key_id: process.env.Key_Id,
      key_secret: process.env.Key_Secret,
    });
    const options = {
      amount: price * 100,
      currency: "INR",
    };
    instance.orders.create(options, (err, order) => {
      if (err) {
        res.status(500).json({ message: "server error" });
      } else {
        res.status(200).json({ order });
      }
    });
  });

  app.post("/v1/food/order", async(req, res) => {
    const {
      order_id,
      name,
      username,
      payment_id,
      product_id,
      quantity,
      phone,
      pincode,
      locality,
      address,
      city,
      state,
      signature,
    } = req.body;
    const result = await foodOrder.create({order_id,name,username,payment_id,product_id,quantity,phone,pincode,locality,address,city,state,signature,})
        if (!result) {
          res.status(500).json({ message: "server error" });
        } else {
          res.status(201).json({ result });
        }
  });

  app.get("/v1/food/byname",async(req,res)=>{
    const name= req.query.q
    const [result] = await sequelize.query("SELECT * FROM food WHERE type LIKE ? OR FIND_IN_SET(?, type)",{replacements:[name+'%',name]})
      if(!result || result == ''){
        res.status(404).json({ message: "Food not found" });
      }
      else{
        res.status(200).json({result})
      }
})

app.post("/v1/add/address",async(req,res)=>{
  const {username,name,phone,pincode,locality,address,city,state} = req.body;
  const data = await Address.findOne({where:{username,name,phone,pincode,locality,address,city,state}})
    if(data){
      if(data.username == username && data.name == name && data.phone == phone && data.pincode == pincode && data.locality == locality && data.address == address && data.city == city && data.state == state){
        res.status(403).json({message:"already Present"})
      }
      else{
        const result = await Address.create({username,name,phone,pincode,locality,address,city,state})
          if (!result) {
            res.status(500).json({ message: "server error" });
          } else {
            res.status(201).json({ result });
          }
      }
    }
    else{
      const result = await Address.create({username,name,phone,pincode,locality,address,city,state})
      if (!result) {
        res.status(500).json({ message: "server error" });
      } else {
        res.status(201).json({ result });
      }
    }
})

app.get("/v1/get/address",async(req,res)=>{
  const username=req.query.q
  const result = await Address.findAll({where:{username}})
    if(!result || result ==''){
      res.status(404).json({message:"No such Order"})
    }
    else{
      res.status(200).json({result})
    }
})

app.get("/v1/food/orders",async(req,res)=>{
  const username=req.query.q
  const result = await foodOrder.findAll({where:{username},include:food})
    if(!result || result ==''){
      res.status(404).json({message:"No such Order"})
    }
    else{
      res.status(200).json({result})
    }
})

  app.post("/v1/food/register",async(req, res) => {
    const { name, brand, location, price, img, img1, img2, img3, img4,type } =
      req.body;
    const result= await food.create({name, brand, location, price, img, img1, img2, img3, img4,type})
        if (!result) {
          res.send(err);
        } else {
          console.log(result);
          res.send(result);
        }
  });

// app.listen(port, () => {
//   console.log(`server run at http://localhost:${port}`);
// });
expo
