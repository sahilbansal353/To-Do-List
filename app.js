//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const _ = require("lodash")
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect("mongodb+srv://admin-Sahil:Test123@cluster0-fygzs.mongodb.net/todolistDB",{useNewUrlParser:true});
const itemSchema=new mongoose.Schema({
  name:String
});
const Item=mongoose.model("Item",itemSchema);
const item1=new Item({
  name:"Buy Food"
});
const item2 = new Item({
  name:"Cook Food"
});
const item3=new Item({
  name:"Eat Food"
});
const defaulItems=[item1,item2,item3];
const listSchema={
  name:String,
  items:[itemSchema]
};
const List=mongoose.model("List",listSchema);

app.get("/", function(req, res) {
Item.find({},function(err,founditems){
  if(founditems.length===0){
    Item.insertMany(defaulItems,function(err){
      if(err)
      {console.log(err);}
      else{
      console.log("Successful");}
    });
    res.redirect("/");
  }
  else {
    res.render("list", {listTitle:"Today", newListItems: founditems});
  }
});


});

app.post("/", function(req, res){

  const newitem = req.body.newItem;
  const listname=req.body.list;
const item=new Item({
  name:newitem
});
if(listname==="Today")
{
item.save();
res.redirect("/");
}
else {
  List.findOne({name:listname},function(err,found){
    found.items.push(item);
    found.save();
    res.redirect("/"+ listname);
  })
}
});

app.post("/delete",function(req,res){
  const checkedItemId=req.body.checkbox;
  const listName=req.body.listName;
  if(listName==="Today")
  {
    Item.deleteOne({_id:checkedItemId},function(err)
   {
  if(err){
    console.log(err);
  }
  else {
    res.redirect("/");
  }
   });
}
else {
  List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,found){
    if(!err){
      res.redirect("/"+listName);
    }
  }
);
}
});
app.get("/:customparam",function(req,res){
  const customparam=_.capitalize(req.params.customparam);
  List.findOne({name:customparam},function(err,found){
    if(!err){
      if(!found)
      {
        const listitem= new List({
          name:customparam,
          items:defaulItems
        });
        listitem.save();
        res.redirect("/"+ customparam);
      }
      else {
        res.render("list",{listTitle:customparam, newListItems: found.items})
      }
    }
  })

});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port,function(){
  console.log("Server is started");
});
