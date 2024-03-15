import { Sequelize, DataTypes } from "sequelize";
import mysql2 from "mysql2";
import 'dotenv/config'

export const sequelize = new Sequelize(process.env.database, process.env.user, process.env.password, {
  host: process.env.host,
  dialect: "mysql",
  dialectModule: mysql2,
  port:28534
});

 export const user = sequelize.define('user',{
  name: {
    type: DataTypes.STRING,
    allowNoll: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNoll: false,
    unique: true,
    validate: {
      isEmail: true
    },
  },
  username: {
    type: DataTypes.STRING,
    allowNoll: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNoll: false,
  },
},{
    timestamps:false
});

export const food= sequelize.define('food',{
    name:{
        type:DataTypes.STRING,
        allowNoll:false
    }, 
    brand:{
        type:DataTypes.STRING,
        allowNoll:false
    }, 
    location:{
        type:DataTypes.STRING,
        allowNoll:false
    }, 
    price:{
        type:DataTypes.DECIMAL(10, 2),
        allowNoll:false
    }, 
    img:{
        type:DataTypes.STRING
    }, 
    img1:{
        type:DataTypes.STRING
    }, 
    img2:{
        type:DataTypes.STRING
    }, 
    img3:{
        type:DataTypes.STRING
    }, 
    img4:{
        type:DataTypes.STRING
    },
    type:{
        type:DataTypes.STRING
    }
},{
    timestamps:false
})

export const foodOrder= sequelize.define('food_order',{
    order_id:{
        type:DataTypes.STRING,
        primaryKey:true,
        unique:true
    },
    name:{
        type:DataTypes.STRING
    },
    username:{
        type:DataTypes.STRING
    },
    payment_id:{
        type:DataTypes.STRING
    },
    quantity:{
        type:DataTypes.INTEGER
    },
    phone:{
        type:DataTypes.BIGINT
    },
    pincode:{
        type:DataTypes.INTEGER
    },
    locality:{
        type:DataTypes.STRING
    },
    address:{
        type:DataTypes.STRING
    },
    city:{
        type:DataTypes.STRING
    },
    state:{
        type:DataTypes.STRING
    },
    signature:{
        type:DataTypes.STRING
    }
},{
    timestamps:false
})

export const Address = sequelize.define('address',{
    address_id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    username:{
        type:DataTypes.STRING,
        allowNoll:false
    },
    name:{
        type:DataTypes.STRING
    },
    phone:{
        type:DataTypes.BIGINT
    },
    pincode:{
        type:DataTypes.INTEGER
    },
    locality:{
        type:DataTypes.STRING
    },
    address:{
        type:DataTypes.STRING
    },
    city:{
        type:DataTypes.STRING
    },
    state:{
        type:DataTypes.STRING
    }
},{
    timestamps:false
})

food.hasMany(foodOrder,{foreignKey:'product_id'})
foodOrder.belongsTo(food,{foreignKey:'product_id'})

sequelize.sync()
.then(()=>{
    console.log("Connected");
})
.catch((e)=>{
    console.log(e);
    console.log("Not Connected");
})
