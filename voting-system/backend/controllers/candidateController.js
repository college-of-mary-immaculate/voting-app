const db = require("../config/db");

exports.getCandidates = (req,res)=>{

  const sql = "SELECT * FROM candidates";

  db.query(sql,(err,result)=>{

    if(err){
      return res.status(500).json(err);
    }

    res.json(result);

  });

};